// Odds API Service - Sports Betting Odds
// Hybrid approach: ESPN consensus + Odds-API.io sportsbook-specific odds
// Uses intelligent caching to optimize API usage (5000 requests/hour)

import { Sport } from '../types/game';
import { OddsComparison, Sportsbook } from '../types/boxScore';
import { OddsAPIIO, OddsAPIIOEvent, Bookmaker } from './oddsApiIO';
import { getCachedOdds, setCachedOdds, shouldFetchFreshOdds } from '../utils/oddsCache';
import type { SportsbookProp } from '../types/playerProp';

export class OddsAPI {
  /**
   * Get odds comparison for a specific game
   * Currently returns ESPN odds, but structured to support multiple sportsbooks
   *
   * @param gameId - ESPN game ID
   * @param sport - Sport league
   * @returns OddsComparison with sportsbook odds
   */
  static async getGameOdds(
    gameId: string,
    sport: Sport,
    espnGameData?: any
  ): Promise<OddsComparison | null> {
    try {
      const sportsbooks: Sportsbook[] = [];

      // Get ESPN odds (always available, no quota limit)
      const espnOdds = await this.getESPNOdds(gameId, sport, espnGameData);
      if (espnOdds) {
        sportsbooks.push(espnOdds);
      }

      // Get sportsbook-specific odds from Odds-API.io (cached, rate-limited)
      const oddsAPIIOSportsbooks = await this.getOddsAPIIO(gameId, sport);
      if (oddsAPIIOSportsbooks.length > 0) {
        sportsbooks.push(...oddsAPIIOSportsbooks);
      }

      if (sportsbooks.length === 0) {
        return null;
      }

      return {
        gameId,
        sportsbooks,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error(`Error fetching odds for game ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Extract ESPN odds from game data
   * ESPN provides consensus odds from their scoreboard API
   */
  private static async getESPNOdds(
    gameId: string,
    sport: Sport,
    espnGameData?: any
  ): Promise<Sportsbook | null> {
    try {
      // If ESPN game data is already provided, use it
      let gameData = espnGameData;

      // Otherwise, fetch from ESPN
      if (!gameData) {
        const sportPath = this.getSportPath(sport);
        const response = await fetch(
          `http://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${gameId}`,
          {
            headers: { 'Accept': 'application/json' },
          }
        );
        gameData = await response.json();
      }

      const competition = gameData?.header?.competitions?.[0] ||
                          gameData?.competitions?.[0];

      if (!competition || !competition.odds) {
        return null;
      }

      const odds = competition.odds[0];
      if (!odds) {
        return null;
      }

      // Parse ESPN odds
      const sportsbook: Sportsbook = {
        name: 'ESPN Consensus',
        lastUpdated: Date.now(),
      };

      // Spread (e.g., "LAL -5.5")
      if (odds.details) {
        const spreadParts = odds.details.split(' ');
        if (spreadParts.length >= 2) {
          sportsbook.spread = {
            home: odds.homeTeamOdds?.spreadOdds || odds.details,
            away: odds.awayTeamOdds?.spreadOdds || '',
          };
        }
      }

      // Moneyline
      if (odds.homeTeamOdds?.moneyLine || odds.awayTeamOdds?.moneyLine) {
        sportsbook.moneyline = {
          home: this.formatMoneyline(odds.homeTeamOdds?.moneyLine),
          away: this.formatMoneyline(odds.awayTeamOdds?.moneyLine),
        };
      }

      // Over/Under (Total)
      if (odds.overUnder) {
        sportsbook.total = {
          over: this.formatOdds(odds.over?.odds),
          under: this.formatOdds(odds.under?.odds),
          line: odds.overUnder.toString(),
        };
      }

      return sportsbook;
    } catch (error) {
      console.error('Error fetching ESPN odds:', error);
      return null;
    }
  }

  /**
   * Get sportsbook-specific odds from Odds-API.io
   * Uses caching to optimize API usage (rate limit: 5000 requests/hour)
   *
   * @param gameId - ESPN game ID (not used, but kept for compatibility)
   * @param sport - Sport league
   * @param forceRefresh - Force fresh API call (bypass cache)
   * @returns Array of sportsbook odds
   */
  private static async getOddsAPIIO(
    gameId: string,
    sport: Sport,
    forceRefresh: boolean = false
  ): Promise<Sportsbook[]> {
    try {
      // Check if Odds-API.io is configured
      if (!OddsAPIIO.isConfigured()) {
        console.log('ℹ️  Odds-API.io not configured, using ESPN odds only');
        return [];
      }

      // Check if we should fetch fresh data or use cache
      const shouldFetch = await shouldFetchFreshOdds(sport, 'game_odds', forceRefresh);

      if (!shouldFetch) {
        const cached = await getCachedOdds(sport, 'game_odds');
        if (cached) {
          return this.convertOddsAPIIOToSportsbooks(cached);
        }
      }

      // Fetch fresh odds from Odds-API.io
      console.log(`📡 Fetching fresh odds for ${sport} from Odds-API.io...`);
      const events = await OddsAPIIO.getEvents(sport);

      // For each event, fetch odds (this could be optimized with batch requests)
      const eventsWithOdds: OddsAPIIOEvent[] = [];

      // Use popular bookmakers to reduce response size
      const bookmakers = OddsAPIIO.getPopularBookmakers();

      for (const event of events.slice(0, 5)) { // Limit to first 5 events for now
        try {
          const eventOdds = await OddsAPIIO.getOdds(event.id, ['h2h', 'spreads', 'totals'], bookmakers);
          eventsWithOdds.push(eventOdds);
        } catch (error) {
          console.error(`Error fetching odds for event ${event.id}:`, error);
        }
      }

      // Cache the results
      if (eventsWithOdds.length > 0) {
        await setCachedOdds(
          sport,
          'game_odds',
          eventsWithOdds,
          OddsAPIIO.getRemainingRequests()
        );
      }

      return this.convertOddsAPIIOToSportsbooks(eventsWithOdds);
    } catch (error) {
      console.error('Error fetching from Odds-API.io:', error);
      // Graceful degradation: return empty array (ESPN odds will still work)
      return [];
    }
  }

  /**
   * Convert Odds-API.io events to our Sportsbook format
   */
  private static convertOddsAPIIOToSportsbooks(events: OddsAPIIOEvent[]): Sportsbook[] {
    const sportsbooks: Sportsbook[] = [];

    // Group by bookmaker
    const bookmakerMap = new Map<string, Bookmaker>();

    for (const event of events) {
      for (const bookmaker of event.bookmakers) {
        if (!bookmakerMap.has(bookmaker.key)) {
          bookmakerMap.set(bookmaker.key, bookmaker);
        }
      }
    }

    // Convert each bookmaker to our format
    for (const [key, bookmaker] of bookmakerMap) {
      const sportsbook: Sportsbook = {
        name: bookmaker.title,
        lastUpdated: new Date(bookmaker.last_update).getTime(),
      };

      // Extract markets
      for (const market of bookmaker.markets) {
        if (market.key === 'h2h') {
          // Moneyline
          const homeOutcome = market.outcomes.find(o => o.name === events[0]?.home_team);
          const awayOutcome = market.outcomes.find(o => o.name === events[0]?.away_team);

          if (homeOutcome && awayOutcome) {
            sportsbook.moneyline = {
              home: this.formatMoneyline(homeOutcome.price),
              away: this.formatMoneyline(awayOutcome.price),
            };
          }
        } else if (market.key === 'spreads') {
          // Spread
          const homeOutcome = market.outcomes.find(o => o.name === events[0]?.home_team);
          const awayOutcome = market.outcomes.find(o => o.name === events[0]?.away_team);

          if (homeOutcome && awayOutcome) {
            sportsbook.spread = {
              home: `${homeOutcome.point} (${this.formatMoneyline(homeOutcome.price)})`,
              away: `${awayOutcome.point} (${this.formatMoneyline(awayOutcome.price)})`,
            };
          }
        } else if (market.key === 'totals') {
          // Over/Under
          const overOutcome = market.outcomes.find(o => o.description === 'Over');
          const underOutcome = market.outcomes.find(o => o.description === 'Under');

          if (overOutcome && underOutcome) {
            sportsbook.total = {
              over: this.formatMoneyline(overOutcome.price),
              under: this.formatMoneyline(underOutcome.price),
              line: overOutcome.point?.toString() || underOutcome.point?.toString() || '',
            };
          }
        }
      }

      sportsbooks.push(sportsbook);
    }

    return sportsbooks;
  }

  /**
   * Helper: Get sport path for ESPN API
   */
  private static getSportPath(sport: Sport): string {
    const sportPaths: Record<Sport, string> = {
      NBA: 'basketball/nba',
      NFL: 'football/nfl',
      MLB: 'baseball/mlb',
      NHL: 'hockey/nhl',
    };
    return sportPaths[sport];
  }

  /**
   * Helper: Format moneyline odds
   */
  private static formatMoneyline(moneyline?: number | string): string {
    if (!moneyline) return '--';

    const value = typeof moneyline === 'string' ? parseInt(moneyline) : moneyline;

    if (isNaN(value)) return '--';

    return value > 0 ? `+${value}` : value.toString();
  }

  /**
   * Helper: Format generic odds
   */
  private static formatOdds(odds?: number | string): string {
    if (!odds) return '-110'; // Default vig

    const value = typeof odds === 'string' ? parseInt(odds) : odds;

    if (isNaN(value)) return '-110';

    return value > 0 ? `+${value}` : value.toString();
  }

  /**
   * Get odds for multiple games at once
   * Useful for batch loading on FeedScreen
   */
  static async getBatchGameOdds(
    games: Array<{ id: string; sport: Sport; espnData?: any }>
  ): Promise<Record<string, OddsComparison>> {
    try {
      const oddsPromises = games.map(game =>
        this.getGameOdds(game.id, game.sport, game.espnData)
      );

      const oddsResults = await Promise.all(oddsPromises);

      const oddsMap: Record<string, OddsComparison> = {};

      games.forEach((game, index) => {
        const odds = oddsResults[index];
        if (odds) {
          oddsMap[game.id] = odds;
        }
      });

      return oddsMap;
    } catch (error) {
      console.error('Error fetching batch game odds:', error);
      return {};
    }
  }
}

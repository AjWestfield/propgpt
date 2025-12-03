/**
 * Odds-API.io Client
 *
 * Professional odds API with superior features:
 * - 5,000 requests/hour (vs 500/month with The Odds API)
 * - 250+ bookmakers supported
 * - Low latency (<150ms)
 * - WebSocket support available
 * - Batch requests (up to 10 events)
 *
 * Documentation: https://docs.odds-api.io/api-reference/introduction
 * Base URL: https://api.odds-api.io/v3
 * Authentication: API key as query parameter
 */

import { ENV } from '../config/env';
import { Sport } from '../types/game';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Available sports in Odds-API.io
 */
export type OddsAPIIOSportKey =
  | 'basketball_nba'
  | 'americanfootball_nfl'
  | 'baseball_mlb'
  | 'icehockey_nhl'
  | 'americanfootball_ncaaf'
  | 'basketball_ncaab';

/**
 * Market types for odds
 */
export type MarketType = 'h2h' | 'spreads' | 'totals';

/**
 * Sport information from API
 */
export interface OddsAPIIOSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

/**
 * Event (game) from API
 */
export interface OddsAPIIOEvent {
  id: number;
  home: string;
  away: string;
  date: string;
  sport: {
    name: string;
    slug: string;
  };
  league: {
    name: string;
    slug: string;
  };
  status: 'pending' | 'live' | 'settled';
  scores?: {
    home: number;
    away: number;
  };
  bookmakers?: Bookmaker[];
}

/**
 * Bookmaker with odds
 */
export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

/**
 * Market (h2h, spreads, totals)
 */
export interface Market {
  key: MarketType;
  last_update: string;
  outcomes: Outcome[];
}

/**
 * Outcome (team odds)
 */
export interface Outcome {
  name: string;
  price: number;
  point?: number;
  description?: string;
}

/**
 * Player prop market types
 */
export type PlayerPropType =
  | 'player_points'
  | 'player_rebounds'
  | 'player_assists'
  | 'player_threes'
  | 'player_blocks'
  | 'player_steals'
  | 'player_turnovers'
  | 'player_points_rebounds_assists'
  | 'player_points_rebounds'
  | 'player_points_assists'
  | 'player_rebounds_assists'
  | 'player_pass_tds'
  | 'player_pass_yds'
  | 'player_rush_yds'
  | 'player_receptions'
  | 'batter_home_runs'
  | 'batter_hits'
  | 'batter_total_bases'
  | 'batter_rbis'
  | 'batter_runs_scored'
  | 'pitcher_strikeouts'
  | 'pitcher_hits_allowed'
  | 'pitcher_walks'
  | 'pitcher_earned_runs';

/**
 * Player prop outcome
 */
export interface PlayerPropOutcome {
  name: string; // Player name
  description: 'Over' | 'Under';
  price: number; // Odds in American format
  point: number; // Line (e.g., 27.5 points)
}

/**
 * Player prop market
 */
export interface PlayerPropMarket {
  key: PlayerPropType;
  last_update: string;
  outcomes: PlayerPropOutcome[];
}

/**
 * Player prop event
 */
export interface PlayerPropEvent extends OddsAPIIOEvent {
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: PlayerPropMarket[];
  }>;
}

/**
 * Bookmaker information
 */
export interface BookmakerInfo {
  key: string;
  title: string;
  group: string;
}

/**
 * API Response wrapper
 */
export interface OddsAPIIOResponse<T> {
  data: T;
  requestsRemaining?: number;
  requestsUsed?: number;
}

// ============================================================================
// Main API Client
// ============================================================================

export class OddsAPIIO {
  private static baseURL = ENV.ODDS_API_IO_BASE_URL;
  private static apiKey = ENV.ODDS_API_IO_KEY;
  private static requestsRemaining: number | null = null;
  private static requestsUsed: number | null = null;

  /**
   * Check if API is configured
   */
  static isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Get remaining requests in current hour
   */
  static getRemainingRequests(): number | null {
    return this.requestsRemaining;
  }

  /**
   * Get used requests in current hour
   */
  static getUsedRequests(): number | null {
    return this.requestsUsed;
  }

  /**
   * Make API request with authentication
   */
  private static async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<OddsAPIIOResponse<T>> {
    if (!this.isConfigured()) {
      throw new Error('Odds-API.io API key not configured');
    }

    // Add API key to query params
    const queryParams = new URLSearchParams({
      apiKey: this.apiKey,
      ...params,
    });

    const url = `${this.baseURL}${endpoint}?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    // Track rate limit from headers
    const remaining = response.headers.get('x-requests-remaining');
    const used = response.headers.get('x-requests-used');

    if (remaining) this.requestsRemaining = parseInt(remaining);
    if (used) this.requestsUsed = parseInt(used);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded (5000 requests/hour)');
      } else if (response.status === 404) {
        throw new Error(`Endpoint not found: ${endpoint}`);
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      data,
      requestsRemaining: this.requestsRemaining,
      requestsUsed: this.requestsUsed,
    };
  }

  /**
   * Convert PropGPT Sport to Odds-API.io sport key
   */
  static getSportKey(sport: Sport): OddsAPIIOSportKey {
    const sportKeyMap: Record<Sport, OddsAPIIOSportKey> = {
      NBA: 'basketball_nba',
      NFL: 'americanfootball_nfl',
      MLB: 'baseball_mlb',
      NHL: 'icehockey_nhl',
    };

    const key = sportKeyMap[sport];
    if (!key) {
      throw new Error(`Unsupported sport: ${sport}`);
    }
    return key;
  }

  /**
   * Get list of available sports
   *
   * @returns List of sports with metadata
   */
  static async getSports(): Promise<OddsAPIIOSport[]> {
    console.log('📡 Fetching sports from Odds-API.io...');
    const response = await this.request<OddsAPIIOSport[]>('/sports');
    return response.data;
  }

  /**
   * Get events (games) for a specific sport
   *
   * @param sport - Sport league (NBA, NFL, MLB, NHL)
   * @param liveOnly - Only return live/in-progress games
   * @returns List of events filtered by league
   */
  static async getEvents(
    sport: Sport,
    liveOnly: boolean = false
  ): Promise<OddsAPIIOEvent[]> {
    const sportParam = this.getSportParam(sport);
    console.log(`📡 Fetching ${sport} events from Odds-API.io...`);

    const params: Record<string, string> = {
      sport: sportParam,
      limit: '100', // Increased to get more results for filtering
    };

    if (liveOnly) {
      params.status = 'live';
    } else {
      params.status = 'pending'; // CRITICAL: Use 'pending' not 'scheduled' for upcoming games
    }

    const response = await this.request<OddsAPIIOEvent[]>(
      '/events',
      params
    );

    // Filter by league to get only the specific league (e.g., NBA not NCAA)
    const leagueFilter = this.getLeagueFilter(sport);
    const filteredEvents = response.data.filter(event => leagueFilter(event.league));

    console.log(`✅ Found ${filteredEvents.length} ${sport} events after league filtering`);

    return filteredEvents;
  }

  /**
   * Get league filter function for specific sport
   * Filters out college/minor leagues
   */
  private static getLeagueFilter(sport: Sport): (league: { name: string; slug: string }) => boolean {
    const filters: Record<Sport, (league: { name: string; slug: string }) => boolean> = {
      NBA: (league) => {
        const name = league.name.toLowerCase();
        const slug = league.slug.toLowerCase();
        return (name.includes('nba') || slug.includes('nba')) && !name.includes('g league');
      },
      NFL: (league) => {
        const name = league.name.toLowerCase();
        const slug = league.slug.toLowerCase();
        return name.includes('nfl') || slug.includes('nfl');
      },
      MLB: (league) => {
        const name = league.name.toLowerCase();
        const slug = league.slug.toLowerCase();
        return name.includes('mlb') || slug.includes('mlb');
      },
      NHL: (league) => {
        const name = league.name.toLowerCase();
        const slug = league.slug.toLowerCase();
        return name.includes('nhl') || slug.includes('nhl');
      },
    };
    return filters[sport];
  }

  /**
   * Convert PropGPT Sport to Odds-API.io sport parameter
   */
  static getSportParam(sport: Sport): string {
    const sportParamMap: Record<Sport, string> = {
      NBA: 'basketball',
      NFL: 'american-football', // CRITICAL: Must be 'american-football' not 'football'
      MLB: 'baseball',
      NHL: 'hockey',
    };

    const param = sportParamMap[sport];
    if (!param) {
      throw new Error(`Unsupported sport: ${sport}`);
    }
    return param;
  }

  /**
   * Get odds for a specific event
   *
   * @param eventId - Event ID from getEvents()
   * @param bookmakers - Specific bookmakers to include (optional)
   * @returns Event with odds from bookmakers
   */
  static async getOdds(
    eventId: number,
    bookmakers?: string[]
  ): Promise<OddsAPIIOEvent> {
    console.log(`📡 Fetching odds for event ${eventId} from Odds-API.io...`);

    const params: Record<string, string> = {
      eventId: eventId.toString(),
    };

    if (bookmakers && bookmakers.length > 0) {
      params.bookmakers = bookmakers.join(',');
    }

    const response = await this.request<OddsAPIIOEvent>(
      '/odds',
      params
    );

    return response.data;
  }

  /**
   * Get odds for multiple events (batch request)
   *
   * @param eventIds - Array of event IDs (max 10)
   * @param markets - Market types to include
   * @param bookmakers - Specific bookmakers to include (optional)
   * @returns Array of events with odds
   */
  static async getMultipleOdds(
    eventIds: string[],
    markets: MarketType[] = ['h2h', 'spreads', 'totals'],
    bookmakers?: string[]
  ): Promise<OddsAPIIOEvent[]> {
    if (eventIds.length > 10) {
      throw new Error('Maximum 10 events per batch request');
    }

    console.log(`📡 Fetching odds for ${eventIds.length} events from Odds-API.io...`);

    const params: Record<string, string> = {
      eventIds: eventIds.join(','),
      markets: markets.join(','),
    };

    if (bookmakers && bookmakers.length > 0) {
      params.bookmakers = bookmakers.join(',');
    }

    const response = await this.request<OddsAPIIOEvent[]>(
      '/odds/multi',
      params
    );

    return response.data;
  }

  /**
   * Get player props for a specific sport
   *
   * @param sport - Sport league (NBA, NFL, MLB, NHL)
   * @param propTypes - Types of player props to fetch
   * @param bookmakers - Specific bookmakers to include (optional)
   * @returns Player prop events with markets
   */
  static async getPlayerProps(
    sport: Sport,
    propTypes?: PlayerPropType[],
    bookmakers?: string[]
  ): Promise<PlayerPropEvent[]> {
    const sportParam = this.getSportParam(sport);
    const leagueParam = this.getLeagueParam(sport);
    console.log(`📡 Fetching ${sport} player props from Odds-API.io...`);

    // STEP 1: Get upcoming events/games
    const eventsResponse = await this.request<OddsAPIIOEvent[]>(
      '/events',
      {
        sport: sportParam,
        league: leagueParam,
        status: 'pending',
        limit: '10', // Fetch first 10 games
      }
    );

    if (!eventsResponse.data || eventsResponse.data.length === 0) {
      console.log(`⚠️  No upcoming ${sport} games found`);
      return [];
    }

    console.log(`✅ Found ${eventsResponse.data.length} upcoming ${sport} games`);

    // STEP 2: Fetch odds (including player props) for each event
    const bookmakerList = bookmakers?.join(',') || 'Bet365,Betfair,Bwin';
    const playerPropEvents: PlayerPropEvent[] = [];

    // Process first 3 events to avoid rate limits
    const eventsToProcess = eventsResponse.data.slice(0, 3);

    for (const event of eventsToProcess) {
      try {
        console.log(`📡 Fetching odds for event ${event.id} (${event.away} @ ${event.home})`);

        const oddsResponse = await this.request<any>(
          '/odds',
          {
            eventId: event.id.toString(),
            bookmakers: bookmakerList,
          }
        );

        // Transform API response to PlayerPropEvent format
        const transformedEvent = this.transformToPlayerPropEvent(oddsResponse.data, propTypes);

        if (transformedEvent && transformedEvent.bookmakers.length > 0) {
          playerPropEvents.push(transformedEvent);
        }
      } catch (err) {
        console.error(`❌ Error fetching odds for event ${event.id}:`, err);
        continue; // Skip this event and continue with others
      }
    }

    console.log(`✅ Successfully fetched player props for ${playerPropEvents.length} events`);
    return playerPropEvents;
  }

  /**
   * Get league parameter for Odds-API.io v3
   */
  private static getLeagueParam(sport: Sport): string {
    const leagueMap: Record<Sport, string> = {
      NBA: 'usa-nba',
      NFL: 'usa-nfl',
      MLB: 'usa-mlb',
      NHL: 'usa-nhl',
    };
    return leagueMap[sport];
  }

  /**
   * Transform Odds-API.io v3 response to PlayerPropEvent format
   */
  private static transformToPlayerPropEvent(
    apiResponse: any,
    propTypes?: PlayerPropType[]
  ): PlayerPropEvent | null {
    if (!apiResponse || !apiResponse.bookmakers) {
      return null;
    }

    // Map of Odds-API.io market names to our PlayerPropType
    const marketNameMap: Record<string, PlayerPropType> = {
      'Points O/U': 'player_points',
      'Rebounds O/U': 'player_rebounds',
      'Assists O/U': 'player_assists',
      '3-Pointers Made O/U': 'player_threes',
      'Blocks O/U': 'player_blocks',
      'Steals O/U': 'player_steals',
      'Turnovers O/U': 'player_turnovers',
      'Pts+Rebs+Asts O/U': 'player_points_rebounds_assists',
      'Points+Rebounds O/U': 'player_points_rebounds',
      'Points+Assists O/U': 'player_points_assists',
      'Rebounds+Assists O/U': 'player_rebounds_assists',
    };

    const bookmakers: Array<{
      key: string;
      title: string;
      last_update: string;
      markets: PlayerPropMarket[];
    }> = [];

    // Process each bookmaker
    for (const [bookmakerId, markets] of Object.entries(apiResponse.bookmakers as Record<string, any[]>)) {
      const playerPropMarkets: PlayerPropMarket[] = [];

      // Process each market (e.g., "Points O/U", "Rebounds O/U")
      for (const market of markets) {
        const propType = marketNameMap[market.name];

        // Skip if not a player prop or not in requested types
        if (!propType || (propTypes && !propTypes.includes(propType))) {
          continue;
        }

        // Transform odds to PlayerPropOutcome format
        const outcomes: PlayerPropOutcome[] = [];

        for (const odd of market.odds || []) {
          // Extract player name from label (e.g., "Jarrett Allen (2) (8.5)")
          const playerNameMatch = odd.label?.match(/^([^(]+)/);
          const playerName = playerNameMatch ? playerNameMatch[1].trim() : 'Unknown Player';

          // Convert decimal odds to American format
          const overOdds = decimalToAmerican(parseFloat(odd.over));
          const underOdds = decimalToAmerican(parseFloat(odd.under));

          outcomes.push(
            {
              name: playerName,
              description: 'Over',
              price: overOdds,
              point: odd.hdp || 0,
            },
            {
              name: playerName,
              description: 'Under',
              price: underOdds,
              point: odd.hdp || 0,
            }
          );
        }

        if (outcomes.length > 0) {
          playerPropMarkets.push({
            key: propType,
            last_update: market.updatedAt || new Date().toISOString(),
            outcomes,
          });
        }
      }

      if (playerPropMarkets.length > 0) {
        bookmakers.push({
          key: bookmakerId.toLowerCase(),
          title: bookmakerId,
          last_update: new Date().toISOString(),
          markets: playerPropMarkets,
        });
      }
    }

    if (bookmakers.length === 0) {
      return null;
    }

    // Build the PlayerPropEvent
    return {
      id: apiResponse.id,
      home: apiResponse.home,
      away: apiResponse.away,
      date: apiResponse.date || new Date().toISOString(),
      sport: apiResponse.sport || { name: 'Unknown', slug: 'unknown' },
      league: apiResponse.league || { name: 'Unknown', slug: 'unknown' },
      status: apiResponse.status || 'pending',
      scores: apiResponse.scores,
      bookmakers,
    };
  }

  /**
   * Get list of available bookmakers
   *
   * @returns List of bookmakers with metadata
   */
  static async getBookmakers(): Promise<BookmakerInfo[]> {
    console.log('📡 Fetching bookmakers from Odds-API.io...');
    const response = await this.request<BookmakerInfo[]>('/bookmakers');
    return response.data;
  }

  /**
   * Get popular/recommended bookmakers
   */
  static getPopularBookmakers(): string[] {
    return [
      'fanduel',
      'draftkings',
      'betmgm',
      'caesars',
      'pointsbet',
      'bet365',
    ];
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format American odds (e.g., -110, +150)
 */
export function formatAmericanOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : odds.toString();
}

/**
 * Convert decimal odds to American odds
 * CRITICAL: Odds-API.io returns odds in decimal format (e.g., 1.541, 2.540)
 * PropGPT displays American format (e.g., -184, +154)
 */
export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2.0) {
    // Positive odds (underdog)
    return Math.round((decimal - 1) * 100);
  } else {
    // Negative odds (favorite)
    return Math.round(-100 / (decimal - 1));
  }
}

/**
 * Convert American odds to decimal odds
 */
export function americanToDecimal(american: number): number {
  if (american > 0) {
    return (american / 100) + 1;
  } else {
    return (100 / Math.abs(american)) + 1;
  }
}

/**
 * Convert American odds to implied probability
 */
export function oddsToImpliedProbability(american: number): number {
  if (american > 0) {
    return 100 / (american + 100);
  } else {
    return Math.abs(american) / (Math.abs(american) + 100);
  }
}

/**
 * Calculate expected value (EV) for a bet
 *
 * @param trueProbability - Your estimated true probability (0-1)
 * @param americanOdds - Bookmaker's American odds
 * @returns Expected value as percentage
 */
export function calculateEV(trueProbability: number, americanOdds: number): number {
  const impliedProb = oddsToImpliedProbability(americanOdds);
  const decimalOdds = americanToDecimal(americanOdds);

  const ev = (trueProbability * (decimalOdds - 1)) - (1 - trueProbability);
  return ev * 100; // Return as percentage
}

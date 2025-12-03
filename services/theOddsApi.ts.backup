/**
 * The Odds API Service
 *
 * Provides real-time sportsbook odds and player props from 40+ sportsbooks
 * including FanDuel, DraftKings, BetMGM, Caesars, and more.
 *
 * API Documentation: https://the-odds-api.com/liveapi/guides/v4/
 *
 * Free Tier: 500 requests/month
 * Rate Limit Tracking: Returned in 'x-requests-remaining' response header
 */

import { ENV } from '../config/env';
import type { Sport } from '../types/game';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface TheOddsAPIConfig {
  apiKey: string;
  baseUrl: string;
  regions: string[]; // e.g., ['us', 'uk', 'eu']
  oddsFormat: 'decimal' | 'american';
  dateFormat: 'iso' | 'unix';
}

export interface Bookmaker {
  key: string; // e.g., 'fanduel', 'draftkings', 'betmgm'
  title: string; // e.g., 'FanDuel', 'DraftKings'
  last_update: string; // ISO 8601 timestamp
  markets: Market[];
}

export interface Market {
  key: string; // e.g., 'h2h', 'spreads', 'totals', 'player_points', 'player_rebounds'
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string; // Player name or team name
  description?: string; // Additional context (e.g., 'Over', 'Under')
  price: number; // American odds (e.g., -110, +120) or decimal odds
  point?: number; // Spread or total line (e.g., -5.5, 27.5)
}

export interface TheOddsAPIEvent {
  id: string; // Unique event ID
  sport_key: string; // e.g., 'basketball_nba', 'americanfootball_nfl'
  sport_title: string; // e.g., 'NBA', 'NFL'
  commence_time: string; // ISO 8601 timestamp
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface TheOddsAPIResponse {
  events: TheOddsAPIEvent[];
  requestsRemaining: number;
  requestsUsed: number;
}

export interface PlayerPropMarket {
  sport: Sport;
  playerName: string;
  propType: string; // 'points', 'rebounds', 'assists', etc.
  line: number;
  odds: number;
  sportsbook: string;
  lastUpdate: string;
}

// =============================================================================
// SPORT KEY MAPPINGS
// =============================================================================

const SPORT_KEY_MAP: Record<Sport, string> = {
  NBA: 'basketball_nba',
  NFL: 'americanfootball_nfl',
  MLB: 'baseball_mlb',
  NHL: 'icehockey_nhl',
  NCAAF: 'americanfootball_ncaaf',
  NCAAB: 'basketball_ncaab',
};

// =============================================================================
// PLAYER PROP MARKETS BY SPORT
// =============================================================================

const PLAYER_PROP_MARKETS: Record<Sport, string[]> = {
  NBA: [
    'player_points',
    'player_rebounds',
    'player_assists',
    'player_threes',
    'player_blocks',
    'player_steals',
    'player_turnovers',
    'player_points_rebounds_assists', // Combo props
  ],
  NFL: [
    'player_pass_tds',
    'player_pass_yds',
    'player_pass_completions',
    'player_pass_interceptions',
    'player_rush_yds',
    'player_rush_tds',
    'player_receptions',
    'player_reception_yds',
  ],
  MLB: [
    'batter_home_runs',
    'batter_hits',
    'batter_total_bases',
    'batter_rbis',
    'batter_runs_scored',
    'batter_stolen_bases',
    'pitcher_strikeouts',
    'pitcher_hits_allowed',
    'pitcher_walks',
    'pitcher_earned_runs',
  ],
  NHL: [
    'player_points',
    'player_goals',
    'player_assists',
    'player_shots_on_goal',
    'player_blocked_shots',
    'goalie_saves',
  ],
  NCAAF: [
    'player_pass_tds',
    'player_pass_yds',
    'player_rush_yds',
    'player_rush_tds',
    'player_receptions',
    'player_reception_yds',
  ],
  NCAAB: [
    'player_points',
    'player_rebounds',
    'player_assists',
    'player_threes',
  ],
};

// =============================================================================
// MAIN API CLASS
// =============================================================================

export class TheOddsAPI {
  private static config: TheOddsAPIConfig = {
    apiKey: ENV.THE_ODDS_API_KEY,
    baseUrl: ENV.THE_ODDS_API_BASE_URL,
    regions: ['us'], // Focus on US sportsbooks
    oddsFormat: 'american', // American odds format (-110, +120, etc.)
    dateFormat: 'iso',
  };

  private static requestsRemaining: number | null = null;
  private static requestsUsed: number = 0;

  /**
   * Check if API key is configured
   */
  static isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey !== '';
  }

  /**
   * Get remaining API requests (from last response header)
   */
  static getRemainingRequests(): number | null {
    return this.requestsRemaining;
  }

  /**
   * Get total requests used in current period
   */
  static getRequestsUsed(): number {
    return this.requestsUsed;
  }

  /**
   * Fetch available sports from The Odds API
   */
  static async getSports(): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('The Odds API key not configured');
    }

    const url = `${this.config.baseUrl}/sports/?apiKey=${this.config.apiKey}`;

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      this.updateRateLimitInfo(response);

      if (!response.ok) {
        throw new Error(`The Odds API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sports:', error);
      throw error;
    }
  }

  /**
   * Fetch odds for a specific sport
   *
   * @param sport - The sport to fetch odds for
   * @param markets - Array of market types (e.g., ['h2h', 'spreads', 'totals'])
   * @param bookmakers - Optional array of specific bookmakers to include
   */
  static async getOdds(
    sport: Sport,
    markets: string[] = ['h2h', 'spreads', 'totals'],
    bookmakers?: string[]
  ): Promise<TheOddsAPIEvent[]> {
    if (!this.isConfigured()) {
      console.warn('The Odds API not configured, returning empty results');
      return [];
    }

    const sportKey = SPORT_KEY_MAP[sport];
    if (!sportKey) {
      throw new Error(`Unsupported sport: ${sport}`);
    }

    const params = new URLSearchParams({
      apiKey: this.config.apiKey,
      regions: this.config.regions.join(','),
      markets: markets.join(','),
      oddsFormat: this.config.oddsFormat,
      dateFormat: this.config.dateFormat,
    });

    if (bookmakers && bookmakers.length > 0) {
      params.append('bookmakers', bookmakers.join(','));
    }

    const url = `${this.config.baseUrl}/sports/${sportKey}/odds/?${params}`;

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      this.updateRateLimitInfo(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your THE_ODDS_API_KEY configuration.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. You have used all 500 free requests this month.');
        }
        throw new Error(`The Odds API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching odds for ${sport}:`, error);
      throw error;
    }
  }

  /**
   * Fetch player props for a specific sport
   *
   * @param sport - The sport to fetch player props for
   * @param propTypes - Optional array of specific prop types (e.g., ['player_points', 'player_rebounds'])
   * @param bookmakers - Optional array of specific bookmakers
   */
  static async getPlayerProps(
    sport: Sport,
    propTypes?: string[],
    bookmakers?: string[]
  ): Promise<TheOddsAPIEvent[]> {
    if (!this.isConfigured()) {
      console.warn('The Odds API not configured, returning empty results');
      return [];
    }

    const availablePropTypes = PLAYER_PROP_MARKETS[sport];
    if (!availablePropTypes || availablePropTypes.length === 0) {
      console.warn(`No player prop markets available for ${sport}`);
      return [];
    }

    // Use specified prop types or all available ones
    const markets = propTypes && propTypes.length > 0
      ? propTypes.filter(pt => availablePropTypes.includes(pt))
      : availablePropTypes;

    if (markets.length === 0) {
      console.warn(`No valid prop types specified for ${sport}`);
      return [];
    }

    return await this.getOdds(sport, markets, bookmakers);
  }

  /**
   * Fetch player props for multiple sports (batch request)
   *
   * WARNING: Each sport counts as 1 API request. Use sparingly to preserve quota.
   */
  static async getPlayerPropsMultipleSports(
    sports: Sport[],
    propTypes?: Record<Sport, string[]>,
    bookmakers?: string[]
  ): Promise<Record<Sport, TheOddsAPIEvent[]>> {
    const results: Record<Sport, TheOddsAPIEvent[]> = {} as Record<Sport, TheOddsAPIEvent[]>;

    for (const sport of sports) {
      try {
        const sportPropTypes = propTypes?.[sport];
        results[sport] = await this.getPlayerProps(sport, sportPropTypes, bookmakers);
      } catch (error) {
        console.error(`Error fetching props for ${sport}:`, error);
        results[sport] = [];
      }
    }

    return results;
  }

  /**
   * Extract player props from API response into simplified format
   */
  static extractPlayerPropsFromEvents(
    events: TheOddsAPIEvent[],
    sport: Sport
  ): PlayerPropMarket[] {
    const props: PlayerPropMarket[] = [];

    for (const event of events) {
      for (const bookmaker of event.bookmakers) {
        for (const market of bookmaker.markets) {
          // Skip non-player prop markets
          if (!market.key.startsWith('player_') && !market.key.startsWith('batter_') && !market.key.startsWith('pitcher_') && !market.key.startsWith('goalie_')) {
            continue;
          }

          for (const outcome of market.outcomes) {
            // Only include "Over" outcomes to avoid duplicates (Over/Under pairs)
            if (outcome.description && outcome.description.toLowerCase() !== 'over') {
              continue;
            }

            props.push({
              sport,
              playerName: outcome.name,
              propType: market.key,
              line: outcome.point || 0,
              odds: outcome.price,
              sportsbook: bookmaker.title,
              lastUpdate: market.last_update,
            });
          }
        }
      }
    }

    return props;
  }

  /**
   * Get available bookmakers for a specific sport
   */
  static async getAvailableBookmakers(sport: Sport): Promise<string[]> {
    try {
      const events = await this.getOdds(sport, ['h2h']); // Use simple market to check bookmakers
      const bookmakerSet = new Set<string>();

      for (const event of events) {
        for (const bookmaker of event.bookmakers) {
          bookmakerSet.add(bookmaker.key);
        }
      }

      return Array.from(bookmakerSet);
    } catch (error) {
      console.error(`Error fetching bookmakers for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get available prop types for a specific sport
   */
  static getAvailablePropTypes(sport: Sport): string[] {
    return PLAYER_PROP_MARKETS[sport] || [];
  }

  /**
   * Update rate limit info from response headers
   */
  private static updateRateLimitInfo(response: Response): void {
    const remaining = response.headers.get('x-requests-remaining');
    const used = response.headers.get('x-requests-used');

    if (remaining) {
      this.requestsRemaining = parseInt(remaining, 10);
    }

    if (used) {
      this.requestsUsed = parseInt(used, 10);
    }

    // Log warning if approaching limit
    if (this.requestsRemaining !== null && this.requestsRemaining < 50) {
      console.warn(`⚠️  Only ${this.requestsRemaining} API requests remaining for this month!`);
    }
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert The Odds API sport key to our Sport type
 */
export function convertSportKey(sportKey: string): Sport | null {
  const entry = Object.entries(SPORT_KEY_MAP).find(([, key]) => key === sportKey);
  return entry ? (entry[0] as Sport) : null;
}

/**
 * Get sportsbook logo URL (placeholder - you'll need to add actual logos)
 */
export function getSportsbookLogo(bookmakerKey: string): string {
  const logoMap: Record<string, string> = {
    fanduel: 'https://example.com/fanduel-logo.png',
    draftkings: 'https://example.com/draftkings-logo.png',
    betmgm: 'https://example.com/betmgm-logo.png',
    caesars: 'https://example.com/caesars-logo.png',
    pointsbetchasesbetpointsbetchasesbet: 'https://example.com/pointsbet-logo.png',
  };

  return logoMap[bookmakerKey] || 'https://example.com/default-sportsbook-logo.png';
}

/**
 * Format American odds for display
 */
export function formatAmericanOdds(odds: number): string {
  if (odds > 0) {
    return `+${odds}`;
  }
  return odds.toString();
}

/**
 * Convert American odds to implied probability
 */
export function americanOddsToImpliedProbability(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}

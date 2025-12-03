/**
 * Player Prop Type Definitions
 * Interface for legacy UI components
 * Note: This is for backward compatibility only
 * New code should use PlayerProp from services/playerPropsService.ts
 */

export interface PlayerProp {
  id: string;
  playerId: string;
  playerName: string;
  playerImage: string; // CDN image URL
  team: string;
  teamLogo: string;
  opponent: string;
  opponentLogo: string;
  sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB';
  propType: string;
  line: number;
  projection: number;
  confidence: number; // 0-100
  over: boolean; // true = over, false = under
  gameTime: string;
  recentGames: number[];
  seasonAverage: number;
  vsOpponentAverage: number;
  trend: 'up' | 'down' | 'stable';
  hitRate: number; // percentage
  reasoning: string;
  isLive?: boolean;
  // Game filter fields
  gameId: string; // ESPN game ID
  gameName: string; // e.g., "Lakers vs Celtics"
  gameStatus: 'upcoming' | 'live' | 'completed';
  homeTeam: string; // Home team abbreviation
  awayTeam: string; // Away team abbreviation
  // College-specific fields
  classYear?: string; // e.g., "FR", "SO", "JR", "SR"
  conference?: string; // e.g., "SEC", "Big Ten"
}

export interface Team {
  name: string;
  abbreviation: string;
  logo: string;
}

export interface GameOption {
  id: string; // 'all' or ESPN game ID
  name: string; // "All Games" or "LAL vs BOS"
  homeTeam: Team; // Team info with logo
  awayTeam: Team; // Team info with logo
  gameTime: string; // "7:00 PM ET"
  status: 'upcoming' | 'live' | 'completed';
  score?: { home: string; away: string }; // If game is live/completed
}

/**
 * Sportsbook-specific prop data from The Odds API
 */
export interface SportsbookProp {
  sportsbook: string; // 'FanDuel', 'DraftKings', 'BetMGM', etc.
  sportsbookKey: string; // 'fanduel', 'draftkings', 'betmgm'
  line: number; // The prop line (e.g., 27.5 points)
  overOdds: number; // American odds for Over (e.g., -110)
  underOdds: number; // American odds for Under (e.g., -110)
  lastUpdate: string; // ISO 8601 timestamp
}

/**
 * Enhanced player prop with multi-sportsbook support
 */
export interface EnhancedPlayerProp extends PlayerProp {
  // Sportsbook-specific data
  sportsbookProps?: SportsbookProp[]; // Props from multiple sportsbooks
  bestLine?: {
    sportsbook: string;
    line: number;
    odds: number;
    value: 'over' | 'under';
  };

  // Data source indicators
  dataSource: 'estimated' | 'real_sportsbook' | 'hybrid'; // Where the data comes from
  hasSportsbookData: boolean; // True if any real sportsbook data exists

  // Line comparison
  lineRange?: {
    min: number;
    max: number;
    average: number;
  };
}

/**
 * Comparison of same prop across multiple sportsbooks
 */
export interface PropComparison {
  playerId: string;
  playerName: string;
  propType: string;
  sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB';
  gameId: string;
  sportsbooks: SportsbookProp[];
  bestOverLine: SportsbookProp | null;
  bestUnderLine: SportsbookProp | null;
  averageLine: number;
  lineSpread: number; // Difference between highest and lowest line
}

/**
 * Cache entry for The Odds API data
 */
export interface OddsAPICacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
  requestsRemaining: number | null;
}

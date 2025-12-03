import { Sport } from './game';

// Base interfaces
export interface PlayerStat {
  playerId: string;
  name: string;
  headshot?: string;
  position: string;
  jerseyNumber?: string;
  // Common stats across all sports
  starter: boolean;
  minutesPlayed?: string;
  // Sport-specific stats stored as key-value pairs
  stats: Record<string, string | number>;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  teamLogo?: string;
  // Aggregated team statistics
  stats: Record<string, string | number>;
}

export interface ScoringPlay {
  period: string;
  time: string;
  team: 'home' | 'away';
  description: string;
  score: {
    home: number;
    away: number;
  };
}

export interface BoxScore {
  gameId: string;
  sport: Sport;
  lastUpdated: number;
  teamStats: {
    home: TeamStats;
    away: TeamStats;
  };
  playerStats: {
    home: PlayerStat[];
    away: PlayerStat[];
  };
  scoringPlays?: ScoringPlay[];
}

// Sport-specific stat categories for display
export interface StatCategory {
  key: string;
  label: string;
  sortable: boolean;
}

// NBA specific stats
export const NBA_PLAYER_STATS: StatCategory[] = [
  { key: 'MIN', label: 'MIN', sortable: true },
  { key: 'PTS', label: 'PTS', sortable: true },
  { key: 'FG', label: 'FG', sortable: false },
  { key: 'FG%', label: 'FG%', sortable: true },
  { key: '3PT', label: '3PT', sortable: false },
  { key: '3PT%', label: '3PT%', sortable: true },
  { key: 'FT', label: 'FT', sortable: false },
  { key: 'FT%', label: 'FT%', sortable: true },
  { key: 'REB', label: 'REB', sortable: true },
  { key: 'AST', label: 'AST', sortable: true },
  { key: 'STL', label: 'STL', sortable: true },
  { key: 'BLK', label: 'BLK', sortable: true },
  { key: 'TO', label: 'TO', sortable: true },
];

export const NBA_TEAM_STATS: StatCategory[] = [
  { key: 'FG', label: 'FG', sortable: false },
  { key: 'Field Goal %', label: 'FG%', sortable: false },
  { key: '3PT', label: '3PT', sortable: false },
  { key: 'Three Point %', label: '3PT%', sortable: false },
  { key: 'FT', label: 'FT', sortable: false },
  { key: 'Free Throw %', label: 'FT%', sortable: false },
  { key: 'Rebounds', label: 'Rebounds', sortable: false },
  { key: 'Assists', label: 'Assists', sortable: false },
  { key: 'Steals', label: 'Steals', sortable: false },
  { key: 'Blocks', label: 'Blocks', sortable: false },
  { key: 'Turnovers', label: 'Turnovers', sortable: false },
  { key: 'Fast Break Points', label: 'Fast Break', sortable: false },
  { key: 'Points in Paint', label: 'Points in Paint', sortable: false },
];

// NFL specific stats
export const NFL_PLAYER_STATS: StatCategory[] = [
  { key: 'COMP', label: 'C', sortable: true },
  { key: 'ATT', label: 'ATT', sortable: true },
  { key: 'YDS', label: 'YDS', sortable: true },
  { key: 'TD', label: 'TD', sortable: true },
  { key: 'INT', label: 'INT', sortable: true },
  { key: 'CAR', label: 'CAR', sortable: true },
  { key: 'REC', label: 'REC', sortable: true },
  { key: 'TAR', label: 'TAR', sortable: true },
];

export const NFL_TEAM_STATS: StatCategory[] = [
  { key: 'Points Per Game', label: 'PPG', sortable: false },
  { key: 'Total Yards', label: 'Total Yards', sortable: false },
  { key: 'Yards Passing', label: 'Pass Yards', sortable: false },
  { key: 'Yards Rushing', label: 'Rush Yards', sortable: false },
  { key: 'Points Allowed Per Game', label: 'Points Allowed', sortable: false },
  { key: 'Yards Allowed', label: 'Yards Allowed', sortable: false },
  { key: 'Pass Yards Allowed', label: 'Pass Yards Allowed', sortable: false },
  { key: 'Rush Yards Allowed', label: 'Rush Yards Allowed', sortable: false },
];

// MLB specific stats
export const MLB_PLAYER_STATS: StatCategory[] = [
  { key: 'AB', label: 'AB', sortable: true },
  { key: 'H', label: 'H', sortable: true },
  { key: 'R', label: 'R', sortable: true },
  { key: 'RBI', label: 'RBI', sortable: true },
  { key: 'HR', label: 'HR', sortable: true },
  { key: 'BB', label: 'BB', sortable: true },
  { key: 'K', label: 'K', sortable: true },
  { key: 'AVG', label: 'AVG', sortable: true },
  { key: 'IP', label: 'IP', sortable: true },
  { key: 'ERA', label: 'ERA', sortable: true },
];

export const MLB_TEAM_STATS: StatCategory[] = [
  { key: 'batting', label: 'Batting', sortable: false },
  { key: 'pitching', label: 'Pitching', sortable: false },
  { key: 'fielding', label: 'Fielding', sortable: false },
  { key: 'records', label: 'Records', sortable: false },
];

// NHL specific stats
export const NHL_PLAYER_STATS: StatCategory[] = [
  { key: 'G', label: 'G', sortable: true },
  { key: 'A', label: 'A', sortable: true },
  { key: 'PTS', label: 'PTS', sortable: true },
  { key: 'SOG', label: 'SOG', sortable: true },
  { key: '+/-', label: '+/-', sortable: true },
  { key: 'PIM', label: 'PIM', sortable: true },
  { key: 'TOI', label: 'TOI', sortable: true },
  { key: 'SV', label: 'SV', sortable: true },
  { key: 'SV%', label: 'SV%', sortable: true },
];

export const NHL_TEAM_STATS: StatCategory[] = [
  { key: 'Shots', label: 'Shots', sortable: false },
  { key: 'Power Play Goals', label: 'PP Goals', sortable: false },
  { key: 'Power Play Opportunities', label: 'PP Opps', sortable: false },
  { key: 'Power Play Percentage', label: 'PP%', sortable: false },
  { key: 'Penalty Minutes', label: 'PIM', sortable: false },
  { key: 'Hits', label: 'Hits', sortable: false },
  { key: 'Blocked Shots', label: 'Blocked', sortable: false },
  { key: 'Takeaways', label: 'Takeaways', sortable: false },
  { key: 'Giveaways', label: 'Giveaways', sortable: false },
  { key: 'Faceoffs Won', label: 'FO Won', sortable: false },
  { key: 'Faceoff Win Percent', label: 'FO%', sortable: false },
];

// NCAAF (College Football) specific stats
export const NCAAF_PLAYER_STATS: StatCategory[] = [
  { key: 'COMP', label: 'C', sortable: true },
  { key: 'ATT', label: 'ATT', sortable: true },
  { key: 'YDS', label: 'YDS', sortable: true },
  { key: 'TD', label: 'TD', sortable: true },
  { key: 'INT', label: 'INT', sortable: true },
  { key: 'CAR', label: 'CAR', sortable: true },
  { key: 'REC', label: 'REC', sortable: true },
  { key: 'TAR', label: 'TAR', sortable: true },
];

export const NCAAF_TEAM_STATS: StatCategory[] = [
  { key: 'Total Yards', label: 'Total Yards', sortable: false },
  { key: 'Yards Passing', label: 'Pass Yards', sortable: false },
  { key: 'Yards Rushing', label: 'Rush Yards', sortable: false },
  { key: 'Turnovers', label: 'Turnovers', sortable: false },
  { key: 'First Downs', label: 'First Downs', sortable: false },
  { key: 'Third Down Conversions', label: '3rd Down', sortable: false },
  { key: 'Fourth Down Conversions', label: '4th Down', sortable: false },
  { key: 'Penalties', label: 'Penalties', sortable: false },
];

// NCAAB (College Basketball) specific stats
export const NCAAB_PLAYER_STATS: StatCategory[] = [
  { key: 'MIN', label: 'MIN', sortable: true },
  { key: 'PTS', label: 'PTS', sortable: true },
  { key: 'FG', label: 'FG', sortable: false },
  { key: 'FG%', label: 'FG%', sortable: true },
  { key: '3PT', label: '3PT', sortable: false },
  { key: '3PT%', label: '3PT%', sortable: true },
  { key: 'FT', label: 'FT', sortable: false },
  { key: 'FT%', label: 'FT%', sortable: true },
  { key: 'REB', label: 'REB', sortable: true },
  { key: 'AST', label: 'AST', sortable: true },
  { key: 'STL', label: 'STL', sortable: true },
  { key: 'BLK', label: 'BLK', sortable: true },
  { key: 'TO', label: 'TO', sortable: true },
];

export const NCAAB_TEAM_STATS: StatCategory[] = [
  { key: 'FG', label: 'FG', sortable: false },
  { key: 'Field Goal %', label: 'FG%', sortable: false },
  { key: '3PT', label: '3PT', sortable: false },
  { key: 'Three Point %', label: '3PT%', sortable: false },
  { key: 'FT', label: 'FT', sortable: false },
  { key: 'Free Throw %', label: 'FT%', sortable: false },
  { key: 'Rebounds', label: 'Rebounds', sortable: false },
  { key: 'Assists', label: 'Assists', sortable: false },
  { key: 'Steals', label: 'Steals', sortable: false },
  { key: 'Blocks', label: 'Blocks', sortable: false },
  { key: 'Turnovers', label: 'Turnovers', sortable: false },
];

// Utility function to get stat categories by sport
export const getPlayerStatCategories = (sport: Sport): StatCategory[] => {
  switch (sport) {
    case 'NBA':
      return NBA_PLAYER_STATS;
    case 'NFL':
      return NFL_PLAYER_STATS;
    case 'MLB':
      return MLB_PLAYER_STATS;
    case 'NHL':
      return NHL_PLAYER_STATS;
    case 'NCAAF':
      return NCAAF_PLAYER_STATS;
    case 'NCAAB':
      return NCAAB_PLAYER_STATS;
    default:
      return [];
  }
};

export const getTeamStatCategories = (sport: Sport): StatCategory[] => {
  switch (sport) {
    case 'NBA':
      return NBA_TEAM_STATS;
    case 'NFL':
      return NFL_TEAM_STATS;
    case 'MLB':
      return MLB_TEAM_STATS;
    case 'NHL':
      return NHL_TEAM_STATS;
    case 'NCAAF':
      return NCAAF_TEAM_STATS;
    case 'NCAAB':
      return NCAAB_TEAM_STATS;
    default:
      return [];
  }
};

// Odds interfaces
export interface Sportsbook {
  name: string;
  spread?: {
    home: string;
    away: string;
  };
  moneyline?: {
    home: string;
    away: string;
  };
  total?: {
    over: string;
    under: string;
    line: string;
  };
  lastUpdated?: number;
}

export interface OddsComparison {
  gameId: string;
  sportsbooks: Sportsbook[];
  lastUpdated: number;
}

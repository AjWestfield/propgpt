// Game and Score TypeScript Interfaces for Live Sports Feed

export type Sport = 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB';
export type GameStatus = 'scheduled' | 'in_progress' | 'final' | 'postponed' | 'cancelled';
export type TimeFilter = 'yesterday' | 'today' | 'upcoming';

export interface Team {
  id: string;
  displayName: string;
  abbreviation: string;
  logo: string;
  color?: string;
  alternateColor?: string;
  record?: string; // e.g., "20-15"
  homeAway: 'home' | 'away';
  // College-specific fields
  conference?: {
    id: string;
    name: string;
    abbreviation: string;
  };
  ranking?: number; // Current AP/Coaches Poll ranking
}

export interface Score {
  home: string;
  away: string;
  period?: number; // Current quarter/period/inning
  clock?: string; // e.g., "2:34" or "Final"
}

export interface Game {
  id: string;
  sport: Sport;
  date: string; // ISO 8601 date string
  status: GameStatus;
  statusText: string; // e.g., "7:30 PM ET", "Final", "2nd Qtr - 2:34"
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  venue?: string;
  broadcast?: string[];
  odds?: {
    spread?: string; // e.g., "GSW -7.5"
    overUnder?: string; // e.g., "O/U 225.5"
  };
  isLive: boolean;
  hasStarted: boolean;
  // College-specific fields
  week?: {
    number: number;
    text: string; // e.g., "Week 12", "Bowl Week"
  };
  tournament?: {
    id: string;
    name: string; // e.g., "NCAA Tournament"
    round: string;
  };
}

export interface ScoreboardResponse {
  games: Game[];
  lastUpdated: number; // Timestamp
}

// ESPN API Response Types (for parsing)
export interface ESPNCompetitor {
  id: string;
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo: string;
    color?: string;
    alternateColor?: string;
  };
  score: string;
  homeAway: 'home' | 'away';
  records?: Array<{
    summary: string; // e.g., "20-15"
  }>;
}

export interface ESPNCompetition {
  id: string;
  date: string;
  competitors: ESPNCompetitor[];
  status: {
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
    period?: number;
    displayClock?: string;
  };
  venue?: {
    fullName: string;
  };
  broadcasts?: Array<{
    names: string[];
  }>;
  odds?: Array<{
    details?: string;
    overUnder?: number;
  }>;
}

export interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  competitions: ESPNCompetition[];
}

export interface ESPNScoreboardResponse {
  events?: ESPNEvent[];
  leagues?: Array<{
    id: string;
    name: string;
    abbreviation: string;
  }>;
}

import { Sport } from './game';

// Trend Categories
export type TrendCategory = 'betting' | 'player' | 'team' | 'injury' | 'news' | 'all';

// Timeframe for trends
export type TrendTimeframe = 'today' | 'week' | 'season';

// Trend severity/importance
export type TrendSeverity = 'low' | 'medium' | 'high' | 'critical';

// Base Trend Interface
export interface BaseTrend {
  id: string;
  sport: Sport;
  category: TrendCategory;
  severity: TrendSeverity;
  title: string;
  description: string;
  timestamp: Date;
  isLive?: boolean;
}

// Betting Trends
export interface BettingTrend extends BaseTrend {
  category: 'betting';
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  currentSpread: number;
  spreadMovement: number; // Positive = line moving toward home team
  currentTotal: number;
  totalMovement: number;
  moneylineHome: number;
  moneylineAway: number;
  bettingPercentage?: {
    homeSpread: number;
    awaySpread: number;
    over: number;
    under: number;
  };
  reverseLine?: boolean; // Reverse Line Movement indicator
  steamMove?: boolean; // Sudden sharp action
  sharpAction?: 'home' | 'away' | 'none';
}

// Player Performance Trends
export interface PlayerTrend extends BaseTrend {
  category: 'player';
  playerId: string;
  playerName: string;
  playerImage?: string;
  teamName: string;
  teamLogo?: string;
  position: string;
  streakType: 'hot' | 'cold' | 'outlier';
  streakLength: number; // Number of games in streak
  stats: {
    metric: string; // e.g., "Points", "Assists", "Rebounds"
    current: number;
    seasonAvg: number;
    last5Avg: number;
    percentChange: number;
  }[];
  calculatedProps?: CalculatedProp[];
  nextGame?: {
    opponent: string;
    date: Date;
    homeAway: 'home' | 'away';
  };
}

// Calculated Prop Suggestion
export interface CalculatedProp {
  metric: string; // e.g., "Points", "Rebounds + Assists"
  line: number; // Suggested prop line
  recommendation: 'over' | 'under';
  confidence: number; // 0-100
  reasoning: string[];
  factors: {
    seasonAverage: number;
    last5Average: number;
    vsOpponentAvg?: number;
    homeAwayDiff?: number;
    restDays?: number;
  };
}

// Team Trends
export interface TeamTrend extends BaseTrend {
  category: 'team';
  teamId: string;
  teamName: string;
  teamLogo?: string;
  trendType: 'win_streak' | 'lose_streak' | 'home_dominant' | 'away_dominant' | 'ats_streak' | 'total_streak';
  streakLength: number;
  record: {
    wins: number;
    losses: number;
  };
  atsRecord?: {
    wins: number;
    losses: number;
    pushes: number;
  };
  stats: {
    pointsPerGame: number;
    pointsAllowed: number;
    avgMargin: number;
  };
  splits?: {
    home: { wins: number; losses: number };
    away: { wins: number; losses: number };
    lastTen: { wins: number; losses: number };
  };
  restDaysImpact?: {
    zeroRest: { wins: number; losses: number };
    oneRest: { wins: number; losses: number };
    twoPlusRest: { wins: number; losses: number };
  };
}

// Injury Impact Trends
export interface InjuryTrend extends BaseTrend {
  category: 'injury';
  playerId: string;
  playerName: string;
  playerImage?: string;
  teamId: string;
  teamName: string;
  teamLogo?: string;
  position: string;
  injuryStatus: 'out' | 'doubtful' | 'questionable' | 'probable' | 'day-to-day';
  injuryDetails: string;
  gameImpact?: {
    gameId: string;
    opponent: string;
    date: Date;
    spreadChange?: number;
    totalChange?: number;
  };
  playerImpact: {
    seasonAvgPoints?: number;
    seasonAvgRebounds?: number;
    seasonAvgAssists?: number;
    seasonAvgMinutes?: number;
    seasonAvgYards?: number;
    seasonAvgTouchdowns?: number;
    usageRate?: number;
    impactScore: number; // 0-100, how critical player is to team
  };
  affectedPlayers?: {
    playerId: string;
    playerName: string;
    expectedUsageIncrease: number; // Percentage increase
    opportunityScore: number; // 0-100
  }[];
}

// Prediction Data
export interface Prediction {
  id: string;
  sport: Sport;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  gameDate: Date;
  predictions: {
    source: string; // e.g., "ESPN", "FiveThirtyEight", "PropGPT Model"
    homeWinProbability: number; // 0-100
    awayWinProbability: number; // 0-100
    confidence: number; // 0-100
    predictedHomeScore?: number;
    predictedAwayScore?: number;
    reasoning?: string[];
  }[];
  consensus: {
    favoredTeam: 'home' | 'away';
    winProbability: number;
    confidence: number;
  };
  currentOdds?: {
    spread: number;
    total: number;
    moneylineHome: number;
    moneylineAway: number;
  };
  keyFactors?: string[]; // e.g., "Home team on 5-game win streak", "Star player injured"
}

// Aggregated Trend Response
export interface TrendsData {
  bettingTrends: BettingTrend[];
  playerTrends: PlayerTrend[];
  teamTrends: TeamTrend[];
  injuryTrends: InjuryTrend[];
  predictions: Prediction[];
  lastUpdated: Date;
  liveGamesCount: number;
}

// Filter options for UI
export interface TrendFilter {
  sports: Sport[];
  categories: TrendCategory[];
  timeframe: TrendTimeframe;
  severity?: TrendSeverity[];
  sortBy: 'recent' | 'severity' | 'impact' | 'confidence';
}

// Trend card display props
export interface TrendCardProps {
  trend: BaseTrend | BettingTrend | PlayerTrend | TeamTrend | InjuryTrend;
  onPress?: () => void;
}

// Prediction card display props
export interface PredictionCardProps {
  prediction: Prediction;
  onPress?: () => void;
}

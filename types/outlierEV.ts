/**
 * Types and interfaces for Outlier EV feature
 * Expected Value and Arbitrage detection across multiple sportsbooks
 */

import { Sport } from './game';

/**
 * Sportsbook odds for a specific prop
 */
export interface SportsbookOdds {
  sportsbook: string;         // Display name (e.g., "FanDuel")
  sportsbookKey: string;      // API key (e.g., "fanduel")
  line: number;               // Prop line (e.g., 27.5 points)
  overOdds: number;           // American odds for Over (e.g., -110)
  underOdds: number;          // American odds for Under (e.g., -110)
  overImpliedProb: number;    // Implied probability for Over (0-1)
  underImpliedProb: number;   // Implied probability for Under (0-1)
  lastUpdate: string;         // ISO timestamp
  logoUrl?: string;           // Logo URL for display
}

/**
 * Arbitrage opportunity - guaranteed profit across books
 */
export interface ArbitrageOpportunity {
  id: string;                    // Unique ID
  type: 'arbitrage' | 'middle';  // Type of opportunity
  player: string;                // Player name
  propType: string;              // e.g., "Points", "Rebounds"
  sport: Sport;                  // NBA, NFL, etc.
  game: {
    homeTeam: string;
    awayTeam: string;
    gameTime: string;
  };

  // Arbitrage details
  overBook: {
    sportsbook: string;
    sportsbookKey: string;
    line: number;
    odds: number;
    logoUrl?: string;
  };
  underBook: {
    sportsbook: string;
    sportsbookKey: string;
    line: number;
    odds: number;
    logoUrl?: string;
  };

  // Profit calculations
  guaranteedProfit: number;      // Profit % (e.g., 2.5 = 2.5% profit)
  totalStake: number;            // Total amount to bet (e.g., 100)
  overStake: number;             // Amount to bet on Over
  underStake: number;            // Amount to bet on Under
  profitAmount: number;          // Profit in dollars

  // Metadata
  confidence: 'high' | 'medium' | 'low';  // Based on line difference
  createdAt: string;             // When detected
  expiresAt?: string;            // When odds might change
}

/**
 * High Expected Value opportunity
 */
export interface EVOpportunity {
  id: string;                    // Unique ID
  player: string;                // Player name
  propType: string;              // e.g., "Points", "Assists"
  sport: Sport;                  // NBA, NFL, etc.
  game: {
    homeTeam: string;
    awayTeam: string;
    gameTime: string;
  };

  // EV calculations
  estimatedTrueProbability: number;  // Model's true probability (0-1)

  // Best odds across all books
  bestOver: {
    sportsbook: string;
    sportsbookKey: string;
    line: number;
    odds: number;
    impliedProb: number;
    ev: number;              // EV percentage (e.g., 4.2 = 4.2%)
    logoUrl?: string;
  };
  bestUnder: {
    sportsbook: string;
    sportsbookKey: string;
    line: number;
    odds: number;
    impliedProb: number;
    ev: number;
    logoUrl?: string;
  };

  // All sportsbook odds
  allBooks: SportsbookOdds[];

  // Line comparison
  lineRange: {
    min: number;
    max: number;
    average: number;
    spread: number;          // Difference between min and max
  };

  // Metadata
  rating: 1 | 2 | 3 | 4 | 5;   // Star rating based on EV
  confidence: 'high' | 'medium' | 'low';
  createdAt: string;
}

/**
 * Combined outlier opportunity (arbitrage or EV)
 */
export interface OutlierOpportunity {
  id: string;
  opportunityType: 'arbitrage' | 'high-ev';
  player: string;
  propType: string;
  sport: Sport;
  game: {
    homeTeam: string;
    awayTeam: string;
    gameTime: string;
  };

  // Either arbitrage or EV data
  arbitrage?: ArbitrageOpportunity;
  ev?: EVOpportunity;

  // Common fields
  highlight: string;           // e.g., "2.5% Guaranteed Profit" or "4.2% EV"
  bestPlay: string;            // e.g., "FanDuel Over -105"
  allBooks: SportsbookOdds[];

  // Sorting/filtering
  score: number;               // For sorting (profit % or EV %)
  createdAt: string;
}

/**
 * Filter options for Outlier EV screen
 */
export interface OutlierEVFilters {
  sport: Sport | 'all';
  opportunityType: 'all' | 'arbitrage' | 'high-ev';
  minProfit: number;           // Minimum arbitrage profit % (e.g., 1.0)
  minEV: number;               // Minimum EV % (e.g., 2.0)
  sportsbooks: string[];       // Filter by specific books
  propTypes: string[];         // Filter by prop types
}

/**
 * Bet calculator input/output
 */
export interface BetCalculation {
  bankroll: number;            // Total bankroll
  kellyPercentage: number;     // Kelly Criterion % (e.g., 25 = quarter Kelly)
  ev: number;                  // Expected value %
  odds: number;                // American odds
  trueProbability: number;     // Estimated true probability (0-1)

  // Results
  recommendedStake: number;    // Amount to bet
  expectedProfit: number;      // Expected profit per bet
  riskOfRuin: number;          // Risk of losing bankroll %
}

/**
 * Historical line movement
 */
export interface LineMovement {
  timestamp: string;
  sportsbook: string;
  line: number;
  overOdds: number;
  underOdds: number;
}

/**
 * Player recent form for prop
 */
export interface PropRecentForm {
  gameDate: string;
  opponent: string;
  actual: number;              // Actual stat (e.g., 28 points)
  line: number;                // Line that day (e.g., 27.5)
  result: 'over' | 'under' | 'push';
}

/**
 * Sportsbook configuration
 */
export interface SportsbookConfig {
  key: string;                 // API key (e.g., "fanduel")
  name: string;                // Display name
  logoUrl: string;             // Logo image URL
  type: 'dfs' | 'traditional'; // Daily Fantasy or Traditional Sportsbook
  priority: number;            // Display order (1 = highest)
  deepLinkBase?: string;       // Deep link URL base
  isActive: boolean;           // Whether to include in comparisons
}

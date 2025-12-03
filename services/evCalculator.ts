/**
 * Enhanced Expected Value (EV) Calculator
 *
 * Calculates EV for props across multiple sportsbooks
 * and identifies high-value betting opportunities
 */

import {
  calculateEV,
  oddsToImpliedProbability,
  formatAmericanOdds,
} from './oddsApiIO';
import { EVOpportunity, SportsbookOdds } from '../types/outlierEV';

/**
 * Minimum EV threshold for high-value opportunities (in percentage)
 */
const MIN_EV_THRESHOLD = 2.0; // 2%

/**
 * Calculate EV rating (1-5 stars) based on EV percentage
 *
 * @param ev - Expected value percentage
 * @returns Star rating from 1-5
 */
export function calculateEVRating(ev: number): 1 | 2 | 3 | 4 | 5 {
  if (ev < 0) return 1;
  if (ev < 2) return 2;
  if (ev < 4) return 3;
  if (ev < 6) return 4;
  return 5;
}

/**
 * Estimate true probability for a prop
 *
 * Currently uses a simplified market consensus approach
 * TODO: Integrate with ML model predictions
 *
 * @param books - Array of sportsbook odds
 * @param side - 'over' or 'under'
 * @returns Estimated true probability (0-1)
 */
export function estimateTrueProbability(
  books: SportsbookOdds[],
  side: 'over' | 'under'
): number {
  if (books.length === 0) return 0.5; // Default 50/50

  // Calculate average implied probability across all books
  // This represents the market consensus
  const impliedProbs = books.map((book) =>
    side === 'over' ? book.overImpliedProb : book.underImpliedProb
  );

  const avgImpliedProb =
    impliedProbs.reduce((sum, prob) => sum + prob, 0) / impliedProbs.length;

  // Remove vig (bookmaker margin) to get closer to true probability
  // Typical vig is 4-5%, so we adjust the probability slightly
  const totalImpliedProb = books.reduce(
    (sum, book) => sum + book.overImpliedProb + book.underImpliedProb,
    0
  ) / books.length;

  const vigMultiplier = 1 / totalImpliedProb; // Typically ~0.95-0.96
  const estimatedTrueProb = avgImpliedProb * vigMultiplier;

  // Clamp between 0.01 and 0.99
  return Math.max(0.01, Math.min(0.99, estimatedTrueProb));
}

/**
 * Find best odds across all sportsbooks for Over and Under
 *
 * @param books - Array of sportsbook odds
 * @returns Best Over and Under odds with EV calculations
 */
export function findBestOdds(
  books: SportsbookOdds[],
  trueProbabilityOver: number
): {
  bestOver: SportsbookOdds & { ev: number };
  bestUnder: SportsbookOdds & { ev: number };
} {
  if (books.length === 0) {
    throw new Error('No sportsbooks provided');
  }

  const trueProbabilityUnder = 1 - trueProbabilityOver;

  // Find best Over odds (highest +EV)
  let bestOverBook = books[0];
  let bestOverEV = calculateEV(trueProbabilityOver, bestOverBook.overOdds);

  for (const book of books) {
    const ev = calculateEV(trueProbabilityOver, book.overOdds);
    if (ev > bestOverEV) {
      bestOverEV = ev;
      bestOverBook = book;
    }
  }

  // Find best Under odds (highest +EV)
  let bestUnderBook = books[0];
  let bestUnderEV = calculateEV(trueProbabilityUnder, bestUnderBook.underOdds);

  for (const book of books) {
    const ev = calculateEV(trueProbabilityUnder, book.underOdds);
    if (ev > bestUnderEV) {
      bestUnderEV = ev;
      bestUnderBook = book;
    }
  }

  return {
    bestOver: {
      ...bestOverBook,
      ev: bestOverEV,
    },
    bestUnder: {
      ...bestUnderBook,
      ev: bestUnderEV,
    },
  };
}

/**
 * Calculate line statistics across multiple sportsbooks
 *
 * @param books - Array of sportsbook odds
 * @returns Line range statistics
 */
export function calculateLineRange(books: SportsbookOdds[]): {
  min: number;
  max: number;
  average: number;
  spread: number;
} {
  if (books.length === 0) {
    return { min: 0, max: 0, average: 0, spread: 0 };
  }

  const lines = books.map((book) => book.line);
  const min = Math.min(...lines);
  const max = Math.max(...lines);
  const average = lines.reduce((sum, line) => sum + line, 0) / lines.length;
  const spread = max - min;

  return {
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    average: Math.round(average * 10) / 10,
    spread: Math.round(spread * 10) / 10,
  };
}

/**
 * Detect high EV opportunities for a prop across all sportsbooks
 *
 * @param books - Array of sportsbook odds for same prop
 * @param playerName - Player name
 * @param propType - Prop type (e.g., "Points")
 * @param gameInfo - Game information
 * @returns EV opportunity if found, null otherwise
 */
export function detectEVOpportunity(
  books: SportsbookOdds[],
  playerName: string,
  propType: string,
  gameInfo: { homeTeam: string; awayTeam: string; gameTime: string }
): EVOpportunity | null {
  if (books.length === 0) return null;

  // Estimate true probabilities using market consensus
  const trueProbOver = estimateTrueProbability(books, 'over');
  const trueProbUnder = 1 - trueProbOver;

  // Find best odds for both sides
  const { bestOver, bestUnder } = findBestOdds(books, trueProbOver);

  // Calculate line statistics
  const lineRange = calculateLineRange(books);

  // Only return opportunity if EV exceeds threshold on at least one side
  if (bestOver.ev < MIN_EV_THRESHOLD && bestUnder.ev < MIN_EV_THRESHOLD) {
    return null;
  }

  // Determine confidence based on line consistency and EV magnitude
  let confidence: 'high' | 'medium' | 'low';
  const maxEV = Math.max(bestOver.ev, bestUnder.ev);

  if (lineRange.spread <= 0.5 && maxEV >= 4) {
    confidence = 'high'; // Tight lines, strong EV
  } else if (lineRange.spread <= 1.0 && maxEV >= 3) {
    confidence = 'high';
  } else if (lineRange.spread <= 2.0 || maxEV >= 2.5) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Calculate rating based on best EV
  const rating = calculateEVRating(maxEV);

  return {
    id: `ev-${playerName}-${propType}-${Date.now()}`,
    player: playerName,
    propType,
    sport: 'NBA', // TODO: Pass dynamically
    game: gameInfo,
    estimatedTrueProbability: trueProbOver,
    bestOver: {
      sportsbook: bestOver.sportsbook,
      sportsbookKey: bestOver.sportsbookKey,
      line: bestOver.line,
      odds: bestOver.overOdds,
      impliedProb: bestOver.overImpliedProb,
      ev: bestOver.ev,
      logoUrl: bestOver.logoUrl,
    },
    bestUnder: {
      sportsbook: bestUnder.sportsbook,
      sportsbookKey: bestUnder.sportsbookKey,
      line: bestUnder.line,
      odds: bestUnder.underOdds,
      impliedProb: bestUnder.underImpliedProb,
      ev: bestUnder.ev,
      logoUrl: bestUnder.logoUrl,
    },
    allBooks: books,
    lineRange,
    rating,
    confidence,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Detect all high-EV opportunities from an array of props
 *
 * @param propsWithOdds - Array of props with sportsbook odds
 * @returns Array of EV opportunities
 */
export function detectAllEVOpportunities(
  propsWithOdds: Array<{
    player: string;
    propType: string;
    gameInfo: { homeTeam: string; awayTeam: string; gameTime: string };
    books: SportsbookOdds[];
  }>
): EVOpportunity[] {
  const opportunities: EVOpportunity[] = [];

  for (const prop of propsWithOdds) {
    const opportunity = detectEVOpportunity(
      prop.books,
      prop.player,
      prop.propType,
      prop.gameInfo
    );

    if (opportunity) {
      opportunities.push(opportunity);
    }
  }

  return opportunities;
}

/**
 * Sort EV opportunities by EV (highest first)
 */
export function sortEVOpportunities(
  opportunities: EVOpportunity[]
): EVOpportunity[] {
  return opportunities.sort((a, b) => {
    const aMaxEV = Math.max(a.bestOver.ev, a.bestUnder.ev);
    const bMaxEV = Math.max(b.bestOver.ev, b.bestUnder.ev);
    return bMaxEV - aMaxEV;
  });
}

/**
 * Filter EV opportunities by minimum EV threshold
 */
export function filterEVByThreshold(
  opportunities: EVOpportunity[],
  minEV: number
): EVOpportunity[] {
  return opportunities.filter((opp) => {
    const maxEV = Math.max(opp.bestOver.ev, opp.bestUnder.ev);
    return maxEV >= minEV;
  });
}

/**
 * Get EV summary statistics
 */
export function getEVSummary(opportunities: EVOpportunity[]): {
  total: number;
  highConfidence: number;
  averageEV: number;
  bestEV: number;
  fiveStarCount: number;
} {
  if (opportunities.length === 0) {
    return {
      total: 0,
      highConfidence: 0,
      averageEV: 0,
      bestEV: 0,
      fiveStarCount: 0,
    };
  }

  const highConfidence = opportunities.filter(
    (o) => o.confidence === 'high'
  ).length;

  const allEVs = opportunities.flatMap((o) => [o.bestOver.ev, o.bestUnder.ev]);
  const averageEV = allEVs.reduce((sum, ev) => sum + ev, 0) / allEVs.length;
  const bestEV = Math.max(...allEVs);

  const fiveStarCount = opportunities.filter((o) => o.rating === 5).length;

  return {
    total: opportunities.length,
    highConfidence,
    averageEV: Math.round(averageEV * 100) / 100,
    bestEV: Math.round(bestEV * 100) / 100,
    fiveStarCount,
  };
}

/**
 * Kelly Criterion calculator for bet sizing
 *
 * @param bankroll - Total bankroll amount
 * @param trueProbability - Estimated true probability (0-1)
 * @param odds - American odds
 * @param kellyFraction - Fraction of Kelly to use (0.25 = quarter Kelly)
 * @returns Recommended stake amount
 */
export function calculateKellyStake(
  bankroll: number,
  trueProbability: number,
  odds: number,
  kellyFraction: number = 0.25
): number {
  const impliedProb = oddsToImpliedProbability(odds);
  const decimalOdds = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;

  // Kelly formula: f = (bp - q) / b
  // where b = decimal odds - 1, p = true prob, q = 1 - p
  const b = decimalOdds - 1;
  const p = trueProbability;
  const q = 1 - p;

  const kellyPercent = (b * p - q) / b;

  // Apply Kelly fraction (e.g., 0.25 for quarter Kelly)
  const adjustedKelly = kellyPercent * kellyFraction;

  // Clamp between 0 and 10% of bankroll for safety
  const stake = Math.max(0, Math.min(0.1 * bankroll, adjustedKelly * bankroll));

  return Math.round(stake * 100) / 100;
}

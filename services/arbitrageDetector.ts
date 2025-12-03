/**
 * Arbitrage Detection Service
 *
 * Detects guaranteed profit opportunities across multiple sportsbooks
 * Includes both cross-book arbitrage and middle betting detection
 */

import { oddsToImpliedProbability } from './oddsApiIO';
import { ArbitrageOpportunity, SportsbookOdds } from '../types/outlierEV';
import { getSportsbookLogoUrl } from '../constants/sportsbookLogos';

/**
 * Minimum profit threshold for arbitrage (in percentage)
 * Below this, opportunity is not worth the effort/risk
 */
const MIN_ARBITRAGE_PROFIT = 0.5; // 0.5%

/**
 * Calculate optimal stakes for arbitrage bet
 *
 * @param overOdds - American odds for Over side
 * @param underOdds - American odds for Under side
 * @param totalStake - Total amount to wager (e.g., 100)
 * @returns Stake amounts for each side
 */
function calculateArbitrageStakes(
  overOdds: number,
  underOdds: number,
  totalStake: number = 100
): { overStake: number; underStake: number } {
  const overImplied = oddsToImpliedProbability(overOdds);
  const underImplied = oddsToImpliedProbability(underOdds);

  // Total implied probability (should be < 1 for arbitrage)
  const totalImplied = overImplied + underImplied;

  // Stake proportions
  const overStake = (overImplied / totalImplied) * totalStake;
  const underStake = (underImplied / totalImplied) * totalStake;

  return {
    overStake: Math.round(overStake * 100) / 100,
    underStake: Math.round(underStake * 100) / 100,
  };
}

/**
 * Calculate guaranteed profit from arbitrage
 *
 * @param overOdds - American odds for Over side
 * @param underOdds - American odds for Under side
 * @param totalStake - Total amount wagered
 * @returns Profit percentage and amount
 */
function calculateArbitrageProfit(
  overOdds: number,
  underOdds: number,
  totalStake: number = 100
): { profitPercent: number; profitAmount: number } {
  const overImplied = oddsToImpliedProbability(overOdds);
  const underImplied = oddsToImpliedProbability(underOdds);
  const totalImplied = overImplied + underImplied;

  if (totalImplied >= 1) {
    // No arbitrage exists
    return { profitPercent: 0, profitAmount: 0 };
  }

  // Profit percentage
  const profitPercent = ((1 / totalImplied) - 1) * 100;

  // Profit amount (guaranteed regardless of outcome)
  const profitAmount = totalStake * (profitPercent / 100);

  return {
    profitPercent: Math.round(profitPercent * 100) / 100,
    profitAmount: Math.round(profitAmount * 100) / 100,
  };
}

/**
 * Detect arbitrage opportunity between two sportsbooks
 *
 * @param book1 - First sportsbook odds
 * @param book2 - Second sportsbook odds
 * @param playerName - Player name
 * @param propType - Prop type (e.g., "Points")
 * @param gameInfo - Game information
 * @returns Arbitrage opportunity if found, null otherwise
 */
export function detectArbitrageBetweenBooks(
  book1: SportsbookOdds,
  book2: SportsbookOdds,
  playerName: string,
  propType: string,
  gameInfo: { homeTeam: string; awayTeam: string; gameTime: string }
): ArbitrageOpportunity | null {
  // Try all combinations:
  // 1. Book1 Over vs Book2 Under
  // 2. Book1 Under vs Book2 Over

  const combinations = [
    {
      overBook: book1,
      overOdds: book1.overOdds,
      underBook: book2,
      underOdds: book2.underOdds,
    },
    {
      overBook: book2,
      overOdds: book2.overOdds,
      underBook: book1,
      underOdds: book1.underOdds,
    },
  ];

  for (const combo of combinations) {
    const { profitPercent, profitAmount } = calculateArbitrageProfit(
      combo.overOdds,
      combo.underOdds,
      100
    );

    if (profitPercent >= MIN_ARBITRAGE_PROFIT) {
      const stakes = calculateArbitrageStakes(combo.overOdds, combo.underOdds, 100);

      // Determine line difference for confidence
      const lineDiff = Math.abs(combo.overBook.line - combo.underBook.line);
      let confidence: 'high' | 'medium' | 'low';

      if (lineDiff === 0 && profitPercent >= 1.5) {
        confidence = 'high'; // Same line, good profit
      } else if (lineDiff <= 1 && profitPercent >= 1.0) {
        confidence = 'high';
      } else if (lineDiff <= 2 || profitPercent >= 0.8) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }

      return {
        id: `arb-${playerName}-${propType}-${Date.now()}`,
        type: lineDiff > 1 ? 'middle' : 'arbitrage',
        player: playerName,
        propType,
        sport: 'NBA', // TODO: Pass this in dynamically
        game: gameInfo,
        overBook: {
          sportsbook: combo.overBook.sportsbook,
          sportsbookKey: combo.overBook.sportsbookKey,
          line: combo.overBook.line,
          odds: combo.overOdds,
          logoUrl: combo.overBook.logoUrl,
        },
        underBook: {
          sportsbook: combo.underBook.sportsbook,
          sportsbookKey: combo.underBook.sportsbookKey,
          line: combo.underBook.line,
          odds: combo.underOdds,
          logoUrl: combo.underBook.logoUrl,
        },
        guaranteedProfit: profitPercent,
        totalStake: 100,
        overStake: stakes.overStake,
        underStake: stakes.underStake,
        profitAmount,
        confidence,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
      };
    }
  }

  return null;
}

/**
 * Detect all arbitrage opportunities for a prop across multiple sportsbooks
 *
 * @param books - Array of sportsbook odds for the same prop
 * @param playerName - Player name
 * @param propType - Prop type
 * @param gameInfo - Game information
 * @returns Array of arbitrage opportunities
 */
export function detectAllArbitrageOpportunities(
  books: SportsbookOdds[],
  playerName: string,
  propType: string,
  gameInfo: { homeTeam: string; awayTeam: string; gameTime: string }
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  // Check all pair combinations
  for (let i = 0; i < books.length; i++) {
    for (let j = i + 1; j < books.length; j++) {
      const arb = detectArbitrageBetweenBooks(
        books[i],
        books[j],
        playerName,
        propType,
        gameInfo
      );

      if (arb) {
        // Check if we already have a better opportunity for this player/prop
        const existing = opportunities.find(
          (o) => o.player === arb.player && o.propType === arb.propType
        );

        if (!existing || existing.guaranteedProfit < arb.guaranteedProfit) {
          // Remove existing if this is better
          if (existing) {
            const index = opportunities.indexOf(existing);
            opportunities.splice(index, 1);
          }
          opportunities.push(arb);
        }
      }
    }
  }

  return opportunities;
}

/**
 * Detect middle betting opportunities
 *
 * Middle bets occur when two books have different lines for the same prop,
 * creating a "window" where you can win both bets
 *
 * @param books - Array of sportsbook odds
 * @param playerName - Player name
 * @param propType - Prop type
 * @param gameInfo - Game information
 * @returns Array of middle opportunities
 */
export function detectMiddleOpportunities(
  books: SportsbookOdds[],
  playerName: string,
  propType: string,
  gameInfo: { homeTeam: string; awayTeam: string; gameTime: string }
): ArbitrageOpportunity[] {
  const middles: ArbitrageOpportunity[] = [];

  // Find books with different lines
  for (let i = 0; i < books.length; i++) {
    for (let j = i + 1; j < books.length; j++) {
      const book1 = books[i];
      const book2 = books[j];

      const lineDiff = Math.abs(book1.line - book2.line);

      // Middle opportunity exists if lines differ by 2+ points
      if (lineDiff >= 2) {
        // Determine which book has the lower line (bet Over there)
        // and which has the higher line (bet Under there)
        const lowerLineBook = book1.line < book2.line ? book1 : book2;
        const higherLineBook = book1.line > book2.line ? book1 : book2;

        // Calculate if this middle is profitable
        const overOdds = lowerLineBook.overOdds;
        const underOdds = higherLineBook.underOdds;

        const { profitPercent, profitAmount } = calculateArbitrageProfit(
          overOdds,
          underOdds,
          100
        );

        // Middle is attractive if either:
        // 1. It's a guaranteed profit (arbitrage)
        // 2. The middle window is large enough (3+ points) with reasonable odds
        const isAttractive =
          profitPercent >= MIN_ARBITRAGE_PROFIT || lineDiff >= 3;

        if (isAttractive) {
          const stakes = calculateArbitrageStakes(overOdds, underOdds, 100);

          middles.push({
            id: `middle-${playerName}-${propType}-${Date.now()}`,
            type: 'middle',
            player: playerName,
            propType,
            sport: 'NBA',
            game: gameInfo,
            overBook: {
              sportsbook: lowerLineBook.sportsbook,
              sportsbookKey: lowerLineBook.sportsbookKey,
              line: lowerLineBook.line,
              odds: overOdds,
              logoUrl: lowerLineBook.logoUrl,
            },
            underBook: {
              sportsbook: higherLineBook.sportsbook,
              sportsbookKey: higherLineBook.sportsbookKey,
              line: higherLineBook.line,
              odds: underOdds,
              logoUrl: higherLineBook.logoUrl,
            },
            guaranteedProfit: profitPercent >= 0 ? profitPercent : 0,
            totalStake: 100,
            overStake: stakes.overStake,
            underStake: stakes.underStake,
            profitAmount: profitAmount >= 0 ? profitAmount : 0,
            confidence: lineDiff >= 3 ? 'high' : 'medium',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          });
        }
      }
    }
  }

  return middles;
}

/**
 * Sort arbitrage opportunities by profit (highest first)
 */
export function sortArbitrageOpportunities(
  opportunities: ArbitrageOpportunity[]
): ArbitrageOpportunity[] {
  return opportunities.sort((a, b) => b.guaranteedProfit - a.guaranteedProfit);
}

/**
 * Filter arbitrage opportunities by minimum profit threshold
 */
export function filterArbitrageByProfit(
  opportunities: ArbitrageOpportunity[],
  minProfit: number
): ArbitrageOpportunity[] {
  return opportunities.filter((opp) => opp.guaranteedProfit >= minProfit);
}

/**
 * Get arbitrage summary statistics
 */
export function getArbitrageSummary(opportunities: ArbitrageOpportunity[]): {
  total: number;
  highConfidence: number;
  averageProfit: number;
  bestProfit: number;
  totalPotentialProfit: number;
} {
  if (opportunities.length === 0) {
    return {
      total: 0,
      highConfidence: 0,
      averageProfit: 0,
      bestProfit: 0,
      totalPotentialProfit: 0,
    };
  }

  const highConfidence = opportunities.filter(
    (o) => o.confidence === 'high'
  ).length;

  const averageProfit =
    opportunities.reduce((sum, o) => sum + o.guaranteedProfit, 0) /
    opportunities.length;

  const bestProfit = Math.max(...opportunities.map((o) => o.guaranteedProfit));

  const totalPotentialProfit = opportunities.reduce(
    (sum, o) => sum + o.profitAmount,
    0
  );

  return {
    total: opportunities.length,
    highConfidence,
    averageProfit: Math.round(averageProfit * 100) / 100,
    bestProfit: Math.round(bestProfit * 100) / 100,
    totalPotentialProfit: Math.round(totalPotentialProfit * 100) / 100,
  };
}

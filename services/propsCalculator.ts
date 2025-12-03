// Props Calculation Engine
// Generates player prop projections based on statistical analysis
// Now integrated with real data from PlayerPropsService

import { PlayerProp } from './playerPropsService';
import { ESPNGame, ESPNAthlete } from './sportsApi';

export interface PlayerStats {
  recentGames: number[];
  seasonAverage: number;
  homeAverage?: number;
  awayAverage?: number;
  vsOpponentAverage?: number;
}

export interface PropCalculation {
  line: number;
  projection: number;
  confidence: number;
  over: boolean;
  trend: 'up' | 'down' | 'stable';
  reasoning: string;
  hitRate: number;
}

export class PropsCalculator {
  // Calculate last N games average
  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  // Calculate standard deviation for confidence scoring
  private static calculateStdDev(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  // Determine trend based on recent performance
  private static calculateTrend(recentGames: number[]): 'up' | 'down' | 'stable' {
    if (recentGames.length < 3) return 'stable';

    const firstHalf = recentGames.slice(0, Math.floor(recentGames.length / 2));
    const secondHalf = recentGames.slice(Math.floor(recentGames.length / 2));

    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);

    const difference = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (difference > 10) return 'up';
    if (difference < -10) return 'down';
    return 'stable';
  }

  // Calculate confidence score (0-100)
  private static calculateConfidence(
    projection: number,
    line: number,
    recentGames: number[],
    seasonAverage: number
  ): number {
    // Base confidence starts at 50
    let confidence = 50;

    // Recent consistency (how close recent games are to each other)
    const recentAvg = this.calculateAverage(recentGames);
    const stdDev = this.calculateStdDev(recentGames, recentAvg);
    // Prevent division by zero
    const consistency = recentAvg > 0
      ? Math.max(0, 100 - (stdDev / recentAvg) * 100)
      : 50;
    confidence += (consistency - 50) * 0.3; // Add up to ±15 points

    // Distance from line (more confident if projection is far from line)
    const lineDistance = Math.abs(projection - line);
    // Prevent division by zero
    const lineDistanceScore = line > 0
      ? Math.min(lineDistance / line * 100, 30)
      : 0;
    confidence += lineDistanceScore * 0.5; // Add up to 15 points

    // Recent vs season average alignment
    const avgDifference = Math.abs(recentAvg - seasonAverage);
    // Prevent division by zero
    const alignment = seasonAverage > 0
      ? Math.max(0, 100 - (avgDifference / seasonAverage) * 100)
      : 50;
    confidence += (alignment - 50) * 0.2; // Add up to ±10 points

    // Hit rate of recent games over/under the line
    const hitsOverLine = recentGames.filter(game =>
      projection > line ? game > line : game < line
    ).length;
    const hitRate = recentGames.length > 0
      ? (hitsOverLine / recentGames.length) * 100
      : 50;
    confidence += (hitRate - 50) * 0.2; // Add up to ±10 points

    // Clamp between 55 and 95 (never show absolute certainty)
    return Math.round(Math.max(55, Math.min(95, confidence)));
  }

  // Calculate hit rate (how often projection would have been correct)
  private static calculateHitRate(recentGames: number[], line: number, over: boolean): number {
    if (recentGames.length === 0) return 50;

    const hits = recentGames.filter(game =>
      over ? game > line : game < line
    ).length;

    return Math.round((hits / recentGames.length) * 100);
  }

  // Generate reasoning text
  private static generateReasoning(
    playerName: string,
    propType: string,
    stats: PlayerStats,
    calculation: PropCalculation,
    opponent: string
  ): string {
    const reasons: string[] = [];

    // Recent form
    const recentAvg = this.calculateAverage(stats.recentGames);
    if (calculation.trend === 'up') {
      reasons.push(`${playerName} is hot, averaging ${recentAvg} in last ${stats.recentGames.length} games`);
    } else if (calculation.trend === 'down') {
      reasons.push(`${playerName} has cooled off recently with ${recentAvg} avg in L${stats.recentGames.length}`);
    }

    // Season vs recent
    const difference = recentAvg - stats.seasonAverage;
    if (Math.abs(difference) > stats.seasonAverage * 0.1) {
      if (difference > 0) {
        reasons.push(`Performing ${Math.abs(Math.round(difference))} above season avg`);
      } else {
        reasons.push(`Currently ${Math.abs(Math.round(difference))} below season avg`);
      }
    }

    // Matchup history
    if (stats.vsOpponentAverage && Math.abs(stats.vsOpponentAverage - stats.seasonAverage) > 2) {
      reasons.push(`Averages ${stats.vsOpponentAverage} vs ${opponent} historically`);
    }

    // Hit rate
    if (calculation.hitRate >= 70) {
      reasons.push(`Hit the ${calculation.over ? 'over' : 'under'} in ${calculation.hitRate}% of recent games`);
    }

    return reasons.join('. ') + '.';
  }

  // Main calculation method
  static calculateProp(
    playerName: string,
    propType: string,
    stats: PlayerStats,
    opponent: string,
    line?: number
  ): PropCalculation {
    // Calculate projection (weighted average of recent and season)
    const recentAvg = this.calculateAverage(stats.recentGames);
    const recentWeight = 0.65; // 65% weight to recent games
    const seasonWeight = 0.35; // 35% weight to season average

    let projection = (recentAvg * recentWeight) + (stats.seasonAverage * seasonWeight);

    // Adjust for opponent if data available
    if (stats.vsOpponentAverage) {
      projection = (projection * 0.7) + (stats.vsOpponentAverage * 0.3);
    }

    projection = Math.round(projection * 10) / 10;

    // Use provided line or generate one slightly below projection
    const calculatedLine = line || Math.round((projection - 0.5) * 10) / 10;

    // Determine over/under recommendation
    const over = projection > calculatedLine;

    // Calculate trend
    const trend = this.calculateTrend(stats.recentGames);

    // Calculate confidence
    const confidence = this.calculateConfidence(
      projection,
      calculatedLine,
      stats.recentGames,
      stats.seasonAverage
    );

    // Calculate hit rate
    const hitRate = this.calculateHitRate(stats.recentGames, calculatedLine, over);

    // Generate reasoning
    const reasoning = this.generateReasoning(
      playerName,
      propType,
      stats,
      { line: calculatedLine, projection, confidence, over, trend, hitRate, reasoning: '' },
      opponent
    );

    return {
      line: calculatedLine,
      projection,
      confidence,
      over,
      trend,
      hitRate,
      reasoning,
    };
  }

  // Generate sample stats for testing (simulates realistic player performance)
  static generateSampleStats(
    propType: string,
    sport: 'NBA' | 'NFL' | 'MLB' | 'NHL'
  ): PlayerStats {
    let baseValue = 0;
    let variance = 0;

    // Set realistic base values by sport and prop type
    switch (sport) {
      case 'NBA':
        if (propType.toLowerCase().includes('point')) {
          baseValue = 22;
          variance = 5;
        } else if (propType.toLowerCase().includes('rebound')) {
          baseValue = 8;
          variance = 3;
        } else if (propType.toLowerCase().includes('assist')) {
          baseValue = 6;
          variance = 2;
        }
        break;
      case 'NFL':
        if (propType.toLowerCase().includes('yard')) {
          baseValue = 250;
          variance = 50;
        } else if (propType.toLowerCase().includes('td')) {
          baseValue = 2;
          variance = 1;
        }
        break;
      case 'MLB':
        if (propType.toLowerCase().includes('hit')) {
          baseValue = 1;
          variance = 0.5;
        } else if (propType.toLowerCase().includes('strikeout')) {
          baseValue = 7;
          variance = 2;
        }
        break;
      case 'NHL':
        if (propType.toLowerCase().includes('point')) {
          baseValue = 1.5;
          variance = 0.8;
        } else if (propType.toLowerCase().includes('shot')) {
          baseValue = 4;
          variance = 1.5;
        }
        break;
    }

    // Generate deterministic recent games with predictable variance
    // Use index-based variance to ensure consistency
    const recentGames = Array.from({ length: 5 }, (_, index) => {
      // Deterministic variance pattern: [-1, -0.5, 0, 0.5, 1] * variance
      const deterministicVariance = ((index - 2) / 2) * variance;
      return Math.max(0, Math.round((baseValue + deterministicVariance) * 10) / 10);
    });

    const seasonAverage = baseValue;
    // Deterministic opponent average (slightly above base for consistency)
    const vsOpponentAverage = baseValue + (variance * 0.1);

    return {
      recentGames,
      seasonAverage,
      vsOpponentAverage: Math.round(vsOpponentAverage * 10) / 10,
    };
  }
}

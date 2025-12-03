import { NBAStatsAPIV2, PlayerGameLog, PlayerSeasonStats } from './nbaStatsApiV2';
import {
  formatGameLogToChartData,
  calculateHitRate,
  extractStatFromGame,
  calculateTrend,
  calculateAverage,
  ChartDataPoint,
  HitRateData,
} from '../utils/chartDataFormatter';
import { PlayerProp as MockPlayerProp } from '../data/mockProps';
import { PlayerProp as RealPlayerProp } from './playerPropsService';

// Support both PlayerProp types (mock and real)
type PlayerProp = MockPlayerProp | RealPlayerProp;

export interface PlayerChartData {
  chartData: ChartDataPoint[];
  hitRateData: HitRateData;
  trend: 'up' | 'down' | 'stable';
  seasonAverage: number;
  last5Average: number;
  last10Average: number;
  loading: boolean;
  error: string | null;
}

export interface PlayerStatsCache {
  [playerId: string]: {
    gameLog: PlayerGameLog[];
    seasonAverage: PlayerSeasonStats | null;
    timestamp: number;
  };
}

// In-memory cache (5 minutes TTL)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const statsCache: PlayerStatsCache = {};

/**
 * Player Stats Service
 * Central service to fetch, cache, and format player statistics for charts
 */
export class PlayerStatsService {
  /**
   * Get comprehensive chart data for a player prop
   */
  static async getPlayerChartData(
    playerProp: PlayerProp,
    gameLimit: number = 10,
    compact: boolean = false
  ): Promise<PlayerChartData> {
    try {
      // Extract player name and prop type - handle both mock and real prop interfaces
      const playerName = playerProp.playerName;
      const propType = 'propType' in playerProp ? playerProp.propType : playerProp.statType;
      const line = playerProp.line;
      const sport = playerProp.sport;

      // Check if this is a college sport (NCAAB or NCAAF)
      if (sport === 'NCAAB' || sport === 'NCAAF') {
        console.log(`College sport detected (${sport}), using fallback data for ${playerName}`);
        return this.getCollegeFallbackData(playerProp, propType, line, gameLimit);
      }

      // For NBA, continue with existing NBA Stats API logic
      console.log(`Searching for player: ${playerName}`);
      const currentSeason = NBAStatsAPIV2.getCurrentSeason();
      const players = await NBAStatsAPIV2.searchPlayers(playerName, currentSeason);

      if (players.length === 0) {
        throw new Error(`Player search failed: "${playerName}" not found in NBA database. This player may not be active in the ${currentSeason} season.`);
      }

      const player = players[0];
      console.log(`Found player: ${player.displayName} (ID: ${player.personId})`);

      // Fetch game log and season averages
      console.log(`Fetching stats for ${player.displayName}...`);
      let gameLog: PlayerGameLog[] = [];
      let seasonAverage: PlayerSeasonStats | null = null;

      try {
        [gameLog, seasonAverage] = await Promise.all([
          this.getGameLog(player.personId, currentSeason, gameLimit),
          this.getSeasonAverages(player.personId, currentSeason),
        ]);
      } catch (statsError) {
        throw new Error(`Stats fetch failed: Unable to retrieve game logs or season averages for ${player.displayName}. ${statsError instanceof Error ? statsError.message : 'Unknown error'}`);
      }

      if (gameLog.length === 0) {
        console.warn(
          `No game data: ${player.displayName} has no recent games in the ${currentSeason} season. Returning empty chart.`
        );

        const seasonAverageValue = seasonAverage
          ? this.extractSeasonStatValue(seasonAverage, propType)
          : 0;

        return {
          chartData: [],
          hitRateData: {
            hitRate: 0,
            hits: 0,
            misses: 0,
            pushes: 0,
            streak: { count: 0, type: 'none' },
          },
          trend: 'stable',
          seasonAverage: seasonAverageValue,
          last5Average: 0,
          last10Average: 0,
          loading: false,
          error: `${player.displayName} has no recent games in the ${currentSeason} season.`,
        };
      }

      console.log(`Successfully loaded ${gameLog.length} games for ${player.displayName}`);

      // Extract stat values based on prop type
      const statValues = gameLog.map(game => extractStatFromGame(game, propType));

      // Format data for chart
      // Note: Using teamId as string since new API returns string IDs
      const chartData = formatGameLogToChartData(
        gameLog as any, // Cast since formatGameLogToChartData expects old format
        propType,
        line,
        player.teamId,
        compact
      );

      // Calculate hit rate
      const hitRateData = calculateHitRate(statValues, line);

      // Calculate trend
      const trend = calculateTrend(statValues);

      // Calculate averages
      const last5Average = calculateAverage(statValues.slice(0, 5));
      const last10Average = calculateAverage(statValues);

      // Get season average - extract from season stats
      const seasonAverageValue = seasonAverage
        ? this.extractSeasonStatValue(seasonAverage, propType)
        : last10Average;

      return {
        chartData,
        hitRateData,
        trend,
        seasonAverage: seasonAverageValue,
        last5Average,
        last10Average,
        loading: false,
        error: null,
      };
    } catch (error) {
      console.error('Error fetching player chart data:', error);
      return {
        chartData: [],
        hitRateData: {
          hitRate: 0,
          hits: 0,
          misses: 0,
          pushes: 0,
          streak: { count: 0, type: 'none' },
        },
        trend: 'stable',
        seasonAverage: seasonAverage ? this.extractSeasonStatValue(seasonAverage, propType) : 0,
        last5Average: 0,
        last10Average: 0,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      };
    }
  }

  /**
   * Get cached or fetch game log for a player
   */
  private static async getGameLog(
    playerId: string,
    season: string,
    limit: number
  ): Promise<PlayerGameLog[]> {
    const cacheKey = playerId;

    // Check cache
    if (statsCache[cacheKey]) {
      const cached = statsCache[cacheKey];
      const isExpired = Date.now() - cached.timestamp > CACHE_TTL;

      if (!isExpired && cached.gameLog.length > 0) {
        return cached.gameLog.slice(0, limit);
      }
    }

    // Fetch fresh data
    const gameLog = await NBAStatsAPIV2.getPlayerGameLog(playerId, season, 'Regular Season', limit);

    // Update cache
    statsCache[cacheKey] = {
      ...statsCache[cacheKey],
      gameLog,
      timestamp: Date.now(),
    };

    return gameLog;
  }

  /**
   * Get cached or fetch season averages for a player
   */
  private static async getSeasonAverages(
    playerId: string,
    season: string
  ): Promise<PlayerSeasonStats | null> {
    const cacheKey = playerId;

    // Check cache
    if (statsCache[cacheKey]) {
      const cached = statsCache[cacheKey];
      const isExpired = Date.now() - cached.timestamp > CACHE_TTL;

      if (!isExpired && cached.seasonAverage) {
        return cached.seasonAverage;
      }
    }

    // Fetch fresh data
    const seasonAverage = await NBAStatsAPIV2.getPlayerSeasonStats(playerId, season);

    // Update cache
    if (seasonAverage) {
      statsCache[cacheKey] = {
        ...statsCache[cacheKey],
        seasonAverage,
        timestamp: Date.now(),
      };
    }

    return seasonAverage;
  }

  /**
   * Extract stat value from season stats based on prop type
   */
  private static extractSeasonStatValue(stats: PlayerSeasonStats, propType: string): number {
    const normalizedPropType = propType.toLowerCase();

    if (normalizedPropType.includes('point')) return stats.pts;
    if (normalizedPropType.includes('rebound')) return stats.reb;
    if (normalizedPropType.includes('assist')) return stats.ast;
    if (normalizedPropType.includes('3-pointer') || normalizedPropType.includes('three')) return stats.fg3m;
    if (normalizedPropType.includes('steal')) return stats.stl;
    if (normalizedPropType.includes('block')) return stats.blk;
    if (normalizedPropType.includes('turnover')) return stats.tov;
    if (normalizedPropType.includes('foul')) return stats.pf;
    if (normalizedPropType.includes('fg%') || normalizedPropType.includes('field goal')) return stats.fgPct * 100;
    if (normalizedPropType.includes('3pt%')) return stats.fg3Pct * 100;
    if (normalizedPropType.includes('ft%') || normalizedPropType.includes('free throw')) return stats.ftPct * 100;

    // Default to points if no match
    return stats.pts;
  }

  /**
   * Manually refresh player stats (bypasses cache)
   */
  static async refreshPlayerStats(playerId: string): Promise<void> {
    delete statsCache[playerId];
  }

  /**
   * Clear entire stats cache
   */
  static clearCache(): void {
    Object.keys(statsCache).forEach(key => delete statsCache[key]);
  }

  /**
   * Get cache statistics (for debugging)
   */
  static getCacheStats(): {
    entries: number;
    totalSize: number;
    oldestEntry: number | null;
  } {
    const entries = Object.keys(statsCache).length;
    const timestamps = Object.values(statsCache).map(c => c.timestamp);
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : null;

    return {
      entries,
      totalSize: entries,
      oldestEntry,
    };
  }

  /**
   * Get fallback chart data for college sports (NCAAB/NCAAF)
   * Returns realistic mock data based on the prop line
   */
  private static getCollegeFallbackData(
    playerProp: PlayerProp,
    propType: string,
    line: number,
    gameLimit: number
  ): PlayerChartData {
    // Generate realistic game data around the line
    const chartData: ChartDataPoint[] = [];
    const statValues: number[] = [];

    // Create game data for last N games
    for (let i = 0; i < gameLimit; i++) {
      // Generate stat value with some variance around the line
      // 60% chance to hit the line, 40% chance to miss
      const variance = Math.random() * (line * 0.4) - (line * 0.2); // ±20% variance
      const baseValue = line + variance;
      const statValue = Math.max(0, Math.round(baseValue * 10) / 10); // Round to 1 decimal

      statValues.push(statValue);

      // Generate date for game (going backwards from today)
      const gameDate = new Date(Date.now() - (i + 1) * 86400000);
      const month = gameDate.getMonth() + 1;
      const day = gameDate.getDate();
      const dateStr = `${month}/${day}`;

      // Random opponent abbreviation
      const opponents = ['DUKE', 'UNC', 'UK', 'KANS', 'UCLA', 'MSU', 'OSU', 'ND', 'SYR', 'VILL'];
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const isHome = Math.random() > 0.5;

      // Determine color based on whether stat hit the line
      const color = statValue >= line ? '#10B981' : '#EF4444';

      // Create ChartDataPoint with correct structure (x field with newlines)
      chartData.push({
        x: `${dateStr}\n${isHome ? 'Home' : 'Away'}\nvs ${opponent}`,
        y: statValue,
        label: statValue.toFixed(1),
        color,
        gameDate: gameDate.toISOString(),
        opponent,
        isHome,
      });
    }

    // Reverse to show oldest to newest
    chartData.reverse();
    statValues.reverse();

    // Calculate hit rate
    const hitRateData = calculateHitRate(statValues, line);

    // Calculate trend
    const trend = calculateTrend(statValues);

    // Calculate averages
    const last5Average = calculateAverage(statValues.slice(-5));
    const last10Average = calculateAverage(statValues);
    const seasonAverage = last10Average; // Use last 10 as season average for college

    return {
      chartData,
      hitRateData,
      trend,
      seasonAverage,
      last5Average,
      last10Average,
      loading: false,
      error: null,
    };
  }
}

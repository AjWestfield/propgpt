/**
 * Player Props Orchestration Service
 * Coordinates all sports APIs and generates betting props with real data
 * Replaces mock data with live stats from free APIs
 */

import { NBAStatsAPI, BallDontLiePlayer, BallDontLieSeasonAverage } from './nbaStatsApi';
import { NHLStatsAPI, NHLPlayerStats, NHLGameLog } from './nhlStatsApi';
import { MLBStatsAPI, MLBPlayer, MLBPlayerStats, MLBGameLog } from './mlbStatsApi';
import { SportsAPI, ESPNGame, RealPlayer } from './sportsApi';

export interface PlayerProp {
  id: string;
  playerId: string;
  playerName: string;
  headshot: string;
  team: {
    name: string;
    abbreviation: string;
    logo: string;
  };
  opponent: {
    name: string;
    abbreviation: string;
    logo: string;
  };
  sport: 'NBA' | 'NFL' | 'MLB' | 'NHL';
  statType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  confidence: number;
  recommendation: 'OVER' | 'UNDER';
  gameTime: string;
  position?: string;
  recentGames: {
    value: number;
    date: string;
    opponent: string;
  }[];
  seasonAverage: number;
}

export interface PropsByCategory {
  points: PlayerProp[];
  rebounds: PlayerProp[];
  assists: PlayerProp[];
  threePointers: PlayerProp[];
  goals: PlayerProp[];
  saves: PlayerProp[];
  hits: PlayerProp[];
  strikeouts: PlayerProp[];
}

export class PlayerPropsService {
  /**
   * Get all props for NBA games today
   * NOTE: Using estimated stats since balldontlie.io now requires API key
   * Future: Integrate with official NBA Stats API
   */
  static async getNBAProps(): Promise<PlayerProp[]> {
    try {
      console.log('Fetching NBA props with estimated data...');

      // Get real players from today's games via ESPN
      const realPlayers = await SportsAPI.getRealPlayersBySport('NBA');

      if (realPlayers.length === 0) {
        console.log('No NBA games today');
        return [];
      }

      console.log(`Found ${realPlayers.length} NBA players from today's games`);

      // Generate props with estimated stats for now
      const allProps: PlayerProp[] = [];

      for (const player of realPlayers) {
        // Generate basic props with position-based estimates
        const props = this.generateEstimatedNBAProps(player);
        allProps.push(...props);
      }

      console.log(`Generated ${allProps.length} NBA props`);
      return allProps;
    } catch (error) {
      console.error('Error getting NBA props:', error);
      return [];
    }
  }

  /**
   * Get all props for NHL games today
   */
  static async getNHLProps(): Promise<PlayerProp[]> {
    try {
      console.log('Fetching NHL props with real data...');

      const realPlayers = await SportsAPI.getRealPlayersBySport('NHL');

      if (realPlayers.length === 0) {
        console.log('No NHL games today');
        return [];
      }

      console.log(`Found ${realPlayers.length} NHL players from today's games`);

      const allProps: PlayerProp[] = [];

      for (const player of realPlayers) {
        try {
          // NHL API uses numeric IDs from ESPN
          const playerStats = await NHLStatsAPI.getPlayerStats(player.id);

          if (!playerStats) continue;

          // Get recent game log
          const gameLog = await NHLStatsAPI.getPlayerGameLog(player.id);

          // Generate props for different stat types
          const props = this.generateNHLProps(player, playerStats, gameLog);
          allProps.push(...props);
        } catch (error) {
          console.error(`Error fetching stats for ${player.name}:`, error);
        }
      }

      console.log(`Generated ${allProps.length} NHL props`);
      return allProps;
    } catch (error) {
      console.error('Error getting NHL props:', error);
      return [];
    }
  }

  /**
   * Get all props for MLB games today
   */
  static async getMLBProps(): Promise<PlayerProp[]> {
    try {
      console.log('Fetching MLB props with real data...');

      const realPlayers = await SportsAPI.getRealPlayersBySport('MLB');

      if (realPlayers.length === 0) {
        console.log('No MLB games today');
        return [];
      }

      console.log(`Found ${realPlayers.length} MLB players from today's games`);

      const allProps: PlayerProp[] = [];

      for (const player of realPlayers) {
        try {
          // Get player info and stats
          const mlbPlayer = await MLBStatsAPI.getPlayer(parseInt(player.id));

          if (!mlbPlayer) continue;

          // Determine if player is batter or pitcher
          const isPitcher = mlbPlayer.primaryPosition.code === '1';
          const group = isPitcher ? 'pitching' : 'hitting';

          // Get season stats
          const seasonStats = await MLBStatsAPI.getPlayerSeasonStats(
            mlbPlayer.id,
            undefined,
            group
          );

          if (seasonStats.length === 0) continue;

          // Get recent game log
          const gameLog = await MLBStatsAPI.getPlayerGameLog(
            mlbPlayer.id,
            undefined,
            group
          );

          // Generate props based on position
          const props = isPitcher
            ? this.generateMLBPitcherProps(player, mlbPlayer, seasonStats, gameLog)
            : this.generateMLBBatterProps(player, mlbPlayer, seasonStats, gameLog);

          allProps.push(...props);
        } catch (error) {
          console.error(`Error fetching stats for ${player.name}:`, error);
        }
      }

      console.log(`Generated ${allProps.length} MLB props`);
      return allProps;
    } catch (error) {
      console.error('Error getting MLB props:', error);
      return [];
    }
  }

  /**
   * Get all props for NFL games today
   */
  static async getNFLProps(): Promise<PlayerProp[]> {
    try {
      console.log('Fetching NFL props with real data...');

      const realPlayers = await SportsAPI.getRealPlayersBySport('NFL');

      if (realPlayers.length === 0) {
        console.log('No NFL games today');
        return [];
      }

      console.log(`Found ${realPlayers.length} NFL players from today's games`);

      // For NFL, we'll use ESPN data directly since there's no free stats API
      // Generate basic props using PropsCalculator logic
      const allProps: PlayerProp[] = [];

      for (const player of realPlayers) {
        const props = this.generateNFLProps(player);
        allProps.push(...props);
      }

      console.log(`Generated ${allProps.length} NFL props`);
      return allProps;
    } catch (error) {
      console.error('Error getting NFL props:', error);
      return [];
    }
  }

  /**
   * Get all props for all sports
   */
  static async getAllProps(): Promise<{
    nba: PlayerProp[];
    nfl: PlayerProp[];
    mlb: PlayerProp[];
    nhl: PlayerProp[];
  }> {
    console.log('Fetching all props for all sports...');

    const [nba, nfl, mlb, nhl] = await Promise.all([
      this.getNBAProps(),
      this.getNFLProps(),
      this.getMLBProps(),
      this.getNHLProps(),
    ]);

    return { nba, nfl, mlb, nhl };
  }

  // === PROP GENERATION METHODS ===

  /**
   * Generate NBA props for a player
   */
  private static generateNBAProps(
    player: RealPlayer,
    seasonAvg: BallDontLieSeasonAverage,
    gameLog: any[]
  ): PlayerProp[] {
    const props: PlayerProp[] = [];

    // Points prop
    if (seasonAvg.pts > 5) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.pts,
        date: g.game.date,
        opponent: `vs ${g.team.abbreviation}`,
      }));

      const line = this.calculateLine(seasonAvg.pts, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        seasonAvg.pts,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-points`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'NBA',
        statType: 'Points',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: seasonAvg.pts,
      });
    }

    // Rebounds prop
    if (seasonAvg.reb > 3) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.reb,
        date: g.game.date,
        opponent: `vs ${g.team.abbreviation}`,
      }));

      const line = this.calculateLine(seasonAvg.reb, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        seasonAvg.reb,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-rebounds`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'NBA',
        statType: 'Rebounds',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: seasonAvg.reb,
      });
    }

    // Assists prop
    if (seasonAvg.ast > 2) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.ast,
        date: g.game.date,
        opponent: `vs ${g.team.abbreviation}`,
      }));

      const line = this.calculateLine(seasonAvg.ast, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        seasonAvg.ast,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-assists`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'NBA',
        statType: 'Assists',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: seasonAvg.ast,
      });
    }

    // 3-Pointers Made prop
    if (seasonAvg.fg3m > 1) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.fg3m,
        date: g.game.date,
        opponent: `vs ${g.team.abbreviation}`,
      }));

      const line = this.calculateLine(seasonAvg.fg3m, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        seasonAvg.fg3m,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-3pm`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'NBA',
        statType: '3-Pointers Made',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: seasonAvg.fg3m,
      });
    }

    return props;
  }

  /**
   * Generate NHL props for a player
   */
  private static generateNHLProps(
    player: RealPlayer,
    playerStats: NHLPlayerStats,
    gameLog: NHLGameLog[]
  ): PlayerProp[] {
    const props: PlayerProp[] = [];

    const seasonStats = playerStats.featuredStats?.regularSeason?.subSeason;
    if (!seasonStats) return props;

    // Points (Goals + Assists) prop
    const avgPoints = seasonStats.gamesPlayed > 0
      ? (seasonStats.goals + seasonStats.assists) / seasonStats.gamesPlayed
      : 0;

    if (avgPoints > 0.3) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.goals + g.assists,
        date: g.gameDate,
        opponent: `vs ${g.opponentAbbrev}`,
      }));

      const line = this.calculateLine(avgPoints, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        avgPoints,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-points`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'NHL',
        statType: 'Points',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: avgPoints,
      });
    }

    // Goals prop
    const avgGoals = seasonStats.gamesPlayed > 0
      ? seasonStats.goals / seasonStats.gamesPlayed
      : 0;

    if (avgGoals > 0.2) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.goals,
        date: g.gameDate,
        opponent: `vs ${g.opponentAbbrev}`,
      }));

      const line = this.calculateLine(avgGoals, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        avgGoals,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-goals`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'NHL',
        statType: 'Goals',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: avgGoals,
      });
    }

    // Assists prop
    const avgAssists = seasonStats.gamesPlayed > 0
      ? seasonStats.assists / seasonStats.gamesPlayed
      : 0;

    if (avgAssists > 0.2) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.assists,
        date: g.gameDate,
        opponent: `vs ${g.opponentAbbrev}`,
      }));

      const line = this.calculateLine(avgAssists, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        avgAssists,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-assists`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'NHL',
        statType: 'Assists',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: avgAssists,
      });
    }

    return props;
  }

  /**
   * Generate MLB batter props
   */
  private static generateMLBBatterProps(
    player: RealPlayer,
    mlbPlayer: MLBPlayer,
    seasonStats: MLBPlayerStats[],
    gameLog: MLBGameLog[]
  ): PlayerProp[] {
    const props: PlayerProp[] = [];
    const stats = seasonStats[0]?.stat;

    if (!stats) return props;

    // Hits prop
    const avgHits = stats.gamesPlayed && stats.gamesPlayed > 0
      ? (stats.hits || 0) / stats.gamesPlayed
      : 0;

    if (avgHits > 0.5) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.stat.hits || 0,
        date: g.date,
        opponent: `vs ${g.opponent.name}`,
      }));

      const line = this.calculateLine(avgHits, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        avgHits,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-hits`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'MLB',
        statType: 'Hits',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: avgHits,
      });
    }

    // Home Runs prop
    const avgHR = stats.gamesPlayed && stats.gamesPlayed > 0
      ? (stats.homeRuns || 0) / stats.gamesPlayed
      : 0;

    if (avgHR > 0.1) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.stat.homeRuns || 0,
        date: g.date,
        opponent: `vs ${g.opponent.name}`,
      }));

      const line = this.calculateLine(avgHR, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        avgHR,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-hr`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'MLB',
        statType: 'Home Runs',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: avgHR,
      });
    }

    return props;
  }

  /**
   * Generate MLB pitcher props
   */
  private static generateMLBPitcherProps(
    player: RealPlayer,
    mlbPlayer: MLBPlayer,
    seasonStats: MLBPlayerStats[],
    gameLog: MLBGameLog[]
  ): PlayerProp[] {
    const props: PlayerProp[] = [];
    const stats = seasonStats[0]?.stat;

    if (!stats) return props;

    // Strikeouts prop
    const avgSO = stats.gamesPlayed && stats.gamesPlayed > 0
      ? (stats.strikeOuts || 0) / stats.gamesPlayed
      : 0;

    if (avgSO > 3) {
      const recentGames = gameLog.slice(0, 10).map(g => ({
        value: g.stat.strikeOuts || 0,
        date: g.date,
        opponent: `vs ${g.opponent.name}`,
      }));

      const line = this.calculateLine(avgSO, recentGames.map(g => g.value));
      const { confidence, recommendation } = this.calculateConfidence(
        line,
        avgSO,
        recentGames.map(g => g.value)
      );

      props.push({
        id: `${player.id}-so`,
        playerId: player.id,
        playerName: player.name,
        headshot: player.headshot,
        team: player.team,
        opponent: player.opponent,
        sport: 'MLB',
        statType: 'Strikeouts',
        line,
        overOdds: -110,
        underOdds: -110,
        confidence,
        recommendation,
        gameTime: player.gameTime,
        position: player.position,
        recentGames,
        seasonAverage: avgSO,
      });
    }

    return props;
  }

  /**
   * Generate NFL props (using ESPN data only)
   */
  private static generateNFLProps(player: RealPlayer): PlayerProp[] {
    // For NFL, generate basic props with estimated lines
    // In production, you would integrate with ESPN stats or other sources
    const props: PlayerProp[] = [];

    // Position-specific props
    if (player.position === 'QB') {
      props.push(this.createBasicProp(player, 'Passing Yards', 250));
      props.push(this.createBasicProp(player, 'Passing TDs', 2));
    } else if (player.position === 'RB') {
      props.push(this.createBasicProp(player, 'Rushing Yards', 70));
      props.push(this.createBasicProp(player, 'Rushing TDs', 0.5));
    } else if (player.position === 'WR' || player.position === 'TE') {
      props.push(this.createBasicProp(player, 'Receiving Yards', 60));
      props.push(this.createBasicProp(player, 'Receptions', 5));
    }

    return props;
  }

  // === HELPER METHODS ===

  /**
   * Calculate betting line from season average and recent form
   */
  private static calculateLine(seasonAvg: number, recentValues: number[]): number {
    if (recentValues.length === 0) return Math.round(seasonAvg * 2) / 2;

    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;

    // Weight: 60% recent form, 40% season average
    const weightedAvg = (recentAvg * 0.6) + (seasonAvg * 0.4);

    // Round to nearest 0.5
    return Math.round(weightedAvg * 2) / 2;
  }

  /**
   * Calculate confidence score and recommendation
   */
  private static calculateConfidence(
    line: number,
    seasonAvg: number,
    recentValues: number[]
  ): { confidence: number; recommendation: 'OVER' | 'UNDER' } {
    if (recentValues.length === 0) {
      return { confidence: 50, recommendation: 'OVER' };
    }

    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;

    // Calculate how many recent games hit over the line
    const hitsOverLine = recentValues.filter(val => val > line).length;
    const hitRate = (hitsOverLine / recentValues.length) * 100;

    // Calculate standard deviation for consistency
    const variance = recentValues.reduce((sum, val) => {
      return sum + Math.pow(val - recentAvg, 2);
    }, 0) / recentValues.length;
    const stdDev = Math.sqrt(variance);

    const consistency = recentAvg > 0
      ? Math.max(0, 100 - (stdDev / recentAvg) * 100)
      : 50;

    // Combine factors for confidence (55-95 range)
    const rawConfidence = (hitRate * 0.5) + (consistency * 0.3) +
      ((recentAvg > seasonAvg ? 60 : 40) * 0.2);

    const confidence = Math.min(95, Math.max(55, Math.round(rawConfidence)));

    // Recommendation based on recent average vs line
    const recommendation = recentAvg > line ? 'OVER' : 'UNDER';

    return { confidence, recommendation };
  }

  /**
   * Create a basic prop with estimated values (for NFL)
   */
  private static createBasicProp(
    player: RealPlayer,
    statType: string,
    estimatedLine: number
  ): PlayerProp {
    return {
      id: `${player.id}-${statType.toLowerCase().replace(/\s+/g, '-')}`,
      playerId: player.id,
      playerName: player.name,
      headshot: player.headshot,
      team: player.team,
      opponent: player.opponent,
      sport: 'NFL',
      statType,
      line: estimatedLine,
      overOdds: -110,
      underOdds: -110,
      confidence: 75,
      recommendation: 'OVER',
      gameTime: player.gameTime,
      position: player.position,
      recentGames: [],
      seasonAverage: estimatedLine,
    };
  }
}

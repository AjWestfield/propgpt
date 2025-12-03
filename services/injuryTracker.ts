import { Sport } from '../types/game';
import { InjuryTrend } from '../types/trends';
import TrendsAPI from './trendsApi';

const ESPN_CORE_BASE = 'https://sports.core.api.espn.com/v2';
const PLAYER_STATS_TTL = 5 * 60 * 1000; // 5 minutes

type NormalizedPlayerStats = {
  pointsPerGame?: number;
  assistsPerGame?: number;
  reboundsPerGame?: number;
  minutesPerGame?: number;
  usageShare?: number;
  passingYardsPerGame?: number;
  rushingYardsPerGame?: number;
  receivingYardsPerGame?: number;
  passingTouchdownsPerGame?: number;
  rushingTouchdownsPerGame?: number;
  receivingTouchdownsPerGame?: number;
  touchesPerGame?: number;
  combinedYardsPerGame?: number;
  battingAverage?: number;
  ops?: number;
  homeRunsPer162?: number;
};

class InjuryTracker {
  private fallbackPlayers: Record<Sport, Array<{ name: string; team: string; position: string; image?: string; logo?: string }>> = {
    NBA: [
      {
        name: 'LeBron James',
        team: 'Los Angeles Lakers',
        position: 'SF',
        image: 'https://a.espncdn.com/i/headshots/nba/players/full/1966.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
      },
      {
        name: 'Stephen Curry',
        team: 'Golden State Warriors',
        position: 'PG',
        image: 'https://a.espncdn.com/i/headshots/nba/players/full/3975.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
      },
      {
        name: 'Jayson Tatum',
        team: 'Boston Celtics',
        position: 'SF',
        image: 'https://a.espncdn.com/i/headshots/nba/players/full/4065648.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
      },
      {
        name: 'Nikola Jokic',
        team: 'Denver Nuggets',
        position: 'C',
        image: 'https://a.espncdn.com/i/headshots/nba/players/full/3112335.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
      },
    ],
    NFL: [
      {
        name: 'Patrick Mahomes',
        team: 'Kansas City Chiefs',
        position: 'QB',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3139477.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
      },
      {
        name: 'Josh Allen',
        team: 'Buffalo Bills',
        position: 'QB',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3918298.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
      },
      {
        name: 'Justin Jefferson',
        team: 'Minnesota Vikings',
        position: 'WR',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4242335.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
      },
      {
        name: 'Travis Kelce',
        team: 'Kansas City Chiefs',
        position: 'TE',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/15847.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
      },
    ],
    MLB: [
      {
        name: 'Shohei Ohtani',
        team: 'Los Angeles Dodgers',
        position: 'SP',
        image: 'https://a.espncdn.com/i/headshots/mlb/players/full/39832.png',
        logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
      },
      {
        name: 'Aaron Judge',
        team: 'New York Yankees',
        position: 'OF',
        image: 'https://a.espncdn.com/i/headshots/mlb/players/full/33192.png',
        logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
      },
      {
        name: 'Juan Soto',
        team: 'New York Yankees',
        position: 'OF',
        image: 'https://a.espncdn.com/i/headshots/mlb/players/full/36168.png',
        logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
      },
      {
        name: 'Ronald Acuña Jr.',
        team: 'Atlanta Braves',
        position: 'OF',
        image: 'https://a.espncdn.com/i/headshots/mlb/players/full/36169.png',
        logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png',
      },
    ],
    NHL: [
      {
        name: 'Connor McDavid',
        team: 'Edmonton Oilers',
        position: 'C',
        image: 'https://a.espncdn.com/i/headshots/nhl/players/full/3954690.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png',
      },
      {
        name: 'Nathan MacKinnon',
        team: 'Colorado Avalanche',
        position: 'C',
        image: 'https://a.espncdn.com/i/headshots/nhl/players/full/2563034.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png',
      },
      {
        name: 'Auston Matthews',
        team: 'Toronto Maple Leafs',
        position: 'C',
        image: 'https://a.espncdn.com/i/headshots/nhl/players/full/3987645.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png',
      },
      {
        name: 'David Pastrnak',
        team: 'Boston Bruins',
        position: 'RW',
        image: 'https://a.espncdn.com/i/headshots/nhl/players/full/3155277.png',
        logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png',
      },
    ],
  };
  private playerStatsCache: Map<string, { stats: NormalizedPlayerStats; timestamp: number }> = new Map();
  /**
   * Calculate impact score based on sport-specific metrics
   */
  private calculateImpactScore(
    stats: NormalizedPlayerStats | null,
    position: string,
    sport: Sport
  ): number {
    switch (sport) {
      case 'NBA':
        return this.calculateNbaImpactScore(stats, position);
      case 'NFL':
        return this.calculateNflImpactScore(stats, position);
      case 'MLB':
        return this.calculateMlbImpactScore(stats, position);
      case 'NHL':
      default:
        return this.calculateFallbackImpactScore(stats, position);
    }
  }

  private getPositionWeight(position: string): number {
    const positionWeights: Record<string, number> = {
      QB: 40,
      RB: 32,
      WR: 30,
      TE: 25,
      PG: 36,
      SG: 32,
      SF: 30,
      PF: 30,
      C: 35,
      SP: 40,
      RP: 24,
      CATCHER: 28,
      '1B': 25,
      '2B': 25,
      '3B': 25,
      SS: 28,
      OF: 26,
      LW: 28,
      RW: 28,
      D: 30,
      G: 38,
    };

    return positionWeights[position?.toUpperCase()] || 20;
  }

  private clampScore(score: number): number {
    return Math.min(Math.max(Math.round(score), 5), 100);
  }

  private calculateNbaImpactScore(
    stats: NormalizedPlayerStats | null,
    position: string
  ): number {
    const base = this.getPositionWeight(position);
    if (!stats) {
      return this.clampScore(base + 25);
    }

    const pointsScore = stats.pointsPerGame
      ? Math.min((stats.pointsPerGame / 34) * 40, 40)
      : 0;
    const assistScore = stats.assistsPerGame
      ? Math.min((stats.assistsPerGame / 10) * 15, 15)
      : 0;
    const reboundScore = stats.reboundsPerGame
      ? Math.min((stats.reboundsPerGame / 13) * 15, 15)
      : 0;
    const minutesScore = stats.minutesPerGame
      ? Math.min((stats.minutesPerGame / 37) * 10, 10)
      : 0;
    const estimatedUsage =
      stats.usageShare ??
      ((stats.pointsPerGame || 0) / 28 + (stats.minutesPerGame || 0) / 36) / 2;
    const usageScore = Math.min(Math.max(estimatedUsage, 0) * 20, 20);

    const score =
      base + pointsScore + assistScore + reboundScore + minutesScore + usageScore;

    return this.clampScore(score);
  }

  private calculateNflImpactScore(
    stats: NormalizedPlayerStats | null,
    position: string
  ): number {
    const base = this.getPositionWeight(position);
    if (!stats) {
      return this.clampScore(base + 20);
    }

    const isQuarterback = position?.toUpperCase() === 'QB';
    if (isQuarterback) {
      const yardsScore = stats.passingYardsPerGame
        ? Math.min((stats.passingYardsPerGame / 325) * 45, 45)
        : 0;
      const tdScore = stats.passingTouchdownsPerGame
        ? Math.min((stats.passingTouchdownsPerGame / 3.2) * 25, 25)
        : 0;
      const rushingScore = stats.rushingYardsPerGame
        ? Math.min((stats.rushingYardsPerGame / 60) * 10, 10)
        : 0;
      const score = base + yardsScore + tdScore + rushingScore;
      return this.clampScore(score);
    }

    const totalYards =
      (stats.rushingYardsPerGame || 0) + (stats.receivingYardsPerGame || 0);
    const yardsScore = Math.min((totalYards / 160) * 40, 40);
    const touchdownsPerGame =
      (stats.rushingTouchdownsPerGame || 0) +
      (stats.receivingTouchdownsPerGame || 0);
    const touchdownScore = Math.min((touchdownsPerGame / 1.5) * 25, 25);
    const touchesScore = stats.touchesPerGame
      ? Math.min((stats.touchesPerGame / 25) * 20, 20)
      : 0;

    const score = base + yardsScore + touchdownScore + touchesScore;
    return this.clampScore(score);
  }

  private calculateMlbImpactScore(
    stats: NormalizedPlayerStats | null,
    position: string
  ): number {
    const base = this.getPositionWeight(position);
    if (!stats) {
      return this.clampScore(base + 15);
    }

    const avgScore = stats.battingAverage
      ? Math.min(
          Math.max((stats.battingAverage - 0.22) / 0.12, 0) * 25,
          25
        )
      : 0;
    const opsScore = stats.ops
      ? Math.min(Math.max((stats.ops - 0.65) / 0.45, 0) * 35, 35)
      : 0;
    const powerScore = stats.homeRunsPer162
      ? Math.min((stats.homeRunsPer162 / 45) * 20, 20)
      : 0;

    const score = base + avgScore + opsScore + powerScore;
    return this.clampScore(score);
  }

  private calculateFallbackImpactScore(
    stats: NormalizedPlayerStats | null,
    position: string
  ): number {
    const base = this.getPositionWeight(position);
    const usage = stats?.usageShare ? stats.usageShare * 15 : 10;
    const production = stats?.pointsPerGame
      ? Math.min((stats.pointsPerGame / 20) * 30, 30)
      : 15;
    return this.clampScore(base + usage + production);
  }

  /**
   * Determine injury severity level
   */
  private getInjurySeverity(
    status: string,
    impactScore: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (status === 'out' && impactScore > 70) return 'critical';
    if (status === 'out' && impactScore > 40) return 'high';
    if (status === 'doubtful' && impactScore > 60) return 'high';
    if (status === 'questionable' && impactScore > 70) return 'medium';
    if (status === 'out') return 'medium';
    return 'low';
  }

  /**
   * Calculate affected players' opportunity scores
   */
  private calculateAffectedPlayers(
    injuredPlayerStats: any,
    teamRoster: any[]
  ): InjuryTrend['affectedPlayers'] {
    const affected: InjuryTrend['affectedPlayers'] = [];

    // Distribute injured player's usage to teammates
    const usageToDistribute = injuredPlayerStats.usageRate || 20;

    // Filter teammates by position similarity
    const eligiblePlayers = teamRoster.filter(
      (player) =>
        player.id !== injuredPlayerStats.playerId && player.position !== 'BENCH'
    );

    eligiblePlayers.slice(0, 3).forEach((player, index) => {
      // Top 3 players get distributed usage
      const expectedIncrease = usageToDistribute / (index + 1) / 2; // Diminishing returns
      const opportunityScore = Math.min(
        85 - index * 15, // First player gets up to 85, second 70, third 55
        expectedIncrease * 3
      );

      affected.push({
        playerId: player.id,
        playerName: player.displayName || player.name,
        expectedUsageIncrease: Math.round(expectedIncrease * 10) / 10,
        opportunityScore: Math.round(opportunityScore),
      });
    });

    return affected;
  }

  private getCoreSportPath(sport: Sport): string | null {
    const paths: Record<Sport, string> = {
      NBA: 'sports/basketball/leagues/nba',
      NFL: 'sports/football/leagues/nfl',
      MLB: 'sports/baseball/leagues/mlb',
      NHL: 'sports/hockey/leagues/nhl',
    };
    return paths[sport] || null;
  }

  private extractStatValue(categories: any[], statName: string): number | undefined {
    for (const category of categories || []) {
      if (!category?.stats) continue;
      const stat = category.stats.find((s: any) => s.name === statName);
      if (stat && typeof stat.value === 'number') {
        return stat.value;
      }
    }
    return undefined;
  }

  private normalizeNbaStats(categories: any[]): NormalizedPlayerStats | null {
    const points = this.extractStatValue(categories, 'avgPoints');
    const assists = this.extractStatValue(categories, 'avgAssists');
    const rebounds = this.extractStatValue(categories, 'avgRebounds');
    const minutes = this.extractStatValue(categories, 'avgMinutes');

    if (!points && !assists && !rebounds && !minutes) {
      return null;
    }

    const usageShare =
      points || minutes
        ? ((points || 0) / 28 + (minutes || 0) / 36) / 2
        : undefined;

    return {
      pointsPerGame: points,
      assistsPerGame: assists,
      reboundsPerGame: rebounds,
      minutesPerGame: minutes,
      usageShare,
    };
  }

  private normalizeNflStats(categories: any[]): NormalizedPlayerStats | null {
    const games =
      this.extractStatValue(categories, 'gamesPlayed') ||
      this.extractStatValue(categories, 'teamGamesPlayed');

    const passingYardsPerGame =
      this.extractStatValue(categories, 'passingYardsPerGame') ??
      (games
        ? (this.extractStatValue(categories, 'passingYards') || 0) / games
        : undefined);

    const rushingYardsPerGame =
      this.extractStatValue(categories, 'rushingYardsPerGame') ??
      (games
        ? (this.extractStatValue(categories, 'rushingYards') || 0) / games
        : undefined);

    const receivingYardsPerGame =
      this.extractStatValue(categories, 'receivingYardsPerGame') ??
      (games
        ? (this.extractStatValue(categories, 'receivingYards') || 0) / games
        : undefined);

    const rushingAttempts = this.extractStatValue(categories, 'rushingAttempts') || 0;
    const receivingTargets = this.extractStatValue(categories, 'receivingTargets') || 0;
    const touchesPerGame =
      games && (rushingAttempts || receivingTargets)
        ? (rushingAttempts + receivingTargets) / games
        : undefined;

    const passingTDs = this.extractStatValue(categories, 'passingTouchdowns') || 0;
    const rushingTDs = this.extractStatValue(categories, 'rushingTouchdowns') || 0;
    const receivingTDs = this.extractStatValue(categories, 'receivingTouchdowns') || 0;

    const normalized: NormalizedPlayerStats = {
      passingYardsPerGame,
      rushingYardsPerGame,
      receivingYardsPerGame,
      touchesPerGame,
      passingTouchdownsPerGame: games ? passingTDs / games : undefined,
      rushingTouchdownsPerGame: games ? rushingTDs / games : undefined,
      receivingTouchdownsPerGame: games ? receivingTDs / games : undefined,
    };

    if (
      !normalized.passingYardsPerGame &&
      !normalized.rushingYardsPerGame &&
      !normalized.receivingYardsPerGame
    ) {
      return null;
    }

    normalized.combinedYardsPerGame =
      (normalized.rushingYardsPerGame || 0) + (normalized.receivingYardsPerGame || 0);

    return normalized;
  }

  private normalizeMlbStats(categories: any[]): NormalizedPlayerStats | null {
    const games = this.extractStatValue(categories, 'gamesPlayed');
    const battingAverage = this.extractStatValue(categories, 'avg');
    const ops = this.extractStatValue(categories, 'OPS');
    const homeRuns = this.extractStatValue(categories, 'homeRuns');
    const homeRunsPer162 =
      games && homeRuns ? (homeRuns / games) * 162 : undefined;

    if (!battingAverage && !ops && !homeRunsPer162) {
      return null;
    }

    return {
      battingAverage,
      ops,
      homeRunsPer162,
    };
  }

  private async getPlayerImpactStats(
    athleteId: string,
    sport: Sport
  ): Promise<NormalizedPlayerStats | null> {
    const cacheKey = `${sport}_${athleteId}`;
    const cached = this.playerStatsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < PLAYER_STATS_TTL) {
      return cached.stats;
    }

    const sportPath = this.getCoreSportPath(sport);
    if (!sportPath) {
      return null;
    }

    try {
      const url = `${ESPN_CORE_BASE}/${sportPath}/athletes/${athleteId}/statistics?lang=en&region=us`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const categories = data?.splits?.categories || [];
      let normalized: NormalizedPlayerStats | null = null;

      switch (sport) {
        case 'NBA':
          normalized = this.normalizeNbaStats(categories);
          break;
        case 'NFL':
          normalized = this.normalizeNflStats(categories);
          break;
        case 'MLB':
          normalized = this.normalizeMlbStats(categories);
          break;
        default:
          normalized = null;
      }

      if (normalized) {
        this.playerStatsCache.set(cacheKey, {
          stats: normalized,
          timestamp: Date.now(),
        });
      }

      return normalized;
    } catch (error) {
      console.error(`Error fetching stats for athlete ${athleteId} (${sport}):`, error);
      return null;
    }
  }

  /**
   * Get all injury trends for a specific sport
   */
  async getInjuryTrends(sport: Sport): Promise<InjuryTrend[]> {
    try {
      const injuries = await TrendsAPI.getAllInjuries(sport);
      console.log(`Fetched ${injuries.length} raw injuries from ESPN for ${sport}`);
      const trends: InjuryTrend[] = [];

      for (const injury of injuries) {
        const player = injury.athlete;
        if (!player) continue;

        const status = injury.status?.toLowerCase() || 'questionable';
        const injuryStatus = this.mapInjuryStatus(status);

        const normalizedStats = await this.getPlayerImpactStats(player.id, sport);

        const playerStats = {
          seasonAvgPoints:
            normalizedStats?.pointsPerGame ?? player.stats?.ppg ?? 0,
          seasonAvgRebounds:
            normalizedStats?.reboundsPerGame ?? player.stats?.rpg ?? 0,
          seasonAvgAssists:
            normalizedStats?.assistsPerGame ?? player.stats?.apg ?? 0,
          seasonAvgMinutes: normalizedStats?.minutesPerGame,
          seasonAvgYards: normalizedStats?.combinedYardsPerGame,
          seasonAvgTouchdowns:
            (normalizedStats?.passingTouchdownsPerGame || 0) +
            (normalizedStats?.rushingTouchdownsPerGame || 0) +
            (normalizedStats?.receivingTouchdownsPerGame || 0),
          usageRate:
            normalizedStats?.usageShare !== undefined
              ? Math.round(normalizedStats.usageShare * 100)
              : player.stats?.usageRate || 20,
          playerId: player.id,
        };

        const impactScore = this.calculateImpactScore(
          normalizedStats,
          player.position?.abbreviation || '',
          sport
        );

        const severity = this.getInjurySeverity(injuryStatus, impactScore);

        // Include all injuries (removed severity filter to show more injuries)
        // Was: if (severity === 'low') continue;

        // Calculate deterministic spread/total changes based on impact score
        const playerIdHash = parseInt(player.id, 10) || 0;
        const spreadChange = impactScore > 50 ? ((playerIdHash % 6) - 3) / 2 : 0; // -1.5 to 1.5
        const totalChange = impactScore > 50 ? ((playerIdHash % 8) - 4) / 2 : 0; // -2 to 2

        // Prioritize detailed descriptions from ESPN
        // Order: longComment (most detailed) > details > type + status
        let injuryDetailsText = injury.longComment;

        // ESPN's injury.details can be either a string or an object with nested properties
        if (!injuryDetailsText && injury.details) {
          if (typeof injury.details === 'string') {
            injuryDetailsText = injury.details;
          } else if (typeof injury.details === 'object') {
            // Extract text from the details object (e.g., {type, detail, side, returnDate})
            injuryDetailsText = injury.details.detail || injury.details.type || '';
          }
        }

        if (!injuryDetailsText || (typeof injuryDetailsText === 'string' && injuryDetailsText.trim() === '')) {
          // Use injury type with status-specific message as fallback
          const injuryType = injury.type || 'Injury';
          if (injuryStatus === 'out') {
            injuryDetailsText = `${injuryType} - Will not play tonight`;
          } else if (injuryStatus === 'doubtful') {
            injuryDetailsText = `${injuryType} - Unlikely to play`;
          } else if (injuryStatus === 'questionable') {
            injuryDetailsText = `${injuryType} - Game-time decision`;
          } else if (injuryStatus === 'probable') {
            injuryDetailsText = `${injuryType} - Probable to play`;
          } else {
            injuryDetailsText = `${injuryType} - Status being monitored`;
          }
        }

        // Log when we get detailed ESPN data
        if (injury.longComment) {
          console.log(`Got detailed injury info for ${player.displayName}: ${injury.longComment.substring(0, 50)}...`);
        }

        const trend: InjuryTrend = {
          id: `injury_${player.id}_${Date.now()}`,
          sport,
          category: 'injury',
          severity,
          title: `${player.displayName} - ${injuryStatus.toUpperCase()}`,
          description: injury.details || injury.longComment || injury.type || 'Injury status',
          timestamp: new Date(),
          isLive: injury.game && injury.game.status?.type?.state === 'in',
          playerId: player.id,
          playerName: player.displayName,
          playerImage: player.headshot?.href,
          teamId: injury.team?.id,
          teamName: injury.team?.displayName || injury.team?.name,
          teamLogo: injury.team?.logo,
          position: player.position?.abbreviation || 'N/A',
          injuryStatus,
          injuryDetails: injuryDetailsText,
          gameImpact: injury.gameId
            ? {
                gameId: injury.gameId,
                opponent: injury.opponent?.displayName || 'Unknown',
                date: new Date(injury.gameDate),
                spreadChange: Math.round(spreadChange * 10) / 10,
                totalChange: Math.round(totalChange * 10) / 10,
              }
            : undefined,
          playerImpact: {
            seasonAvgPoints: playerStats.seasonAvgPoints,
            seasonAvgRebounds: playerStats.seasonAvgRebounds,
            seasonAvgAssists: playerStats.seasonAvgAssists,
            seasonAvgMinutes: playerStats.seasonAvgMinutes,
            seasonAvgYards: playerStats.seasonAvgYards,
            seasonAvgTouchdowns: playerStats.seasonAvgTouchdowns,
            usageRate: playerStats.usageRate || 0,
            impactScore,
          },
          affectedPlayers: [], // Would populate with real roster data
        };

        trends.push(trend);
      }

      // Sort by impact score (highest first)
      const sortedTrends = trends.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (
          severityOrder[b.severity] - severityOrder[a.severity] ||
          b.playerImpact.impactScore - a.playerImpact.impactScore
        );
      });

      // If we have injuries, return them
      if (sortedTrends.length > 0) {
        console.log(`✅ Returning ${sortedTrends.length} REAL injury trends for ${sport}`);
        console.log(`First real injury: ${sortedTrends[0].playerName} (${sortedTrends[0].teamName})`);
        return sortedTrends;
      }

      // No real injuries found - generate mock injuries as fallback
      console.log(`⚠️ No real injuries found for ${sport}, generating MOCK fallback data`);
      return this.generateMockInjuries(sport);
    } catch (error) {
      console.error(`❌ Error getting injury trends for ${sport}:`, error);
      console.error(`Falling back to MOCK data due to error`);
      // Return mock data on error
      return this.generateMockInjuries(sport);
    }
  }

  /**
   * Generate mock injury data as fallback when no real injuries available
   */
  private generateMockInjuries(sport: Sport): InjuryTrend[] {
    const mockInjuries: InjuryTrend[] = [];
    const statuses: InjuryTrend['injuryStatus'][] = ['out', 'doubtful', 'questionable', 'probable'];
    const injuries = [
      'Ankle Sprain', 'Knee Soreness', 'Hamstring Strain', 'Back Spasms',
      'Shoulder Inflammation', 'Wrist Injury', 'Concussion Protocol'
    ];

    const teamNames = {
      NBA: ['Lakers', 'Warriors', 'Celtics', 'Heat'],
      NFL: ['Chiefs', 'Eagles', 'Cowboys', 'Bills'],
      MLB: ['Yankees', 'Dodgers', 'Red Sox', 'Astros'],
      NHL: ['Maple Leafs', 'Bruins', 'Rangers', 'Avalanche'],
    };

    const positions = {
      NBA: ['PG', 'SG', 'SF', 'PF', 'C'],
      NFL: ['QB', 'RB', 'WR', 'TE', 'LB'],
      MLB: ['P', 'C', '1B', '2B', 'SS'],
      NHL: ['C', 'LW', 'RW', 'D', 'G'],
    };

    // Generate deterministic 4 mock injuries per sport (was 3-5)
    const count = 4;

    for (let i = 0; i < count; i++) {
      const status = statuses[i % statuses.length];
      const fallbackPool = this.fallbackPlayers[sport];
      const playerInfo = fallbackPool[i % fallbackPool.length];
      const teamName = playerInfo.team;
      // Deterministic position selection
      const position = playerInfo.position || positions[sport][i % positions[sport].length];
      // Deterministic injury type selection
      const injuryType = injuries[i % injuries.length];

      // Deterministic impact score based on status and index
      const impactScore = status === 'out' ? 60 + ((i * 7) % 30) :
                         status === 'doubtful' ? 50 + ((i * 5) % 20) :
                         30 + ((i * 4) % 20);

      const severity: 'low' | 'medium' | 'high' | 'critical' =
        impactScore > 75 ? 'high' :
        impactScore > 50 ? 'medium' : 'low';

      // Deterministic timestamp (10 minutes ago + index offset)
      const timestampOffset = (i * 10 * 60 * 1000); // Each injury 10 min apart
      const timestamp = new Date(Date.now() - timestampOffset);

      // Deterministic opponent selection (ensure it's not the same as player's team)
      const availableOpponents = teamNames[sport].filter(team => !teamName.includes(team));
      const opponentIndex = i % availableOpponents.length;
      const opponent = availableOpponents[opponentIndex];

      // Deterministic game impact values
      const spreadChange = impactScore > 60 ? ((i % 4) - 2) / 2 : 0; // -1 to 1
      const totalChange = impactScore > 60 ? ((i % 6) - 3) / 2 : 0; // -1.5 to 1.5

      // Deterministic player stats
      const avgPoints = 15 + ((i * 3) % 15); // 15-30
      const avgRebounds = sport === 'NBA' ? 5 + (i % 5) : 0; // 5-10 for NBA
      const avgAssists = (sport === 'NBA' || sport === 'NHL') ? 3 + (i % 5) : 0; // 3-8
      const usageRate = 20 + ((i * 3) % 15); // 20-35

      // Generate injury details based on status and type
      let injuryDetail = '';
      if (status === 'out') {
        injuryDetail = `${injuryType} - Will not play tonight`;
      } else if (status === 'doubtful') {
        injuryDetail = `${injuryType} - Unlikely to play`;
      } else if (status === 'questionable') {
        injuryDetail = `${injuryType} - Game-time decision`;
      } else {
        injuryDetail = `${injuryType} - Probable to play`;
      }

      mockInjuries.push({
        id: `injury_mock_${sport}_${i}`,
        sport,
        category: 'injury',
        severity,
        title: `${playerInfo.name} - ${status.toUpperCase()}`,
        description: injuryType,
        timestamp,
        isLive: false,
        playerId: `mock_player_${i}`,
        playerName: playerInfo.name,
        playerImage: playerInfo.image,
        teamId: `mock_team_${i}`,
        teamName,
        teamLogo: playerInfo.logo,
        position,
        injuryStatus: status,
        injuryDetails: injuryDetail,
        gameImpact: {
          gameId: `mock_game_${i}`,
          opponent,
          date: new Date(Date.now() + 86400000), // Tomorrow
          spreadChange: Math.round(spreadChange * 10) / 10,
          totalChange: Math.round(totalChange * 10) / 10,
        },
        playerImpact: {
          seasonAvgPoints: avgPoints,
          seasonAvgRebounds: avgRebounds,
          seasonAvgAssists: avgAssists,
          usageRate: usageRate,
          impactScore: Math.round(impactScore),
        },
        affectedPlayers: [],
      });
    }

    return mockInjuries;
  }

  /**
   * Get injury trends for all sports
   */
  async getAllSportsInjuryTrends(): Promise<InjuryTrend[]> {
    const sports: Sport[] = ['NBA', 'NFL', 'MLB', 'NHL'];
    const allTrends: InjuryTrend[] = [];

    await Promise.all(
      sports.map(async (sport) => {
        const trends = await this.getInjuryTrends(sport);
        allTrends.push(...trends);
      })
    );

    // Sort by severity and timestamp
    return allTrends.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  /**
   * Map injury status string to standardized format
   */
  private mapInjuryStatus(status: string): InjuryTrend['injuryStatus'] {
    const normalized = status.toLowerCase().trim();

    if (normalized.includes('out')) return 'out';
    if (normalized.includes('doubtful')) return 'doubtful';
    if (normalized.includes('questionable')) return 'questionable';
    if (normalized.includes('probable')) return 'probable';
    if (normalized.includes('day')) return 'day-to-day';

    return 'questionable'; // Default
  }

  /**
   * Get injury trends with betting impact
   */
  async getHighImpactInjuries(sport?: Sport): Promise<InjuryTrend[]> {
    const trends = sport
      ? await this.getInjuryTrends(sport)
      : await this.getAllSportsInjuryTrends();

    // Filter for injuries with significant betting impact
    return trends.filter(
      (trend) =>
        trend.playerImpact.impactScore > 60 ||
        (trend.gameImpact && Math.abs(trend.gameImpact.spreadChange || 0) > 1)
    );
  }
}

export default new InjuryTracker();

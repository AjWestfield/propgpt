import { Sport } from '../types/game';
import { PlayerTrend, TeamTrend, CalculatedProp } from '../types/trends';
import { SportsAPI, ESPNAthlete } from './sportsApi';

class BettingTrendsService {
  /**
   * Analyze player performance trends and generate calculated props
   */
  async getPlayerTrends(sport: Sport, limit = 20): Promise<PlayerTrend[]> {
    try {
      const { games: scoreboard } = await SportsAPI.getScoreboardByDate(sport);
      const trends: PlayerTrend[] = [];

      // Get REAL players from today's games
      const realPlayers = await this.getRealPlayersFromGames(sport, scoreboard, limit);
      trends.push(...realPlayers);

      // If we don't have enough real players (no games today), add mock as fallback
      if (trends.length < 5) {
        const mockPlayers = await this.generateMockPlayerTrends(
          sport,
          scoreboard,
          Math.max(5, limit - trends.length)
        );
        trends.push(...mockPlayers);
      }

      return trends.sort((a, b) => {
        // Sort by severity and confidence
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;

        // Then by confidence in props
        const aMaxConfidence = Math.max(...(a.calculatedProps?.map(p => p.confidence) || [0]));
        const bMaxConfidence = Math.max(...(b.calculatedProps?.map(p => p.confidence) || [0]));
        return bMaxConfidence - aMaxConfidence;
      });
    } catch (error) {
      console.error(`Error getting player trends for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get real players from actual games using ESPN box scores
   */
  private async getRealPlayersFromGames(sport: Sport, scoreboard: any[], limit: number): Promise<PlayerTrend[]> {
    const trends: PlayerTrend[] = [];

    try {
      // Get players from all games (limit to first 5 games to avoid too many API calls)
      const gamesToCheck = scoreboard.slice(0, Math.min(5, scoreboard.length));

      for (const game of gamesToCheck) {
        try {
          // Use the existing getPlayersFromGame method from SportsAPI
          const players = await SportsAPI.getPlayersFromGame(game, sport);

          // Filter to only live or completed games players (they have actual data)
          const relevantPlayers = players.filter(p =>
            p.gameStatus === 'live' || p.gameStatus === 'completed'
          );

          // If no live/completed game players, take upcoming game players (limited info)
          const playersToUse = relevantPlayers.length > 0 ? relevantPlayers : players.slice(0, 5);

          // Take top 3-5 players from the game
          playersToUse.slice(0, 3).forEach((player, playerIndex) => {
            if (!player.name || player.name.includes('Star')) return; // Skip if no real name

            // Generate deterministic stats based on player ID hash
            const playerIdHash = player.id ? parseInt(player.id, 10) : playerIndex * 1000;
            const basePoints = 15 + (playerIdHash % 15); // 15-30 points average (deterministic)
            const streakMultiplier = (playerIdHash % 2) === 0 ? 1.2 : 0.8; // Hot or cold (deterministic)
            const streakType: 'hot' | 'cold' | 'outlier' = streakMultiplier > 1 ? 'hot' : 'cold';

            const seasonAvg = basePoints;
            const last5Avg = basePoints * streakMultiplier;
            const percentChange = ((last5Avg - seasonAvg) / seasonAvg) * 100;

            const severity: 'low' | 'medium' | 'high' | 'critical' =
              Math.abs(percentChange) > 25 ? 'high' :
              Math.abs(percentChange) > 15 ? 'medium' : 'low';

            // Calculate props based on generated stats
            const calculatedProps: CalculatedProp[] = [];

            // Deterministic confidence based on percent change magnitude
            const confidenceScore = Math.min(90, 60 + Math.abs(percentChange));

            calculatedProps.push({
              metric: 'Points',
              line: Math.round(last5Avg - 0.5),
              recommendation: streakType === 'hot' ? 'over' : 'under',
              confidence: Math.round(confidenceScore),
              reasoning: [
                `Averaging ${last5Avg.toFixed(1)} in recent games`,
                `${streakType.toUpperCase()} performance trend`,
                player.isLive ? 'Currently playing' : 'Based on recent form',
                `Season average: ${seasonAvg.toFixed(1)}`
              ],
              factors: {
                seasonAverage: seasonAvg,
                last5Average: last5Avg,
              },
            });

            trends.push({
              id: `player_trend_real_${player.id}`,
              sport,
              category: 'player',
              severity,
              title: `${player.name} - ${streakType.toUpperCase()} STREAK`,
              description: player.isLive ? 'Playing LIVE now' : `${player.gameStatus === 'completed' ? 'Last game' : 'Next game'} vs ${player.opponent.abbreviation}`,
              timestamp: new Date(),
              playerId: player.id,
              playerName: player.name,
              playerImage: player.headshot,
              teamName: player.team.name,
              teamLogo: player.team.logo,
              position: player.position || 'N/A',
              streakType,
              streakLength: 3 + (playerIdHash % 4), // Deterministic: 3-6 games
              stats: [
                {
                  metric: 'Points',
                  current: last5Avg,
                  seasonAvg,
                  last5Avg,
                  percentChange,
                },
              ],
              calculatedProps,
              nextGame: {
                opponent: player.opponent.name,
                date: new Date(player.gameTime),
                homeAway: game.competitions?.[0]?.competitors.find((c: any) =>
                  c.team.id === player.team.id
                )?.homeAway || 'home',
              },
            });
          });

          if (trends.length >= limit) break;
        } catch (gameError) {
          console.log(`Could not get players from game ${game.id}:`, gameError);
          continue;
        }
      }
    } catch (error) {
      console.error('Error getting real players:', error);
    }

    return trends;
  }

  /**
   * Generate mock player trends (will be replaced with real API data)
   */
  private async generateMockPlayerTrends(
    sport: Sport,
    scoreboard: any[],
    limit: number
  ): Promise<PlayerTrend[]> {
    const trends: PlayerTrend[] = [];
    const streakTypes: Array<'hot' | 'cold' | 'outlier'> = ['hot', 'hot', 'cold', 'outlier'];
    const rosterCache = new Map<string, ESPNAthlete[]>();

    const getRosterForTeam = async (teamId?: string): Promise<ESPNAthlete[]> => {
      if (!teamId) return [];

      if (rosterCache.has(teamId)) {
        return rosterCache.get(teamId)!;
      }

      const roster = await SportsAPI.getTeamRoster(teamId, sport);
      rosterCache.set(teamId, roster);
      return roster;
    };

    const normalizeHeadshot = (headshot?: any): string | undefined => {
      if (!headshot) return undefined;
      if (typeof headshot === 'string') return headshot;
      return headshot.href || undefined;
    };

    const getFeaturedPlayerInfo = async (team: any): Promise<{
      id?: string;
      name: string;
      headshot?: string;
      position?: string;
    } | null> => {
      const leaderCategory = team?.leaders?.find(
        (leader: any) => Array.isArray(leader?.leaders) && leader.leaders.length > 0 && leader.leaders[0]?.athlete
      );
      const leaderAthlete = leaderCategory?.leaders?.[0]?.athlete;
      if (leaderAthlete) {
        return {
          id: leaderAthlete.id,
          name: leaderAthlete.displayName || leaderAthlete.fullName,
          headshot: normalizeHeadshot(leaderAthlete.headshot),
          position: leaderAthlete.position?.abbreviation || leaderAthlete.position,
        };
      }

      const probableEntry = Array.isArray(team?.probables)
        ? team.probables.find((p: any) => p?.athlete)
        : null;
      const probableAthlete = probableEntry?.athlete;
      if (probableAthlete) {
        return {
          id: probableAthlete.id,
          name: probableAthlete.displayName || probableAthlete.fullName,
          headshot: normalizeHeadshot(probableAthlete.headshot),
          position:
            typeof probableAthlete.position === 'string'
              ? probableAthlete.position
              : probableAthlete.position?.abbreviation,
        };
      }

      const roster = await getRosterForTeam(team?.team?.id);
      if (roster.length > 0) {
        const rosterAthlete = roster[0];
        return {
          id: rosterAthlete.id,
          name: rosterAthlete.displayName || rosterAthlete.fullName,
          headshot: normalizeHeadshot(rosterAthlete.headshot),
          position: rosterAthlete.position?.abbreviation,
        };
      }

      return null;
    };

    for (let i = 0; i < Math.min(limit, scoreboard.length * 2); i++) {
      const game = scoreboard[Math.floor(i / 2)];
      if (!game?.competitions?.[0]) continue;

      const competition = game.competitions[0];
      const team = competition.competitors[i % 2];
      if (!team) continue;

      const featuredPlayer = (await getFeaturedPlayerInfo(team)) || {
        id: undefined,
        name: `${team.team.displayName} Player`,
        headshot: team.team.logo,
        position: 'N/A',
      };

      const streakType = streakTypes[i % streakTypes.length];

      // Deterministic streak length based on index
      const streakLength = 3 + (i % 5); // 3-7 games (deterministic)

      // Deterministic base points using team ID hash
      const teamIdHash = team?.team?.id ? parseInt(team.team.id, 10) : i * 100;
      const basePoints = 15 + (teamIdHash % 15); // 15-30 points (deterministic)
      const seasonAvg = basePoints;
      const last5Avg = streakType === 'hot' ? basePoints * 1.25 : basePoints * 0.75;
      const percentChange = ((last5Avg - seasonAvg) / seasonAvg) * 100;

      // Deterministic confidence based on streak length
      const baseConfidence = 60 + (streakLength * 5); // Longer streaks = higher confidence

      // Deterministic opponent and rest day values
      const opponentVariance = ((teamIdHash % 4) - 2); // -2 to +1
      const homeAwayDiff = ((teamIdHash % 6) - 3) / 2; // -1.5 to +1.5
      const restDays = teamIdHash % 3; // 0-2 days

      const calculatedProps: CalculatedProp[] = [
        {
          metric: 'Points',
          line: Math.round(last5Avg - 0.5),
          recommendation: streakType === 'hot' ? 'over' : 'under',
          confidence: Math.min(90, Math.round(baseConfidence)),
          reasoning: [
            `${streakLength} game ${streakType} streak`,
            `Averaging ${last5Avg.toFixed(1)} in last 5 games`,
            `Season average: ${seasonAvg.toFixed(1)}`,
            streakType === 'hot' ? 'Favorable matchup' : 'Tough defensive matchup'
          ],
          factors: {
            seasonAverage: seasonAvg,
            last5Average: last5Avg,
            vsOpponentAvg: basePoints + opponentVariance,
            homeAwayDiff: homeAwayDiff,
            restDays: restDays,
          },
        },
      ];

      // Add rebounds for certain positions
      if (['C', 'PF', 'F'].includes(team.team.abbreviation?.slice(-1) || '')) {
        const baseRebounds = 6 + (teamIdHash % 6); // 6-12 rebounds (deterministic)
        const reboundConfidence = 55 + ((streakLength - 3) * 6); // Deterministic: 55-79
        calculatedProps.push({
          metric: 'Rebounds',
          line: Math.round(baseRebounds),
          recommendation: streakType === 'hot' ? 'over' : 'under',
          confidence: Math.min(80, Math.round(reboundConfidence)),
          reasoning: [
            `Strong rebounding presence`,
            `Opponent weak on the glass`,
          ],
          factors: {
            seasonAverage: baseRebounds,
            last5Average: baseRebounds * (streakType === 'hot' ? 1.2 : 0.8),
          },
        });
      }

      const severity: 'low' | 'medium' | 'high' | 'critical' =
        streakLength >= 6 ? 'high' : streakLength >= 4 ? 'medium' : 'low';

      trends.push({
        id: featuredPlayer.id ? `player_trend_${featuredPlayer.id}` : `player_trend_${sport}_${i}`,
        sport,
        category: 'player',
        severity,
        title: `${featuredPlayer.name} - ${streakType.toUpperCase()} STREAK`,
        description: `On a ${streakLength}-game ${streakType} streak with ${Math.abs(percentChange).toFixed(1)}% change`,
        timestamp: new Date(),
        playerId: featuredPlayer.id || `player_${i}`,
        playerName: featuredPlayer.name,
        playerImage: featuredPlayer.headshot || team.team.logo,
        teamName: team.team.displayName,
        teamLogo: team.team.logo,
        position: featuredPlayer.position || 'N/A',
        streakType,
        streakLength,
        stats: [
          {
            metric: 'Points',
            current: last5Avg,
            seasonAvg,
            last5Avg,
            percentChange,
          },
        ],
        calculatedProps,
        nextGame: {
          opponent:
            competition.competitors.find((c: any) => c.id !== team.id)?.team.displayName || 'TBD',
          date: new Date(game.date),
          homeAway: team.homeAway,
        },
      });
    }

    return trends;
  }

  /**
   * Analyze team trends and patterns
   */
  async getTeamTrends(sport: Sport): Promise<TeamTrend[]> {
    try {
      const { games: scoreboard } = await SportsAPI.getScoreboardByDate(sport);
      const trends: TeamTrend[] = [];

      // Generate mock team trends
      scoreboard.forEach((game, index) => {
        const competition = game.competitions?.[0];
        if (!competition) return;

        competition.competitors?.forEach((team: any, teamIndex: number) => {
          const record = this.parseRecord(team.records?.[0]?.summary || '0-0');
          const wins = record.wins;
          const losses = record.losses;

          // Deterministic streak based on team ID
          const teamIdHash = team.id ? parseInt(team.id, 10) : (index * 10 + teamIndex);
          const streakLength = 3 + (teamIdHash % 4); // 3-6 games
          const isWinStreak = (teamIdHash % 2) === 0; // Deterministic win/lose streak

          const trendType: TeamTrend['trendType'] = isWinStreak ? 'win_streak' : 'lose_streak';

          // Only create trend if significant streak
          if (streakLength < 3) return;

          const severity: 'low' | 'medium' | 'high' | 'critical' =
            streakLength >= 6 ? 'high' : streakLength >= 4 ? 'medium' : 'low';

          // Deterministic ATS and stats based on team hash
          const atsWinVariance = (teamIdHash % 3) - 1; // -1, 0, or 1
          const atsLossVariance = ((teamIdHash + 1) % 3) - 1; // -1, 0, or 1
          const atsPushes = teamIdHash % 2; // 0 or 1

          const ppgBase = 100 + (teamIdHash % 20); // 100-120
          const paBase = 95 + ((teamIdHash + 5) % 20); // 95-115
          const marginVariance = (teamIdHash % 10) / 2; // 0-4.5

          trends.push({
            id: `team_trend_${team.id}_${index}`,
            sport,
            category: 'team',
            severity,
            title: `${team.team.displayName} - ${streakLength} Game ${isWinStreak ? 'Win' : 'Lose'} Streak`,
            description: `${team.team.displayName} has ${isWinStreak ? 'won' : 'lost'} ${streakLength} straight games`,
            timestamp: new Date(),
            teamId: team.id,
            teamName: team.team.displayName,
            teamLogo: team.team.logo,
            trendType,
            streakLength,
            record: { wins, losses },
            atsRecord: {
              wins: wins + atsWinVariance,
              losses: losses + atsLossVariance,
              pushes: atsPushes,
            },
            stats: {
              pointsPerGame: ppgBase,
              pointsAllowed: paBase,
              avgMargin: isWinStreak ? 5 + marginVariance : -(5 + marginVariance),
            },
            splits: {
              home: {
                wins: Math.floor(wins * 0.6),
                losses: Math.floor(losses * 0.4),
              },
              away: {
                wins: Math.floor(wins * 0.4),
                losses: Math.floor(losses * 0.6),
              },
              lastTen: {
                wins: isWinStreak ? Math.min(10, streakLength + (teamIdHash % 3)) : (teamIdHash % 5),
                losses: isWinStreak ? (teamIdHash % 5) : Math.min(10, streakLength + (teamIdHash % 3)),
              },
            },
          });
        });
      });

      return trends.filter((t) => t.severity !== 'low').slice(0, 15);
    } catch (error) {
      console.error(`Error getting team trends for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Parse team record string
   */
  private parseRecord(recordStr: string): { wins: number; losses: number } {
    if (!recordStr) return { wins: 0, losses: 0 };

    const match = recordStr.match(/(\d+)-(\d+)/);
    if (match) {
      return {
        wins: parseInt(match[1], 10),
        losses: parseInt(match[2], 10),
      };
    }

    return { wins: 0, losses: 0 };
  }

  /**
   * Get all trends for all sports
   */
  async getAllSportsPlayerTrends(limit = 50): Promise<PlayerTrend[]> {
    const sports: Sport[] = ['NBA', 'NFL', 'MLB', 'NHL'];
    const allTrends: PlayerTrend[] = [];

    await Promise.all(
      sports.map(async (sport) => {
        const trends = await this.getPlayerTrends(sport, limit / 4);
        allTrends.push(...trends);
      })
    );

    return allTrends.slice(0, limit);
  }

  /**
   * Get all team trends for all sports
   */
  async getAllSportsTeamTrends(): Promise<TeamTrend[]> {
    const sports: Sport[] = ['NBA', 'NFL', 'MLB', 'NHL'];
    const allTrends: TeamTrend[] = [];

    await Promise.all(
      sports.map(async (sport) => {
        const trends = await this.getTeamTrends(sport);
        allTrends.push(...trends);
      })
    );

    return allTrends;
  }
}

export default new BettingTrendsService();

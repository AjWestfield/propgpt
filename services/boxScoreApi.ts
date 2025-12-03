// Box Score API Service - ESPN Hidden API Integration for Live Box Scores
// Provides real-time box score data for all major sports

import { Sport } from '../types/game';
import { BoxScore, PlayerStat, TeamStats } from '../types/boxScore';

const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

// ESPN API Response Types for Box Scores
interface ESPNBoxScoreResponse {
  boxscore?: {
    teams: Array<{
      team: {
        id: string;
        displayName: string;
        abbreviation: string;
        logo: string;
      };
      statistics: Array<{
        name: string;
        displayValue: string;
        label?: string;
        abbreviation?: string;
      }>;
    }>;
    players: Array<{
      team: {
        id: string;
        displayName: string;
        abbreviation: string;
        logo: string;
      };
      statistics: Array<{
        name?: string;
        keys: string[];
        labels: string[];
        descriptions?: string[];
        athletes: Array<{
          athlete: {
            id: string;
            displayName: string;
            shortName: string;
            headshot?: {
              href: string;
            };
            jersey?: string;
            position?: {
              abbreviation: string;
            };
          };
          stats: string[];
          starter: boolean;
        }>;
      }>;
    }>;
  };
  header?: {
    competitions: Array<{
      competitors: Array<{
        id: string;
        team: {
          id: string;
          displayName: string;
          abbreviation: string;
          logo: string;
        };
        score: string;
        homeAway: 'home' | 'away';
        linescores?: Array<{
          value: number;
          displayValue: string;
        }>;
      }>;
      status: {
        type: {
          state: string;
          completed: boolean;
          description: string;
          detail: string;
        };
        period: number;
        displayClock?: string;
      };
    }>;
  };
}

export class BoxScoreAPI {
  private static async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get the ESPN sport path for API calls
   */
  private static getSportPath(sport: Sport): string {
    switch (sport) {
      case 'NBA':
        return 'basketball/nba';
      case 'NHL':
        return 'hockey/nhl';
      case 'NFL':
        return 'football/nfl';
      case 'MLB':
        return 'baseball/mlb';
      case 'NCAAF':
        return 'football/college-football';
      case 'NCAAB':
        return 'basketball/mens-college-basketball';
      default:
        throw new Error(`Unsupported sport: ${sport}`);
    }
  }

  /**
   * Fetch box score for a specific game
   */
  static async getBoxScore(gameId: string, sport: Sport): Promise<BoxScore | null> {
    try {
      const sportPath = this.getSportPath(sport);
      const url = `${ESPN_BASE}/${sportPath}/summary?event=${gameId}`;

      console.log(`Fetching box score from: ${url}`);

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.error(`Box score API error: ${response.status}`);
        return null;
      }

      const data: ESPNBoxScoreResponse = await response.json();

      if (!data.boxscore || !data.header) {
        console.error('Invalid box score response structure');
        return null;
      }

      return this.parseBoxScore(gameId, sport, data);
    } catch (error) {
      console.error('Error fetching box score:', error);
      return null;
    }
  }

  /**
   * Parse ESPN box score response into our BoxScore format
   */
  private static parseBoxScore(
    gameId: string,
    sport: Sport,
    data: ESPNBoxScoreResponse
  ): BoxScore | null {
    try {
      const { boxscore, header } = data;

      if (!boxscore || !header?.competitions?.[0]) {
        return null;
      }

      const competition = header.competitions[0];

      // Validate that required arrays exist before calling .find()
      if (!Array.isArray(competition.competitors)) {
        console.log('[BoxScoreAPI] No competitors array available for game:', gameId);
        return null;
      }

      if (!Array.isArray(boxscore.teams)) {
        console.log('[BoxScoreAPI] No teams stats available yet for game:', gameId);
        return null;
      }

      if (!Array.isArray(boxscore.players)) {
        console.log('[BoxScoreAPI] No player stats available yet for game:', gameId);
        return null;
      }

      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

      if (!homeTeam || !awayTeam) {
        return null;
      }

      // Parse team stats
      const homeTeamStats = this.parseTeamStats(
        boxscore.teams.find(t => t.team.id === homeTeam.team.id),
        sport
      );

      const awayTeamStats = this.parseTeamStats(
        boxscore.teams.find(t => t.team.id === awayTeam.team.id),
        sport
      );

      // Parse player stats (handle cases where boxscore.players is missing)
      const playerSections = boxscore.players || [];

      const homePlayerStats = this.parsePlayerStats(
        playerSections.find((p) => p.team?.id === homeTeam.team.id),
        sport
      );

      const awayPlayerStats = this.parsePlayerStats(
        playerSections.find((p) => p.team?.id === awayTeam.team.id),
        sport
      );

      return {
        gameId,
        sport,
        lastUpdated: Date.now(),
        teamStats: {
          home: homeTeamStats,
          away: awayTeamStats,
        },
        playerStats: {
          home: homePlayerStats,
          away: awayPlayerStats,
        },
      };
    } catch (error) {
      console.error('[BoxScoreAPI] Error parsing box score:', {
        gameId,
        sport,
        error: error instanceof Error ? error.message : String(error),
        hasBoxscore: !!data.boxscore,
        hasTeams: !!data.boxscore?.teams,
        teamsIsArray: Array.isArray(data.boxscore?.teams),
        hasPlayers: !!data.boxscore?.players,
        playersIsArray: Array.isArray(data.boxscore?.players),
      });
      return null;
    }
  }

  /**
   * Parse team statistics
   */
  private static parseTeamStats(
    teamData: ESPNBoxScoreResponse['boxscore']['teams'][0] | undefined,
    sport: Sport
  ): TeamStats {
    if (!teamData) {
      return {
        teamId: '',
        teamName: '',
        stats: {},
      };
    }

    const stats: Record<string, string | number> = {};

    if (teamData.statistics && Array.isArray(teamData.statistics)) {
      teamData.statistics.forEach(stat => {
        // Use label if available, otherwise use name
        const key = stat.label || stat.abbreviation || stat.name;
        stats[key] = stat.displayValue;
      });
    }

    return {
      teamId: teamData.team.id,
      teamName: teamData.team.displayName,
      teamLogo: teamData.team.logo,
      stats,
    };
  }

  /**
   * Parse player statistics
   */
  private static parsePlayerStats(
    playerData: ESPNBoxScoreResponse['boxscore']['players'][0] | undefined,
    sport: Sport
  ): PlayerStat[] {
    if (!playerData || !playerData.statistics) {
      return [];
    }

    const allPlayers: PlayerStat[] = [];

    // Some sports (like NHL) have multiple stat groups (forwards, defense, goalies)
    // We need to combine all of them
    playerData.statistics.forEach(statGroup => {
      const { labels, athletes } = statGroup;

      if (!athletes || athletes.length === 0) {
        return;
      }

      const players = athletes.map(athlete => {
        const stats: Record<string, string | number> = {};

        // Map stat labels to values
        labels.forEach((label, index) => {
          const value = athlete.stats[index];
          stats[label] = value || '0';
        });

        // Calculate percentage stats for NBA and NCAAB (college basketball)
        if (sport === 'NBA' || sport === 'NCAAB') {
          // FG% - Calculate from FG (made-attempted)
          if (stats['FG']) {
            const fg = String(stats['FG']).split('-');
            if (fg.length === 2) {
              const made = parseFloat(fg[0]);
              const attempted = parseFloat(fg[1]);
              stats['FG%'] = attempted > 0 ? ((made / attempted) * 100).toFixed(1) : '0.0';
            }
          }

          // 3PT% - Calculate from 3PT (made-attempted)
          if (stats['3PT']) {
            const threePt = String(stats['3PT']).split('-');
            if (threePt.length === 2) {
              const made = parseFloat(threePt[0]);
              const attempted = parseFloat(threePt[1]);
              stats['3PT%'] = attempted > 0 ? ((made / attempted) * 100).toFixed(1) : '0.0';
            }
          }

          // FT% - Calculate from FT (made-attempted)
          if (stats['FT']) {
            const ft = String(stats['FT']).split('-');
            if (ft.length === 2) {
              const made = parseFloat(ft[0]);
              const attempted = parseFloat(ft[1]);
              stats['FT%'] = attempted > 0 ? ((made / attempted) * 100).toFixed(1) : '0.0';
            }
          }
        }

        return {
          playerId: athlete.athlete.id,
          name: athlete.athlete.displayName,
          headshot: athlete.athlete.headshot?.href,
          position: athlete.athlete.position?.abbreviation || '',
          jerseyNumber: athlete.athlete.jersey,
          starter: athlete.starter,
          stats,
        };
      });

      allPlayers.push(...players);
    });

    return allPlayers;
  }

  /**
   * Get scoreboard with all games for a sport
   */
  static async getScoreboard(sport: Sport): Promise<any> {
    try {
      const sportPath = this.getSportPath(sport);
      const url = `${ESPN_BASE}/${sportPath}/scoreboard`;

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.error(`Scoreboard API error: ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
      return null;
    }
  }

  /**
   * Test API connectivity for a specific sport
   */
  static async testAPI(sport: Sport): Promise<{
    success: boolean;
    message: string;
    sampleGameId?: string;
  }> {
    try {
      console.log(`Testing ${sport} API...`);

      const scoreboard = await this.getScoreboard(sport);

      if (!scoreboard || !scoreboard.events || scoreboard.events.length === 0) {
        return {
          success: false,
          message: `No games found for ${sport}`,
        };
      }

      const sampleGame = scoreboard.events[0];
      const gameId = sampleGame.id;

      console.log(`Found sample game: ${gameId}`);

      const boxScore = await this.getBoxScore(gameId, sport);

      if (!boxScore) {
        return {
          success: false,
          message: `Could not fetch box score for ${sport} game ${gameId}`,
        };
      }

      return {
        success: true,
        message: `${sport} API working correctly`,
        sampleGameId: gameId,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error testing ${sport} API: ${error.message}`,
      };
    }
  }
}

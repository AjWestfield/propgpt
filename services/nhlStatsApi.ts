/**
 * NHL Statistics API Service
 * Uses official NHL Stats API - Free, no authentication required
 * No documented rate limits
 *
 * Community Documentation: https://gitlab.com/dword4/nhlapi
 */

const BASE_URL = 'https://api-web.nhle.com/v1';

export interface NHLPlayer {
  playerId: number;
  headshot: string;
  firstName: {
    default: string;
  };
  lastName: {
    default: string;
  };
  sweaterNumber: number;
  positionCode: string;
  shootsCatches: string;
  heightInInches: number;
  weightInPounds: number;
  birthDate: string;
  birthCity: {
    default: string;
  };
  birthCountry: string;
}

export interface NHLPlayerStats {
  playerId: number;
  isActive: boolean;
  currentTeamId: number;
  currentTeamAbbrev: string;
  fullTeamName: {
    default: string;
  };
  firstName: {
    default: string;
  };
  lastName: {
    default: string;
  };
  teamLogo: string;
  sweaterNumber: number;
  position: string;
  headshot: string;
  heroImage: string;
  heightInInches: number;
  heightInCentimeters: number;
  weightInPounds: number;
  weightInKilograms: number;
  birthDate: string;
  birthCity: {
    default: string;
  };
  birthStateProvince: {
    default: string;
  } | null;
  birthCountry: string;
  shootsCatches: string;
  draftDetails: {
    year: number;
    teamAbbrev: string;
    round: number;
    pickInRound: number;
    overallPick: number;
  } | null;
  playerSlug: string;
  inTop100AllTime: number;
  inHHOF: number;
  featuredStats: {
    season: number;
    regularSeason: {
      subSeason: {
        gamesPlayed: number;
        goals: number;
        assists: number;
        points: number;
        plusMinus: number;
        pim: number;
        gameWinningGoals: number;
        otGoals: number;
        shots: number;
        shootingPctg: number;
        powerPlayGoals: number;
        powerPlayPoints: number;
        shorthandedGoals: number;
        shorthandedPoints: number;
      };
      career: {
        gamesPlayed: number;
        goals: number;
        assists: number;
        points: number;
        plusMinus: number;
        pim: number;
        gameWinningGoals: number;
        otGoals: number;
        shots: number;
        shootingPctg: number;
        powerPlayGoals: number;
        powerPlayPoints: number;
        shorthandedGoals: number;
        shorthandedPoints: number;
      };
    };
  };
}

export interface NHLGameLog {
  gameId: number;
  gameDate: string;
  homeRoadFlag: string;
  opponentAbbrev: string;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  powerPlayGoals: number;
  shots: number;
  shifts: number;
  toi: string;
  gameWinningGoals: number;
}

export class NHLStatsAPI {
  /**
   * Get player landing page data (comprehensive stats)
   */
  static async getPlayerStats(playerId: string): Promise<NHLPlayerStats | null> {
    try {
      const url = `${BASE_URL}/player/${playerId}/landing`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching NHL player stats:', error);
      return null;
    }
  }

  /**
   * Get player game log for a specific season
   * @param playerId - NHL player ID
   * @param season - Season in format "20242025" (for 2024-25 season)
   * @param gameType - 2 for regular season, 3 for playoffs
   */
  static async getPlayerGameLog(
    playerId: string,
    season?: string,
    gameType: number = 2
  ): Promise<NHLGameLog[]> {
    try {
      const currentSeason = season || this.getCurrentSeason();
      const url = `${BASE_URL}/player/${playerId}/game-log/${currentSeason}/${gameType}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.gameLog || [];
    } catch (error) {
      console.error('Error fetching NHL player game log:', error);
      return [];
    }
  }

  /**
   * Get current NHL schedule
   */
  static async getCurrentSchedule(): Promise<any> {
    try {
      const url = `${BASE_URL}/schedule/now`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching NHL schedule:', error);
      return null;
    }
  }

  /**
   * Get team roster
   */
  static async getTeamRoster(teamAbbrev: string, season?: string): Promise<NHLPlayer[]> {
    try {
      const currentSeason = season || this.getCurrentSeason();
      const url = `${BASE_URL}/roster/${teamAbbrev}/${currentSeason}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // NHL API returns roster grouped by position
      const allPlayers: NHLPlayer[] = [];

      // Combine forwards, defensemen, and goalies
      if (data.forwards) allPlayers.push(...data.forwards);
      if (data.defensemen) allPlayers.push(...data.defensemen);
      if (data.goalies) allPlayers.push(...data.goalies);

      return allPlayers;
    } catch (error) {
      console.error('Error fetching NHL team roster:', error);
      return [];
    }
  }

  /**
   * Get league standings
   */
  static async getStandings(): Promise<any> {
    try {
      const url = `${BASE_URL}/standings/now`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching NHL standings:', error);
      return null;
    }
  }

  /**
   * Helper: Get current NHL season in API format
   * Returns format like "20242025" for 2024-25 season
   */
  static getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    // NHL season starts in October (month 10)
    // If we're before July, we're still in the previous season
    const startYear = month >= 7 ? year : year - 1;
    const endYear = startYear + 1;

    return `${startYear}${endYear}`;
  }

  /**
   * Helper: Extract season averages from featured stats
   */
  static extractSeasonAverages(playerStats: NHLPlayerStats): {
    gamesPlayed: number;
    goals: number;
    assists: number;
    points: number;
    shots: number;
    powerPlayGoals: number;
  } | null {
    try {
      const stats = playerStats.featuredStats?.regularSeason?.subSeason;
      if (!stats) return null;

      return {
        gamesPlayed: stats.gamesPlayed,
        goals: stats.goals,
        assists: stats.assists,
        points: stats.points,
        shots: stats.shots,
        powerPlayGoals: stats.powerPlayGoals,
      };
    } catch (error) {
      console.error('Error extracting season averages:', error);
      return null;
    }
  }

  /**
   * Helper: Calculate per-game averages from game log
   */
  static calculatePerGameAverages(
    gameLog: NHLGameLog[],
    limit: number = 10
  ): {
    goals: number;
    assists: number;
    points: number;
    shots: number;
  } {
    const recentGames = gameLog.slice(0, limit);

    if (recentGames.length === 0) {
      return { goals: 0, assists: 0, points: 0, shots: 0 };
    }

    const totals = recentGames.reduce(
      (acc, game) => ({
        goals: acc.goals + game.goals,
        assists: acc.assists + game.assists,
        points: acc.points + game.points,
        shots: acc.shots + game.shots,
      }),
      { goals: 0, assists: 0, points: 0, shots: 0 }
    );

    const gamesPlayed = recentGames.length;

    return {
      goals: Number((totals.goals / gamesPlayed).toFixed(2)),
      assists: Number((totals.assists / gamesPlayed).toFixed(2)),
      points: Number((totals.points / gamesPlayed).toFixed(2)),
      shots: Number((totals.shots / gamesPlayed).toFixed(2)),
    };
  }
}

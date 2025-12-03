/**
 * MLB Statistics API Service
 * Uses official MLB Stats API - Free, no authentication required
 * No documented rate limits
 *
 * API Documentation: https://github.com/toddrob99/MLB-StatsAPI
 * Base URL: https://statsapi.mlb.com/api/v1
 */

const BASE_URL = 'https://statsapi.mlb.com/api/v1';

export interface MLBPlayer {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  primaryNumber: string;
  birthDate: string;
  currentAge: number;
  birthCity: string;
  birthStateProvince: string;
  birthCountry: string;
  height: string;
  weight: number;
  active: boolean;
  primaryPosition: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  batSide: {
    code: string;
    description: string;
  };
  pitchHand: {
    code: string;
    description: string;
  };
  currentTeam?: {
    id: number;
    name: string;
    link: string;
  };
}

export interface MLBTeam {
  id: number;
  name: string;
  link: string;
  season: number;
  venue: {
    id: number;
    name: string;
    link: string;
  };
  teamCode: string;
  fileCode: string;
  abbreviation: string;
  teamName: string;
  locationName: string;
  firstYearOfPlay: string;
  league: {
    id: number;
    name: string;
    link: string;
  };
  division: {
    id: number;
    name: string;
    link: string;
  };
}

export interface MLBPlayerStats {
  season: string;
  stat: {
    // Batting stats
    gamesPlayed?: number;
    groundOuts?: number;
    airOuts?: number;
    runs?: number;
    doubles?: number;
    triples?: number;
    homeRuns?: number;
    strikeOuts?: number;
    baseOnBalls?: number;
    intentionalWalks?: number;
    hits?: number;
    hitByPitch?: number;
    avg?: string;
    atBats?: number;
    obp?: string;
    slg?: string;
    ops?: string;
    caughtStealing?: number;
    stolenBases?: number;
    stolenBasePercentage?: string;
    groundIntoDoublePlay?: number;
    numberOfPitches?: number;
    plateAppearances?: number;
    totalBases?: number;
    rbi?: number;
    leftOnBase?: number;
    sacBunts?: number;
    sacFlies?: number;
    babip?: string;
    groundOutsToAirouts?: string;
    catchersInterference?: number;
    atBatsPerHomeRun?: string;

    // Pitching stats
    gamesStarted?: number;
    wins?: number;
    losses?: number;
    saves?: number;
    saveOpportunities?: number;
    holds?: number;
    blownSaves?: number;
    earnedRuns?: number;
    inningsPitched?: string;
    hitBatsmen?: number;
    balks?: number;
    wildPitches?: number;
    pickoffs?: number;
    totalBases?: number;
    era?: string;
    whip?: string;
    battersFaced?: number;
    outs?: number;
    gamesPitched?: number;
    completeGames?: number;
    shutouts?: number;
    strikes?: number;
    strikePercentage?: string;
    hitBatsmen?: number;
    balks?: number;
    wildPitches?: number;
    pickoffs?: number;
  };
}

export interface MLBGame {
  gamePk: number;
  gameDate: string;
  gameType: string;
  season: string;
  teams: {
    away: {
      team: MLBTeam;
      score?: number;
      isWinner?: boolean;
    };
    home: {
      team: MLBTeam;
      score?: number;
      isWinner?: boolean;
    };
  };
  venue: {
    id: number;
    name: string;
  };
  status: {
    abstractGameState: string;
    codedGameState: string;
    detailedState: string;
    statusCode: string;
  };
}

export interface MLBGameLog {
  date: string;
  gameNumber: number;
  opponent: {
    id: number;
    name: string;
  };
  stat: {
    gamesPlayed: number;
    hits?: number;
    runs?: number;
    rbi?: number;
    homeRuns?: number;
    strikeOuts?: number;
    baseOnBalls?: number;
    stolenBases?: number;
    // Pitching
    inningsPitched?: string;
    earnedRuns?: number;
    wins?: number;
    losses?: number;
    saves?: number;
  };
  isHome: boolean;
  isWin: boolean;
}

export class MLBStatsAPI {
  /**
   * Get player information by ID
   */
  static async getPlayer(playerId: number): Promise<MLBPlayer | null> {
    try {
      const url = `${BASE_URL}/people/${playerId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.people?.[0] || null;
    } catch (error) {
      console.error('Error fetching MLB player:', error);
      return null;
    }
  }

  /**
   * Search for players by name
   */
  static async searchPlayers(name: string, sport: number = 1): Promise<MLBPlayer[]> {
    try {
      const url = `${BASE_URL}/sports/${sport}/players?search=${encodeURIComponent(name)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.people || [];
    } catch (error) {
      console.error('Error searching MLB players:', error);
      return [];
    }
  }

  /**
   * Get player season stats
   * @param playerId - MLB player ID
   * @param season - Season year (e.g., 2024)
   * @param group - Stats group: hitting, pitching, fielding
   */
  static async getPlayerSeasonStats(
    playerId: number,
    season?: number,
    group: 'hitting' | 'pitching' | 'fielding' = 'hitting'
  ): Promise<MLBPlayerStats[]> {
    try {
      const currentSeason = season || this.getCurrentSeason();
      const url = `${BASE_URL}/people/${playerId}/stats?stats=season&season=${currentSeason}&group=${group}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.stats?.[0]?.splits || [];
    } catch (error) {
      console.error('Error fetching MLB player season stats:', error);
      return [];
    }
  }

  /**
   * Get player game log for a specific season
   * @param playerId - MLB player ID
   * @param season - Season year (e.g., 2024)
   * @param group - Stats group: hitting, pitching, fielding
   */
  static async getPlayerGameLog(
    playerId: number,
    season?: number,
    group: 'hitting' | 'pitching' | 'fielding' = 'hitting'
  ): Promise<MLBGameLog[]> {
    try {
      const currentSeason = season || this.getCurrentSeason();
      const url = `${BASE_URL}/people/${playerId}/stats?stats=gameLog&season=${currentSeason}&group=${group}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.stats?.[0]?.splits || [];
    } catch (error) {
      console.error('Error fetching MLB player game log:', error);
      return [];
    }
  }

  /**
   * Get team roster
   * @param teamId - MLB team ID
   * @param season - Season year (defaults to current season)
   */
  static async getTeamRoster(teamId: number, season?: number): Promise<MLBPlayer[]> {
    try {
      const currentSeason = season || this.getCurrentSeason();
      const url = `${BASE_URL}/teams/${teamId}/roster?season=${currentSeason}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract player info from roster
      const roster = data.roster || [];
      return roster.map((item: any) => item.person);
    } catch (error) {
      console.error('Error fetching MLB team roster:', error);
      return [];
    }
  }

  /**
   * Get all MLB teams
   * @param season - Season year (defaults to current season)
   */
  static async getTeams(season?: number): Promise<MLBTeam[]> {
    try {
      const currentSeason = season || this.getCurrentSeason();
      const url = `${BASE_URL}/teams?season=${currentSeason}&sportId=1`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.teams || [];
    } catch (error) {
      console.error('Error fetching MLB teams:', error);
      return [];
    }
  }

  /**
   * Get today's schedule
   * @param date - Date in YYYY-MM-DD format (defaults to today)
   */
  static async getSchedule(date?: string): Promise<MLBGame[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const url = `${BASE_URL}/schedule?sportId=1&date=${targetDate}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract games from all dates
      const allGames: MLBGame[] = [];
      if (data.dates && data.dates.length > 0) {
        data.dates.forEach((dateObj: any) => {
          if (dateObj.games) {
            allGames.push(...dateObj.games);
          }
        });
      }

      return allGames;
    } catch (error) {
      console.error('Error fetching MLB schedule:', error);
      return [];
    }
  }

  /**
   * Get standings
   * @param season - Season year (defaults to current season)
   */
  static async getStandings(season?: number): Promise<any> {
    try {
      const currentSeason = season || this.getCurrentSeason();
      const url = `${BASE_URL}/standings?leagueId=103,104&season=${currentSeason}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching MLB standings:', error);
      return [];
    }
  }

  /**
   * Helper: Get current MLB season year
   * Returns current year (MLB season runs within calendar year)
   */
  static getCurrentSeason(): number {
    const now = new Date();
    return now.getFullYear();
  }

  /**
   * Helper: Extract batting averages from season stats
   */
  static extractBattingAverages(stats: MLBPlayerStats[]): {
    gamesPlayed: number;
    avg: number;
    hits: number;
    homeRuns: number;
    rbi: number;
    stolenBases: number;
    runs: number;
  } | null {
    try {
      if (stats.length === 0) return null;

      const seasonStats = stats[0].stat;

      return {
        gamesPlayed: seasonStats.gamesPlayed || 0,
        avg: parseFloat(seasonStats.avg || '0'),
        hits: seasonStats.hits || 0,
        homeRuns: seasonStats.homeRuns || 0,
        rbi: seasonStats.rbi || 0,
        stolenBases: seasonStats.stolenBases || 0,
        runs: seasonStats.runs || 0,
      };
    } catch (error) {
      console.error('Error extracting batting averages:', error);
      return null;
    }
  }

  /**
   * Helper: Extract pitching stats from season stats
   */
  static extractPitchingStats(stats: MLBPlayerStats[]): {
    gamesPlayed: number;
    wins: number;
    losses: number;
    era: number;
    strikeOuts: number;
    saves: number;
    inningsPitched: string;
  } | null {
    try {
      if (stats.length === 0) return null;

      const seasonStats = stats[0].stat;

      return {
        gamesPlayed: seasonStats.gamesPlayed || 0,
        wins: seasonStats.wins || 0,
        losses: seasonStats.losses || 0,
        era: parseFloat(seasonStats.era || '0'),
        strikeOuts: seasonStats.strikeOuts || 0,
        saves: seasonStats.saves || 0,
        inningsPitched: seasonStats.inningsPitched || '0.0',
      };
    } catch (error) {
      console.error('Error extracting pitching stats:', error);
      return null;
    }
  }

  /**
   * Helper: Calculate per-game averages from game log
   */
  static calculatePerGameAverages(
    gameLog: MLBGameLog[],
    limit: number = 10
  ): {
    hits: number;
    runs: number;
    rbi: number;
    homeRuns: number;
    stolenBases: number;
  } {
    const recentGames = gameLog.slice(0, limit);

    if (recentGames.length === 0) {
      return { hits: 0, runs: 0, rbi: 0, homeRuns: 0, stolenBases: 0 };
    }

    const totals = recentGames.reduce(
      (acc, game) => ({
        hits: acc.hits + (game.stat.hits || 0),
        runs: acc.runs + (game.stat.runs || 0),
        rbi: acc.rbi + (game.stat.rbi || 0),
        homeRuns: acc.homeRuns + (game.stat.homeRuns || 0),
        stolenBases: acc.stolenBases + (game.stat.stolenBases || 0),
      }),
      { hits: 0, runs: 0, rbi: 0, homeRuns: 0, stolenBases: 0 }
    );

    const gamesPlayed = recentGames.length;

    return {
      hits: Number((totals.hits / gamesPlayed).toFixed(2)),
      runs: Number((totals.runs / gamesPlayed).toFixed(2)),
      rbi: Number((totals.rbi / gamesPlayed).toFixed(2)),
      homeRuns: Number((totals.homeRuns / gamesPlayed).toFixed(2)),
      stolenBases: Number((totals.stolenBases / gamesPlayed).toFixed(2)),
    };
  }
}

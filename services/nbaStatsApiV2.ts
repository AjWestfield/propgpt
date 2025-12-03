/**
 * NBA Statistics API Service V2
 * Uses official stats.nba.com endpoints - FREE, no authentication required
 *
 * Documentation: https://github.com/swar/nba_api
 * Base URL: https://stats.nba.com/stats/
 */

const BASE_URL = 'https://stats.nba.com/stats';

// Required headers to mimic browser requests
const STATS_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.nba.com',
  'Referer': 'https://www.nba.com/',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

export interface NBAPlayer {
  personId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  teamId: string;
  teamCity: string;
  teamName: string;
  teamAbbreviation: string;
  position?: string;
}

export interface PlayerGameLog {
  seasonId: string;
  playerId: string;
  gameId: string;
  gameDate: string;
  matchup: string;
  wl: string;
  min: string;
  fgm: number;
  fga: number;
  fgPct: number;
  fg3m: number;
  fg3a: number;
  fg3Pct: number;
  ftm: number;
  fta: number;
  ftPct: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  pts: number;
  plusMinus: number;
}

export interface PlayerSeasonStats {
  playerId: string;
  playerName: string;
  gp: number; // games played
  min: number; // minutes
  pts: number;
  reb: number;
  ast: number;
  fg3m: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
}

export class NBAStatsAPIV2 {
  /**
   * Get all active NBA players for current season
   */
  static async getAllPlayers(season: string = '2024-25'): Promise<NBAPlayer[]> {
    try {
      const params = new URLSearchParams({
        IsOnlyCurrentSeason: '1',
        LeagueID: '00',
        Season: season,
      });

      const url = `${BASE_URL}/commonallplayers?${params}`;
      const response = await fetch(url, { headers: STATS_HEADERS });

      if (!response.ok) {
        console.error(`API error ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const resultSet = data.resultSets?.[0];

      if (!resultSet || !resultSet.rowSet) {
        console.error('No player data in response');
        return [];
      }

      // Map to player objects
      const headers = resultSet.headers;
      const rows = resultSet.rowSet;

      return rows.map((row: any[]) => {
        const player: any = {};
        headers.forEach((header: string, index: number) => {
          player[header] = row[index];
        });

        return {
          personId: player.PERSON_ID?.toString() || '',
          displayName: player.DISPLAY_FIRST_LAST || '',
          firstName: player.DISPLAY_FIRST_LAST?.split(' ')[0] || '',
          lastName: player.DISPLAY_FIRST_LAST?.split(' ').slice(1).join(' ') || '',
          teamId: player.TEAM_ID?.toString() || '',
          teamCity: player.TEAM_CITY || '',
          teamName: player.TEAM_NAME || '',
          teamAbbreviation: player.TEAM_ABBREVIATION || '',
        } as NBAPlayer;
      });
    } catch (error) {
      console.error('Error fetching all players:', error);
      return [];
    }
  }

  /**
   * Search for players by name
   */
  static async searchPlayers(name: string, season: string = '2024-25'): Promise<NBAPlayer[]> {
    const allPlayers = await this.getAllPlayers(season);
    const searchTerm = name.toLowerCase().trim();

    return allPlayers.filter(player =>
      player.displayName.toLowerCase().includes(searchTerm) ||
      player.firstName.toLowerCase().includes(searchTerm) ||
      player.lastName.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get player game log for a season
   */
  static async getPlayerGameLog(
    playerId: string,
    season: string = '2024-25',
    seasonType: string = 'Regular Season',
    limit: number = 10
  ): Promise<PlayerGameLog[]> {
    try {
      const params = new URLSearchParams({
        PlayerID: playerId,
        Season: season,
        SeasonType: seasonType,
        DateFrom: '',
        DateTo: '',
        LeagueID: '',
      });

      const url = `${BASE_URL}/playergamelog?${params}`;
      const response = await fetch(url, { headers: STATS_HEADERS });

      if (!response.ok) {
        console.error(`Game log API error ${response.status}`);
        return [];
      }

      const data = await response.json();
      const resultSet = data.resultSets?.[0];

      if (!resultSet || !resultSet.rowSet) {
        return [];
      }

      const headers = resultSet.headers;
      const rows = resultSet.rowSet.slice(0, limit);

      return rows.map((row: any[]) => {
        const game: any = {};
        headers.forEach((header: string, index: number) => {
          game[header] = row[index];
        });

        return {
          seasonId: game.SEASON_ID || '',
          playerId: game.Player_ID?.toString() || '',
          gameId: game.Game_ID || '',
          gameDate: game.GAME_DATE || '',
          matchup: game.MATCHUP || '',
          wl: game.WL || '',
          min: game.MIN || '0',
          fgm: game.FGM || 0,
          fga: game.FGA || 0,
          fgPct: game.FG_PCT || 0,
          fg3m: game.FG3M || 0,
          fg3a: game.FG3A || 0,
          fg3Pct: game.FG3_PCT || 0,
          ftm: game.FTM || 0,
          fta: game.FTA || 0,
          ftPct: game.FT_PCT || 0,
          oreb: game.OREB || 0,
          dreb: game.DREB || 0,
          reb: game.REB || 0,
          ast: game.AST || 0,
          stl: game.STL || 0,
          blk: game.BLK || 0,
          tov: game.TOV || 0,
          pf: game.PF || 0,
          pts: game.PTS || 0,
          plusMinus: game.PLUS_MINUS || 0,
        } as PlayerGameLog;
      });
    } catch (error) {
      console.error('Error fetching player game log:', error);
      return [];
    }
  }

  /**
   * Get player season averages
   */
  static async getPlayerSeasonStats(
    playerId: string,
    season: string = '2024-25'
  ): Promise<PlayerSeasonStats | null> {
    try {
      const params = new URLSearchParams({
        PlayerID: playerId,
        LeagueID: '00',
      });

      const url = `${BASE_URL}/commonplayerinfo?${params}`;
      const response = await fetch(url, { headers: STATS_HEADERS });

      if (!response.ok) {
        console.error(`Player info API error ${response.status}`);
        return null;
      }

      const data = await response.json();

      // Get player career stats to extract season averages
      const careerStats = data.resultSets?.find((rs: any) =>
        rs.name === 'PlayerHeadlineStats'
      );

      if (!careerStats || !careerStats.rowSet || careerStats.rowSet.length === 0) {
        return null;
      }

      const row = careerStats.rowSet[0];
      const headers = careerStats.headers;

      const stats: any = {};
      headers.forEach((header: string, index: number) => {
        stats[header] = row[index];
      });

      return {
        playerId: playerId,
        playerName: stats.PLAYER_NAME || '',
        gp: stats.TimeFrame || 0,
        min: stats.MIN || 0,
        pts: stats.PTS || 0,
        reb: stats.REB || 0,
        ast: stats.AST || 0,
        fg3m: 0, // Not in headline stats
        stl: 0,
        blk: 0,
        tov: 0,
        pf: 0,
        fgPct: stats.FG_PCT || 0,
        fg3Pct: stats.FG3_PCT || 0,
        ftPct: stats.FT_PCT || 0,
      } as PlayerSeasonStats;
    } catch (error) {
      console.error('Error fetching player season stats:', error);
      return null;
    }
  }

  /**
   * Helper: Get current NBA season string
   */
  static getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // NBA season starts in October (month 10)
    if (month >= 10) {
      return `${year}-${(year + 1).toString().slice(2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(2)}`;
    }
  }
}

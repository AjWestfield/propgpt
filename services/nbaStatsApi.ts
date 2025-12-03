/**
 * NBA Statistics API Service
 * Uses balldontlie.io - Free, no authentication required
 * Rate limit: 60 requests/minute
 *
 * API Documentation: https://docs.balldontlie.io/
 */

const BASE_URL = 'https://www.balldontlie.io/api/v1';

export interface BallDontLiePlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height_feet: number | null;
  height_inches: number | null;
  weight_pounds: number | null;
  team: {
    id: number;
    abbreviation: string;
    city: string;
    conference: string;
    division: string;
    full_name: string;
    name: string;
  };
}

export interface BallDontLieSeasonAverage {
  games_played: number;
  player_id: number;
  season: number;
  min: string;
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  pf: number;
  pts: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
}

export interface BallDontLieGameStats {
  id: number;
  ast: number;
  blk: number;
  dreb: number;
  fg3_pct: number;
  fg3a: number;
  fg3m: number;
  fg_pct: number;
  fga: number;
  fgm: number;
  ft_pct: number;
  fta: number;
  ftm: number;
  game: {
    id: number;
    date: string;
    home_team_id: number;
    home_team_score: number;
    period: number;
    postseason: boolean;
    season: number;
    status: string;
    time: string;
    visitor_team_id: number;
    visitor_team_score: number;
  };
  min: string;
  oreb: number;
  pf: number;
  player: BallDontLiePlayer;
  pts: number;
  reb: number;
  stl: number;
  team: {
    id: number;
    abbreviation: string;
    city: string;
    conference: string;
    division: string;
    full_name: string;
    name: string;
  };
  turnover: number;
}

export class NBAStatsAPI {
  /**
   * Normalize player name for search
   * Handles common formatting issues
   */
  private static normalizeName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\./g, '') // Remove periods (e.g., "J. Doe" -> "J Doe")
      .replace(/'/g, '') // Remove apostrophes
      .toLowerCase();
  }

  /**
   * Search for players by name with multiple fallback strategies
   */
  static async searchPlayers(name: string): Promise<BallDontLiePlayer[]> {
    try {
      // Try exact search first
      const exactUrl = `${BASE_URL}/players?search=${encodeURIComponent(name)}`;
      const exactResponse = await fetch(exactUrl);

      if (exactResponse.ok) {
        const exactData = await exactResponse.json();
        if (exactData.data && exactData.data.length > 0) {
          return exactData.data;
        }
      }

      // If exact search fails, try splitting name and searching for last name
      const nameParts = name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        const lastName = nameParts[nameParts.length - 1];
        const lastNameUrl = `${BASE_URL}/players?search=${encodeURIComponent(lastName)}`;
        const lastNameResponse = await fetch(lastNameUrl);

        if (lastNameResponse.ok) {
          const lastNameData = await lastNameResponse.json();
          const players = lastNameData.data || [];

          // Filter to find best match by first name
          const firstName = nameParts[0];
          const bestMatch = players.find((p: BallDontLiePlayer) =>
            this.normalizeName(p.first_name).startsWith(this.normalizeName(firstName))
          );

          if (bestMatch) {
            return [bestMatch];
          }

          // Return all players with matching last name if no perfect match
          if (players.length > 0) {
            return players;
          }
        }
      }

      console.error(`No players found for: ${name}`);
      return [];
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  }

  /**
   * Get player by ID
   */
  static async getPlayer(playerId: number): Promise<BallDontLiePlayer | null> {
    try {
      const url = `${BASE_URL}/players/${playerId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching player:', error);
      return null;
    }
  }

  /**
   * Get season averages for one or more players
   */
  static async getSeasonAverages(
    playerIds: number[],
    season: number = new Date().getFullYear()
  ): Promise<BallDontLieSeasonAverage[]> {
    try {
      const playerIdsParam = playerIds.map(id => `player_ids[]=${id}`).join('&');
      const url = `${BASE_URL}/season_averages?season=${season}&${playerIdsParam}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching season averages:', error);
      return [];
    }
  }

  /**
   * Get player game log (recent games)
   */
  static async getPlayerGameLog(
    playerId: number,
    season: number = new Date().getFullYear(),
    limit: number = 10
  ): Promise<BallDontLieGameStats[]> {
    try {
      const url = `${BASE_URL}/stats?player_ids[]=${playerId}&season=${season}&per_page=${limit}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      // Sort by date descending (most recent first)
      return (data.data || []).sort((a: BallDontLieGameStats, b: BallDontLieGameStats) => {
        return new Date(b.game.date).getTime() - new Date(a.game.date).getTime();
      });
    } catch (error) {
      console.error('Error fetching player game log:', error);
      return [];
    }
  }

  /**
   * Get all players (paginated)
   */
  static async getAllPlayers(page: number = 1, perPage: number = 100): Promise<BallDontLiePlayer[]> {
    try {
      const url = `${BASE_URL}/players?page=${page}&per_page=${perPage}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching all players:', error);
      return [];
    }
  }

  /**
   * Get players by team abbreviation
   */
  static async getPlayersByTeam(teamAbbreviation: string): Promise<BallDontLiePlayer[]> {
    try {
      // Get all players and filter by team
      // Note: balldontlie doesn't have a direct team filter, so we search by team name
      const url = `${BASE_URL}/players?search=${encodeURIComponent(teamAbbreviation)}&per_page=100`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const allPlayers = data.data || [];

      // Filter to only players on the specified team
      return allPlayers.filter((player: BallDontLiePlayer) =>
        player.team.abbreviation === teamAbbreviation
      );
    } catch (error) {
      console.error('Error fetching players by team:', error);
      return [];
    }
  }

  /**
   * Helper: Get current NBA season year
   */
  static getCurrentSeason(): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    // NBA season starts in October (month 10)
    // If we're before October, use previous year
    return month >= 10 ? year : year - 1;
  }
}

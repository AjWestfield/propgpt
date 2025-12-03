// Sports API Service - ESPN Hidden API Integration
// Provides real-time schedules, scores, stats, and news for all major sports

import { isHalftime } from '../utils/gameStatus';

const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports';

export interface ESPNGame {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: Array<{
    id: string;
    date: string;
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
    }>;
    status: {
      type: {
        completed: boolean;
        description: string;
      };
    };
  }>;
}

export interface ESPNAthlete {
  id: string;
  displayName: string;
  headshot?: {
    href: string;
  };
  team?: {
    id: string;
    name: string;
    logo: string;
  };
  position?: {
    abbreviation: string;
    displayName: string;
  };
  statistics?: Array<{
    name: string;
    displayValue: string;
    value: number;
  }>;
}

export interface RealPlayer {
  id: string;
  name: string;
  headshot: string;
  team: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
  };
  opponent: {
    name: string;
    abbreviation: string;
    logo: string;
  };
  sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB';
  gameTime: string;
  position?: string;
  isLive?: boolean;
  // Game filter fields
  gameId: string;
  gameName: string;
  gameStatus: 'upcoming' | 'live' | 'completed';
  homeTeam: string;
  awayTeam: string;
  // College-specific fields
  classYear?: string; // 'FR', 'SO', 'JR', 'SR'
  conference?: string; // e.g., 'SEC', 'Big Ten'
}

export interface ESPNTeam {
  id: string;
  displayName: string;
  abbreviation: string;
  logos: Array<{
    href: string;
  }>;
}

export class SportsAPI {
  private static async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // NBA Methods
  static async getNBAScoreboard(): Promise<{ games: ESPNGame[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/basketball/nba/scoreboard`
      );
      const data = await response.json();
      return { games: data.events || [] };
    } catch (error) {
      console.error('Error fetching NBA scoreboard:', error);
      return { games: [] };
    }
  }

  static async getNBATeams(): Promise<{ teams: ESPNTeam[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/basketball/nba/teams`
      );
      const data = await response.json();
      return { teams: data.sports?.[0]?.leagues?.[0]?.teams || [] };
    } catch (error) {
      console.error('Error fetching NBA teams:', error);
      return { teams: [] };
    }
  }

  static async getNBAPlayer(playerId: string): Promise<ESPNAthlete | null> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/basketball/nba/athletes/${playerId}`
      );
      const data = await response.json();
      return data.athlete || null;
    } catch (error) {
      console.error(`Error fetching NBA player ${playerId}:`, error);
      return null;
    }
  }

  // NFL Methods
  static async getNFLScoreboard(): Promise<{ games: ESPNGame[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/football/nfl/scoreboard`
      );
      const data = await response.json();
      return { games: data.events || [] };
    } catch (error) {
      console.error('Error fetching NFL scoreboard:', error);
      return { games: [] };
    }
  }

  static async getNFLTeams(): Promise<{ teams: ESPNTeam[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/football/nfl/teams`
      );
      const data = await response.json();
      return { teams: data.sports?.[0]?.leagues?.[0]?.teams || [] };
    } catch (error) {
      console.error('Error fetching NFL teams:', error);
      return { teams: [] };
    }
  }

  static async getNFLPlayer(playerId: string): Promise<ESPNAthlete | null> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/football/nfl/athletes/${playerId}`
      );
      const data = await response.json();
      return data.athlete || null;
    } catch (error) {
      console.error(`Error fetching NFL player ${playerId}:`, error);
      return null;
    }
  }

  // MLB Methods
  static async getMLBScoreboard(): Promise<{ games: ESPNGame[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/baseball/mlb/scoreboard`
      );
      const data = await response.json();
      return { games: data.events || [] };
    } catch (error) {
      console.error('Error fetching MLB scoreboard:', error);
      return { games: [] };
    }
  }

  static async getMLBTeams(): Promise<{ teams: ESPNTeam[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/baseball/mlb/teams`
      );
      const data = await response.json();
      return { teams: data.sports?.[0]?.leagues?.[0]?.teams || [] };
    } catch (error) {
      console.error('Error fetching MLB teams:', error);
      return { teams: [] };
    }
  }

  static async getMLBPlayer(playerId: string): Promise<ESPNAthlete | null> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/baseball/mlb/athletes/${playerId}`
      );
      const data = await response.json();
      return data.athlete || null;
    } catch (error) {
      console.error(`Error fetching MLB player ${playerId}:`, error);
      return null;
    }
  }

  // NHL Methods
  static async getNHLScoreboard(): Promise<{ games: ESPNGame[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/hockey/nhl/scoreboard`
      );
      const data = await response.json();
      return { games: data.events || [] };
    } catch (error) {
      console.error('Error fetching NHL scoreboard:', error);
      return { games: [] };
    }
  }

  static async getNHLTeams(): Promise<{ teams: ESPNTeam[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/hockey/nhl/teams`
      );
      const data = await response.json();
      return { teams: data.sports?.[0]?.leagues?.[0]?.teams || [] };
    } catch (error) {
      console.error('Error fetching NHL teams:', error);
      return { teams: [] };
    }
  }

  static async getNHLPlayer(playerId: string): Promise<ESPNAthlete | null> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/hockey/nhl/athletes/${playerId}`
      );
      const data = await response.json();
      return data.athlete || null;
    } catch (error) {
      console.error(`Error fetching NHL player ${playerId}:`, error);
      return null;
    }
  }

  // College Football Methods
  static async getCollegeFootballScoreboard(date?: string): Promise<{ games: ESPNGame[] }> {
    try {
      const dateParam = date ? `?dates=${date}` : '';
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/football/college-football/scoreboard${dateParam}`
      );
      const data = await response.json();
      return { games: data.events || [] };
    } catch (error) {
      console.error('Error fetching college football scoreboard:', error);
      return { games: [] };
    }
  }

  static async getCollegeFootballByWeek(week: number, year?: number): Promise<{ games: ESPNGame[] }> {
    try {
      const seasonYear = year || new Date().getFullYear();
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/football/college-football/scoreboard?seasontype=2&week=${week}&year=${seasonYear}`
      );
      const data = await response.json();
      return { games: data.events || [] };
    } catch (error) {
      console.error(`Error fetching college football week ${week}:`, error);
      return { games: [] };
    }
  }

  static async getCollegeFootballTeams(): Promise<{ teams: ESPNTeam[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/football/college-football/teams?limit=200`
      );
      const data = await response.json();
      return { teams: data.sports?.[0]?.leagues?.[0]?.teams || [] };
    } catch (error) {
      console.error('Error fetching college football teams:', error);
      return { teams: [] };
    }
  }

  static async getCollegeFootballPlayer(playerId: string): Promise<ESPNAthlete | null> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/football/college-football/athletes/${playerId}`
      );
      const data = await response.json();
      return data.athlete || null;
    } catch (error) {
      console.error(`Error fetching college football player ${playerId}:`, error);
      return null;
    }
  }

  static async getCollegeFootballRankings(): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/football/college-football/rankings`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching college football rankings:', error);
      return null;
    }
  }

  // College Basketball Methods
  static async getCollegeBasketballScoreboard(date?: string): Promise<{ games: ESPNGame[] }> {
    try {
      const dateParam = date ? `?dates=${date}` : '';
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/basketball/mens-college-basketball/scoreboard${dateParam}`
      );
      const data = await response.json();
      return { games: data.events || [] };
    } catch (error) {
      console.error('Error fetching college basketball scoreboard:', error);
      return { games: [] };
    }
  }

  static async getCollegeBasketballTeams(): Promise<{ teams: ESPNTeam[] }> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/basketball/mens-college-basketball/teams?limit=400`
      );
      const data = await response.json();
      return { teams: data.sports?.[0]?.leagues?.[0]?.teams || [] };
    } catch (error) {
      console.error('Error fetching college basketball teams:', error);
      return { teams: [] };
    }
  }

  static async getCollegeBasketballPlayer(playerId: string): Promise<ESPNAthlete | null> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/basketball/mens-college-basketball/athletes/${playerId}`
      );
      const data = await response.json();
      return data.athlete || null;
    } catch (error) {
      console.error(`Error fetching college basketball player ${playerId}:`, error);
      return null;
    }
  }

  static async getCollegeBasketballRankings(): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/basketball/mens-college-basketball/rankings`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching college basketball rankings:', error);
      return null;
    }
  }

  // College Sports Helper - Get Rankings for any college sport
  static async getCollegeRankings(sport: 'NCAAF' | 'NCAAB'): Promise<any> {
    switch (sport) {
      case 'NCAAF':
        return this.getCollegeFootballRankings();
      case 'NCAAB':
        return this.getCollegeBasketballRankings();
      default:
        return null;
    }
  }

  // Multi-Sport Methods
  static async getScoreboardBySport(sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB'): Promise<{ games: ESPNGame[] }> {
    switch (sport) {
      case 'NBA':
        return this.getNBAScoreboard();
      case 'NFL':
        return this.getNFLScoreboard();
      case 'MLB':
        return this.getMLBScoreboard();
      case 'NHL':
        return this.getNHLScoreboard();
      case 'NCAAF':
        return this.getCollegeFootballScoreboard();
      case 'NCAAB':
        return this.getCollegeBasketballScoreboard();
      default:
        return { games: [] };
    }
  }

  static async getTeamsBySport(sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB'): Promise<{ teams: ESPNTeam[] }> {
    switch (sport) {
      case 'NBA':
        return this.getNBATeams();
      case 'NFL':
        return this.getNFLTeams();
      case 'MLB':
        return this.getMLBTeams();
      case 'NHL':
        return this.getNHLTeams();
      case 'NCAAF':
        return this.getCollegeFootballTeams();
      case 'NCAAB':
        return this.getCollegeBasketballTeams();
      default:
        return { teams: [] };
    }
  }

  static async getAllScoreboards(): Promise<{
    nba: ESPNGame[];
    nfl: ESPNGame[];
    mlb: ESPNGame[];
    nhl: ESPNGame[];
  }> {
    try {
      const [nba, nfl, mlb, nhl] = await Promise.all([
        this.getNBAScoreboard(),
        this.getNFLScoreboard(),
        this.getMLBScoreboard(),
        this.getNHLScoreboard(),
      ]);

      return {
        nba: nba.games,
        nfl: nfl.games,
        mlb: mlb.games,
        nhl: nhl.games,
      };
    } catch (error) {
      console.error('Error fetching all scoreboards:', error);
      return {
        nba: [],
        nfl: [],
        mlb: [],
        nhl: [],
      };
    }
  }

  // New Methods for Player Roster Data

  /**
   * Get detailed game summary with roster information
   */
  static async getGameSummary(gameId: string, sport: Sport): Promise<any> {
    try {
      const sportPath = this.getSportPath(sport);
      const url = `${ESPN_BASE}/${sportPath}/summary?event=${gameId}`;
      console.log(`[SportsAPI.getGameSummary] Fetching: ${url}`);

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.error(`[SportsAPI.getGameSummary] HTTP error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log(`[SportsAPI.getGameSummary] Response keys:`, Object.keys(data));
      console.log(`[SportsAPI.getGameSummary] Has boxscore:`, !!data.boxscore);
      console.log(`[SportsAPI.getGameSummary] Has header:`, !!data.header);
      console.log(`[SportsAPI.getGameSummary] Has gameInfo:`, !!data.gameInfo);

      // Log boxscore structure if it exists
      if (data.boxscore) {
        console.log(`[SportsAPI.getGameSummary] Boxscore structure:`, {
          hasTeams: !!data.boxscore.teams,
          teamsLength: data.boxscore.teams?.length,
          hasPlayers: !!data.boxscore.players,
        });
      }

      return data;
    } catch (error) {
      console.error(`[SportsAPI.getGameSummary] Error fetching game summary for ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Get team roster for a specific team
   */
  static async getTeamRoster(teamId: string, sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB'): Promise<ESPNAthlete[]> {
    try {
      const sportPath = this.getSportPath(sport);
      const response = await this.fetchWithTimeout(
        `${ESPN_BASE}/${sportPath}/teams/${teamId}/roster`
      );
      const data = await response.json();

      // Extract athletes from roster structure
      const athletes = data.athletes || [];
      const allPlayers: ESPNAthlete[] = [];

      // ESPN roster can be either grouped by position or flat array
      athletes.forEach((athleteOrGroup: any) => {
        // Check if this is a group with items (positional grouping)
        if (athleteOrGroup.items && Array.isArray(athleteOrGroup.items)) {
          athleteOrGroup.items.forEach((athlete: any) => {
            allPlayers.push({
              id: athlete.id,
              displayName: athlete.displayName || athlete.fullName,
              headshot: athlete.headshot,
              team: athlete.team,
              position: athlete.position,
              statistics: athlete.statistics,
            });
          });
        } else if (athleteOrGroup.id) {
          // This is a direct athlete object (flat structure)
          allPlayers.push({
            id: athleteOrGroup.id,
            displayName: athleteOrGroup.displayName || athleteOrGroup.fullName,
            headshot: athleteOrGroup.headshot,
            team: athleteOrGroup.team,
            position: athleteOrGroup.position,
            statistics: athleteOrGroup.statistics,
          });
        }
      });

      return allPlayers;
    } catch (error) {
      console.error(`Error fetching team roster for ${teamId}:`, error);
      return [];
    }
  }

  /**
   * Extract real players from game data
   * Returns top players from both teams in the game
   */
  static async getPlayersFromGame(game: ESPNGame, sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB'): Promise<RealPlayer[]> {
    try {
      const players: RealPlayer[] = [];
      const competition = game.competitions[0];

      if (!competition || competition.competitors.length < 2) {
        return players;
      }

      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

      if (!homeTeam || !awayTeam) {
        return players;
      }

      // Get rosters for both teams
      const [homeRoster, awayRoster] = await Promise.all([
        this.getTeamRoster(homeTeam.team.id, sport),
        this.getTeamRoster(awayTeam.team.id, sport),
      ]);

      // Check if game is live
      const isLive = !competition.status.type.completed &&
                     (competition.status.type.description.toLowerCase().includes('in progress') ||
                      competition.status.type.description.toLowerCase().includes('halftime') ||
                      competition.status.type.description.toLowerCase().includes('1st') ||
                      competition.status.type.description.toLowerCase().includes('2nd') ||
                      competition.status.type.description.toLowerCase().includes('3rd') ||
                      competition.status.type.description.toLowerCase().includes('4th') ||
                      competition.status.type.description.toLowerCase().includes('ot'));

      // Determine game status
      const gameStatus: 'upcoming' | 'live' | 'completed' =
        competition.status.type.completed ? 'completed' :
        isLive ? 'live' : 'upcoming';

      const createPlayerFromAthlete = (athlete: any, teamWrapper: any, opponentWrapper: any): RealPlayer | null => {
        if (!athlete) return null;

        const formattedName =
          athlete.displayName ||
          athlete.fullName ||
          athlete.shortName ||
          'Unknown Player';

        const headshot =
          typeof athlete.headshot === 'string'
            ? athlete.headshot
            : athlete.headshot?.href || this.getDefaultHeadshot(sport);

        const experience =
          athlete.experience?.abbreviation ||
          athlete.experience?.displayValue ||
          undefined;

        return {
          id: athlete.id?.toString() || `${teamWrapper.team.id}_${formattedName}`,
          name: formattedName,
          headshot,
          team: {
            id: teamWrapper.team.id,
            name: teamWrapper.team.displayName,
            abbreviation: teamWrapper.team.abbreviation,
            logo: teamWrapper.team.logo,
          },
          opponent: {
            name: opponentWrapper.team.displayName,
            abbreviation: opponentWrapper.team.abbreviation,
            logo: opponentWrapper.team.logo,
          },
          sport,
          gameTime: this.formatGameTime(competition.date, isLive),
          position: athlete.position?.abbreviation,
          isLive,
          gameId: game.id,
          gameName: game.name,
          gameStatus,
          homeTeam: homeTeam.team.abbreviation,
          awayTeam: awayTeam.team.abbreviation,
          classYear: experience,
          conference: teamWrapper.team.conferenceId?.toString(),
        };
      };

      const selectTopPlayers = (roster: ESPNAthlete[], team: any, opponent: any): RealPlayer[] => {
        if (!roster || roster.length === 0) return [];
        const maxPlayers =
          sport === 'NFL' || sport === 'NCAAF'
            ? 10
            : sport === 'NBA' || sport === 'NCAAB'
            ? 8
            : 6;

        const topAthletes = roster.slice(0, maxPlayers);
        const players: RealPlayer[] = [];

        topAthletes.forEach(athlete => {
          const player = createPlayerFromAthlete(athlete, team, opponent);
          if (player) {
            players.push(player);
          }
        });

        return players;
      };

      const selectPlayersFromLeaders = (team: any, opponent: any): RealPlayer[] => {
        const leaderGroups = team.leaders || [];
        const seen = new Set<string>();
        const leaderPlayers: RealPlayer[] = [];

        leaderGroups.forEach((group: any) => {
          (group.leaders || []).forEach((leader: any) => {
            const athlete = leader.athlete;
            if (!athlete?.id || seen.has(athlete.id)) {
              return;
            }
            const player = createPlayerFromAthlete(athlete, team, opponent);
            if (player) {
              seen.add(athlete.id);
              leaderPlayers.push(player);
            }
          });
        });

        return leaderPlayers;
      };

      // Add players from both teams with leader fallback for college sports
      let homePlayers = selectTopPlayers(homeRoster, homeTeam, awayTeam);
      let awayPlayers = selectTopPlayers(awayRoster, awayTeam, homeTeam);

      if (homePlayers.length === 0) {
        homePlayers = selectPlayersFromLeaders(homeTeam, awayTeam);
      }
      if (awayPlayers.length === 0) {
        awayPlayers = selectPlayersFromLeaders(awayTeam, homeTeam);
      }

      players.push(...homePlayers, ...awayPlayers);

      return players;
    } catch (error) {
      console.error(`Error extracting players from game ${game.id}:`, error);
      return [];
    }
  }

  /**
   * Get all real players from today's games for a specific sport
   */
  static async getRealPlayersBySport(sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB'): Promise<RealPlayer[]> {
    try {
      const { games } = await this.getScoreboardBySport(sport);

      if (games.length === 0) {
        console.log(`No games found for ${sport} today`);
        return [];
      }

      console.log(`Found ${games.length} ${sport} games, extracting players...`);

      // Extract players from all games in parallel
      const playersArrays = await Promise.all(
        games.map(game => this.getPlayersFromGame(game, sport))
      );

      // Flatten the arrays
      const allPlayers = playersArrays.flat();

      console.log(`Extracted ${allPlayers.length} real players for ${sport}`);
      return allPlayers;
    } catch (error) {
      console.error(`Error getting real players for ${sport}:`, error);
      return [];
    }
  }

  // Helper Methods

  private static getSportPath(sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB'): string {
    switch (sport) {
      case 'NBA':
        return 'basketball/nba';
      case 'NFL':
        return 'football/nfl';
      case 'MLB':
        return 'baseball/mlb';
      case 'NHL':
        return 'hockey/nhl';
      case 'NCAAF':
        return 'football/college-football';
      case 'NCAAB':
        return 'basketball/mens-college-basketball';
      default:
        return 'basketball/nba';
    }
  }

  private static getDefaultHeadshot(sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB'): string {
    // Return a placeholder based on sport
    const sportEmojis: Record<string, string> = {
      'NBA': '🏀',
      'NFL': '🏈',
      'MLB': '⚾',
      'NHL': '🏒',
      'NCAAF': '🏈',
      'NCAAB': '🏀',
    };

    // Map college sports to their logo paths
    const logoMap: Record<string, string> = {
      'NCAAF': 'college-football',
      'NCAAB': 'ncaa',
    };

    const logoPath = logoMap[sport] || sport.toLowerCase();
    return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/${logoPath}.png`;
  }

  private static formatGameTime(dateString: string, isLive: boolean = false): string {
    // If game is live, return "LIVE"
    if (isLive) {
      return 'LIVE';
    }

    const gameDate = new Date(dateString);
    const now = new Date();

    // Check if the game is today
    const isToday = gameDate.toDateString() === now.toDateString();

    // Format time
    const timeString = gameDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) {
      return `Today ${timeString}`;
    }

    // Check if the game is tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = gameDate.toDateString() === tomorrow.toDateString();

    if (isTomorrow) {
      return `Tomorrow ${timeString}`;
    }

    // For other dates, format as "Nov 18, 7:30 PM"
    const dateFormatted = gameDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return `${dateFormatted}, ${timeString}`;
  }

  // ============================================
  // LIVE FEED METHODS - For FeedScreen
  // ============================================

  /**
   * Get scoreboard for a specific sport with optional date filtering
   * @param sport - Sport league to fetch
   * @param date - Optional date in YYYYMMDD format (default: today)
   */
  static async getScoreboardByDate(
    sport: 'NBA' | 'NFL' | 'MLB' | 'NHL',
    date?: string
  ): Promise<{ games: ESPNGame[]; lastUpdated: number }> {
    try {
      const sportPath = this.getSportPath(sport);
      const dateParam = date ? `?dates=${date}` : '';
      const url = `${ESPN_BASE}/${sportPath}/scoreboard${dateParam}`;

      const response = await this.fetchWithTimeout(url);
      const data = await response.json();

      return {
        games: data.events || [],
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error(`Error fetching ${sport} scoreboard:`, error);
      return { games: [], lastUpdated: Date.now() };
    }
  }

  /**
   * Get all live games across all sports
   * Returns only games currently in progress
   */
  static async getAllLiveGames(): Promise<{
    games: ESPNGame[];
    bySport: {
      NBA: ESPNGame[];
      NFL: ESPNGame[];
      MLB: ESPNGame[];
      NHL: ESPNGame[];
    };
    liveCount: number;
  }> {
    try {
      // Fetch all sports in parallel
      const [nba, nfl, mlb, nhl] = await Promise.all([
        this.getNBAScoreboard(),
        this.getNFLScoreboard(),
        this.getMLBScoreboard(),
        this.getNHLScoreboard(),
      ]);

      // Filter for live games only (games not completed and past scheduled time)
      const filterLiveGames = (games: ESPNGame[]) => {
        return games.filter(game => {
          const competition = game.competitions?.[0];
          if (!competition) return false;

          const status = competition.status?.type;
          // Live if: not completed AND (in progress OR started)
          const isLive = !status?.completed && status?.state !== 'pre';
          return isLive;
        });
      };

      const nbaLive = filterLiveGames(nba.games);
      const nflLive = filterLiveGames(nfl.games);
      const mlbLive = filterLiveGames(mlb.games);
      const nhlLive = filterLiveGames(nhl.games);

      const allLiveGames = [...nbaLive, ...nflLive, ...mlbLive, ...nhlLive];

      return {
        games: allLiveGames,
        bySport: {
          NBA: nbaLive,
          NFL: nflLive,
          MLB: mlbLive,
          NHL: nhlLive,
        },
        liveCount: allLiveGames.length,
      };
    } catch (error) {
      console.error('Error fetching live games:', error);
      return {
        games: [],
        bySport: { NBA: [], NFL: [], MLB: [], NHL: [] },
        liveCount: 0,
      };
    }
  }

  /**
   * Get all games for today across all sports
   */
  static async getTodaysGames(): Promise<{
    games: ESPNGame[];
    bySport: {
      NBA: ESPNGame[];
      NFL: ESPNGame[];
      MLB: ESPNGame[];
      NHL: ESPNGame[];
    };
    totalCount: number;
  }> {
    try {
      const [nba, nfl, mlb, nhl] = await Promise.all([
        this.getNBAScoreboard(),
        this.getNFLScoreboard(),
        this.getMLBScoreboard(),
        this.getNHLScoreboard(),
      ]);

      const allGames = [...nba.games, ...nfl.games, ...mlb.games, ...nhl.games];

      return {
        games: allGames,
        bySport: {
          NBA: nba.games,
          NFL: nfl.games,
          MLB: mlb.games,
          NHL: nhl.games,
        },
        totalCount: allGames.length,
      };
    } catch (error) {
      console.error('Error fetching todays games:', error);
      return {
        games: [],
        bySport: { NBA: [], NFL: [], MLB: [], NHL: [] },
        totalCount: 0,
      };
    }
  }

  /**
   * Get detailed game information including full roster
   * @param gameId - ESPN game ID
   * @param sport - Sport league
   */
  static async getGameDetails(
    gameId: string,
    sport: Sport
  ): Promise<any> {
    try {
      const sportPath = this.getSportPath(sport);
      const url = `${ESPN_BASE}/${sportPath}/summary?event=${gameId}`;

      console.log(`[SportsAPI.getGameDetails] Fetching: ${url}`);
      const response = await this.fetchWithTimeout(url);
      const data = await response.json();

      console.log(`[SportsAPI.getGameDetails] Response keys:`, Object.keys(data));
      console.log(`[SportsAPI.getGameDetails] Has header:`, !!data.header);
      console.log(`[SportsAPI.getGameDetails] Has header.competitions:`, !!data.header?.competitions);
      console.log(`[SportsAPI.getGameDetails] Header.competitions length:`, data.header?.competitions?.length);

      return data;
    } catch (error) {
      console.error(`[SportsAPI.getGameDetails] Error fetching game ${gameId} details:`, error);
      return null;
    }
  }


  /**
   * Construct team logo URL from team ID if ESPN doesn't provide it
   * ESPN logo pattern: https://a.espncdn.com/i/teamlogos/{sport}/500/{teamId}.png
   */
  static getTeamLogoUrl(
    teamId: string,
    sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB',
    providedLogo?: string
  ): string {
    // If ESPN provided a logo, use it
    if (providedLogo) {
      return providedLogo;
    }

    // Otherwise construct the logo URL
    const sportPathMap: Record<string, string> = {
      NBA: 'nba',
      NFL: 'nfl',
      MLB: 'mlb',
      NHL: 'nhl',
      NCAAF: 'ncaa',
      NCAAB: 'ncaa',
    };
    const sportPath = sportPathMap[sport] || sport.toLowerCase();
    return `https://a.espncdn.com/i/teamlogos/${sportPath}/500/${teamId}.png`;
  }

  /**
   * Parse ESPN game data into simplified Game format
   * Used by FeedScreen to display games consistently
   */
  static parseGameData(espnGame: ESPNGame, sport: 'NBA' | 'NFL' | 'MLB' | 'NHL'): any {
    try {
      const competition = espnGame.competitions?.[0];
      if (!competition) return null;

      const competitors = competition.competitors || [];
      const homeTeam = competitors.find(c => c.homeAway === 'home');
      const awayTeam = competitors.find(c => c.homeAway === 'away');

      if (!homeTeam || !awayTeam) return null;

      const status = competition.status?.type;
      const isCompleted = status?.completed || false;
      const isLive = !isCompleted && status?.state !== 'pre';
      const hasStarted = status?.state !== 'pre';

      // Determine game status
      let gameStatus: 'scheduled' | 'in_progress' | 'final' | 'postponed' = 'scheduled';
      if (isCompleted) {
        gameStatus = 'final';
      } else if (isLive) {
        gameStatus = 'in_progress';
      } else if (status?.name === 'STATUS_POSTPONED') {
        gameStatus = 'postponed';
      }

      const period = competition.status?.period;
      const clock = competition.status?.displayClock;
      const halftime = isHalftime(
        sport,
        period,
        clock,
        status?.description || status?.detail || status?.shortDetail
      );

      // Format status text
      let statusText = status?.shortDetail || status?.description || 'Scheduled';
      if (halftime) {
        statusText = 'Half Time';
      } else if (isLive && clock && period) {
        statusText = `Q${period} - ${clock}`;
      }

      return {
        id: espnGame.id,
        sport,
        date: espnGame.date,
        status: gameStatus,
        statusText,
        homeTeam: {
          id: homeTeam.team.id,
          displayName: homeTeam.team.displayName,
          abbreviation: homeTeam.team.abbreviation,
          logo: this.getTeamLogoUrl(homeTeam.team.id, sport, homeTeam.team.logo),
          homeAway: 'home' as const,
          record: homeTeam.records?.[0]?.summary,
        },
        awayTeam: {
          id: awayTeam.team.id,
          displayName: awayTeam.team.displayName,
          abbreviation: awayTeam.team.abbreviation,
          logo: this.getTeamLogoUrl(awayTeam.team.id, sport, awayTeam.team.logo),
          homeAway: 'away' as const,
          record: awayTeam.records?.[0]?.summary,
        },
        score: {
          home: homeTeam.score || '0',
          away: awayTeam.score || '0',
          period,
          clock,
        },
        venue: competition.venue?.fullName,
        broadcast: competition.broadcasts?.flatMap(b => b.names || []),
        odds: competition.odds?.[0] ? {
          spread: competition.odds[0].details,
          overUnder: competition.odds[0].overUnder?.toString(),
        } : undefined,
        isLive,
        hasStarted,
      };
    } catch (error) {
      console.error('Error parsing game data:', error);
      return null;
    }
  }

  // ============================================
  // BOX SCORE METHODS - For GameDetailScreen
  // ============================================

  /**
   * Map ESPN stat names to app-expected keys
   * ESPN uses camelCase names like "fieldGoalPct" but we want "FG%"
   */
  private static mapESPNStatKey(espnName: string, sport: Sport): string {
    const NBA_STAT_MAP: Record<string, string> = {
      'fieldGoalPct': 'FG%',
      'threePointPct': '3P%',
      'freeThrowPct': 'FT%',
      'totalRebounds': 'REB',
      'assists': 'AST',
      'turnovers': 'TO',
      'steals': 'STL',
      'blocks': 'BLK',
      'points': 'PTS',
      'offensiveRebounds': 'OREB',
      'defensiveRebounds': 'DREB',
      'personalFouls': 'PF',
      'fieldGoalsMade': 'FGM',
      'fieldGoalsAttempted': 'FGA',
      'threePointFieldGoalsMade': '3PM',
      'threePointFieldGoalsAttempted': '3PA',
      'freeThrowsMade': 'FTM',
      'freeThrowsAttempted': 'FTA',
    };

    const NFL_STAT_MAP: Record<string, string> = {
      'totalYards': 'TOTAL_YDS',
      'passingYards': 'PASS_YDS',
      'rushingYards': 'RUSH_YDS',
      'turnovers': 'TURNOVERS',
      'penalties': 'PENALTIES',
      'possessionTime': 'TIME_OF_POSSESSION',
      'firstDowns': 'FIRST_DOWNS',
      'thirdDownEff': '3RD_DOWN',
      'fourthDownEff': '4TH_DOWN',
      'completionAttempts': 'COMP_ATT',
    };

    const MLB_STAT_MAP: Record<string, string> = {
      'runs': 'RUNS',
      'hits': 'HITS',
      'errors': 'ERRORS',
      'leftOnBase': 'LOB',
      'battingAvg': 'AVG',
      'atBats': 'AB',
      'rbi': 'RBI',
      'homeRuns': 'HR',
      'strikeouts': 'K',
      'walks': 'BB',
    };

    const NHL_STAT_MAP: Record<string, string> = {
      'goals': 'GOALS',
      'shots': 'SHOTS',
      'powerPlay': 'PP',
      'penaltyMinutes': 'PIM',
      'hits': 'HITS',
      'blockedShots': 'BLOCKED',
      'faceoffWinPercentage': 'FO%',
      'giveaways': 'GIVE',
      'takeaways': 'TAKE',
      'saves': 'SV',
      'savePercentage': 'SV%',
    };

    const maps: Record<string, Record<string, string>> = {
      'NBA': NBA_STAT_MAP,
      'NCAAB': NBA_STAT_MAP,
      'NFL': NFL_STAT_MAP,
      'NCAAF': NFL_STAT_MAP,
      'MLB': MLB_STAT_MAP,
      'NHL': NHL_STAT_MAP,
    };

    return maps[sport]?.[espnName] || espnName;
  }

  /**
   * Get complete box score data for a game
   * @param gameId - ESPN game ID
   * @param sport - Sport league
   * @returns BoxScore object with team and player statistics
   */
  static async getBoxScore(
    gameId: string,
    sport: Sport
  ): Promise<any> {
    try {
      console.log(`[SportsAPI.getBoxScore] Fetching box score for game ${gameId} (${sport})`);
      const gameSummary = await this.getGameSummary(gameId, sport);

      if (!gameSummary) {
        console.warn(`[SportsAPI.getBoxScore] No game summary returned for ${gameId}`);
        return null;
      }

      console.log(`[SportsAPI.getBoxScore] Game summary received:`, {
        hasBoxscore: !!gameSummary.boxscore,
        hasHeader: !!gameSummary.header,
        hasPlays: !!gameSummary.plays,
        boxscoreTeamsCount: gameSummary.boxscore?.teams?.length || 0,
      });

      // Parse box score based on sport
      switch (sport) {
        case 'NBA':
          return this.parseNBABoxScore(gameSummary, gameId);
        case 'NCAAB':
          return this.parseNCAABBoxScore(gameSummary, gameId);
        case 'NFL':
          return this.parseNFLBoxScore(gameSummary, gameId);
        case 'NCAAF':
          return this.parseNCAAFBoxScore(gameSummary, gameId);
        case 'MLB':
          return this.parseMLBBoxScore(gameSummary, gameId);
        case 'NHL':
          return this.parseNHLBoxScore(gameSummary, gameId);
        default:
          return null;
      }
    } catch (error) {
      console.error(`[SportsAPI.getBoxScore] Error fetching box score for game ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Parse NBA box score from ESPN game summary
   */
  private static parseNBABoxScore(gameSummary: any, gameId: string): any {
    return this.parseBasketballBoxScore(gameSummary, gameId, 'NBA');
  }

  /**
   * Parse college basketball box score
   */
  private static parseNCAABBoxScore(gameSummary: any, gameId: string): any {
    return this.parseBasketballBoxScore(gameSummary, gameId, 'NCAAB');
  }

  private static parseBasketballBoxScore(
    gameSummary: any,
    gameId: string,
    sport: 'NBA' | 'NCAAB'
  ): any {
    try {
      console.log(`[parse${sport}BoxScore] Starting parse for game ${gameId}`);
      const boxscore = gameSummary.boxscore;

      if (!boxscore) {
        console.warn(`[parse${sport}BoxScore] No boxscore found in game summary`);
        return null;
      }

      if (!boxscore.teams) {
        console.warn(`[parse${sport}BoxScore] No teams found in boxscore`);
        return null;
      }

      const teams = boxscore.teams;
      const homeTeam = teams.find((t: any) => t.homeAway === 'home');
      const awayTeam = teams.find((t: any) => t.homeAway === 'away');

      if (!homeTeam || !awayTeam) {
        return null;
      }

      const playerSections = boxscore.players || [];
      const homePlayerSource =
        playerSections.find((p: any) => p.team?.id === homeTeam.team?.id) || homeTeam;
      const awayPlayerSource =
        playerSections.find((p: any) => p.team?.id === awayTeam.team?.id) || awayTeam;

      return {
        gameId,
        sport,
        lastUpdated: Date.now(),
        teamStats: {
          home: this.parseBasketballTeamStats(homeTeam, sport),
          away: this.parseBasketballTeamStats(awayTeam, sport),
        },
        playerStats: {
          home: this.parseBasketballPlayerStats(homePlayerSource, sport),
          away: this.parseBasketballPlayerStats(awayPlayerSource, sport),
        },
        scoringPlays: this.parseScoringPlays(gameSummary.plays),
      };
    } catch (error) {
      console.error(`Error parsing ${sport} box score:`, error);
      return null;
    }
  }

  private static parseBasketballTeamStats(team: any, sport: 'NBA' | 'NCAAB'): any {
    const stats = team.statistics || [];
    const statsMap: Record<string, string | number> = {};

    stats.forEach((stat: any) => {
      // Map ESPN stat name to app key
      const key = this.mapESPNStatKey(stat.name, sport);
      statsMap[key] = stat.displayValue || stat.value || '0';
    });

    return {
      teamId: team.team?.id || '',
      teamName: team.team?.abbreviation || team.team?.displayName || '',
      teamLogo: this.getTeamLogoUrl(team.team?.id || '', sport, team.team?.logo),
      stats: statsMap,
    };
  }

  private static parseBasketballPlayerStats(team: any, sport: 'NBA' | 'NCAAB'): any[] {
    const players: any[] = [];
    const statistics = team.statistics || [];

    statistics.forEach((statGroup: any) => {
      if (statGroup.athletes) {
        statGroup.athletes.forEach((athlete: any) => {
          const playerStats: Record<string, string | number> = {};

          if (athlete.stats && statGroup.labels) {
            athlete.stats.forEach((stat: string, index: number) => {
              const label = statGroup.labels[index];

              // Store raw stat value
              playerStats[label] = stat;

              // Calculate percentages from made-attempted format (e.g., "9-18")
              if (label === 'FG' && stat.includes('-')) {
                const [made, attempted] = stat.split('-').map(s => parseFloat(s) || 0);
                if (attempted > 0) {
                  playerStats['FG%'] = ((made / attempted) * 100).toFixed(1);
                }
              }

              if (label === '3PT' && stat.includes('-')) {
                const [made, attempted] = stat.split('-').map(s => parseFloat(s) || 0);
                if (attempted > 0) {
                  playerStats['3P%'] = ((made / attempted) * 100).toFixed(1);
                }
              }

              if (label === 'FT' && stat.includes('-')) {
                const [made, attempted] = stat.split('-').map(s => parseFloat(s) || 0);
                if (attempted > 0) {
                  playerStats['FT%'] = ((made / attempted) * 100).toFixed(1);
                }
              }
            });
          }

          players.push({
            playerId: athlete.athlete?.id || '',
            name: athlete.athlete?.displayName || '',
            headshot: athlete.athlete?.headshot?.href || '',
            position: athlete.athlete?.position?.abbreviation || '',
            jerseyNumber: athlete.athlete?.jersey || '',
            starter: athlete.starter || false,
            stats: playerStats,
          });
        });
      }
    });

    return players;
  }

  /**
   * Parse NFL box score from ESPN game summary
   */
  private static parseNFLBoxScore(gameSummary: any, gameId: string): any {
    return this.parseFootballBoxScore(gameSummary, gameId, 'NFL');
  }

  /**
   * Parse college football box score
   */
  private static parseNCAAFBoxScore(gameSummary: any, gameId: string): any {
    return this.parseFootballBoxScore(gameSummary, gameId, 'NCAAF');
  }

  private static parseFootballBoxScore(
    gameSummary: any,
    gameId: string,
    sport: 'NFL' | 'NCAAF'
  ): any {
    try {
      const boxscore = gameSummary.boxscore;
      if (!boxscore || !boxscore.teams) {
        return null;
      }

      const teams = boxscore.teams;
      const homeTeam = teams.find((t: any) => t.homeAway === 'home');
      const awayTeam = teams.find((t: any) => t.homeAway === 'away');

      if (!homeTeam || !awayTeam) {
        return null;
      }

      const playerSections = boxscore.players || [];
      const homePlayerSource =
        playerSections.find((p: any) => p.team?.id === homeTeam.team?.id) || homeTeam;
      const awayPlayerSource =
        playerSections.find((p: any) => p.team?.id === awayTeam.team?.id) || awayTeam;

      return {
        gameId,
        sport,
        lastUpdated: Date.now(),
        teamStats: {
          home: this.parseFootballTeamStats(homeTeam, sport),
          away: this.parseFootballTeamStats(awayTeam, sport),
        },
        playerStats: {
          home: this.parseFootballPlayerStats(homePlayerSource),
          away: this.parseFootballPlayerStats(awayPlayerSource),
        },
        scoringPlays: this.parseScoringPlays(gameSummary.plays),
      };
    } catch (error) {
      console.error(`Error parsing ${sport} box score:`, error);
      return null;
    }
  }

  private static parseFootballTeamStats(team: any, sport: 'NFL' | 'NCAAF'): any {
    const stats = team.statistics || [];
    const statsMap: Record<string, string | number> = {};

    stats.forEach((stat: any) => {
      // Map ESPN stat name to app key
      const key = this.mapESPNStatKey(stat.name, sport);
      statsMap[key] = stat.displayValue || stat.value || '0';
    });

    return {
      teamId: team.team?.id || '',
      teamName: team.team?.abbreviation || team.team?.displayName || '',
      teamLogo: this.getTeamLogoUrl(team.team?.id || '', sport, team.team?.logo),
      stats: statsMap,
    };
  }

  private static parseFootballPlayerStats(team: any): any[] {
    const players: any[] = [];
    const statistics = team.statistics || [];

    statistics.forEach((statGroup: any) => {
      if (statGroup.athletes) {
        statGroup.athletes.forEach((athlete: any) => {
          const playerStats: Record<string, string | number> = {};

          if (athlete.stats && statGroup.labels) {
            athlete.stats.forEach((stat: string, index: number) => {
              const label = statGroup.labels[index];
              playerStats[label] = stat;

              // Calculate completion percentage for passing (e.g., "15-25")
              if (label === 'C/ATT' && stat.includes('-')) {
                const [comp, att] = stat.split('-').map(s => parseFloat(s) || 0);
                if (att > 0) {
                  playerStats['COMP%'] = ((comp / att) * 100).toFixed(1);
                }
              }
            });
          }

          players.push({
            playerId: athlete.athlete?.id || '',
            name: athlete.athlete?.displayName || '',
            headshot: athlete.athlete?.headshot?.href || '',
            position: athlete.athlete?.position?.abbreviation || '',
            jerseyNumber: athlete.athlete?.jersey || '',
            starter: athlete.starter || false,
            stats: playerStats,
          });
        });
      }
    });

    return players;
  }

  /**
   * Parse MLB box score from ESPN game summary
   */
  private static parseMLBBoxScore(gameSummary: any, gameId: string): any {
    try {
      const boxscore = gameSummary.boxscore;
      if (!boxscore || !boxscore.teams) {
        return null;
      }

      const teams = boxscore.teams;
      const homeTeam = teams.find((t: any) => t.homeAway === 'home');
      const awayTeam = teams.find((t: any) => t.homeAway === 'away');

      if (!homeTeam || !awayTeam) {
        return null;
      }

      return {
        gameId,
        sport: 'MLB',
        lastUpdated: Date.now(),
        teamStats: {
          home: this.parseMLBTeamStats(homeTeam, 'MLB'),
          away: this.parseMLBTeamStats(awayTeam, 'MLB'),
        },
        playerStats: {
          home: this.parseMLBPlayerStats(homeTeam),
          away: this.parseMLBPlayerStats(awayTeam),
        },
        scoringPlays: this.parseScoringPlays(gameSummary.plays),
      };
    } catch (error) {
      console.error('Error parsing MLB box score:', error);
      return null;
    }
  }

  private static parseMLBTeamStats(team: any, sport: 'NBA' | 'NFL' | 'MLB' | 'NHL'): any {
    const stats = team.statistics || [];
    const statsMap: Record<string, string | number> = {};

    stats.forEach((stat: any) => {
      // Map ESPN stat name to app key
      const key = this.mapESPNStatKey(stat.name, sport);
      statsMap[key] = stat.displayValue || stat.value || '0';
    });

    return {
      teamId: team.team?.id || '',
      teamName: team.team?.abbreviation || team.team?.displayName || '',
      teamLogo: this.getTeamLogoUrl(team.team?.id || '', sport, team.team?.logo),
      stats: statsMap,
    };
  }

  private static parseMLBPlayerStats(team: any): any[] {
    const players: any[] = [];
    const statistics = team.statistics || [];

    statistics.forEach((statGroup: any) => {
      if (statGroup.athletes) {
        statGroup.athletes.forEach((athlete: any) => {
          const playerStats: Record<string, string | number> = {};

          if (athlete.stats && statGroup.labels) {
            athlete.stats.forEach((stat: string, index: number) => {
              const label = statGroup.labels[index];
              playerStats[label] = stat;
            });
          }

          players.push({
            playerId: athlete.athlete?.id || '',
            name: athlete.athlete?.displayName || '',
            headshot: athlete.athlete?.headshot?.href || '',
            position: athlete.athlete?.position?.abbreviation || '',
            jerseyNumber: athlete.athlete?.jersey || '',
            starter: athlete.starter || false,
            stats: playerStats,
          });
        });
      }
    });

    return players;
  }

  /**
   * Parse NHL box score from ESPN game summary
   */
  private static parseNHLBoxScore(gameSummary: any, gameId: string): any {
    try {
      console.log(`[parseNHLBoxScore] Starting parse for game ${gameId}`);
      const boxscore = gameSummary.boxscore;

      if (!boxscore) {
        console.warn(`[parseNHLBoxScore] No boxscore found in game summary`);
        return null;
      }

      if (!boxscore.teams) {
        console.warn(`[parseNHLBoxScore] No teams found in boxscore`);
        return null;
      }

      console.log(`[parseNHLBoxScore] Found ${boxscore.teams.length} teams`);
      const teams = boxscore.teams;
      const homeTeam = teams.find((t: any) => t.homeAway === 'home');
      const awayTeam = teams.find((t: any) => t.homeAway === 'away');

      if (!homeTeam || !awayTeam) {
        console.warn(`[parseNHLBoxScore] Missing home or away team`, {
          hasHome: !!homeTeam,
          hasAway: !!awayTeam,
        });
        return null;
      }

      console.log(`[parseNHLBoxScore] Successfully parsed NHL box score for game ${gameId}`);
      return {
        gameId,
        sport: 'NHL',
        lastUpdated: Date.now(),
        teamStats: {
          home: this.parseNHLTeamStats(homeTeam, 'NHL'),
          away: this.parseNHLTeamStats(awayTeam, 'NHL'),
        },
        playerStats: {
          home: this.parseNHLPlayerStats(homeTeam),
          away: this.parseNHLPlayerStats(awayTeam),
        },
        scoringPlays: this.parseScoringPlays(gameSummary.plays),
      };
    } catch (error) {
      console.error('[parseNHLBoxScore] Error parsing NHL box score:', error);
      return null;
    }
  }

  private static parseNHLTeamStats(team: any, sport: 'NBA' | 'NFL' | 'MLB' | 'NHL'): any {
    const stats = team.statistics || [];
    const statsMap: Record<string, string | number> = {};

    stats.forEach((stat: any) => {
      // Map ESPN stat name to app key
      const key = this.mapESPNStatKey(stat.name, sport);
      statsMap[key] = stat.displayValue || stat.value || '0';
    });

    return {
      teamId: team.team?.id || '',
      teamName: team.team?.abbreviation || team.team?.displayName || '',
      teamLogo: this.getTeamLogoUrl(team.team?.id || '', sport, team.team?.logo),
      stats: statsMap,
    };
  }

  private static parseNHLPlayerStats(team: any): any[] {
    const players: any[] = [];
    const statistics = team.statistics || [];

    statistics.forEach((statGroup: any) => {
      if (statGroup.athletes) {
        statGroup.athletes.forEach((athlete: any) => {
          const playerStats: Record<string, string | number> = {};

          if (athlete.stats && statGroup.labels) {
            athlete.stats.forEach((stat: string, index: number) => {
              const label = statGroup.labels[index];
              playerStats[label] = stat;
            });
          }

          players.push({
            playerId: athlete.athlete?.id || '',
            name: athlete.athlete?.displayName || '',
            headshot: athlete.athlete?.headshot?.href || '',
            position: athlete.athlete?.position?.abbreviation || '',
            jerseyNumber: athlete.athlete?.jersey || '',
            starter: athlete.starter || false,
            stats: playerStats,
          });
        });
      }
    });

    return players;
  }

  /**
   * Parse scoring plays from game summary
   */
  private static parseScoringPlays(plays: any): any[] {
    if (!plays || !Array.isArray(plays)) {
      return [];
    }

    return plays
      .filter((play: any) => play.scoringPlay)
      .map((play: any) => ({
        period: play.period?.displayValue || '',
        time: play.clock?.displayValue || '',
        team: play.homeAway || 'home',
        description: play.text || '',
        score: {
          home: play.homeScore || 0,
          away: play.awayScore || 0,
        },
      }));
  }
}

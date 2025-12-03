import { Sport } from '../types/game';
import { BettingTrend, PlayerTrend, TeamTrend, TrendsData } from '../types/trends';
import { SportsAPI } from './sportsApi';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const ESPN_WEB_BASE = 'https://site.web.api.espn.com/apis/site/v2/sports';

class TrendsAPI {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data if available and not expired
   */
  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cache data
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Fetch with timeout and error handling
   */
  private async fetchWithTimeout(url: string, timeout = 10000): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Get sport path for ESPN API
   */
  private getSportPath(sport: Sport): string {
    const sportPaths: Record<Sport, string> = {
      NBA: 'basketball/nba',
      NFL: 'football/nfl',
      MLB: 'baseball/mlb',
      NHL: 'hockey/nhl',
      NCAAF: 'football/college-football',
      NCAAB: 'basketball/mens-college-basketball',
    };
    return sportPaths[sport];
  }

  /**
   * Get ESPN news for a sport
   */
  async getNews(sport: Sport, limit = 20): Promise<any[]> {
    const cacheKey = `news_${sport}_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const sportPath = this.getSportPath(sport);
      const url = `${ESPN_BASE}/${sportPath}/news?limit=${limit}`;
      const data = await this.fetchWithTimeout(url);

      const articles = data.articles || [];
      this.setCache(cacheKey, articles);
      return articles;
    } catch (error) {
      console.error(`Error fetching ${sport} news:`, error);
      return [];
    }
  }

  /**
   * Get all teams for a sport
   */
  async getTeamsBySport(sport: Sport): Promise<any[]> {
    const cacheKey = `teams_${sport}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const sportPath = this.getSportPath(sport);
      const url = `${ESPN_BASE}/${sportPath}/teams`;
      const data = await this.fetchWithTimeout(url);

      const teams = data.sports?.[0]?.leagues?.[0]?.teams || [];
      // Extract team objects from the structure
      const teamList = teams.map((t: any) => t.team).filter((t: any) => t && t.id);

      this.setCache(cacheKey, teamList);
      console.log(`Fetched ${teamList.length} teams for ${sport}`);
      return teamList;
    } catch (error) {
      console.error(`Error fetching teams for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get team injuries for a specific sport and team
   */
  async getTeamInjuries(sport: Sport, teamId: string): Promise<any[]> {
    const cacheKey = `injuries_${sport}_${teamId}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const sportPath = this.getSportPath(sport);
      const url = `${ESPN_WEB_BASE}/${sportPath}/teams/${teamId}/injuries`;
      const data = await this.fetchWithTimeout(url);

      const injuries = data.injuries || [];
      this.setCache(cacheKey, injuries);
      return injuries;
    } catch (error) {
      console.error(`Error fetching injuries for team ${teamId}:`, error);
      return [];
    }
  }

  /**
   * Get injuries from all teams for comprehensive coverage
   */
  async getAllTeamInjuries(sport: Sport): Promise<any[]> {
    try {
      console.log(`Fetching comprehensive team injuries for ${sport}...`);

      // Get all teams for the sport
      const teams = await this.getTeamsBySport(sport);

      if (teams.length === 0) {
        console.log(`No teams found for ${sport}`);
        return [];
      }

      // Fetch injuries for all teams in parallel (with limit to avoid overwhelming)
      const batchSize = 5; // Process 5 teams at a time
      const allInjuries: any[] = [];

      for (let i = 0; i < teams.length; i += batchSize) {
        const batch = teams.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(team => this.getTeamInjuries(sport, team.id))
        );

        // Flatten and add to results
        batchResults.forEach(injuries => {
          if (injuries.length > 0) {
            allInjuries.push(...injuries);
          }
        });

        // Small delay between batches to be respectful to ESPN's servers
        if (i + batchSize < teams.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Fetched ${allInjuries.length} total injuries from all ${teams.length} ${sport} teams`);
      return allInjuries;
    } catch (error) {
      console.error(`Error fetching all team injuries for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get injuries from ESPN's dedicated injuries endpoint (more detailed)
   * Note: The endpoint returns a nested structure where each top-level item
   * represents a TEAM with an array of injuries for that team
   */
  async getInjuriesFromEndpoint(sport: Sport): Promise<any[]> {
    try {
      const sportPath = this.getSportPath(sport);
      const url = `${ESPN_BASE}/${sportPath}/injuries`;
      console.log(`Fetching injuries from ESPN endpoint: ${url}`);
      const data = await this.fetchWithTimeout(url);

      if (data && data.injuries && Array.isArray(data.injuries)) {
        // Flatten the nested structure: each item is a team with an injuries array
        const allInjuries: any[] = [];
        let teamsProcessed = 0;
        let injuriesWithAthlete = 0;

        data.injuries.forEach((teamData: any) => {
          if (teamData.injuries && Array.isArray(teamData.injuries)) {
            teamsProcessed++;
            teamData.injuries.forEach((injury: any) => {
              // Check if athlete data exists
              if (injury.athlete) {
                injuriesWithAthlete++;
                // Log the FULL athlete structure for the first injury to debug
                if (allInjuries.length === 0) {
                  console.log(`🔍 Full first injury structure:`, JSON.stringify({
                    injuryId: injury.id,
                    athlete: injury.athlete,
                    athleteKeys: Object.keys(injury.athlete || {}),
                    status: injury.status
                  }, null, 2));
                }
              } else if (allInjuries.length < 3) {
                console.log(`⚠️ Injury missing athlete data:`, JSON.stringify(injury, null, 2).substring(0, 300));
              }

              allInjuries.push({
                ...injury,
                // Preserve team info from the parent if not already in injury
                team: injury.athlete?.team || {
                  displayName: teamData.displayName,
                  id: teamData.id
                }
              });
            });
          }
        });

        console.log(`ESPN injuries endpoint returned ${data.injuries.length} teams with ${allInjuries.length} total injuries for ${sport}`);
        console.log(`Processed ${teamsProcessed} teams, ${injuriesWithAthlete} injuries have athlete data`);

        if (allInjuries.length > 0 && allInjuries[0].athlete) {
          console.log(`First injury athlete.id:`, allInjuries[0].athlete?.id);
        }

        return allInjuries;
      }

      console.log(`ESPN injuries endpoint returned no injuries for ${sport}`);
      return [];
    } catch (error) {
      console.error(`Error fetching from ESPN injuries endpoint for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get all injuries from scoreboard for a sport (fallback method)
   */
  async getInjuriesFromScoreboard(sport: Sport): Promise<any[]> {
    try {
      const { games: scoreboard } = await SportsAPI.getScoreboardByDate(sport);
      const allInjuries: any[] = [];

      scoreboard.forEach((game: any) => {
        if (game.competitions?.[0]?.competitors) {
          game.competitions[0].competitors.forEach((competitor: any) => {
            if (competitor.injuries && competitor.injuries.length > 0) {
              competitor.injuries.forEach((injury: any) => {
                allInjuries.push({
                  ...injury,
                  team: competitor.team,
                  gameId: game.id,
                  gameDate: game.date,
                  opponent: game.competitions[0].competitors.find(
                    (c: any) => c.id !== competitor.id
                  )?.team,
                });
              });
            }
          });
        }
      });

      return allInjuries;
    } catch (error) {
      console.error(`Error fetching injuries from scoreboard for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get all injuries for a sport (comprehensive - combines multiple sources)
   */
  async getAllInjuries(sport: Sport): Promise<any[]> {
    const cacheKey = `all_injuries_${sport}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(`Serving ${cached.length} injuries from cache for ${sport}`);
      return cached;
    }

    try {
      console.log(`Fetching comprehensive injury data for ${sport}...`);
      const allInjuries: any[] = [];
      const injuryMap = new Map<string, any>(); // Use map to deduplicate by player ID

      // 1. Try ESPN's dedicated injuries endpoint (most detailed)
      const endpointInjuries = await this.getInjuriesFromEndpoint(sport);
      console.log(`Processing ${endpointInjuries.length} endpoint injuries for ${sport}`);

      let skippedCount = 0;
      endpointInjuries.forEach((injury, index) => {
        // Try multiple ways to get a unique player ID
        let playerId = injury.athlete?.id ||
                       injury.athlete?.guid ||
                       injury.athlete?.uid;

        // If still no ID, create one from player name (as fallback)
        if (!playerId && injury.athlete?.displayName) {
          playerId = `synthetic_${injury.athlete.displayName.replace(/\s+/g, '_').toLowerCase()}`;
          if (index < 3) {
            console.log(`Created synthetic ID for ${injury.athlete.displayName}: ${playerId}`);
          }
        }

        if (!playerId) {
          if (index < 3) {
            console.log(`Injury ${index} has NO identifiable player:`, JSON.stringify(injury, null, 2).substring(0, 200));
          }
          skippedCount++;
        } else if (!injuryMap.has(playerId)) {
          injuryMap.set(playerId, { ...injury, source: 'espn_endpoint' });
        }
      });

      if (skippedCount > 0) {
        console.log(`⚠️ Skipped ${skippedCount} injuries without any player identification`);
      }
      console.log(`Added ${injuryMap.size} injuries to map from endpoint`);

      // 2. Get scoreboard injuries (real-time, today's games)
      const scoreboardInjuries = await this.getInjuriesFromScoreboard(sport);
      scoreboardInjuries.forEach(injury => {
        const playerId = injury.athlete?.id;
        if (playerId && !injuryMap.has(playerId)) {
          injuryMap.set(playerId, { ...injury, source: 'scoreboard' });
        }
      });

      // 3. Get team-specific injuries (comprehensive, all teams)
      const teamInjuries = await this.getAllTeamInjuries(sport);
      teamInjuries.forEach(injury => {
        const playerId = injury.athlete?.id;
        if (playerId && !injuryMap.has(playerId)) {
          injuryMap.set(playerId, { ...injury, source: 'team_roster' });
        }
      });

      // Convert map back to array
      const mergedInjuries = Array.from(injuryMap.values());

      console.log(`Comprehensive ${sport} injuries: ${endpointInjuries.length} from endpoint, ${scoreboardInjuries.length} from scoreboard, ${teamInjuries.length} from teams = ${mergedInjuries.length} unique injuries`);

      this.setCache(cacheKey, mergedInjuries);
      return mergedInjuries;
    } catch (error) {
      console.error(`Error fetching all injuries for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get team standings for a sport
   */
  async getStandings(sport: Sport): Promise<any> {
    const cacheKey = `standings_${sport}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const sportPath = this.getSportPath(sport);
      const url = `${ESPN_BASE}/${sportPath}/standings`;
      const data = await this.fetchWithTimeout(url);

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${sport} standings:`, error);
      return null;
    }
  }

  /**
   * Get betting trends from scoreboard data
   */
  async getBettingTrends(sport: Sport): Promise<BettingTrend[]> {
    try {
      const { games: scoreboard } = await SportsAPI.getScoreboardByDate(sport);
      const trends: BettingTrend[] = [];

      scoreboard.forEach((game: any, index: number) => {
        const competition = game.competitions?.[0];
        if (!competition) return;

        const homeTeam = competition.competitors?.find((c: any) => c.homeAway === 'home');
        const awayTeam = competition.competitors?.find((c: any) => c.homeAway === 'away');

        if (!homeTeam || !awayTeam) return;

        const odds = competition.odds?.[0];
        if (odds) {
          const spread = parseFloat(odds.details?.split(' ')[1] || '0');
          const total = odds.overUnder || 0;

          // Detect line movement (deterministic mock - would need historical odds data for real implementation)
          const gameIdHash = parseInt(game.id.replace(/\D/g, ''), 10) || 54321;

          // Deterministic spread movement: -1 to +1 based on game ID
          const spreadMovement = (gameIdHash % 2) === 0
            ? ((gameIdHash % 20) - 10) / 10  // Range: -1 to +1
            : 0;

          // Deterministic total movement: -1.5 to +1.5 based on game ID
          const totalMovement = (gameIdHash % 3) === 0
            ? ((gameIdHash % 30) - 15) / 10  // Range: -1.5 to +1.5
            : 0;

          const reverseLine = spreadMovement > 0.5 && (gameIdHash % 10) > 7;
          const steamMove = Math.abs(spreadMovement) > 1 || Math.abs(totalMovement) > 2;

          let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (steamMove) severity = 'critical';
          else if (reverseLine) severity = 'high';
          else if (Math.abs(spreadMovement) > 0.5) severity = 'medium';

          trends.push({
            id: `betting_${game.id}`,
            sport,
            category: 'betting',
            severity,
            title: `${awayTeam.team.displayName} @ ${homeTeam.team.displayName}`,
            description: reverseLine
              ? 'Reverse line movement detected'
              : steamMove
              ? 'Sharp action detected'
              : 'Line movement observed',
            timestamp: new Date(),
            isLive: game.status?.type?.state === 'in',
            gameId: game.id,
            homeTeam: homeTeam.team.displayName,
            awayTeam: awayTeam.team.displayName,
            homeTeamLogo: homeTeam.team.logo,
            awayTeamLogo: awayTeam.team.logo,
            currentSpread: spread,
            spreadMovement,
            currentTotal: total,
            totalMovement,
            moneylineHome: homeTeam.team.odds?.moneyLine || 0,
            moneylineAway: awayTeam.team.odds?.moneyLine || 0,
            reverseLine,
            steamMove,
            sharpAction: spreadMovement > 0.3 ? 'home' : spreadMovement < -0.3 ? 'away' : 'none',
          });
        }
      });

      return trends.filter((t) => t.severity !== 'low' || t.steamMove || t.reverseLine);
    } catch (error) {
      console.error(`Error getting betting trends for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for specific sport
   */
  clearSportCache(sport: Sport): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(sport)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

export default new TrendsAPI();

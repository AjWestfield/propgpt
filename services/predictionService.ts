import { Sport } from '../types/game';
import { Prediction } from '../types/trends';
import { SportsAPI } from './sportsApi';

class PredictionService {
  // In-memory cache for predictions
  private cache: Map<string, { prediction: Prediction; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  /**
   * Calculate ELO-based win probability
   * Simple ELO model based on team performance
   */
  private calculateELOProbability(
    teamARecord: { wins: number; losses: number },
    teamBRecord: { wins: number; losses: number },
    homeAdvantage = 3
  ): number {
    // Calculate win percentages
    const teamAWinPct =
      teamARecord.wins / (teamARecord.wins + teamARecord.losses) || 0.5;
    const teamBWinPct =
      teamBRecord.wins / (teamBRecord.wins + teamBRecord.losses) || 0.5;

    // Simple ELO rating (1500 base + win% bonus)
    const teamARating = 1500 + (teamAWinPct - 0.5) * 400 + homeAdvantage;
    const teamBRating = 1500 + (teamBWinPct - 0.5) * 400;

    // Calculate expected win probability
    const expectedA =
      1 / (1 + Math.pow(10, (teamBRating - teamARating) / 400));

    return Math.round(expectedA * 100);
  }

  /**
   * Parse team record from ESPN data
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
   * Get ESPN predictor data (if available)
   */
  private async getESPNPredictor(gameId: string, competitionId: string, sport: Sport): Promise<any> {
    try {
      const sportPath = this.getSportPath(sport);
      const url = `https://sports.core.api.espn.com/v2/sports/${sportPath}/events/${gameId}/competitions/${competitionId}/predictor`;

      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('ESPN predictor not available for this game');
    }
    return null;
  }

  /**
   * Get sport path for ESPN API
   */
  private getSportPath(sport: Sport): string {
    const sportPaths: Record<Sport, string> = {
      NBA: 'basketball/leagues/nba',
      NFL: 'football/leagues/nfl',
      MLB: 'baseball/leagues/mlb',
      NHL: 'hockey/leagues/nhl',
    };
    return sportPaths[sport];
  }

  /**
   * Calculate confidence score based on various factors
   */
  private calculateConfidence(
    winProbability: number,
    recordDifferential: number,
    hasInjuries: boolean
  ): number {
    let confidence = 50; // Base confidence

    // Higher confidence if win probability is more extreme
    const extremeness = Math.abs(winProbability - 50);
    confidence += extremeness * 0.5;

    // Adjust for record differential
    confidence += Math.min(recordDifferential * 5, 20);

    // Reduce confidence if key injuries
    if (hasInjuries) {
      confidence -= 15;
    }

    return Math.round(Math.max(0, Math.min(100, confidence)));
  }

  /**
   * Generate predictions for a single game
   */
  async getPredictionForGame(game: any, sport: Sport): Promise<Prediction | null> {
    try {
      // Check cache first
      const cacheKey = `${game.id}_${sport}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        // Return cached prediction if still fresh
        return cached.prediction;
      }

      const competition = game.competitions?.[0];
      if (!competition) return null;

      const homeTeam = competition.competitors?.find((c: any) => c.homeAway === 'home');
      const awayTeam = competition.competitors?.find((c: any) => c.homeAway === 'away');

      if (!homeTeam || !awayTeam) return null;

      const predictions: Prediction['predictions'] = [];

      // Parse records
      const homeRecord = this.parseRecord(homeTeam.records?.[0]?.summary || '0-0');
      const awayRecord = this.parseRecord(awayTeam.records?.[0]?.summary || '0-0');

      // Try to get ESPN predictor data
      const espnPredictor = await this.getESPNPredictor(
        game.id,
        competition.id,
        sport
      );

      if (espnPredictor) {
        const homeProb = parseFloat(espnPredictor.homeTeam?.gameProjection || '50');
        predictions.push({
          source: 'ESPN',
          homeWinProbability: Math.round(homeProb),
          awayWinProbability: Math.round(100 - homeProb),
          confidence: 75,
          predictedHomeScore: espnPredictor.homeTeam?.averageScorePrediction,
          predictedAwayScore: espnPredictor.awayTeam?.averageScorePrediction,
          reasoning: ['ESPN FPI Model', 'Historical performance analysis'],
        });
      }

      // Calculate ELO-based prediction
      const eloHomeProb = this.calculateELOProbability(homeRecord, awayRecord);
      const recordDiff =
        (homeRecord.wins - homeRecord.losses) - (awayRecord.wins - awayRecord.losses);

      predictions.push({
        source: 'PropGPT Model',
        homeWinProbability: eloHomeProb,
        awayWinProbability: 100 - eloHomeProb,
        confidence: this.calculateConfidence(
          eloHomeProb,
          Math.abs(recordDiff),
          false // TODO: Check for injuries
        ),
        reasoning: [
          `Home record: ${homeRecord.wins}-${homeRecord.losses}`,
          `Away record: ${awayRecord.wins}-${awayRecord.losses}`,
          'ELO rating calculation',
          'Home court advantage applied',
        ],
      });

      // Calculate consensus
      const avgHomeProb =
        predictions.reduce((sum, p) => sum + p.homeWinProbability, 0) /
        predictions.length;
      const avgConfidence =
        predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

      const consensus = {
        favoredTeam: avgHomeProb >= 50 ? ('home' as const) : ('away' as const),
        winProbability: Math.round(
          avgHomeProb >= 50 ? avgHomeProb : 100 - avgHomeProb
        ),
        confidence: Math.round(avgConfidence),
      };

      // Get current odds
      const odds = competition.odds?.[0];
      let currentOdds;
      if (odds) {
        currentOdds = {
          spread: parseFloat(odds.details?.split(' ')[1] || '0'),
          total: odds.overUnder || 0,
          moneylineHome: homeTeam.team.odds?.moneyLine || 0,
          moneylineAway: awayTeam.team.odds?.moneyLine || 0,
        };
      }

      // Generate key factors
      const keyFactors: string[] = [];

      if (Math.abs(recordDiff) >= 5) {
        keyFactors.push(
          `${recordDiff > 0 ? homeTeam.team.displayName : awayTeam.team.displayName} has ${Math.abs(recordDiff)} more wins`
        );
      }

      if (homeTeam.statistics) {
        keyFactors.push('Home team playing at home');
      }

      if (odds && Math.abs(currentOdds?.spread || 0) < 3) {
        keyFactors.push('Close matchup expected');
      }

      const prediction: Prediction = {
        id: `prediction_${game.id}`,
        sport,
        gameId: game.id,
        homeTeam: homeTeam.team.displayName,
        awayTeam: awayTeam.team.displayName,
        homeTeamLogo: homeTeam.team.logo,
        awayTeamLogo: awayTeam.team.logo,
        gameDate: new Date(game.date),
        predictions,
        consensus,
        currentOdds,
        keyFactors,
      };

      // Store in cache
      this.cache.set(cacheKey, {
        prediction,
        timestamp: Date.now(),
      });

      return prediction;
    } catch (error) {
      console.error('Error generating prediction:', error);
      return null;
    }
  }

  /**
   * Get predictions for all games in a sport
   */
  async getPredictions(sport: Sport): Promise<Prediction[]> {
    try {
      const { games: scoreboard } = await SportsAPI.getScoreboardByDate(sport);
      const predictions: Prediction[] = [];

      for (const game of scoreboard) {
        // Only predict future or live games
        const gameState = game.status?.type?.state;
        if (gameState === 'pre' || gameState === 'in') {
          const prediction = await this.getPredictionForGame(game, sport);
          if (prediction) {
            predictions.push(prediction);
          }
        }
      }

      // Sort by game date
      return predictions.sort((a, b) => a.gameDate.getTime() - b.gameDate.getTime());
    } catch (error) {
      console.error(`Error getting predictions for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get predictions for all sports
   */
  async getAllSportsPredictions(): Promise<Prediction[]> {
    const sports: Sport[] = ['NBA', 'NFL', 'MLB', 'NHL'];
    const allPredictions: Prediction[] = [];

    await Promise.all(
      sports.map(async (sport) => {
        const predictions = await this.getPredictions(sport);
        allPredictions.push(...predictions);
      })
    );

    // Sort by confidence (highest first) then by game date
    return allPredictions.sort((a, b) => {
      const confidenceDiff = b.consensus.confidence - a.consensus.confidence;
      if (confidenceDiff !== 0) return confidenceDiff;
      return a.gameDate.getTime() - b.gameDate.getTime();
    });
  }

  /**
   * Get high-confidence predictions only
   */
  async getHighConfidencePredictions(
    sport?: Sport,
    minConfidence = 65
  ): Promise<Prediction[]> {
    const predictions = sport
      ? await this.getPredictions(sport)
      : await this.getAllSportsPredictions();

    return predictions.filter((p) => p.consensus.confidence >= minConfidence);
  }
}

export default new PredictionService();

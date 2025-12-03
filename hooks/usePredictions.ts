import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sport } from '../types/game';
import { Prediction } from '../types/trends';
import PredictionService from '../services/predictionService';

interface UsePredictionsOptions {
  sport?: Sport | 'all';
  minConfidence?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Cache never expires automatically - user must manually refresh via pull-to-refresh
const CACHE_DURATION = Infinity;

export const usePredictions = (options: UsePredictionsOptions = {}) => {
  const {
    sport = 'all',
    minConfidence = 0,
    autoRefresh = false, // Changed default to false - no auto-refresh
    refreshInterval = 300000, // 5 minutes (but disabled by default)
  } = options;

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchPredictions = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Create cache key based on sport and minConfidence
      const cacheKey = `predictions_${sport}_${minConfidence}`;

      // On initial load (not force refresh), try to serve from cache immediately
      if (isInitialLoad && !forceRefresh) {
        try {
          const cachedData = await AsyncStorage.getItem(cacheKey);
          if (cachedData) {
            const { predictions: cachedPredictions, timestamp } = JSON.parse(cachedData);

            // Parse dates back to Date objects (they get stringified in AsyncStorage)
            const parsedPredictions = cachedPredictions.map((p: any) => ({
              ...p,
              gameDate: new Date(p.gameDate),
            }));

            console.log(`Serving predictions from cache (cached ${Math.floor((Date.now() - timestamp) / 60000)} minutes ago)`);
            setPredictions(parsedPredictions);
            setLoading(false);
            setIsInitialLoad(false);
            return; // Return early with cached data
          }
        } catch (cacheError) {
          // Silent fail on cache read - continue to fetch fresh data
          console.log('Cache read error, fetching fresh data:', cacheError);
        }
      }

      // First load with no cache OR manual refresh - fetch fresh data
      console.log(forceRefresh ? 'Manual refresh - fetching fresh data' : 'First load - fetching fresh data');
      let data: Prediction[];

      if (minConfidence > 0) {
        data = await PredictionService.getHighConfidencePredictions(
          sport === 'all' ? undefined : sport,
          minConfidence
        );
      } else if (sport === 'all') {
        data = await PredictionService.getAllSportsPredictions();
      } else {
        data = await PredictionService.getPredictions(sport);
      }

      setPredictions(data);
      setIsInitialLoad(false);

      // Save to AsyncStorage for future use
      try {
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            predictions: data,
            timestamp: Date.now(),
          })
        );
        console.log(`Cached ${data.length} predictions for ${sport}`);
      } catch (cacheError) {
        // Silent fail on cache write - data is still available in state
        console.log('Cache write error:', cacheError);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  }, [sport, minConfidence, isInitialLoad]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchPredictions, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchPredictions]);

  const refresh = useCallback(() => {
    // Clear cache on manual refresh
    return fetchPredictions(true);
  }, [fetchPredictions]);

  const getHighConfidence = useCallback(
    (threshold = 70) => {
      return predictions.filter((p) => p.consensus.confidence >= threshold);
    },
    [predictions]
  );

  const getPredictionsBySport = useCallback(
    (targetSport: Sport) => {
      return predictions.filter((p) => p.sport === targetSport);
    },
    [predictions]
  );

  const getTodaysPredictions = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return predictions.filter((p) => {
      const gameDate = new Date(p.gameDate);
      return gameDate >= today && gameDate < tomorrow;
    });
  }, [predictions]);

  return {
    predictions,
    loading,
    error,
    refresh,
    getHighConfidence,
    getPredictionsBySport,
    getTodaysPredictions,
    count: predictions.length,
  };
};

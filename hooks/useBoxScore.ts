// useBoxScore Hook - Real-time box score data with smart polling
import { useState, useEffect, useCallback, useRef } from 'react';
import { BoxScore } from '../types/boxScore';
import { Sport, GameStatus } from '../types/game';
import { BoxScoreAPI } from '../services/boxScoreApi';

interface UseBoxScoreOptions {
  gameId: string;
  sport: Sport;
  gameStatus?: GameStatus;
  enabled?: boolean;
}

interface UseBoxScoreReturn {
  boxScore: BoxScore | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: number | null;
}

/**
 * Smart polling intervals based on game status
 */
const POLLING_INTERVALS = {
  live: 5000,         // 5 seconds during live games
  pre_game: 60000,    // 1 minute for upcoming games
  final: 300000,      // 5 minutes for completed games
  default: 5000,      // 5 seconds default (for box score modal)
};

/**
 * Hook to fetch and auto-update box score data
 */
export function useBoxScore(options: UseBoxScoreOptions): UseBoxScoreReturn {
  const { gameId, sport, gameStatus, enabled = true } = options;

  const [boxScore, setBoxScore] = useState<BoxScore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  /**
   * Fetch box score data
   * @param isBackgroundRefresh - If true, don't show loading spinner
   */
  const fetchBoxScore = useCallback(async (isBackgroundRefresh = false) => {
    if (!enabled || !gameId || !sport) {
      return;
    }

    try {
      // Only clear error on manual refresh, not background refresh
      if (!isBackgroundRefresh) {
        setError(null);
      }

      const data = await BoxScoreAPI.getBoxScore(gameId, sport);

      if (!isMountedRef.current) return;

      if (data) {
        setBoxScore(data);
        setLastUpdated(Date.now());
        // Clear any previous errors on successful fetch
        if (error) {
          setError(null);
        }
      } else {
        // Only set error on initial load, not background refresh
        if (!isBackgroundRefresh) {
          setError('Failed to fetch box score data');
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      // Only set error on initial load, not background refresh
      if (!isBackgroundRefresh) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching box score:', err);
      }
    } finally {
      if (isMountedRef.current && !isBackgroundRefresh) {
        setLoading(false);
      }
    }
  }, [gameId, sport, enabled, error]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchBoxScore();
  }, [fetchBoxScore]);

  /**
   * Get polling interval based on game status
   */
  const getPollingInterval = useCallback((): number => {
    if (!gameStatus) return POLLING_INTERVALS.default;

    switch (gameStatus) {
      case 'in_progress':
        return POLLING_INTERVALS.live;
      case 'scheduled':
        return POLLING_INTERVALS.pre_game;
      case 'final':
      case 'postponed':
      case 'cancelled':
        return POLLING_INTERVALS.final;
      default:
        return POLLING_INTERVALS.default;
    }
  }, [gameStatus]);

  /**
   * Setup polling
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initial fetch (show loading)
    fetchBoxScore(false);

    // Setup polling based on game status
    const interval = getPollingInterval();

    intervalRef.current = setInterval(() => {
      // Background refresh (no loading spinner)
      fetchBoxScore(true);
    }, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, fetchBoxScore, getPollingInterval]);

  /**
   * Update polling interval when game status changes
   */
  useEffect(() => {
    if (!enabled || !intervalRef.current) {
      return;
    }

    // Clear existing interval
    clearInterval(intervalRef.current);

    // Setup new interval with updated game status
    const interval = getPollingInterval();
    intervalRef.current = setInterval(() => {
      // Background refresh (no loading spinner)
      fetchBoxScore(true);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameStatus, enabled, fetchBoxScore, getPollingInterval]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    boxScore,
    loading,
    error,
    refresh,
    lastUpdated,
  };
}

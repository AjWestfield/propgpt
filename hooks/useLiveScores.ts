import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SportsAPI, ESPNGame } from '../services/sportsApi';
import type { Game, Sport } from '../types/game';

interface UseLiveScoresOptions {
  refreshInterval?: number; // Milliseconds between refreshes (default: 30000)
  liveRefreshInterval?: number; // Interval for live games (default: 5000)
  autoRefresh?: boolean; // Enable auto-refresh (default: true)
  sports?: Sport[]; // Filter by specific sports (default: all)
}

interface UseLiveScoresReturn {
  games: Game[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  liveCount: number;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  hasLiveGames: boolean;
}

/**
 * Hook for managing live sports scores with auto-refresh
 * Automatically stops refreshing when no games are live
 * Pauses when app is in background
 */
export function useLiveScores(
  options: UseLiveScoresOptions = {}
): UseLiveScoresReturn {
  const {
    refreshInterval = 30000, // 30 seconds default
    liveRefreshInterval = 5000, // 5 seconds for live games
    autoRefresh = true,
    sports = ['NBA', 'NFL', 'MLB', 'NHL'],
  } = options;

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isMountedRef = useRef(true);

  // Parse ESPN games to Game format
  const parseGames = useCallback((espnGames: ESPNGame[], sport: Sport): Game[] => {
    return espnGames
      .map(game => SportsAPI.parseGameData(game, sport))
      .filter((game): game is Game => game !== null);
  }, []);

  // Fetch games from API
  interface FetchOptions {
    showLoading?: boolean;
    showRefreshing?: boolean;
  }

  const fetchGames = useCallback(async (options: FetchOptions = {}) => {
    const { showLoading = false, showRefreshing = false } = options;

    try {
      if (showLoading) {
        setLoading(true);
      }
      if (showRefreshing) {
        setRefreshing(true);
      }
      setError(null);

      // Fetch all sports in parallel
      const requests = sports.map(async (sport) => {
        const { games: espnGames } = await SportsAPI.getScoreboardByDate(sport);
        return parseGames(espnGames, sport);
      });

      const results = await Promise.all(requests);
      const allGames = results.flat();

      // Sort by: live games first, then by start time
      const sortedGames = allGames.sort((a, b) => {
        // Live games first
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;

        // Then by start time (earliest first)
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      if (isMountedRef.current) {
        setGames(sortedGames);
        setLiveCount(sortedGames.filter(g => g.isLive).length);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      console.error('Error fetching live scores:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load games');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        if (showRefreshing) {
          setRefreshing(false);
        }
      }
    }
  }, [sports, parseGames]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchGames({ showRefreshing: true });
  }, [fetchGames]);

  // Setup auto-refresh timer
  const setupRefreshTimer = useCallback(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // Only setup timer if auto-refresh is enabled and there are live games
    if (autoRefresh && liveCount > 0 && appStateRef.current === 'active') {
      refreshTimerRef.current = setInterval(() => {
        fetchGames();
      }, liveRefreshInterval);
    }
  }, [autoRefresh, liveCount, liveRefreshInterval, fetchGames]);

  // Handle app state changes (pause when backgrounded)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appStateRef.current = nextAppState;

      if (nextAppState === 'active') {
        // App came to foreground - refresh immediately and restart timer
        fetchGames();
      } else {
        // App went to background - stop timer
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchGames]);

  // Initial fetch
  useEffect(() => {
    fetchGames({ showLoading: true });
  }, [fetchGames]);

  // Setup/teardown refresh timer based on live game count
  useEffect(() => {
    setupRefreshTimer();

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [setupRefreshTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  return {
    games,
    loading,
    refreshing,
    error,
    liveCount,
    lastUpdated,
    refresh,
    hasLiveGames: liveCount > 0,
  };
}

/**
 * Hook for fetching games by specific sport
 */
export function useSportScores(sport: Sport, autoRefresh = true) {
  return useLiveScores({
    sports: [sport],
    autoRefresh,
  });
}

/**
 * Hook for fetching only live games
 */
export function useOnlyLiveGames() {
  const { games, ...rest } = useLiveScores();

  const liveGames = games.filter(game => game.isLive);

  return {
    games: liveGames,
    ...rest,
  };
}

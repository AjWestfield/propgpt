import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SportsAPI } from '../services/sportsApi';
import { OddsAPI } from '../services/oddsApi';
import { Sport } from '../types/game';
import { BoxScore } from '../types/boxScore';
import { OddsComparison } from '../types/boxScore';

interface GameDetailData {
  gameInfo: any;
  boxScore: BoxScore | null;
  odds: OddsComparison | null;
}

interface UseGameDetailReturn {
  gameData: GameDetailData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isLive: boolean;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage game detail data with auto-refresh
 * Refreshes every 10-15 seconds for live games
 * Pauses when app is in background
 *
 * @param gameId - ESPN game ID
 * @param sport - Sport league
 * @returns Game detail data, loading states, and refresh function
 */
export function useGameDetail(
  gameId: string,
  sport: Sport
): UseGameDetailReturn {
  const [gameData, setGameData] = useState<GameDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const appState = useRef(AppState.currentState);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  /**
   * Fetch game details, box score, and odds
   */
  interface FetchOptions {
    showLoading?: boolean;
    showRefreshing?: boolean;
  }

  const fetchGameData = useCallback(async (options: FetchOptions = {}) => {
    const { showLoading = false, showRefreshing = false } = options;

    try {
      if (showLoading) {
        setLoading(true);
      }
      if (showRefreshing) {
        setRefreshing(true);
      }
      setError(null);

      console.log(`[useGameDetail] Fetching data for game ${gameId} (${sport})`);

      // Fetch all data in parallel using allSettled to handle partial failures
      const results = await Promise.allSettled([
        SportsAPI.getGameDetails(gameId, sport),
        SportsAPI.getBoxScore(gameId, sport),
        OddsAPI.getGameOdds(gameId, sport),
      ]);

      // Extract results
      const gameInfo = results[0].status === 'fulfilled' ? results[0].value : null;
      const boxScore = results[1].status === 'fulfilled' ? results[1].value : null;
      const odds = results[2].status === 'fulfilled' ? results[2].value : null;

      // Debug logging
      console.log('[useGameDetail] Fetch results:', {
        gameInfo: gameInfo ? 'SUCCESS' : 'FAILED',
        boxScore: boxScore ? 'SUCCESS' : 'FAILED',
        odds: odds ? 'SUCCESS' : 'FAILED',
      });

      if (results[0].status === 'rejected') {
        console.error('[useGameDetail] Game info fetch failed:', results[0].reason);
      }
      if (results[1].status === 'rejected') {
        console.error('[useGameDetail] Box score fetch failed:', results[1].reason);
      }
      if (results[2].status === 'rejected') {
        console.error('[useGameDetail] Odds fetch failed:', results[2].reason);
      }

      if (!gameInfo) {
        throw new Error('Failed to fetch game details');
      }

      // Determine if game is live
      const competition = gameInfo.header?.competitions?.[0] || gameInfo.competitions?.[0];
      const status = competition?.status?.type;
      const gameLive = !status?.completed && status?.state !== 'pre';

      console.log('[useGameDetail] Game status:', {
        isLive: gameLive,
        statusState: status?.state,
        completed: status?.completed,
      });

      setIsLive(gameLive);
      setGameData({
        gameInfo,
        boxScore,
        odds,
      });
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('[useGameDetail] Error fetching game detail:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game details');
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setRefreshing(false);
      }
    }
  }, [gameId, sport]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchGameData({ showRefreshing: true });
  }, [fetchGameData]);

  /**
   * Setup auto-refresh for live games
   */
  useEffect(() => {
    if (!isLive || appState.current !== 'active') {
      // Clear interval if game is not live or app is in background
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = undefined;
      }
      return;
    }

    // Set up auto-refresh every 10-15 seconds for live games
    // Using 12 seconds as a middle ground
    const REFRESH_INTERVAL = 12000; // 12 seconds

    refreshIntervalRef.current = setInterval(() => {
      fetchGameData();
    }, REFRESH_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isLive, fetchGameData]);

  /**
   * Handle app state changes (foreground/background)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground, refresh data
        if (isLive) {
          fetchGameData();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isLive, fetchGameData]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchGameData({ showLoading: true });
  }, [fetchGameData]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    gameData,
    loading,
    refreshing,
    error,
    isLive,
    lastUpdated,
    refresh,
  };
}

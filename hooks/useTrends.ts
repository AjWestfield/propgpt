import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Sport } from '../types/game';
import {
  TrendsData,
  BettingTrend,
  PlayerTrend,
  TeamTrend,
  InjuryTrend,
  TrendCategory,
  TrendFilter,
} from '../types/trends';
import TrendsAPI from '../services/trendsApi';
import BettingTrendsService from '../services/bettingTrendsService';
import InjuryTracker from '../services/injuryTracker';

interface UseTrendsOptions {
  sport?: Sport | 'all';
  category?: TrendCategory;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export const useTrends = (options: UseTrendsOptions = {}) => {
  const {
    sport = 'all',
    category = 'all',
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [data, setData] = useState<TrendsData>({
    bettingTrends: [],
    playerTrends: [],
    teamTrends: [],
    injuryTrends: [],
    predictions: [],
    lastUpdated: new Date(),
    liveGamesCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache for injury data per sport to avoid re-fetching
  const injuryCacheRef = useRef<Map<Sport, InjuryTrend[]>>(new Map());

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Fetch all trends data
   */
  interface FetchOptions {
    showLoading?: boolean;
    showRefreshing?: boolean;
  }

  const fetchTrends = useCallback(async (options: FetchOptions = {}) => {
    const { showLoading = false, showRefreshing = false } = options;

    try {
      if (showLoading) {
        setLoading(true);
      }
      if (showRefreshing) {
        setRefreshing(true);
      }
      setError(null);

      const sports: Sport[] = sport === 'all' ? ['NBA', 'NFL', 'MLB', 'NHL'] : [sport];
      const effectiveCategory = category === 'news' ? 'all' : category;

      // Lazy load injuries only when needed
      const shouldFetchInjuries = effectiveCategory === 'injury';

      // Fetch data in parallel (skip injuries unless specifically requested)
      const promises = sports.map(async (s) => {
        const [betting, player, team] = await Promise.all([
          effectiveCategory === 'all' || effectiveCategory === 'betting'
            ? TrendsAPI.getBettingTrends(s)
            : Promise.resolve([]),
          effectiveCategory === 'all' || effectiveCategory === 'player'
            ? BettingTrendsService.getPlayerTrends(s, 20)
            : Promise.resolve([]),
          effectiveCategory === 'all' || effectiveCategory === 'team'
            ? BettingTrendsService.getTeamTrends(s)
            : Promise.resolve([]),
        ]);

        // Load injuries with caching
        let injury: InjuryTrend[] = [];
        if (shouldFetchInjuries) {
          // Check cache first
          if (injuryCacheRef.current.has(s)) {
            injury = injuryCacheRef.current.get(s)!;
            console.log(`✅ Using cached injuries for ${s}: ${injury.length} injuries`);
          } else {
            // Fetch and cache
            injury = await InjuryTracker.getInjuryTrends(s);
            injuryCacheRef.current.set(s, injury);
            console.log(`📥 Fetched and cached injuries for ${s}: ${injury.length} injuries`);
          }
        }

        return { betting, player, team, injury };
      });

      const results = await Promise.all(promises);

      // Combine all results
      const combinedData: TrendsData = {
        bettingTrends: results.flatMap((r) => r.betting),
        playerTrends: results.flatMap((r) => r.player),
        teamTrends: results.flatMap((r) => r.team),
        injuryTrends: results.flatMap((r) => r.injury),
        predictions: [], // Will be populated by usePredictions hook
        lastUpdated: new Date(),
        liveGamesCount: results.reduce((acc, r) => {
          return acc + r.betting.filter((b) => b.isLive).length;
        }, 0),
      };

      setData(combinedData);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trends');
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setRefreshing(false);
      }
    }
  }, [sport, category]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(() => {
    return fetchTrends({ showRefreshing: true });
  }, [fetchTrends]);

  /**
   * Setup auto-refresh
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const startRefreshTimer = () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }

      refreshTimerRef.current = setInterval(() => {
        if (appStateRef.current === 'active') {
          fetchTrends();
        }
      }, refreshInterval);
    };

    startRefreshTimer();

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchTrends]);

  /**
   * Monitor app state to pause/resume refresh
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground, refresh data
        fetchTrends();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [fetchTrends]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchTrends({ showLoading: true });
  }, [fetchTrends]);

  /**
   * Get filtered trends by category
   */
  const getTrendsByCategory = useCallback(
    (cat: TrendCategory) => {
      if (cat === 'all') {
        return [
          ...data.bettingTrends,
          ...data.playerTrends,
          ...data.teamTrends,
          ...data.injuryTrends,
        ];
      }

      if (cat === 'news') return [];

      switch (cat) {
        case 'betting':
          return data.bettingTrends;
        case 'player':
          return data.playerTrends;
        case 'team':
          return data.teamTrends;
        case 'injury':
          return data.injuryTrends;
        default:
          return [];
      }
    },
    [data]
  );

  /**
   * Get trends count by category
   */
  const getTrendsCount = useCallback(
    (cat: TrendCategory = 'all'): number => {
      if (cat === 'all') {
        return (
          data.bettingTrends.length +
          data.playerTrends.length +
          data.teamTrends.length +
          data.injuryTrends.length
        );
      }

      if (cat === 'news') {
        return 0;
      }

      return getTrendsByCategory(cat).length;
    },
    [data, getTrendsByCategory]
  );

  /**
   * Get high severity trends
   */
  const getHighSeverityTrends = useCallback(() => {
    const allTrends = [
      ...data.bettingTrends,
      ...data.playerTrends,
      ...data.teamTrends,
      ...data.injuryTrends,
    ];

    return allTrends.filter(
      (trend) => trend.severity === 'critical' || trend.severity === 'high'
    );
  }, [data]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
    getTrendsByCategory,
    getTrendsCount,
    getHighSeverityTrends,
    lastUpdated: data.lastUpdated,
    liveGamesCount: data.liveGamesCount,
  };
};

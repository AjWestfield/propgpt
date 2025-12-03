import { useState, useEffect, useCallback } from 'react';
import { PlayerProp } from '../data/mockProps';
import { PlayerStatsService, PlayerChartData } from '../services/playerStatsService';

/**
 * React hook for fetching and managing player chart data
 */
export function usePlayerChartData(
  playerProp: PlayerProp | null,
  gameLimit: number = 10,
  compact: boolean = false,
  autoFetch: boolean = true
) {
  const [data, setData] = useState<PlayerChartData>({
    chartData: [],
    hitRateData: {
      hitRate: 0,
      hits: 0,
      misses: 0,
      pushes: 0,
      streak: { count: 0, type: 'none' },
    },
    trend: 'stable',
    seasonAverage: 0,
    last5Average: 0,
    last10Average: 0,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!playerProp) {
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const chartData = await PlayerStatsService.getPlayerChartData(
        playerProp,
        gameLimit,
        compact
      );

      setData(chartData);
    } catch (error) {
      console.error('Error in usePlayerChartData:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }));
    }
  }, [playerProp, gameLimit, compact]);

  const refresh = useCallback(async () => {
    if (playerProp) {
      await PlayerStatsService.refreshPlayerStats(playerProp.playerId);
      await fetchData();
    }
  }, [playerProp, fetchData]);

  useEffect(() => {
    if (autoFetch && playerProp) {
      fetchData();
    }
  }, [autoFetch, playerProp, fetchData]);

  return {
    ...data,
    refresh,
    fetchData,
  };
}

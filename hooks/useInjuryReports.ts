import { useState, useEffect, useCallback } from 'react';
import { Sport } from '../types/game';
import { InjuryTrend } from '../types/trends';
import InjuryTracker from '../services/injuryTracker';

interface UseInjuryReportsOptions {
  sport?: Sport | 'all';
  highImpactOnly?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useInjuryReports = (options: UseInjuryReportsOptions = {}) => {
  const {
    sport = 'all',
    highImpactOnly = false,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
  } = options;

  const [injuries, setInjuries] = useState<InjuryTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInjuries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: InjuryTrend[];

      if (highImpactOnly) {
        data = await InjuryTracker.getHighImpactInjuries(
          sport === 'all' ? undefined : sport
        );
      } else if (sport === 'all') {
        data = await InjuryTracker.getAllSportsInjuryTrends();
      } else {
        data = await InjuryTracker.getInjuryTrends(sport);
      }

      setInjuries(data);
    } catch (err) {
      console.error('Error fetching injuries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch injuries');
    } finally {
      setLoading(false);
    }
  }, [sport, highImpactOnly]);

  useEffect(() => {
    fetchInjuries();
  }, [fetchInjuries]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchInjuries, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchInjuries]);

  const refresh = useCallback(() => {
    return fetchInjuries();
  }, [fetchInjuries]);

  const getCriticalInjuries = useCallback(() => {
    return injuries.filter((injury) => injury.severity === 'critical');
  }, [injuries]);

  const getInjuriesBySport = useCallback(
    (targetSport: Sport) => {
      return injuries.filter((injury) => injury.sport === targetSport);
    },
    [injuries]
  );

  return {
    injuries,
    loading,
    error,
    refresh,
    getCriticalInjuries,
    getInjuriesBySport,
    count: injuries.length,
  };
};

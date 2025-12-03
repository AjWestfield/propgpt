import { useState, useEffect, useCallback } from 'react';
import { Sport } from '../types/game';
import TrendsAPI from '../services/trendsApi';

export interface NewsArticle {
  id: string;
  headline: string;
  description?: string;
  published: string;
  link: string;
  image?: string;
  sport: string;
}

interface UseNewsOptions {
  sport?: Sport | 'all';
  autoRefresh?: boolean;
  refreshInterval?: number;
  limit?: number;
}

export const useNews = (options: UseNewsOptions = {}) => {
  const {
    sport = 'all',
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes for news
    limit = 20,
  } = options;

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch news articles
   */
  const fetchNews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const sports: Sport[] = sport === 'all' ? ['NBA', 'NFL', 'MLB', 'NHL'] : [sport];

      // Fetch news for each sport
      const newsPromises = sports.map(async (s) => {
        const sportNews = await TrendsAPI.getNews(s, Math.ceil(limit / sports.length));
        return sportNews.map((article: any) => ({
          id: article.id || `news_${Date.now()}_${Math.random()}`,
          headline: article.headline || article.title || 'No headline',
          description: article.description || article.story || article.caption,
          published: article.published || article.lastModified || new Date().toISOString(),
          link: article.links?.web?.href || article.link || '#',
          image: article.images?.[0]?.url || article.image?.url || article.thumbnail,
          sport: s,
        }));
      });

      const allNews = await Promise.all(newsPromises);
      const combinedNews = allNews.flat();

      // Sort by published date (newest first)
      const sortedNews = combinedNews.sort((a, b) => {
        return new Date(b.published).getTime() - new Date(a.published).getTime();
      });

      setArticles(sortedNews.slice(0, limit));
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sport, limit]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(() => {
    fetchNews(true);
  }, [fetchNews]);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [sport, limit]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNews(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNews]);

  return {
    articles,
    loading,
    refreshing,
    error,
    refresh,
  };
};

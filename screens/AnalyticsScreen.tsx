import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { Sport } from '../types/game';
import { TrendCategory, BaseTrend } from '../types/trends';
import { useTrends } from '../hooks/useTrends';
import { usePredictions } from '../hooks/usePredictions';
import { TrendFilters } from '../components/trends/TrendFilters';
import { TrendCard } from '../components/trends/TrendCard';
import { BettingTrendCard } from '../components/trends/BettingTrendCard';
import { PlayerTrendCard } from '../components/trends/PlayerTrendCard';
import { InjuryTrendCard } from '../components/trends/InjuryTrendCard';
import { PredictionCard } from '../components/trends/PredictionCard';
import { NewsFeedCard } from '../components/trends/NewsFeedCard';
import { useNews, NewsArticle } from '../hooks/useNews';
import { Ionicons } from '@expo/vector-icons';
import { LiveBadge } from '../components/LiveBadge';

export function AnalyticsScreen() {
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory>('all');

  // Fetch trends data
  const {
    data,
    loading,
    refreshing,
    error,
    refresh,
    getTrendsByCategory,
    getTrendsCount,
    getHighSeverityTrends,
    liveGamesCount,
  } = useTrends({
    sport: selectedSport,
    category: selectedCategory,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  });

  // Fetch predictions
  const {
    predictions,
    loading: predictionsLoading,
  } = usePredictions({
    sport: selectedSport === 'all' ? undefined : selectedSport,
    minConfidence: 0,
    autoRefresh: true,
  });

  // Fetch news articles
  const {
    articles: newsArticles,
    loading: newsLoading,
  } = useNews({
    sport: selectedSport,
    autoRefresh: true,
    limit: 10,
  });

  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const openArticle = (article: NewsArticle) => setActiveArticle(article);
  const closeArticle = () => setActiveArticle(null);

  /**
   * Render trend card based on type
   */
  const renderTrendCard = (trend: BaseTrend, index: number) => {
    const key = `${trend.id}-${index}`;

    switch (trend.category) {
      case 'betting':
        return <BettingTrendCard key={key} trend={trend as any} />;
      case 'player':
        return <PlayerTrendCard key={key} trend={trend as any} />;
      case 'injury':
        return <InjuryTrendCard key={key} trend={trend as any} />;
      case 'team':
        return <TrendCard key={key} trend={trend} />;
      default:
        return <TrendCard key={key} trend={trend} />;
    }
  };

  // Pagination state
  const [displayedItemCount, setDisplayedItemCount] = useState(30);
  const ITEMS_PER_PAGE = 30;

  // Get trends to display with pagination
  const allTrendsToDisplay = useMemo(() => getTrendsByCategory(selectedCategory), [selectedCategory, getTrendsByCategory]);
  const trendsToDisplay = useMemo(() => allTrendsToDisplay.slice(0, displayedItemCount), [allTrendsToDisplay, displayedItemCount]);
  const hasMoreTrends = displayedItemCount < allTrendsToDisplay.length;

  const highSeverityTrends = getHighSeverityTrends();
  const showNewsSection = selectedCategory === 'all' || selectedCategory === 'news';
  const showTrendContent = selectedCategory !== 'news';
  const newsLimit = selectedCategory === 'news' ? newsArticles.length : 5;

  // Load more function
  const loadMoreTrends = () => {
    if (!loading && hasMoreTrends) {
      setDisplayedItemCount(prev => prev + ITEMS_PER_PAGE);
    }
  };

  // Reset pagination when category or sport changes
  React.useEffect(() => {
    setDisplayedItemCount(30);
  }, [selectedCategory, selectedSport]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleContainer}>
            <Ionicons name="flame" size={24} color="#F59E0B" />
            <Text style={styles.title}>Trends</Text>
          </View>
          <Text style={styles.subtitle}>
            {liveGamesCount > 0
              ? `${liveGamesCount} live game${liveGamesCount > 1 ? 's' : ''}`
              : 'Latest sports trends & insights'}
          </Text>
        </View>

        {/* Live indicator */}
        {liveGamesCount > 0 && (
          <View style={styles.headerLiveBadge}>
            <LiveBadge size="small" />
          </View>
        )}
      </View>

      {/* Filters */}
      <TrendFilters
        selectedSport={selectedSport}
        selectedCategory={selectedCategory}
        onSportChange={setSelectedSport}
        onCategoryChange={setSelectedCategory}
      />

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <StatsItem icon="pulse" label="Trends" value={getTrendsCount()} />
        <StatsItem icon="warning" label="High Impact" value={highSeverityTrends.length} />
        <StatsItem icon="analytics" label="Predictions" value={predictions.length} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {showTrendContent && (
          loading && trendsToDisplay.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading trends...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              {highSeverityTrends.length > 0 && selectedCategory === 'all' && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.sectionTitle}>High Impact Trends</Text>
                  </View>
                  {highSeverityTrends.slice(0, 3).map((trend, index) =>
                    renderTrendCard(trend, index)
                  )}
                </View>
              )}

              {(selectedCategory === 'all' || selectedCategory === 'betting') &&
                predictions.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="stats-chart" size={20} color="#FFFFFF" />
                      <Text style={styles.sectionTitle}>Game Predictions</Text>
                    </View>
                    {predictions.slice(0, 5).map((prediction, index) => (
                      <PredictionCard key={`pred-${index}`} prediction={prediction} />
                    ))}
                  </View>
                )}

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bar-chart" size={20} color="#FFFFFF" />
                  <Text style={styles.sectionTitle}>
                    {selectedCategory === 'all'
                      ? 'All Trends'
                      : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Trends`}
                  </Text>
                </View>

                {trendsToDisplay.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={48} color="#6B7280" />
                    <Text style={styles.emptyText}>No trends found</Text>
                    <Text style={styles.emptySubtext}>
                      Try selecting a different sport or category
                    </Text>
                  </View>
                ) : (
                  <>
                    {trendsToDisplay.map((trend, index) => renderTrendCard(trend, index))}
                    {hasMoreTrends && (
                      <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={loadMoreTrends}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#10B981" />
                        ) : (
                          <>
                            <Text style={styles.loadMoreText}>
                              Load More ({allTrendsToDisplay.length - displayedItemCount} remaining)
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#10B981" />
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </>
          )
        )}

        {showNewsSection && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="newspaper" size={20} color="#FFFFFF" />
              <Text style={styles.sectionTitle}>Latest News</Text>
            </View>
            {newsLoading && newsArticles.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.loadingText}>Loading news...</Text>
              </View>
            ) : (
              newsArticles.slice(0, newsLimit || 5).map((article, index) => (
                <NewsFeedCard
                  key={`news-${index}`}
                  article={article}
                  onPress={() => openArticle(article)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
      {activeArticle && (
        <Modal transparent animationType="fade" visible={!!activeArticle} onRequestClose={closeArticle}>
          <View style={styles.newsModalOverlay}>
            <TouchableWithoutFeedback onPress={closeArticle}>
              <View style={styles.newsModalBackdrop} />
            </TouchableWithoutFeedback>
            <View style={styles.newsModalCard}>
              {activeArticle.image && (
                <Image source={{ uri: activeArticle.image }} style={styles.newsModalImage} resizeMode="cover" />
              )}
              <Text style={styles.newsModalBadge}>{activeArticle.sport}</Text>
              <Text style={styles.newsModalHeadline}>{activeArticle.headline}</Text>
              {activeArticle.description && (
                <ScrollView style={styles.newsModalBody} showsVerticalScrollIndicator={false}>
                  <Text style={styles.newsModalText}>{activeArticle.description}</Text>
                </ScrollView>
              )}
              <View style={styles.newsModalActions}>
                <TouchableOpacity style={styles.newsModalButton} onPress={closeArticle}>
                  <Text style={styles.newsModalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function StatsItem({ label, value, icon }: { label: string; value: number; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.statsItem}>
      <View style={styles.statsIconWrap}>
        <Ionicons name={icon} size={16} color="#10B981" />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  headerLiveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statsBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'flex-start',
  },
  statsIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 100, // Extra padding for bottom tab navigator
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  newsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  newsModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  newsModalCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '80%',
  },
  newsModalImage: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginBottom: 12,
  },
  newsModalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  newsModalHeadline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  newsModalBody: {
    maxHeight: 200,
    marginBottom: 16,
  },
  newsModalText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  newsModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  newsModalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  newsModalButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  section: {
    marginBottom: 20,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});

/**
 * OutlierEVScreen - Arbitrage and High EV Betting Opportunities
 *
 * Fetches player props from Odds-API.io, detects arbitrage and high-EV opportunities,
 * and displays them in an interactive feed with detailed analytics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { OutlierEVCard } from '../components/OutlierEVCard';
import { PropDetailModal } from '../components/PropDetailModal';
import { OutlierOpportunity, OutlierEVFilters } from '../types/outlierEV';
import { Sport } from '../types/game';
import { OddsAPIIO } from '../services/oddsApiIO';
import {
  detectAllEVOpportunities,
  sortEVOpportunities,
} from '../services/evCalculator';
import {
  detectAllArbitrageOpportunities,
  sortArbitrageOpportunities,
} from '../services/arbitrageDetector';
import { getSportsbookLogoUrl } from '../constants/sportsbookLogos';

type TabType = 'arbitrage' | 'high-ev';

export function OutlierEVScreen() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('arbitrage');
  const [opportunities, setOpportunities] = useState<OutlierOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<OutlierOpportunity | null>(null);

  // Filters
  const [filters, setFilters] = useState<OutlierEVFilters>({
    sport: 'NBA',
    opportunityType: 'all',
    minProfit: 0.5,
    minEV: 2.0,
    sportsbooks: [],
    propTypes: [],
  });

  /**
   * Fetch player props and detect opportunities
   */
  const fetchOpportunities = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Fetch player props for the selected sport
        const sport = filters.sport === 'all' ? 'NBA' : filters.sport;
        const propEvents = await OddsAPIIO.getPlayerProps(sport);

        if (!propEvents || propEvents.length === 0) {
          throw new Error(`No ${sport} player props found`);
        }

        // Get player props for each game
        const allOpportunities: OutlierOpportunity[] = [];

        // Process first 5 games (to avoid rate limits)
        const eventsToProcess = propEvents.slice(0, 5);

        for (const event of eventsToProcess) {
          try {
            const props = event.bookmakers.flatMap((bookmaker) =>
              bookmaker.markets.flatMap((market) =>
                market.outcomes.map((outcome) => ({
                  description: outcome.name,
                  name: market.key.replace('player_', '').replace(/_/g, ' ').toUpperCase(),
                  outcomes: [
                    {
                      name: outcome.description,
                      price: outcome.price,
                      point: outcome.point,
                      bookmakers: [bookmaker],
                    },
                  ],
                }))
              )
            );

            if (!props || props.length === 0) continue;

            // Group props by player and prop type
            const propsMap = new Map<
              string,
              {
                player: string;
                propType: string;
                books: any[];
              }
            >();

            for (const prop of props) {
              const key = `${prop.description}-${prop.name}`;
              if (!propsMap.has(key)) {
                propsMap.set(key, {
                  player: prop.description,
                  propType: prop.name,
                  books: [],
                });
              }

              const propData = propsMap.get(key)!;

              // Add each outcome with odds
              for (const outcome of prop.outcomes) {
                const existingBook = propData.books.find(
                  (b) => b.sportsbookKey === outcome.bookmakers[0].key
                );

                if (!existingBook) {
                  const bookKey = outcome.bookmakers[0].key;
                  const bookName = outcome.bookmakers[0].title;

                  propData.books.push({
                    sportsbook: bookName,
                    sportsbookKey: bookKey,
                    line: outcome.point || 0,
                    overOdds: outcome.name === 'Over' ? outcome.price : 0,
                    underOdds: outcome.name === 'Under' ? outcome.price : 0,
                    overImpliedProb:
                      outcome.name === 'Over'
                        ? 1 / (outcome.price + 1)
                        : 0,
                    underImpliedProb:
                      outcome.name === 'Under'
                        ? 1 / (outcome.price + 1)
                        : 0,
                    lastUpdate: new Date().toISOString(),
                    logoUrl: getSportsbookLogoUrl(bookKey, bookName),
                  });
                } else {
                  // Update the book with Over/Under odds
                  if (outcome.name === 'Over') {
                    existingBook.overOdds = outcome.price;
                    existingBook.overImpliedProb = 1 / (outcome.price + 1);
                  } else if (outcome.name === 'Under') {
                    existingBook.underOdds = outcome.price;
                    existingBook.underImpliedProb = 1 / (outcome.price + 1);
                  }
                }
              }
            }

            // Detect opportunities for each prop
            const gameInfo = {
              homeTeam: event.home,
              awayTeam: event.away,
              gameTime: event.date,
            };

            for (const [_, propData] of propsMap) {
              // Filter books with complete odds (both over and under)
              const completeBooks = propData.books.filter(
                (book) => book.overOdds !== 0 && book.underOdds !== 0
              );

              if (completeBooks.length < 2) continue;

              // Detect arbitrage opportunities
              if (
                activeTab === 'arbitrage' ||
                filters.opportunityType === 'all'
              ) {
                const arbOpps = detectAllArbitrageOpportunities(
                  completeBooks,
                  propData.player,
                  propData.propType,
                  gameInfo
                );

                for (const arb of arbOpps) {
                  if (arb.guaranteedProfit >= filters.minProfit) {
                    allOpportunities.push({
                      id: arb.id,
                      opportunityType: 'arbitrage',
                      player: arb.player,
                      propType: arb.propType,
                      sport: arb.sport,
                      game: arb.game,
                      arbitrage: arb,
                      highlight: `${arb.guaranteedProfit.toFixed(2)}% Guaranteed Profit`,
                      bestPlay: `${arb.overBook.sportsbook} Over ${arb.overBook.odds > 0 ? '+' : ''}${arb.overBook.odds} / ${arb.underBook.sportsbook} Under ${arb.underBook.odds > 0 ? '+' : ''}${arb.underBook.odds}`,
                      allBooks: completeBooks,
                      score: arb.guaranteedProfit,
                      createdAt: arb.createdAt,
                    });
                  }
                }
              }

              // Detect high-EV opportunities
              if (
                activeTab === 'high-ev' ||
                filters.opportunityType === 'all'
              ) {
                const evOpps = detectAllEVOpportunities([
                  {
                    player: propData.player,
                    propType: propData.propType,
                    gameInfo,
                    books: completeBooks,
                  },
                ]);

                for (const ev of evOpps) {
                  const maxEV = Math.max(ev.bestOver.ev, ev.bestUnder.ev);
                  if (maxEV >= filters.minEV) {
                    const bestSide =
                      ev.bestOver.ev > ev.bestUnder.ev ? 'Over' : 'Under';
                    const bestBook =
                      bestSide === 'Over' ? ev.bestOver : ev.bestUnder;

                    allOpportunities.push({
                      id: ev.id,
                      opportunityType: 'high-ev',
                      player: ev.player,
                      propType: ev.propType,
                      sport: ev.sport,
                      game: ev.game,
                      ev,
                      highlight: `${maxEV.toFixed(2)}% Expected Value`,
                      bestPlay: `${bestBook.sportsbook} ${bestSide} ${bestBook.odds > 0 ? '+' : ''}${bestBook.odds}`,
                      allBooks: completeBooks,
                      score: maxEV,
                      createdAt: ev.createdAt,
                    });
                  }
                }
              }
            }
          } catch (gameError) {
            console.warn(`Failed to process props for game ${event.id}:`, gameError);
            // Continue with other games
          }
        }

        // Sort by score (profit % or EV %)
        allOpportunities.sort((a, b) => b.score - a.score);

        setOpportunities(allOpportunities);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load opportunities';
        setError(errorMessage);
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, filters]
  );

  // Initial fetch
  useEffect(() => {
    fetchOpportunities();
  }, [activeTab, filters.sport]);

  // Filter opportunities by active tab
  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeTab === 'arbitrage') {
      return opp.opportunityType === 'arbitrage';
    } else {
      return opp.opportunityType === 'high-ev';
    }
  });

  /**
   * Handle card press - open bottom sheet
   */
  const handleCardPress = (opportunity: OutlierOpportunity) => {
    setSelectedOpportunity(opportunity);
  };

  /**
   * Handle bottom sheet close
   */
  const handleBottomSheetClose = () => {
    setSelectedOpportunity(null);
  };

  /**
   * Render opportunity card
   */
  const renderOpportunity = ({ item }: { item: OutlierOpportunity }) => (
    <OutlierEVCard opportunity={item} onPress={() => handleCardPress(item)} />
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={
            activeTab === 'arbitrage'
              ? 'checkmark-circle-outline'
              : 'trending-up-outline'
          }
          size={64}
          color="#6E6E73"
        />
        <Text style={styles.emptyTitle}>No Opportunities Found</Text>
        <Text style={styles.emptyText}>
          {activeTab === 'arbitrage'
            ? 'No arbitrage opportunities detected at the moment. Try adjusting your filters or check back soon.'
            : 'No high-EV opportunities detected. Lower your minimum EV threshold or try different filters.'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchOpportunities(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Render error state
   */
  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchOpportunities()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Outlier EV</Text>
        <Text style={styles.subtitle}>
          {activeTab === 'arbitrage'
            ? 'Guaranteed Profit Opportunities'
            : 'Positive Expected Value Bets'}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'arbitrage' && styles.tabActive]}
          onPress={() => setActiveTab('arbitrage')}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={activeTab === 'arbitrage' ? '#10B981' : '#6E6E73'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'arbitrage' && styles.tabTextActive,
            ]}
          >
            Arbitrage
          </Text>
          {filteredOpportunities.filter((o) => o.opportunityType === 'arbitrage')
            .length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {
                  filteredOpportunities.filter(
                    (o) => o.opportunityType === 'arbitrage'
                  ).length
                }
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'high-ev' && styles.tabActive]}
          onPress={() => setActiveTab('high-ev')}
        >
          <Ionicons
            name="star"
            size={20}
            color={activeTab === 'high-ev' ? '#F59E0B' : '#6E6E73'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'high-ev' && styles.tabTextActive,
            ]}
          >
            High EV
          </Text>
          {filteredOpportunities.filter((o) => o.opportunityType === 'high-ev')
            .length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {
                  filteredOpportunities.filter(
                    (o) => o.opportunityType === 'high-ev'
                  ).length
                }
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Opportunities List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Analyzing odds...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOpportunities}
          renderItem={renderOpportunity}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOpportunities(true)}
              tintColor="#EF4444"
            />
          }
        />
      )}

      {/* Detail Modal */}
      <PropDetailModal
        opportunity={selectedOpportunity}
        onClose={handleBottomSheetClose}
      />
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6E6E73',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingBottom: 100,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#AEAEB2',
    textAlign: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#AEAEB2',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#AEAEB2',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  // Retry Button
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#EF4444',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

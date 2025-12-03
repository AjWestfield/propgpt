import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameCard } from '../components/GameCard';
import { BoxScoreModal } from '../components/BoxScoreModal';
import { useLiveScores } from '../hooks/useLiveScores';
import type { Sport, TimeFilter, Game } from '../types/game';
import { LiveBadge } from '../components/LiveBadge';

const { width, height } = Dimensions.get('window');

const SPORTS: Sport[] = ['NBA', 'NFL', 'MLB', 'NHL'];

const SPORT_LOGOS: Record<Sport, string> = {
  NBA: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
  NFL: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
  MLB: 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
  NHL: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
};

type GamesStackParamList = {
  GamesMain: undefined;
  GameDetail: {
    gameId: string;
    sport: Sport;
  };
};

type NavigationProp = NativeStackNavigationProp<GamesStackParamList, 'GamesMain'>;

export function FeedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedSport, setSelectedSport] = useState<Sport | 'ALL'>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [boxScoreModalVisible, setBoxScoreModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const { games, loading, refreshing, error, liveCount, lastUpdated, refresh, hasLiveGames } =
    useLiveScores({
      refreshInterval: 30000, // 30 seconds
      autoRefresh: true,
      sports: SPORTS,
    });

  // Filter games by selected sport
  const filteredGames = useMemo(() => {
    let filtered = selectedSport === 'ALL'
      ? games
      : games.filter(game => game.sport === selectedSport);

    // Apply time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (timeFilter === 'yesterday') {
      filtered = filtered.filter(game => {
        const gameDate = new Date(game.date);
        return gameDate >= yesterday && gameDate < today;
      });
    } else if (timeFilter === 'today') {
      filtered = filtered.filter(game => {
        const gameDate = new Date(game.date);
        return gameDate >= today && gameDate < tomorrow;
      });
    } else if (timeFilter === 'upcoming') {
      filtered = filtered.filter(game => {
        const gameDate = new Date(game.date);
        return gameDate >= tomorrow;
      });
    }

    return filtered;
  }, [games, selectedSport, timeFilter]);

  // Format last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';

    const now = Date.now();
    const diff = Math.floor((now - lastUpdated) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <LinearGradient
          colors={['#0A0A0A', '#121212']}
          style={styles.gradientBackground}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading live games...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#121212']}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Live Games</Text>
              {hasLiveGames && (
                <View style={styles.liveIndicatorWrapper}>
                  <LiveBadge label={`${liveCount} Live`} />
                </View>
              )}
            </View>

            {lastUpdated && (
              <Text style={styles.lastUpdatedText}>
                Updated {getLastUpdatedText()}
              </Text>
            )}
          </View>
        </BlurView>

        {/* Filter Section */}
        <View style={styles.filtersWrapper}>
          <View style={styles.timeFilterContainer}>
            {(['yesterday', 'today', 'upcoming'] as TimeFilter[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.timeFilterPill,
                  timeFilter === filter && styles.timeFilterPillActive,
                ]}
                onPress={() => setTimeFilter(filter)}
              >
                <Text
                  style={[
                    styles.timeFilterText,
                    timeFilter === filter && styles.timeFilterTextActive,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sportFilterScroll}
            contentContainerStyle={styles.sportFilterContainer}
          >
            <TouchableOpacity
              style={[
                styles.sportChip,
                selectedSport === 'ALL' && styles.sportChipActive,
              ]}
              onPress={() => setSelectedSport('ALL')}
            >
              <Ionicons
                name="apps"
                size={18}
                color={selectedSport === 'ALL' ? '#FFFFFF' : '#AEAEB2'}
              />
              <Text
                style={[
                  styles.sportChipText,
                  selectedSport === 'ALL' && styles.sportChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {SPORTS.map((sport) => {
              const isActive = selectedSport === sport;

              return (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.sportChip,
                    isActive && styles.sportChipActive,
                  ]}
                  onPress={() => setSelectedSport(sport)}
                >
                  <Image
                    source={{ uri: SPORT_LOGOS[sport] }}
                    style={styles.sportLogo}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.sportChipText,
                      isActive && styles.sportChipTextActive,
                    ]}
                  >
                    {sport}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Games List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#FFFFFF"
              colors={['#FFFFFF']}
            />
          }
        >
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!error && filteredGames.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#6B7280" />
              <Text style={styles.emptyTitle}>No Games {timeFilter === 'today' ? 'Today' : timeFilter === 'yesterday' ? 'Yesterday' : 'Upcoming'}</Text>
              <Text style={styles.emptySubtitle}>
                {selectedSport === 'ALL'
                  ? 'Check back later for scheduled games'
                  : `No ${selectedSport} games scheduled`}
              </Text>
            </View>
          )}

          {!error && filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => {
                setSelectedGame(game);
                setBoxScoreModalVisible(true);
              }}
            />
          ))}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

      </LinearGradient>

      {/* Box Score Modal */}
      {selectedGame && (
        <BoxScoreModal
          visible={boxScoreModalVisible}
          onClose={() => {
            setBoxScoreModalVisible(false);
            setSelectedGame(null);
          }}
          game={selectedGame}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 4,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  liveIndicatorWrapper: {
    marginTop: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  filtersWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
    marginBottom: 6,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  timeFilterPill: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  timeFilterPillActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  timeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  timeFilterTextActive: {
    color: '#FFFFFF',
  },
  sportFilterScroll: {
    marginTop: 0,
    marginBottom: 0,
  },
  sportFilterContainer: {
    paddingHorizontal: 0,
    paddingVertical: 2,
    gap: 6,
    alignItems: 'center',
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sportChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sportChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AEAEB2',
    letterSpacing: 0.2,
  },
  sportChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sportLogo: {
    width: 16,
    height: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  retryButtonText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { PlayerCard } from '../components/PlayerCard';
import { PlayerPropsModal } from '../components/PlayerPropsModal';
import { PlayerProp as OldPlayerProp, GameOption, Team } from '../types/playerProp';
import { SportsAPI, RealPlayer, ESPNGame } from '../services/sportsApi';
import { PropsCalculator, PlayerStats } from '../services/propsCalculator';
import { PlayerPropsService, PlayerProp } from '../services/playerPropsService';
import { GameSelectorModal } from '../components/GameSelectorModal';
import { GameFilterButton } from '../components/GameFilterButton';
import { isCollegeFootballSeason, isCollegeBasketballSeason, getSeasonInfo } from '../services/seasonDetector';
import { NCAAFootballLogo } from '../components/logos/NCAAFootballLogo';

const { width } = Dimensions.get('window');

type Sport = 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB';

type FilterType = 'all' | 'prop' | 'team' | 'confidence';

export function HomeScreen({ navigation }: any) {
  const [selectedSport, setSelectedSport] = useState<Sport>('NBA');
  const [props, setProps] = useState<OldPlayerProp[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal and filtering state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedPlayerProps, setSelectedPlayerProps] = useState<PlayerProp[]>([]);
  const [propTypeFilter, setPropTypeFilter] = useState<string>('All');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('All');
  const [activeFilterModal, setActiveFilterModal] = useState<'propType' | 'confidence' | null>(null);

  // Game filter state
  const [games, setGames] = useState<GameOption[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>('all');
  const [gameModalVisible, setGameModalVisible] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(false);

  // Determine which sports to show based on season
  const allSports: { label: Sport; logo?: any; isInSeason?: boolean; useSvg?: boolean }[] = [
    {
      label: 'NBA',
      logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
      isInSeason: true
    },
    {
      label: 'NFL',
      logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
      isInSeason: true
    },
    {
      label: 'MLB',
      logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
      isInSeason: true
    },
    {
      label: 'NHL',
      logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
      isInSeason: true
    },
    {
      label: 'NCAAF',
      isInSeason: isCollegeFootballSeason(),
      useSvg: true
    },
    {
      label: 'NCAAB',
      logo: require('../assets/logos/ncaa-basketball.png'),
      isInSeason: isCollegeBasketballSeason()
    },
  ];

  // Filter to only show sports that are in season
  const sports = allSports.filter(sport => sport.isInSeason);

  // Note: getPropTypesBySport and generatePropsFromRealPlayers removed
  // Now using PlayerPropsService which handles all prop generation

  // Convert new PlayerProp format to old format for UI compatibility
  const convertNewPropToOld = (newProp: PlayerProp): OldPlayerProp => {
    // Calculate projection from recent games
    const projection = newProp.recentGames.length > 0
      ? newProp.recentGames.reduce((sum, g) => sum + g.value, 0) / newProp.recentGames.length
      : newProp.seasonAverage;

    // Calculate vsOpponentAverage (use season average as fallback)
    const vsOpponentAverage = newProp.seasonAverage;

    // Determine over/under
    const over = newProp.recommendation === 'OVER';

    // Calculate trend based on recent games
    const trend: 'up' | 'down' | 'stable' = newProp.recentGames.length >= 3
      ? (() => {
          const firstHalf = newProp.recentGames.slice(0, Math.floor(newProp.recentGames.length / 2));
          const secondHalf = newProp.recentGames.slice(Math.floor(newProp.recentGames.length / 2));
          const firstAvg = firstHalf.reduce((sum, g) => sum + g.value, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((sum, g) => sum + g.value, 0) / secondHalf.length;
          const diff = ((secondAvg - firstAvg) / firstAvg) * 100;
          return diff > 10 ? 'up' : diff < -10 ? 'down' : 'stable';
        })()
      : 'stable';

    // Calculate hit rate
    const hitRate = newProp.recentGames.length > 0
      ? (newProp.recentGames.filter(g => over ? g.value > newProp.line : g.value < newProp.line).length / newProp.recentGames.length) * 100
      : 50;

    // Generate reasoning
    const reasoning = `${newProp.playerName} ${newProp.recommendation === 'OVER' ? 'trending over' : 'trending under'} ${newProp.line} ${newProp.statType.toLowerCase()} with ${newProp.confidence}% confidence`;

    return {
      id: newProp.id,
      playerId: newProp.playerId,
      playerName: newProp.playerName,
      playerImage: newProp.headshot,
      team: newProp.team.abbreviation,
      teamLogo: newProp.team.logo,
      opponent: newProp.opponent.abbreviation,
      opponentLogo: newProp.opponent.logo,
      sport: newProp.sport,
      propType: newProp.statType,
      line: newProp.line,
      projection: Math.round(projection * 10) / 10,
      confidence: newProp.confidence,
      over,
      gameTime: newProp.gameTime,
      recentGames: newProp.recentGames.map(g => g.value),
      seasonAverage: newProp.seasonAverage,
      vsOpponentAverage,
      trend,
      hitRate: Math.round(hitRate),
      reasoning,
      // Game filter fields
      gameId: newProp.gameId,
      gameName: newProp.gameName,
      gameStatus: newProp.gameStatus,
      homeTeam: newProp.homeTeam,
      awayTeam: newProp.awayTeam,
      // College-specific fields
      classYear: newProp.classYear,
      conference: newProp.conference,
    };
  };

  // Fetch real-time data using PlayerPropsService
  const fetchPropsData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log(`Fetching real props for ${selectedSport} using PlayerPropsService...`);

      // Use the new PlayerPropsService to get props based on sport
      let newProps: PlayerProp[] = [];

      switch (selectedSport) {
        case 'NBA':
          newProps = await PlayerPropsService.getNBAProps();
          break;
        case 'NFL':
          newProps = await PlayerPropsService.getNFLProps();
          break;
        case 'MLB':
          newProps = await PlayerPropsService.getMLBProps();
          break;
        case 'NHL':
          newProps = await PlayerPropsService.getNHLProps();
          break;
        case 'NCAAF':
          newProps = await PlayerPropsService.getNCAAFProps();
          break;
        case 'NCAAB':
          newProps = await PlayerPropsService.getNCAABProps();
          break;
      }

      if (newProps.length === 0) {
        console.log(`No real props found for ${selectedSport}`);
        setError('No games scheduled today.');
        setProps([]);
      } else {
        console.log(`Loaded ${newProps.length} real props for ${selectedSport}`);
        // Convert new format to old format for UI compatibility
        const convertedProps = newProps.map(convertNewPropToOld);
        console.log(`Converted ${convertedProps.length} props`);
        console.log(`First converted prop:`, JSON.stringify(convertedProps[0], null, 2));
        setProps(convertedProps);
      }
    } catch (err) {
      console.error('Error fetching props:', err);
      setError('Failed to load props.');
      setProps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch games data for game filter
  const fetchGamesData = async () => {
    setGamesLoading(true);
    try {
      const { games: espnGames } = await SportsAPI.getScoreboardBySport(selectedSport);

      // Create "All Games" option
      const allGamesOption: GameOption = {
        id: 'all',
        name: 'All Games',
        homeTeam: { name: '', abbreviation: '', logo: '' },
        awayTeam: { name: '', abbreviation: '', logo: '' },
        gameTime: '',
        status: 'upcoming',
      };

      // Convert ESPN games to GameOption format
      const gameOptions: GameOption[] = espnGames.map((game: ESPNGame) => {
        const competition = game.competitions[0];
        const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
        const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

        const isLive = !competition.status.type.completed &&
          (competition.status.type.description.toLowerCase().includes('in progress') ||
           competition.status.type.description.toLowerCase().includes('halftime') ||
           competition.status.type.description.toLowerCase().includes('1st') ||
           competition.status.type.description.toLowerCase().includes('2nd') ||
           competition.status.type.description.toLowerCase().includes('3rd') ||
           competition.status.type.description.toLowerCase().includes('4th') ||
           competition.status.type.description.toLowerCase().includes('ot'));

        const status: 'upcoming' | 'live' | 'completed' =
          competition.status.type.completed ? 'completed' :
          isLive ? 'live' : 'upcoming';

        // Format game time
        const gameDate = new Date(competition.date);
        const gameTime = gameDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        return {
          id: game.id,
          name: game.shortName || game.name, // e.g., "LAL @ BOS"
          homeTeam: {
            name: homeTeam?.team.displayName || '',
            abbreviation: homeTeam?.team.abbreviation || '',
            logo: homeTeam?.team.logo || '',
          },
          awayTeam: {
            name: awayTeam?.team.displayName || '',
            abbreviation: awayTeam?.team.abbreviation || '',
            logo: awayTeam?.team.logo || '',
          },
          gameTime,
          status,
          score: status === 'completed' || status === 'live' ? {
            home: homeTeam?.score || '0',
            away: awayTeam?.score || '0',
          } : undefined,
        };
      });

      setGames([allGamesOption, ...gameOptions]);
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([{
        id: 'all',
        name: 'All Games',
        homeTeam: { name: '', abbreviation: '', logo: '' },
        awayTeam: { name: '', abbreviation: '', logo: '' },
        gameTime: '',
        status: 'upcoming',
      }]);
    } finally {
      setGamesLoading(false);
    }
  };

  // Fetch data on mount and when sport changes
  useEffect(() => {
    fetchPropsData();
    fetchGamesData();
    // Reset game filter when sport changes
    setSelectedGameId('all');
  }, [selectedSport]);

  const handleRefresh = () => {
    fetchPropsData(true);
    fetchGamesData();
  };

  // Group props by player
  const groupedPlayers = React.useMemo(() => {
    console.log(`Grouping ${props.length} props for sport: ${selectedSport}`);
    console.log(`First prop sport:`, props[0]?.sport);
    let filtered = props.filter(prop => prop.sport === selectedSport);
    console.log(`After sport/status filter: ${filtered.length} props`);

    // Apply game filter
    if (selectedGameId !== 'all') {
      filtered = filtered.filter(prop => prop.gameId === selectedGameId);
      console.log(`After game filter: ${filtered.length} props`);
    }

    // Apply prop type filter
    if (propTypeFilter !== 'All') {
      filtered = filtered.filter(prop => prop.propType === propTypeFilter);
    }

    // Apply confidence filter
    if (confidenceFilter !== 'All') {
      if (confidenceFilter === 'High') {
        filtered = filtered.filter(prop => prop.confidence >= 85);
      } else if (confidenceFilter === 'Medium') {
        filtered = filtered.filter(prop => prop.confidence >= 70 && prop.confidence < 85);
      } else if (confidenceFilter === 'Low') {
        filtered = filtered.filter(prop => prop.confidence < 70);
      }
    }

    // Group by player name
    const grouped: { [key: string]: OldPlayerProp[] } = {};
    filtered.forEach(prop => {
      if (!grouped[prop.playerName]) {
        grouped[prop.playerName] = [];
      }
      grouped[prop.playerName].push(prop);
    });

    return grouped;
  }, [props, selectedSport, selectedGameId, propTypeFilter, confidenceFilter]);

  const playerNames = Object.keys(groupedPlayers);

  // Get available prop types for the current sport
  const availablePropTypes = React.useMemo(() => {
    const types = new Set(
      props.filter(prop => prop.sport === selectedSport).map(prop => prop.propType)
    );
    return ['All', ...Array.from(types)];
  }, [props, selectedSport]);

  const confidenceOptions = ['All', 'High', 'Medium', 'Low'];

  const closeFilterModal = () => setActiveFilterModal(null);

  const handleFilterOptionSelect = (option: string) => {
    if (activeFilterModal === 'propType') {
      setPropTypeFilter(option);
    } else if (activeFilterModal === 'confidence') {
      setConfidenceFilter(option);
    }
    closeFilterModal();
  };

  const activeModalOptions = activeFilterModal === 'propType'
    ? availablePropTypes
    : confidenceOptions;

  const handlePlayerPress = (playerName: string) => {
    setSelectedPlayer(playerName);
    setSelectedPlayerProps(groupedPlayers[playerName] || []);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>PropGPT</Text>
          </View>
          <BlurView intensity={60} tint="dark" style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </BlurView>
        </View>

        {/* Sports Selector with Game Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sportsScroll}
          contentContainerStyle={styles.sportsContent}
        >
          {/* Game Filter Button (inline with sports - left side) */}
          <GameFilterButton
            selectedGameName={games.find(g => g.id === selectedGameId)?.name || 'All Games'}
            onPress={() => setGameModalVisible(true)}
            disabled={gamesLoading || games.length === 0}
          />

          {sports.map((sport) => (
            <TouchableOpacity
              key={sport.label}
              onPress={() => setSelectedSport(sport.label)}
              activeOpacity={0.8}
              style={[
                styles.sportButton,
                selectedSport === sport.label && styles.sportButtonActive,
              ]}
            >
              {sport.useSvg ? (
                <View style={styles.sportLogo}>
                  {sport.label === 'NCAAF' && (
                    <NCAAFootballLogo width={24} height={24} />
                  )}
                </View>
              ) : sport.logo ? (
                <Image
                  source={typeof sport.logo === 'string' ? { uri: sport.logo } : sport.logo}
                  style={styles.sportLogo}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="star" size={20} color="#F59E0B" />
              )}
              <Text
                style={[
                  styles.sportLabel,
                  selectedSport === sport.label && styles.sportLabelActive,
                ]}
              >
                {sport.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Compact Filters */}
        <View style={styles.compactFiltersCard}>
          <View style={styles.compactFiltersHeader}>
            <Text style={styles.compactFiltersTitle}>Quick Filters</Text>
            <Text style={styles.compactFiltersSubtitle}>
              {loading ? 'Loading…' : `${playerNames.length} players`}
            </Text>
          </View>
          <View style={styles.filterDropdownRow}>
            <TouchableOpacity
              style={styles.filterDropdown}
              activeOpacity={0.8}
              onPress={() => setActiveFilterModal('propType')}
            >
              <View>
                <Text style={styles.filterDropdownLabel}>Prop Type</Text>
                <Text style={styles.filterDropdownValue} numberOfLines={1}>
                  {propTypeFilter}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterDropdown}
              activeOpacity={0.8}
              onPress={() => setActiveFilterModal('confidence')}
            >
              <View>
                <Text style={styles.filterDropdownLabel}>Confidence</Text>
                <Text style={styles.filterDropdownValue} numberOfLines={1}>
                  {confidenceFilter}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Players List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedSport} Players
            </Text>
            <Text style={styles.sectionSubtitle}>
              {loading ? 'Loading...' : `${playerNames.length} players`}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Calculating props...</Text>
            </View>
          )}

          {/* Players List */}
          {!loading && playerNames.map((playerName) => (
            <PlayerCard
              key={playerName}
              playerName={playerName}
              playerProps={groupedPlayers[playerName]}
              onPress={() => handlePlayerPress(playerName)}
            />
          ))}

          {/* Empty State */}
          {!loading && playerNames.length === 0 && !error && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No players match your filters</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Player Props Modal */}
      <PlayerPropsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        playerProps={selectedPlayerProps}
        playerName={selectedPlayer}
        onPropPress={(prop) => {
          // Navigate first, then close modal after a brief delay for smoother transition
          navigation.navigate('PlayerDetail', { prop });
          setTimeout(() => setModalVisible(false), 150);
        }}
      />

      {/* Game Selector Modal */}
      <GameSelectorModal
        visible={gameModalVisible}
        onClose={() => setGameModalVisible(false)}
        games={games}
        selectedGameId={selectedGameId}
        sport={selectedSport}
        onSelectGame={(gameId) => setSelectedGameId(gameId)}
        onNavigateToLive={(gameId) => {
          // Navigate to Games tab (Live games)
          navigation.navigate('Games');
        }}
        onNavigateToBoxScore={(gameId, sport) => {
          // Navigate to Games tab and then to GameDetail screen
          navigation.navigate('Games', {
            screen: 'GameDetail',
            params: {
              gameId,
              sport: sport as 'NBA' | 'NFL' | 'MLB' | 'NHL',
            },
          });
        }}
      />

      {/* Filter Picker Modal */}
      <Modal
        visible={activeFilterModal !== null}
        transparent
        animationType="fade"
        onRequestClose={closeFilterModal}
      >
        <View style={styles.filterModalOverlay}>
          <TouchableWithoutFeedback onPress={closeFilterModal}>
            <View style={styles.filterModalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>
                Select {activeFilterModal === 'propType' ? 'Prop Type' : 'Confidence'}
              </Text>
              <TouchableOpacity onPress={closeFilterModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            {activeModalOptions.map((option) => {
              const isActive = activeFilterModal === 'propType'
                ? propTypeFilter === option
                : confidenceFilter === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.filterModalOption, isActive && styles.filterModalOptionActive]}
                  onPress={() => handleFilterOptionSelect(option)}
                >
                  <Text style={[styles.filterModalOptionText, isActive && styles.filterModalOptionTextActive]}>
                    {option}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color="#EF4444" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
  },
  profileIcon: {
    fontSize: 20,
  },
  sportsScroll: {
    marginBottom: 12,
  },
  sportsContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  sportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sportButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  sportLogo: {
    width: 18,
    height: 18,
  },
  sportIcon: {
    fontSize: 16,
  },
  sportLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AEAEB2',
    letterSpacing: 0.2,
  },
  sportLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#AEAEB2',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  compactFiltersCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  compactFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactFiltersTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  compactFiltersSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  filterDropdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterDropdown: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterDropdownLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  filterDropdownValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  filterModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  filterModalCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 4,
    borderRadius: 16,
  },
  filterModalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterModalOptionActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  filterModalOptionText: {
    fontSize: 15,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  filterModalOptionTextActive: {
    color: '#FFFFFF',
  },
});

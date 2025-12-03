import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameOption } from '../types/playerProp';
import { LiveBadge } from './LiveBadge';
import { ConferenceFilter } from './ConferenceFilter';
import { WeekNavigator } from './WeekNavigator';

interface GameSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  games: GameOption[];
  selectedGameId: string;
  onSelectGame: (gameId: string) => void;
  onNavigateToLive?: (gameId: string) => void;
  onNavigateToBoxScore?: (gameId: string, sport: string) => void;
  // College sports specific props
  sport?: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB';
  selectedConference?: string;
  onSelectConference?: (conference: string) => void;
  selectedWeek?: number;
  onSelectWeek?: (week: number) => void;
}

export const GameSelectorModal: React.FC<GameSelectorModalProps> = ({
  visible,
  onClose,
  games,
  selectedGameId,
  onSelectGame,
  onNavigateToLive,
  onNavigateToBoxScore,
  sport,
  selectedConference,
  onSelectConference,
  selectedWeek,
  onSelectWeek,
}) => {
  const isCollegeSport = sport === 'NCAAF' || sport === 'NCAAB';
  const isCollegeFootball = sport === 'NCAAF';
  const handleSelectGame = (gameId: string) => {
    const selectedGame = games.find(g => g.id === gameId);

    // If the game is live and onNavigateToLive is provided, navigate to Live tab
    if (selectedGame && selectedGame.status === 'live' && onNavigateToLive) {
      onNavigateToLive(gameId);
      onClose();
    }
    // If the game is completed and onNavigateToBoxScore is provided, navigate to box score
    else if (selectedGame && selectedGame.status === 'completed' && onNavigateToBoxScore && sport) {
      onNavigateToBoxScore(gameId, sport);
      onClose();
    }
    else {
      // Otherwise, just filter the props
      onSelectGame(gameId);
      onClose();
    }
  };

  const getStatusBadge = (game: GameOption) => {
    if (game.status === 'live') {
      return (
        <View style={[styles.statusBadge, styles.liveStatusBadge]}>
          <LiveBadge size="small" />
        </View>
      );
    } else if (game.status === 'completed' && game.score) {
      return (
        <View style={[styles.statusBadge, styles.completedBadge]}>
          <Text style={styles.statusText}>FINAL</Text>
        </View>
      );
    } else {
      return (
        <Text style={styles.gameTime}>{game.gameTime}</Text>
      );
    }
  };

  const renderGameCard = (game: GameOption) => {
    const isSelected = game.id === selectedGameId;
    const isAllGames = game.id === 'all';

    if (isAllGames) {
      return (
        <TouchableOpacity
          key={game.id}
          style={[styles.allGamesCard, isSelected && styles.selectedCard]}
          onPress={() => handleSelectGame(game.id)}
        >
          <Ionicons name="apps" size={24} color={isSelected ? '#fff' : '#EF4444'} />
          <Text style={[styles.allGamesText, isSelected && styles.selectedText]}>
            {game.name}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color="#EF4444" style={styles.checkmark} />
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={game.id}
        style={[styles.gameCard, isSelected && styles.selectedCard]}
        onPress={() => handleSelectGame(game.id)}
      >
        <View style={styles.gameHeader}>
          {getStatusBadge(game)}
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color="#EF4444" style={styles.checkmarkSmall} />
          )}
        </View>

        {/* Single Line Game Format: LAL @ BOS */}
        <View style={styles.gameLineContainer}>
          {/* Away Team */}
          <Image source={{ uri: game.awayTeam.logo }} style={styles.teamLogo} />
          <Text style={[styles.teamAbbr, isSelected && styles.selectedText]}>
            {game.awayTeam.abbreviation}
          </Text>
          {game.status === 'completed' && game.score && (
            <Text style={[styles.score, isSelected && styles.selectedText]}>
              {game.score.away}
            </Text>
          )}

          {/* @ Symbol */}
          <Text style={[styles.atSymbol, isSelected && styles.selectedText]}>@</Text>

          {/* Home Team */}
          {game.status === 'completed' && game.score && (
            <Text style={[styles.score, isSelected && styles.selectedText]}>
              {game.score.home}
            </Text>
          )}
          <Text style={[styles.teamAbbr, isSelected && styles.selectedText]}>
            {game.homeTeam.abbreviation}
          </Text>
          <Image source={{ uri: game.homeTeam.logo }} style={styles.teamLogo} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Game</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#999" />
            </TouchableOpacity>
          </View>

          {/* College Sports Filters */}
          {isCollegeSport && (
            <View style={styles.filtersContainer}>
              {/* Conference Filter (for both NCAAF and NCAAB) */}
              {selectedConference !== undefined && onSelectConference && (
                <ConferenceFilter
                  sport={sport}
                  selectedConference={selectedConference}
                  onSelectConference={onSelectConference}
                />
              )}

              {/* Week Navigator (NCAAF only) */}
              {isCollegeFootball && selectedWeek !== undefined && onSelectWeek && (
                <WeekNavigator
                  selectedWeek={selectedWeek}
                  onSelectWeek={onSelectWeek}
                />
              )}
            </View>
          )}

          {/* Games List */}
          <ScrollView style={styles.gamesList} showsVerticalScrollIndicator={false}>
            {games.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No games scheduled for today</Text>
              </View>
            ) : (
              games.map(game => renderGameCard(game))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  filtersContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  gamesList: {
    padding: 16,
  },
  allGamesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  allGamesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  selectedCard: {
    backgroundColor: '#3a1a1a',
    borderColor: '#EF4444',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedBadge: {
    backgroundColor: '#666',
  },
  liveStatusBadge: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  gameTime: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  gameLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  teamAbbr: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  score: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  atSymbol: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginHorizontal: 4,
  },
  selectedText: {
    color: '#fff',
  },
  checkmark: {
    marginLeft: 8,
  },
  checkmarkSmall: {
    marginLeft: 'auto',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

// BoxScoreModal - Real-time live box score with period-by-period breakdown
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Sport, GameStatus, Game } from '../types/game';
import { useBoxScore } from '../hooks/useBoxScore';
import { PlayerBoxScore } from './PlayerBoxScore';
import { TeamBoxScore } from './TeamBoxScore';
import { isHalftime } from '../utils/gameStatus';

interface BoxScoreModalProps {
  visible: boolean;
  onClose: () => void;
  game: Game;
}

type TabType = 'team' | 'player';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function BoxScoreModal({ visible, onClose, game }: BoxScoreModalProps) {
  const [selectedTab, setSelectedTab] = useState<TabType>('team');

  const { boxScore, loading, error, refresh, lastUpdated } = useBoxScore({
    gameId: game.id,
    sport: game.sport,
    gameStatus: game.status,
    enabled: visible,
  });

  const renderHeader = () => {
    const isLive = game.status === 'in_progress';
    const showHalfTime = isHalftime(game.sport, game.score.period, game.score.clock, game.statusText);

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Box Score</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Game Header */}
        <View style={styles.gameHeader}>
          {/* Away Team */}
          <View style={styles.teamSection}>
            <Image
              source={{ uri: game.awayTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <Text style={styles.teamName}>{game.awayTeam.abbreviation}</Text>
            <Text style={styles.scoreText}>{game.score.away}</Text>
          </View>

          {/* Center Info */}
          <View style={styles.centerInfo}>
            {(game.score.period && game.score.clock) || showHalfTime ? (
              <Text style={styles.periodText}>
                {showHalfTime
                  ? 'Half Time'
                  : `${getPeriodLabel(game.sport, game.score.period!)} - ${game.score.clock}`}
              </Text>
            ) : null}
            {isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveIndicator} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          {/* Home Team */}
          <View style={styles.teamSection}>
            <Image
              source={{ uri: game.homeTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <Text style={styles.teamName}>{game.homeTeam.abbreviation}</Text>
            <Text style={styles.scoreText}>{game.score.home}</Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'team' && styles.activeTab]}
            onPress={() => setSelectedTab('team')}
          >
            <Text style={[styles.tabText, selectedTab === 'team' && styles.activeTabText]}>
              Team Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'player' && styles.activeTab]}
            onPress={() => setSelectedTab('player')}
          >
            <Text style={[styles.tabText, selectedTab === 'player' && styles.activeTabText]}>
              Player Stats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Last Updated */}
        {lastUpdated && (
          <View style={styles.updateInfo}>
            <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.updateText}>
                Updated {getTimeSince(lastUpdated)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (loading && !boxScore) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="rgba(255,255,255,0.7)" />
          <Text style={styles.loadingText}>Loading box score...</Text>
        </View>
      );
    }

    if (error || !boxScore) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.4)" />
          <Text style={styles.errorText}>{error || 'Box score not available'}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (selectedTab === 'team') {
      return (
        <TeamBoxScore
          homeTeam={boxScore.teamStats.home}
          awayTeam={boxScore.teamStats.away}
          sport={game.sport}
        />
      );
    }

    return (
      <PlayerBoxScore
        homeTeamName={game.homeTeam.displayName}
        awayTeamName={game.awayTeam.displayName}
        homeTeamLogo={game.homeTeam.logo}
        awayTeamLogo={game.awayTeam.logo}
        homePlayers={boxScore.playerStats.home}
        awayPlayers={boxScore.playerStats.away}
        sport={game.sport}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {renderHeader()}
          <View style={styles.contentContainer}>
            {renderContent()}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

// Helper functions
function getPeriodLabel(sport: Sport, period: number): string {
  switch (sport) {
    case 'NBA':
      return period <= 4 ? `Q${period}` : `OT${period - 4}`;
    case 'NHL':
      return period <= 3 ? `P${period}` : `OT${period - 3}`;
    case 'NFL':
      return period <= 4 ? `Q${period}` : `OT`;
    case 'NCAAF':
      return period <= 4 ? `Q${period}` : `OT`;
    case 'MLB':
      return period <= 9 ? `Inn ${period}` : `Extra ${period}`;
    case 'NCAAB':
      return period === 1 ? '1st Half' : period === 2 ? '2nd Half' : `OT${period - 2}`;
    default:
      return `Period ${period}`;
  }
}

function getTimeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#0F0F0F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF0000',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF0000',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  teamLogo: {
    width: 48,
    height: 48,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  centerInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: '#1A1A1A',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  updateInfo: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  updateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  contentContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

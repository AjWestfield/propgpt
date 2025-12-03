import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { PlayerProp } from '../data/mockProps';
import { EnhancedBarChart } from './EnhancedBarChart';
import { usePlayerChartData } from '../hooks/usePlayerChartData';
import { PlayerAvatar } from './PlayerAvatar';
import { LiveBadge } from './LiveBadge';
import { useMyPicks } from '../contexts/MyPicksContext';

const { width } = Dimensions.get('window');

interface PlayerPropsModalProps {
  visible: boolean;
  onClose: () => void;
  playerProps: PlayerProp[];
  playerName: string;
  onPropPress?: (prop: PlayerProp) => void;
}

// Mini chart component for each prop
function PropMiniChart({ prop }: { prop: PlayerProp }) {
  const { chartData, loading, error } = usePlayerChartData(prop, 10, true, true);

  // If error or no data, show the "Last 5" boxes as fallback
  if (error || chartData.length === 0) {
    return (
      <View style={styles.recentGamesRow}>
        <Text style={styles.recentLabel}>Last 5: </Text>
        {prop.recentGames.slice(0, 5).map((value, idx) => (
          <View
            key={idx}
            style={[
              styles.gameValue,
              value > prop.line ? styles.gameValueOver : styles.gameValueUnder
            ]}
          >
            <Text style={styles.gameValueText}>{value}</Text>
          </View>
        ))}
        <Text style={styles.hitRateText}>Hit: {prop.hitRate}%</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.recentGamesRow}>
        <Text style={styles.recentLabel}>Loading chart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.miniChartContainer}>
      <EnhancedBarChart
        data={chartData}
        height={200}
        thresholdValue={prop.line}
        showThresholdLine={true}
        showValues={true}
        showLegend={true}
      />
    </View>
  );
}

export function PlayerPropsModal({ visible, onClose, playerProps, playerName, onPropPress }: PlayerPropsModalProps) {
  const { togglePick, isPicked } = useMyPicks();

  if (playerProps.length === 0) return null;

  const firstProp = playerProps[0];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              {/* Close Button - Top Right */}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Player Avatar - Centered */}
              <View style={styles.avatarContainer}>
                <PlayerAvatar
                  imageUrl={firstProp.playerImage}
                  teamLogo={firstProp.teamLogo}
                  size={110}
                  showTeamBadge={true}
                />
              </View>

              {/* Player Name and Live Indicator - Centered */}
              <View style={styles.nameAndLiveContainer}>
                <Text style={styles.playerName}>{playerName}</Text>
                {firstProp.isLive ? (
                  <LiveBadge />
                ) : (
                  <View style={styles.gameTimeContainer}>
                    <Ionicons name="time-outline" size={14} color="#AEAEB2" />
                    <Text style={styles.gameTime}>{firstProp.gameTime}</Text>
                  </View>
                )}
              </View>

              {/* Matchup Info - Centered */}
              <View style={styles.matchupContainer}>
                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: firstProp.teamLogo }}
                    style={styles.teamLogoLarge}
                    resizeMode="contain"
                  />
                  <Text style={styles.teamName}>{firstProp.team}</Text>
                </View>
                <Text style={styles.vsText}>VS</Text>
                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: firstProp.opponentLogo }}
                    style={styles.teamLogoLarge}
                    resizeMode="contain"
                  />
                  <Text style={styles.teamName}>{firstProp.opponent}</Text>
                </View>
              </View>
            </View>

            {/* Props List */}
            <ScrollView
              style={styles.propsScrollView}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>All Props for {playerName}</Text>
              {playerProps.map((prop, index) => {
                const isSaved = isPicked(prop.id);
                return (
                  <TouchableOpacity
                    key={prop.id}
                    style={styles.propItem}
                    onPress={() => onPropPress?.(prop)}
                    activeOpacity={0.7}
                    disabled={!onPropPress}
                  >
                    <View style={styles.propHeader}>
                      <Text style={styles.propType}>{prop.propType}</Text>
                      <View style={styles.propHeaderRight}>
                        <View style={styles.pickBadge}>
                          <Text style={[styles.pickText, prop.over ? styles.pickOver : styles.pickUnder]}>
                            {prop.over ? 'OVER' : 'UNDER'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.addButton, isSaved && styles.addButtonActive]}
                          onPress={(e) => {
                            e.stopPropagation();
                            togglePick(prop);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={isSaved ? 'checkmark' : 'add'}
                            size={16}
                            color={isSaved ? '#0F172A' : '#FFFFFF'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                  <View style={styles.propStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Line</Text>
                      <Text style={styles.statValue}>{prop.line}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Projection</Text>
                      <Text style={styles.statValueHighlight}>{prop.projection}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Confidence</Text>
                      <Text
                        style={[
                          styles.statValue,
                          {
                            color:
                              prop.confidence >= 85 ? '#10B981' :
                              prop.confidence >= 70 ? '#F59E0B' :
                              '#EF4444'
                          }
                        ]}
                      >
                        {prop.confidence}%
                      </Text>
                    </View>
                  </View>

                  {/* Mini Bar Chart */}
                  <PropMiniChart prop={prop} />

                  <Text style={styles.reasoning}>{prop.reasoning}</Text>

                  {onPropPress && (
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      activeOpacity={0.8}
                      onPress={() => onPropPress(prop)}
                    >
                      <Text style={styles.viewDetailsText}>View Full Analysis →</Text>
                    </TouchableOpacity>
                  )}

                  {index < playerProps.length - 1 && <View style={styles.divider} />}
                </TouchableOpacity>
              );
            })}
            </ScrollView>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  blurContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    position: 'relative',
  },
  avatarContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  nameAndLiveContainer: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  gameTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  playerName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  matchupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  teamContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  teamLogoLarge: {
    width: 40,
    height: 40,
  },
  vsText: {
    fontSize: 14,
    color: '#6E6E73',
    fontWeight: '700',
    letterSpacing: 1,
  },
  gameTime: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '500',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  propsScrollView: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  propItem: {
    marginBottom: 20,
  },
  propHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  propHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addButtonActive: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  pickBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pickText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pickOver: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10B981',
  },
  pickUnder: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#EF4444',
  },
  propStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#AEAEB2',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statValueHighlight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recentGamesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  recentLabel: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '600',
  },
  gameValue: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gameValueOver: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  gameValueUnder: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  gameValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hitRateText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 4,
  },
  reasoning: {
    fontSize: 13,
    color: '#AEAEB2',
    lineHeight: 18,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 16,
  },
  viewDetailsButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.2,
  },
  miniChartContainer: {
    marginVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 8,
  },
});

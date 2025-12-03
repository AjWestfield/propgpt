import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { PlayerProp } from '../types/playerProp';
import { EnhancedBarChart } from './EnhancedBarChart';
import { usePlayerChartData } from '../hooks/usePlayerChartData';
import { PlayerAvatar } from './PlayerAvatar';
import { LiveBadge } from './LiveBadge';
import { useMyPicks } from '../contexts/MyPicksContext';

interface PropCardProps {
  prop: PlayerProp;
  onPress?: () => void;
}

export function PropCard({ prop, onPress }: PropCardProps) {
  const [showChart, setShowChart] = useState(false);
  const { togglePick, isPicked } = useMyPicks();
  const isSaved = isPicked(prop.id);

  // Only fetch chart data when chart is expanded
  const { chartData, loading, error } = usePlayerChartData(
    showChart ? prop : null,
    5, // Show last 5 games in mini chart
    true, // Compact labels
    showChart // Only auto-fetch when expanded
  );

  const confidenceColor =
    prop.confidence >= 85 ? '#10B981' :
    prop.confidence >= 70 ? '#F59E0B' :
    '#EF4444';

  // Calculate trend from recent games
  const calculateTrend = () => {
    if (prop.recentGames.length < 2) return 'stable';
    const recent = prop.recentGames.slice(0, 3).reduce((sum, g) => sum + g.value, 0) / 3;
    const older = prop.recentGames.slice(3, 6).reduce((sum, g) => sum + g.value, 0) / Math.min(3, prop.recentGames.slice(3, 6).length || 1);
    if (recent > older * 1.1) return 'up';
    if (recent < older * 0.9) return 'down';
    return 'stable';
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
    return '#9CA3AF';
  };

  // Calculate hit rate from recent games
  const hitRate = prop.recentGames.length > 0
    ? Math.round((prop.recentGames.filter(g => g.value > prop.line).length / prop.recentGames.length) * 100)
    : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardOuterContainer}>
        <BlurView intensity={60} tint="dark" style={styles.cardBlur}>
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.headerRow}>
              <PlayerAvatar
                imageUrl={prop.headshot}
                teamLogo={prop.team.logo}
                size={72}
                showTeamBadge={true}
              />
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{prop.playerName}</Text>
                <View style={styles.matchupContainer}>
                  <View style={styles.teamContainer}>
                    <Text style={styles.teamName}>{prop.team.abbreviation}</Text>
                    <Image
                      source={{ uri: prop.team.logo }}
                      style={styles.teamLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.vsText}>vs</Text>
                  <View style={styles.teamContainer}>
                    <Text style={styles.teamName}>{prop.opponent.abbreviation}</Text>
                    <Image
                      source={{ uri: prop.opponent.logo }}
                      style={styles.teamLogo}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>
              <View style={styles.headerActions}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportText}>{prop.sport}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.addButton, isSaved && styles.addButtonActive]}
                  onPress={() => togglePick(prop)}
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

            {/* Prop Info */}
            <View style={styles.propRow}>
              <Text style={styles.propType}>{prop.statType}</Text>
              <View style={styles.lineContainer}>
                <Text style={styles.lineLabel}>Line:</Text>
                <Text style={styles.lineValue}>{prop.line}</Text>
              </View>
            </View>

            {/* Season Avg & Confidence */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Season Avg</Text>
                <View style={styles.projectionRow}>
                  <Text style={styles.projectionValue}>{prop.seasonAverage.toFixed(1)}</Text>
                  <Text style={[styles.pick, prop.recommendation === 'OVER' ? styles.pickOver : styles.pickUnder]}>
                    {prop.recommendation}
                  </Text>
                  <Ionicons name={getTrendIcon() as any} size={16} color={getTrendColor()} />
                </View>
              </View>

              <View style={styles.confidenceBox}>
                <Text style={styles.statLabel}>Confidence</Text>
                <View style={styles.confidenceRow}>
                  <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
                    {prop.confidence}%
                  </Text>
                  <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
                </View>
              </View>
            </View>

            {/* Recent Form */}
            <View style={styles.recentGamesRow}>
              <Text style={styles.recentLabel}>L5: </Text>
              {prop.recentGames.slice(0, 5).map((game, index) => (
                <View
                  key={index}
                  style={[
                    styles.gameValue,
                    game.value > prop.line ? styles.gameValueOver : styles.gameValueUnder
                  ]}
                >
                  <Text style={styles.gameValueText}>{game.value}</Text>
                </View>
              ))}
            </View>

            {/* View Trend Button */}
            <TouchableOpacity
              onPress={() => setShowChart(!showChart)}
              style={styles.viewTrendButton}
              activeOpacity={0.7}
            >
              <Text style={styles.viewTrendText}>
                {showChart ? 'Hide Trend ▲' : 'View Trend ▼'}
              </Text>
            </TouchableOpacity>

            {/* Mini Chart (Collapsible) */}
            {showChart && (
              <View style={styles.miniChartContainer}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#10B981" />
                    <Text style={styles.loadingText}>Loading trend data...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <Text style={styles.errorSubtext}>Showing recent form instead</Text>
                  </View>
                ) : chartData.length > 0 ? (
                  <EnhancedBarChart
                    data={chartData}
                    height={140}
                    thresholdValue={prop.line}
                    showThresholdLine={true}
                    showValues={false}
                    showLegend={false}
                    containerStyle={styles.miniChart}
                  />
                ) : null}
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              {prop.isLive ? (
                <LiveBadge />
              ) : (
                <View style={styles.gameTimeContainer}>
                  <Ionicons name="time-outline" size={14} color="#E5E5E7" />
                  <Text style={styles.gameTime}>{prop.gameTime}</Text>
                </View>
              )}
              <Text style={styles.hitRate}>Hit Rate: {hitRate}%</Text>
            </View>
          </View>
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardOuterContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardBlur: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
  },
  cardContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  matchupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamName: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '600',
  },
  teamLogo: {
    width: 20,
    height: 20,
  },
  vsText: {
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: '500',
    marginHorizontal: 2,
  },
  sportBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  addButtonActive: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  propRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
  },
  propType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E5E7',
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lineLabel: {
    fontSize: 14,
    color: '#AEAEB2',
  },
  lineValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.5)',
    padding: 14,
    borderRadius: 18,
  },
  confidenceBox: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.5)',
    padding: 14,
    borderRadius: 18,
  },
  statLabel: {
    fontSize: 12,
    color: '#AEAEB2',
    marginBottom: 6,
    fontWeight: '500',
  },
  projectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pick: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
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
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  confidenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  recentGamesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
  },
  recentLabel: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '600',
    marginRight: 8,
  },
  gameValue: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  gameValueOver: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  gameValueUnder: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  gameValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gameTime: {
    fontSize: 13,
    color: '#E5E5E7',
    fontWeight: '500',
  },
  hitRate: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  viewTrendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  viewTrendText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.3,
  },
  miniChartContainer: {
    marginBottom: 16,
  },
  miniChart: {
    marginBottom: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 11,
    color: '#AEAEB2',
    fontWeight: '500',
    textAlign: 'center',
  },
});

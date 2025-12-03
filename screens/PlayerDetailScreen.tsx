import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { PlayerProp } from '../services/playerPropsService';
import { EnhancedBarChart } from '../components/EnhancedBarChart';
import { usePlayerChartData } from '../hooks/usePlayerChartData';
import { formatStatValue, getTrendEmoji } from '../utils/chartDataFormatter';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { LiveBadge } from '../components/LiveBadge';

interface PlayerDetailScreenProps {
  route: {
    params: {
      prop: PlayerProp;
    };
  };
}

export function PlayerDetailScreen({ route }: PlayerDetailScreenProps) {
  const { prop } = route.params;

  const {
    chartData,
    hitRateData,
    trend,
    seasonAverage,
    last5Average,
    last10Average,
    loading,
    error,
    refresh,
  } = usePlayerChartData(prop, 10, false, true);

  const confidenceColor =
    prop.confidence >= 85 ? '#10B981' :
    prop.confidence >= 70 ? '#F59E0B' :
    '#EF4444';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* Player Header */}
        <View style={styles.header}>
          {/* Player Avatar - Centered */}
          <View style={styles.avatarContainer}>
            <PlayerAvatar
              imageUrl={prop.headshot}
              teamLogo={prop.team.logo}
              size={110}
              showTeamBadge={true}
            />
          </View>

          {/* Player Name and Live Indicator - Centered */}
          <View style={styles.nameAndLiveContainer}>
            <Text style={styles.playerName}>{prop.playerName}</Text>
            {prop.isLive ? (
              <LiveBadge />
            ) : (
              <View style={styles.gameTimeContainer}>
                <Ionicons name="time-outline" size={14} color="#E5E5E7" />
                <Text style={styles.gameTime}>{prop.gameTime}</Text>
              </View>
            )}
          </View>

          {/* Matchup Info - Centered */}
          <View style={styles.matchupContainer}>
            <View style={styles.teamContainer}>
              <Image
                source={{ uri: prop.team.logo }}
                style={styles.teamLogoLarge}
                resizeMode="contain"
              />
              <Text style={styles.teamName}>{prop.team.abbreviation}</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.teamContainer}>
              <Image
                source={{ uri: prop.opponent.logo }}
                style={styles.teamLogoLarge}
                resizeMode="contain"
              />
              <Text style={styles.teamName}>{prop.opponent.abbreviation}</Text>
            </View>
          </View>
        </View>

        {/* Current Prop */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Prop</Text>
          <BlurView intensity={60} tint="dark" style={styles.propCard}>
            <View style={styles.propCardContent}>
              <View style={styles.propRow}>
                <Text style={styles.propType}>{prop.statType}</Text>
                <View style={styles.lineContainer}>
                  <Text style={styles.lineLabel}>Line:</Text>
                  <Text style={styles.lineValue}>{prop.line}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Season Avg</Text>
                  <View style={styles.projectionRow}>
                    <Text style={styles.projectionValue}>{prop.seasonAverage.toFixed(1)}</Text>
                    <Text style={[styles.pick, prop.recommendation === 'OVER' ? styles.pickOver : styles.pickUnder]}>
                      {prop.recommendation}
                    </Text>
                  </View>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Confidence</Text>
                  <View style={styles.confidenceRow}>
                    <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
                      {prop.confidence}%
                    </Text>
                    <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
                  </View>
                </View>
              </View>

              <View style={styles.reasoningContainer}>
                <Text style={styles.reasoningLabel}>Position:</Text>
                <Text style={styles.reasoningText}>{prop.position || 'N/A'}</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Performance Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bar-chart" size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Last 10 Games</Text>
          </View>
          {loading && chartData.length === 0 ? (
            <BlurView intensity={60} tint="dark" style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading performance data...</Text>
            </BlurView>
          ) : error ? (
            <BlurView intensity={60} tint="dark" style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <Text style={styles.errorSubtext}>Using cached data</Text>
            </BlurView>
          ) : (
            <EnhancedBarChart
              data={chartData}
              title={`${prop.statType} Performance`}
              subtitle="Last 10 games vs betting line"
              height={300}
              thresholdValue={prop.line}
              showThresholdLine={true}
              showValues={true}
              showLegend={true}
            />
          )}
        </View>

        {/* Stats Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Stats Breakdown</Text>
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              label="Season Avg"
              value={formatStatValue(seasonAverage, prop.statType)}
              iconName="calendar"
              color="#007AFF"
            />
            <StatCard
              label="L5 Avg"
              value={formatStatValue(last5Average, prop.statType)}
              iconName="flame"
              color="#F59E0B"
            />
            <StatCard
              label="L10 Avg"
              value={formatStatValue(last10Average, prop.statType)}
              iconName="bar-chart"
              color="#8B5CF6"
            />
            <StatCard
              label="Line"
              value={formatStatValue(prop.line, prop.statType)}
              iconName="shield"
              color="#EF4444"
            />
          </View>
        </View>

        {/* Hit Rate Analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart-outline" size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Hit Rate Analysis</Text>
          </View>
          <BlurView intensity={60} tint="dark" style={styles.hitRateCard}>
            <View style={styles.hitRateCardContent}>
              <View style={styles.hitRateHeader}>
                <View style={styles.hitRateCircle}>
                  <Text style={[styles.hitRatePercentage, { color: confidenceColor }]}>
                    {hitRateData.hitRate}%
                  </Text>
                  <Text style={styles.hitRateLabel}>Hit Rate</Text>
                </View>
                <View style={styles.hitRateStats}>
                  <View style={styles.hitRateStat}>
                    <Text style={styles.hitRateStatValue}>{hitRateData.hits}</Text>
                    <Text style={styles.hitRateStatLabel}>Overs</Text>
                  </View>
                  <View style={styles.hitRateStat}>
                    <Text style={styles.hitRateStatValue}>{hitRateData.misses}</Text>
                    <Text style={styles.hitRateStatLabel}>Unders</Text>
                  </View>
                  {hitRateData.pushes > 0 && (
                    <View style={styles.hitRateStat}>
                      <Text style={styles.hitRateStatValue}>{hitRateData.pushes}</Text>
                      <Text style={styles.hitRateStatLabel}>Pushes</Text>
                    </View>
                  )}
                </View>
              </View>

              {hitRateData.streak.count > 0 && (
                <View style={styles.streakContainer}>
                  <Text style={styles.streakLabel}>Current Streak:</Text>
                  <Text style={[
                    styles.streakValue,
                    { color: hitRateData.streak.type === 'over' ? '#10B981' : '#EF4444' }
                  ]}>
                    {hitRateData.streak.count} {hitRateData.streak.type.toUpperCase()} in a row
                  </Text>
                </View>
              )}
            </View>
          </BlurView>
        </View>

        {/* Trend Analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pulse" size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Trend Analysis</Text>
          </View>
          <BlurView intensity={60} tint="dark" style={styles.trendCard}>
            <View style={styles.trendCardContent}>
              <Text style={styles.trendEmoji}>{getTrendEmoji(trend)}</Text>
              <Text style={styles.trendText}>
                {trend === 'up' && 'Trending upward - Player is heating up'}
                {trend === 'down' && 'Trending downward - Recent dip in performance'}
                {trend === 'stable' && 'Stable performance - Consistent production'}
              </Text>
              <Text style={styles.trendDetail}>
                Based on last 10 games performance analysis
              </Text>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  iconName,
  color,
}: {
  label: string;
  value: string;
  iconName: string;
  color: string;
}) {
  return (
    <BlurView intensity={60} tint="dark" style={styles.statCard}>
      <View style={[styles.statCardIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={iconName as any} size={24} color={color} />
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#E5E5E7',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  propCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.2)',
  },
  propCardContent: {
    padding: 20,
  },
  propRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
  },
  propType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E5E5E7',
    letterSpacing: -0.3,
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
    fontSize: 20,
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
    padding: 16,
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
    gap: 8,
  },
  projectionValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pick: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontSize: 22,
    fontWeight: '700',
  },
  confidenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reasoningContainer: {
    paddingTop: 16,
  },
  reasoningLabel: {
    fontSize: 12,
    color: '#AEAEB2',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasoningText: {
    fontSize: 14,
    color: '#E5E5E7',
    lineHeight: 20,
    fontWeight: '500',
  },
  loadingCard: {
    padding: 48,
    borderRadius: 24,
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.2)',
  },
  loadingText: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  errorCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#AEAEB2',
    fontWeight: '500',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.2)',
  },
  statCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#AEAEB2',
    fontWeight: '600',
  },
  hitRateCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.2)',
  },
  hitRateCardContent: {
    padding: 24,
  },
  hitRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 20,
  },
  hitRateCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitRatePercentage: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  hitRateLabel: {
    fontSize: 11,
    color: '#AEAEB2',
    fontWeight: '600',
  },
  hitRateStats: {
    flex: 1,
    gap: 12,
  },
  hitRateStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hitRateStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hitRateStatLabel: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  streakContainer: {
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 12,
    color: '#AEAEB2',
    fontWeight: '600',
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  trendCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.2)',
  },
  trendCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  trendEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  trendDetail: {
    fontSize: 13,
    color: '#AEAEB2',
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
});

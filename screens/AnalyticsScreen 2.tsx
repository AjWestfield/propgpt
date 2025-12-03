import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { mockPlayerProps, PlayerProp } from '../data/mockProps';
import { BarChart, BarChartDataPoint } from '../components/BarChart';
import { ComparisonBars, ComparisonBarData } from '../components/ComparisonBars';
import { EnhancedBarChart } from '../components/EnhancedBarChart';
import { usePlayerChartData } from '../hooks/usePlayerChartData';

const { width } = Dimensions.get('window');

export function AnalyticsScreen() {
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Get featured player (first prop by default)
  const featuredPlayer = mockPlayerProps[selectedPlayerIndex] || mockPlayerProps[0];

  // Fetch real chart data for featured player
  const { chartData, loading, error, refresh } = usePlayerChartData(
    featuredPlayer,
    10,
    false,
    true
  );

  const totalProps = mockPlayerProps.length;
  const highConfidence = mockPlayerProps.filter(p => p.confidence >= 85).length;
  const avgConfidence = Math.round(
    mockPlayerProps.reduce((sum, p) => sum + p.confidence, 0) / totalProps
  );
  const trendingUp = mockPlayerProps.filter(p => p.trend === 'up').length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const sportBreakdown = {
    NBA: mockPlayerProps.filter(p => p.sport === 'NBA').length,
    NFL: mockPlayerProps.filter(p => p.sport === 'NFL').length,
    MLB: mockPlayerProps.filter(p => p.sport === 'MLB').length,
    NHL: mockPlayerProps.filter(p => p.sport === 'NHL').length,
  };

  const topPerformers = mockPlayerProps
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  // Sample data for player performance chart (last 10 games)
  const performanceData: BarChartDataPoint[] = [
    { x: '10/27', y: 159, label: '159' },
    { x: '11/03', y: 159, label: '159' },
    { x: '11/10', y: 66, label: '66' },
    { x: '11/14', y: 146, label: '146' },
    { x: '11/24', y: 256, label: '256' },
    { x: '12/01', y: 54, label: '54' },
    { x: '12/08', y: 124, label: '124' },
    { x: '12/15', y: 65, label: '65' },
    { x: '12/22', y: 150, label: '150' },
    { x: '12/29', y: 167, label: '167' },
  ];

  // Sample comparison data (projected vs actual fantasy points)
  const comparisonData: ComparisonBarData[] = [
    { label: 'Projected Fantasy Points (Half PPR)', value1: 11.98, value2: 18.67 },
    { label: 'Avg Fantasy Points (PPR)', value1: 14.40, value2: 21.61 },
    { label: 'Avg Fantasy Points (Half PPR)', value1: 13.20, value2: 19.85 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Real-time insights & stats</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Today's Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Total Props"
              value={totalProps.toString()}
              icon="🎯"
            />
            <StatCard
              label="High Confidence"
              value={highConfidence.toString()}
              icon="⭐"
            />
            <StatCard
              label="Avg Confidence"
              value={`${avgConfidence}%`}
              icon="📈"
            />
            <StatCard
              label="Trending Up"
              value={trendingUp.toString()}
              icon="🔥"
            />
          </View>
        </View>

        {/* Sport Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Sport Breakdown</Text>
          <View style={styles.sportBreakdown}>
            {Object.entries(sportBreakdown).map(([sport, count]) => (
              <SportBreakdownCard key={sport} sport={sport} count={count} />
            ))}
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Top Confidence Props</Text>
          {topPerformers.map((prop, index) => (
            <TopPerformerCard key={prop.id} prop={prop} rank={index + 1} />
          ))}
        </View>

        {/* Confidence Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📉 Confidence Distribution</Text>
          <BlurView intensity={60} tint="dark" style={styles.chartCard}>
            <View style={styles.chartContent}>
              <ConfidenceBar
                label="85-100%"
                count={mockPlayerProps.filter(p => p.confidence >= 85).length}
                color="#10B981"
                total={totalProps}
              />
              <ConfidenceBar
                label="70-84%"
                count={mockPlayerProps.filter(p => p.confidence >= 70 && p.confidence < 85).length}
                color="#F59E0B"
                total={totalProps}
              />
              <ConfidenceBar
                label="0-69%"
                count={mockPlayerProps.filter(p => p.confidence < 70).length}
                color="#EF4444"
                total={totalProps}
              />
            </View>
          </BlurView>
        </View>

        {/* Player Performance Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Featured Player Performance</Text>
            <TouchableOpacity
              onPress={() => {
                const nextIndex = (selectedPlayerIndex + 1) % mockPlayerProps.length;
                setSelectedPlayerIndex(nextIndex);
              }}
              style={styles.changePlayerButton}
            >
              <Text style={styles.changePlayerButtonText}>Next Player</Text>
            </TouchableOpacity>
          </View>

          {/* Player info */}
          <View style={styles.featuredPlayerInfo}>
            <Text style={styles.featuredPlayerName}>{featuredPlayer.playerName}</Text>
            <Text style={styles.featuredPlayerProp}>
              {featuredPlayer.propType} - {featuredPlayer.over ? 'OVER' : 'UNDER'} {featuredPlayer.line}
            </Text>
          </View>

          {/* Real data chart */}
          {loading && chartData.length === 0 ? (
            <BlurView intensity={60} tint="dark" style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading real game data...</Text>
            </BlurView>
          ) : error ? (
            <BlurView intensity={60} tint="dark" style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <Text style={styles.errorSubtext}>Using mock data</Text>
            </BlurView>
          ) : chartData.length > 0 ? (
            <EnhancedBarChart
              data={chartData}
              title={`${featuredPlayer.propType} - Last 10 Games`}
              subtitle="Real performance data from NBA API"
              height={300}
              thresholdValue={featuredPlayer.line}
              showThresholdLine={true}
              showValues={true}
              showLegend={true}
            />
          ) : (
            <BarChart
              data={performanceData}
              title="Rushing Yards"
              subtitle="Sample performance data"
              height={280}
              showValues={true}
              threshold={100}
            />
          )}
        </View>

        {/* Fantasy Points Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Fantasy Points Comparison</Text>
          <ComparisonBars
            data={comparisonData}
            title="Player A vs Player B"
            subtitle="Projected & Average Fantasy Points"
            label1="Player A"
            label2="Player B"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <BlurView intensity={60} tint="dark" style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </BlurView>
  );
}

function SportBreakdownCard({ sport, count }: { sport: string; count: number }) {
  const icons: { [key: string]: string } = {
    NBA: '🏀',
    NFL: '🏈',
    MLB: '⚾',
    NHL: '🏒',
  };

  return (
    <BlurView intensity={60} tint="dark" style={styles.sportCard}>
      <Text style={styles.sportCardIcon}>{icons[sport]}</Text>
      <Text style={styles.sportCardLabel}>{sport}</Text>
      <Text style={styles.sportCardValue}>{count} props</Text>
    </BlurView>
  );
}

function TopPerformerCard({ prop, rank }: { prop: any; rank: number }) {
  const confidenceColor =
    prop.confidence >= 85 ? '#10B981' :
    prop.confidence >= 70 ? '#F59E0B' :
    '#EF4444';

  return (
    <BlurView intensity={60} tint="dark" style={styles.performerCard}>
      <View style={styles.performerRank}>
        <Text style={styles.performerRankText}>{rank}</Text>
      </View>
      <View style={styles.performerInfo}>
        <Text style={styles.performerName}>{prop.playerName}</Text>
        <Text style={styles.performerProp}>
          {prop.propType} {prop.over ? 'OVER' : 'UNDER'} {prop.line}
        </Text>
      </View>
      <View style={styles.performerConfidence}>
        <Text style={[styles.performerConfidenceText, { color: confidenceColor }]}>
          {prop.confidence}%
        </Text>
        <View style={[styles.performerDot, { backgroundColor: confidenceColor }]} />
      </View>
    </BlurView>
  );
}

function ConfidenceBar({
  label,
  count,
  color,
  total,
}: {
  label: string;
  count: number;
  color: string;
  total: number;
}) {
  const percentage = (count / total) * 100;

  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barCount}>{count}</Text>
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
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '600',
  },
  sportBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    alignItems: 'center',
  },
  sportCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  sportCardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sportCardValue: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    marginBottom: 12,
    gap: 16,
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  performerRankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  performerProp: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  performerConfidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  performerConfidenceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  performerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
  },
  chartContent: {
    gap: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barLabel: {
    width: 70,
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E5E7',
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
  },
  barCount: {
    width: 30,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'right',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { PlayerProp } from '../data/mockProps';
import { EnhancedBarChart } from './EnhancedBarChart';
import { usePlayerChartData } from '../hooks/usePlayerChartData';
import { formatStatValue } from '../utils/chartDataFormatter';

interface ChartModalProps {
  visible: boolean;
  prop: PlayerProp | null;
  onClose: () => void;
  onViewFullDetails?: () => void;
}

export function ChartModal({ visible, prop, onClose, onViewFullDetails }: ChartModalProps) {
  const {
    chartData,
    hitRateData,
    last5Average,
    seasonAverage,
    loading,
    error,
  } = usePlayerChartData(prop, 10, false, visible && !!prop);

  if (!prop) return null;

  const confidenceColor =
    prop.confidence >= 85 ? '#10B981' :
    prop.confidence >= 70 ? '#F59E0B' :
    '#EF4444';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <BlurView intensity={80} tint="dark" style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Performance Analysis</Text>
          <View style={{ width: 32 }} />
        </BlurView>

        {/* Content */}
        <View style={styles.modalContent}>
          {/* Player Info */}
          <View style={styles.playerSection}>
            <Image
              source={{ uri: prop.playerImage }}
              style={styles.playerImage}
              resizeMode="contain"
            />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{prop.playerName}</Text>
              <View style={styles.matchupRow}>
                <Text style={styles.teamName}>{prop.team}</Text>
                <Text style={styles.vsText}>vs</Text>
                <Text style={styles.teamName}>{prop.opponent}</Text>
              </View>
              <Text style={styles.propType}>{prop.propType}</Text>
            </View>
            <View style={styles.confidenceContainer}>
              <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
                {prop.confidence}%
              </Text>
              <Text style={styles.confidenceLabel}>Confidence</Text>
            </View>
          </View>

          {/* Prop Summary */}
          <View style={styles.propSummary}>
            <View style={styles.propSummaryItem}>
              <Text style={styles.propSummaryLabel}>Line</Text>
              <Text style={styles.propSummaryValue}>{prop.line}</Text>
            </View>
            <View style={styles.propSummaryDivider} />
            <View style={styles.propSummaryItem}>
              <Text style={styles.propSummaryLabel}>Projection</Text>
              <Text style={styles.propSummaryValue}>{prop.projection}</Text>
            </View>
            <View style={styles.propSummaryDivider} />
            <View style={styles.propSummaryItem}>
              <Text style={styles.propSummaryLabel}>Pick</Text>
              <Text style={[styles.propSummaryPick, prop.over ? styles.pickOver : styles.pickUnder]}>
                {prop.over ? 'OVER' : 'UNDER'}
              </Text>
            </View>
          </View>

          {/* Chart */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading chart data...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : (
            <EnhancedBarChart
              data={chartData}
              title="Last 10 Games"
              subtitle="Performance vs betting line"
              height={280}
              thresholdValue={prop.line}
              showThresholdLine={true}
              showValues={true}
              showLegend={true}
            />
          )}

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <QuickStatCard
              label="Hit Rate"
              value={`${hitRateData.hitRate}%`}
              color={confidenceColor}
            />
            <QuickStatCard
              label="L5 Avg"
              value={formatStatValue(last5Average, prop.propType)}
              color="#F59E0B"
            />
            <QuickStatCard
              label="Season Avg"
              value={formatStatValue(seasonAverage, prop.propType)}
              color="#007AFF"
            />
          </View>

          {/* Action Button */}
          {onViewFullDetails && (
            <TouchableOpacity
              onPress={() => {
                onClose();
                onViewFullDetails();
              }}
              style={styles.fullDetailsButton}
              activeOpacity={0.8}
            >
              <Text style={styles.fullDetailsButtonText}>View Full Details</Text>
              <Text style={styles.fullDetailsButtonIcon}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

function QuickStatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <BlurView intensity={60} tint="dark" style={styles.quickStatCard}>
      <View style={[styles.quickStatDot, { backgroundColor: color }]} />
      <Text style={styles.quickStatLabel}>{label}</Text>
      <Text style={[styles.quickStatValue, { color }]}>{value}</Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  playerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  playerImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  teamName: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '600',
  },
  vsText: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
  },
  propType: {
    fontSize: 13,
    color: '#E5E5E7',
    fontWeight: '600',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#AEAEB2',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  propSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.2)',
    borderRadius: 16,
    marginBottom: 24,
  },
  propSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  propSummaryLabel: {
    fontSize: 11,
    color: '#AEAEB2',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  propSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  propSummaryPick: {
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  propSummaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  quickStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.2)',
  },
  quickStatDot: {
    width: 8,
    height: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#AEAEB2',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  fullDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 18,
    backgroundColor: '#10B981',
    borderRadius: 16,
    gap: 8,
  },
  fullDetailsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  fullDetailsButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

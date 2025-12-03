import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BettingTrend } from '../../types/trends';
import { LiveBadge } from '../LiveBadge';

interface BettingTrendCardProps {
  trend: BettingTrend;
  onPress?: () => void;
}

export const BettingTrendCard: React.FC<BettingTrendCardProps> = ({
  trend,
  onPress,
}) => {
  const renderLineMovement = (movement: number, label: string) => {
    const isPositive = movement > 0;
    const color = isPositive ? '#10B981' : '#EF4444';
    const icon = isPositive ? 'trending-up' : 'trending-down';

    if (movement === 0) return null;

    return (
      <View style={styles.movementRow}>
        <Text style={styles.movementLabel}>{label}</Text>
        <View style={[styles.movementBadge, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={14} color={color} />
          <Text style={[styles.movementText, { color }]}>
            {isPositive ? '+' : ''}
            {movement.toFixed(1)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.2)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Header with teams */}
        <View style={styles.header}>
          <View style={styles.teamContainer}>
            {trend.awayTeamLogo && (
              <Image
                source={{ uri: trend.awayTeamLogo }}
                style={styles.teamLogo}
              />
            )}
            <Text style={styles.teamName} numberOfLines={1}>
              {trend.awayTeam}
            </Text>
          </View>

          <Text style={styles.atSymbol}>@</Text>

          <View style={styles.teamContainer}>
            {trend.homeTeamLogo && (
              <Image
                source={{ uri: trend.homeTeamLogo }}
                style={styles.teamLogo}
              />
            )}
            <Text style={styles.teamName} numberOfLines={1}>
              {trend.homeTeam}
            </Text>
          </View>
        </View>

        {/* Alert badges */}
        <View style={styles.alertsRow}>
          {trend.reverseLine && (
            <View style={styles.alertBadge}>
              <Ionicons name="warning" size={12} color="#F59E0B" />
              <Text style={styles.alertText}>RLM</Text>
            </View>
          )}
          {trend.steamMove && (
            <View style={[styles.alertBadge, styles.steamBadge]}>
              <Ionicons name="flash" size={12} color="#EF4444" />
              <Text style={styles.alertText}>STEAM</Text>
            </View>
          )}
          {trend.sharpAction !== 'none' && (
            <View style={[styles.alertBadge, styles.sharpBadge]}>
              <Ionicons name="bulb" size={12} color="#10B981" />
              <Text style={styles.alertText}>SHARP</Text>
            </View>
          )}
        </View>

        {/* Current lines */}
        <View style={styles.linesContainer}>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Spread</Text>
            <Text style={styles.lineValue}>
              {trend.currentSpread > 0 ? '+' : ''}
              {trend.currentSpread.toFixed(1)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Total</Text>
            <Text style={styles.lineValue}>{trend.currentTotal.toFixed(1)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>ML</Text>
            <Text style={styles.lineValue}>
              {trend.moneylineHome > 0 ? '+' : ''}
              {trend.moneylineHome}
            </Text>
          </View>
        </View>

        {/* Line movements */}
        {(trend.spreadMovement !== 0 || trend.totalMovement !== 0) && (
          <View style={styles.movementContainer}>
            {renderLineMovement(trend.spreadMovement, 'Spread')}
            {renderLineMovement(trend.totalMovement, 'Total')}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportText}>{trend.sport}</Text>
          </View>
          {trend.isLive && (
            <View style={styles.liveBadge}>
              <LiveBadge size="small" />
            </View>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  teamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  atSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginHorizontal: 8,
  },
  alertsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  steamBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  sharpBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  alertText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linesContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lineItem: {
    flex: 1,
    alignItems: 'center',
  },
  lineLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  lineValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  movementContainer: {
    padding: 16,
    paddingTop: 12,
    gap: 8,
  },
  movementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movementLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  movementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  movementText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  sportBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  liveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BaseTrend } from '../../types/trends';
import { LiveBadge } from '../LiveBadge';

interface TrendCardProps {
  trend: BaseTrend;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

export const TrendCard: React.FC<TrendCardProps> = ({ trend, onPress }) => {
  const getSeverityColor = (severity: BaseTrend['severity']) => {
    switch (severity) {
      case 'critical':
        return ['#EF4444', '#DC2626']; // Red
      case 'high':
        return ['#F59E0B', '#D97706']; // Orange
      case 'medium':
        return ['#8B5CF6', '#7C3AED']; // Purple
      case 'low':
        return ['#6B7280', '#4B5563']; // Gray
    }
  };

  const getCategoryIcon = (category: BaseTrend['category']) => {
    switch (category) {
      case 'betting':
        return 'trending-up';
      case 'player':
        return 'person';
      case 'team':
        return 'people';
      case 'injury':
        return 'medical';
      default:
        return 'flame';
    }
  };

  const colors = getSeverityColor(trend.severity);
  const icon = getCategoryIcon(trend.category);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={[`${colors[0]}33`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBadge, { backgroundColor: colors[0] }]}>
              <Ionicons name={icon as any} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.category}>{trend.category.toUpperCase()}</Text>
          </View>

          {trend.isLive && (
            <View style={styles.liveBadge}>
              <LiveBadge size="small" />
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {trend.title}
        </Text>

        <Text style={styles.description} numberOfLines={3}>
          {trend.description}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.sportBadge}>{trend.sport}</Text>
          <Text style={styles.timestamp}>
            {new Date(trend.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={[styles.severityBar, { backgroundColor: colors[0] }]} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  liveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 16,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  sportBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  severityBar: {
    height: 4,
    width: '100%',
  },
});

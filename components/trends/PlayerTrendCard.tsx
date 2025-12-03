import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PlayerTrend } from '../../types/trends';

interface PlayerTrendCardProps {
  trend: PlayerTrend;
  onPress?: () => void;
}

export const PlayerTrendCard: React.FC<PlayerTrendCardProps> = ({ trend, onPress }) => {
  const streakColor = trend.streakType === 'hot' ? '#EF4444' : trend.streakType === 'cold' ? '#3B82F6' : '#8B5CF6';
  const streakIcon = trend.streakType === 'hot' ? 'flame' : trend.streakType === 'cold' ? 'snow' : 'flash';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={[`${streakColor}33`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <View style={styles.playerInfo}>
            <View style={styles.playerImageContainer}>
              {trend.playerImage ? (
                <Image
                  source={{ uri: trend.playerImage }}
                  style={styles.playerImage}
                />
              ) : (
                <View style={[styles.playerImage, styles.placeholderImage]}>
                  <Ionicons name="person" size={24} color="#6B7280" />
                </View>
              )}
              {trend.teamLogo && (
                <View style={styles.teamLogoBadge}>
                  <Image
                    source={{ uri: trend.teamLogo }}
                    style={styles.teamLogoImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
            <View style={styles.playerText}>
              <Text style={styles.playerName} numberOfLines={1}>{trend.playerName}</Text>
              <Text style={styles.teamName}>{trend.teamName} • {trend.position}</Text>
            </View>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: streakColor }]}>
            <Ionicons name={streakIcon as any} size={16} color="#FFF" />
            <Text style={styles.streakText}>{trend.streakLength}G</Text>
          </View>
        </View>

        {trend.stats.map((stat, idx) => (
          <View key={idx} style={styles.statRow}>
            <Text style={styles.statLabel}>{stat.metric}</Text>
            <View style={styles.statValues}>
              <Text style={styles.statCurrent}>{stat.current.toFixed(1)}</Text>
              <Text style={[styles.statChange, { color: stat.percentChange > 0 ? '#10B981' : '#EF4444' }]}>
                {stat.percentChange > 0 ? '+' : ''}{stat.percentChange.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}

        {trend.calculatedProps && trend.calculatedProps.length > 0 && (
          <View style={styles.propsContainer}>
            {trend.calculatedProps.slice(0, 2).map((prop, idx) => (
              <View key={idx} style={styles.propChip}>
                <Text style={styles.propText}>
                  {prop.metric} {prop.recommendation.toUpperCase()} {prop.line}
                </Text>
                <Text style={styles.confidenceText}>{prop.confidence}%</Text>
              </View>
            ))}
          </View>
        )}

        {trend.nextGame && (
          <View style={styles.footer}>
            <Text style={styles.nextGame}>vs {trend.nextGame.opponent}</Text>
            <Text style={styles.sportBadge}>{trend.sport}</Text>
          </View>
        )}
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 12 },
  blurContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingBottom: 12 },
  playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  playerImageContainer: { position: 'relative', width: 48, height: 48 },
  playerImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  teamLogoBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  teamLogoImage: { width: 14, height: 14 },
  playerText: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  teamName: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  streakText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  statLabel: { fontSize: 13, color: '#9CA3AF' },
  statValues: { flexDirection: 'row', gap: 8 },
  statCurrent: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  statChange: { fontSize: 13, fontWeight: '600' },
  propsContainer: { padding: 16, gap: 8 },
  propChip: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(139, 92, 246, 0.2)', padding: 10, borderRadius: 8 },
  propText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  confidenceText: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 8 },
  nextGame: { fontSize: 12, color: '#9CA3AF' },
  sportBadge: { fontSize: 12, fontWeight: '600', color: '#FFF', backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
});

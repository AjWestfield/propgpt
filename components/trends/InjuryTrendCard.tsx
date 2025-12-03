import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { InjuryTrend } from '../../types/trends';

interface InjuryTrendCardProps {
  trend: InjuryTrend;
  onPress?: () => void;
}

export const InjuryTrendCard: React.FC<InjuryTrendCardProps> = ({ trend, onPress }) => {
  const getStatusColor = (status: string) => {
    if (status === 'out') return '#EF4444';
    if (status === 'doubtful') return '#F59E0B';
    if (status === 'questionable') return '#FCD34D';
    return '#10B981';
  };

  const statusColor = getStatusColor(trend.injuryStatus);
  const impactSummary = (() => {
    const impact = trend.playerImpact || {};
    const pieces: string[] = [];

    if (trend.sport === 'NFL') {
      if (impact.seasonAvgYards) {
        pieces.push(`${impact.seasonAvgYards.toFixed(0)} yds/g`);
      }
      if (impact.seasonAvgTouchdowns) {
        pieces.push(`${impact.seasonAvgTouchdowns.toFixed(1)} TD/g`);
      }
    } else {
      if (impact.seasonAvgPoints) {
        pieces.push(`${impact.seasonAvgPoints.toFixed(1)} PPG`);
      }
      if (impact.seasonAvgAssists) {
        pieces.push(`${impact.seasonAvgAssists.toFixed(1)} AST`);
      }
      if (impact.seasonAvgRebounds) {
        pieces.push(`${impact.seasonAvgRebounds.toFixed(1)} REB`);
      }
    }

    if (impact.usageRate) {
      pieces.push(`Usage ${Math.round(impact.usageRate)}%`);
    }

    return pieces.join(' • ');
  })();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'transparent']}
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
              <Text style={styles.playerName}>{trend.playerName}</Text>
              <Text style={styles.teamName}>{trend.teamName} • {trend.position}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{trend.injuryStatus.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.impactContainer}>
          <Text style={styles.impactLabel}>Impact Score</Text>
          <View style={styles.impactBar}>
            <View style={[styles.impactFill, { width: `${trend.playerImpact.impactScore}%`, backgroundColor: statusColor }]} />
          </View>
          <Text style={styles.impactValue}>{trend.playerImpact.impactScore}/100</Text>
          {impactSummary ? <Text style={styles.impactDetails}>{impactSummary}</Text> : null}
        </View>

        <Text style={styles.details}>{trend.injuryDetails}</Text>

        {trend.gameImpact && (
          <View style={styles.gameImpact}>
            <Text style={styles.gameText}>vs {trend.gameImpact.opponent}</Text>
            {trend.gameImpact.spreadChange !== 0 && (
              <Text style={styles.lineChange}>
                Line: {trend.gameImpact.spreadChange > 0 ? '+' : ''}{trend.gameImpact.spreadChange?.toFixed(1)}
              </Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.sportBadge}>{trend.sport}</Text>
          <Text style={styles.timestamp}>{new Date(trend.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
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
  statusBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 7, borderRadius: 100, borderWidth: 1.5, backgroundColor: 'transparent' },
  statusText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  impactContainer: { paddingHorizontal: 16, marginBottom: 12 },
  impactLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 6 },
  impactBar: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  impactFill: { height: '100%', borderRadius: 4 },
  impactValue: { fontSize: 12, fontWeight: '700', color: '#FFF', textAlign: 'right' },
  impactDetails: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  details: { fontSize: 13, color: '#9CA3AF', paddingHorizontal: 16, marginBottom: 12, lineHeight: 18 },
  gameImpact: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: 12, marginHorizontal: 16, marginBottom: 12, borderRadius: 8 },
  gameText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  lineChange: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingTop: 0 },
  sportBadge: { fontSize: 12, fontWeight: '600', color: '#FFF', backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  timestamp: { fontSize: 12, color: '#6B7280' },
});

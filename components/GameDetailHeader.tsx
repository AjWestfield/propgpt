import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { LiveBadge } from './LiveBadge';

interface Team {
  id: string;
  displayName: string;
  abbreviation: string;
  logo: string;
  record?: string;
}

interface Score {
  home: string | number;
  away: string | number;
  period?: number;
  clock?: string;
}

interface GameDetailHeaderProps {
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  status: string;
  statusText: string;
  venue?: string;
  broadcast?: string[];
  isLive: boolean;
}

export function GameDetailHeader({
  homeTeam,
  awayTeam,
  score,
  status,
  statusText,
  venue,
  broadcast,
  isLive,
}: GameDetailHeaderProps) {
  return (
    <BlurView intensity={20} tint="dark" style={styles.container}>
      {/* Live indicator gradient */}
      {isLive && (
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.15)', 'transparent']}
          style={styles.liveGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      )}

      <View style={styles.content}>
        {/* Teams and Score */}
        <View style={styles.teamsRow}>
          {/* Away Team */}
          <View style={styles.teamColumn}>
            <View style={styles.teamLogoContainer}>
              <Image source={{ uri: awayTeam.logo }} style={styles.teamLogo} />
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {awayTeam.abbreviation}
            </Text>
            {awayTeam.record && (
              <Text style={styles.teamRecord}>{awayTeam.record}</Text>
            )}
          </View>

          {/* Score and Status */}
          <View style={styles.scoreColumn}>
            {isLive && <LiveBadge />}

            <View style={styles.scoreRow}>
              <Text style={styles.score}>{score.away}</Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={styles.score}>{score.home}</Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>

          {/* Home Team */}
          <View style={styles.teamColumn}>
            <View style={styles.teamLogoContainer}>
              <Image source={{ uri: homeTeam.logo }} style={styles.teamLogo} />
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {homeTeam.abbreviation}
            </Text>
            {homeTeam.record && (
              <Text style={styles.teamRecord}>{homeTeam.record}</Text>
            )}
          </View>
        </View>

        {/* Game Info */}
        <View style={styles.infoRow}>
          {venue && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📍</Text>
              <Text style={styles.infoText} numberOfLines={1}>
                {venue}
              </Text>
            </View>
          )}

          {broadcast && broadcast.length > 0 && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📺</Text>
              <Text style={styles.infoText} numberOfLines={1}>
                {broadcast.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  liveGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  content: {
    padding: 20,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  teamLogo: {
    width: 48,
    height: 48,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  teamRecord: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  scoreColumn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  score: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreSeparator: {
    fontSize: 28,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

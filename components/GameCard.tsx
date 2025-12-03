import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Game } from '../types/game';
import { isHalftime } from '../utils/gameStatus';
import { LiveBadge } from './LiveBadge';

const SPORT_LOGOS: Record<string, string> = {
  NBA: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
  NFL: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
  MLB: 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
  NHL: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
};

interface GameCardProps {
  game: Game;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // 16px margin on each side

export function GameCard({ game, onPress }: GameCardProps) {
  const {
    sport,
    homeTeam,
    awayTeam,
    score,
    status,
    statusText,
    isLive,
    broadcast,
    odds,
  } = game;

  const showHalfTime = isLive && isHalftime(sport, score.period, score.clock, statusText);
  const hasLiveClock = Boolean(score.period && score.clock);

  // Get status background color - Red theme
  const getStatusColor = () => {
    if (isLive) return 'rgba(239, 68, 68, 0.12)';
    if (status === 'final') return '#6B7280'; // Gray for completed
    return '#DC2626'; // Deep red for scheduled
  };

  const getLiveClockLabel = () => {
    if (!score.period || !score.clock) {
      return '';
    }

    if (sport === 'MLB') {
      const suffix =
        score.period === 1
          ? 'st'
          : score.period === 2
          ? 'nd'
          : score.period === 3
          ? 'rd'
          : 'th';
      return `${score.period}${suffix} - ${score.clock}`;
    }

    if (sport === 'NHL') {
      return `P${score.period} - ${score.clock}`;
    }

    return `Q${score.period} - ${score.clock}`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        {/* Live indicator gradient overlay - Red theme */}
        {isLive && (
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.1)', 'transparent']}
            style={styles.liveGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {/* Header: Sport badge and status */}
        <View style={styles.header}>
          <View style={styles.sportBadge}>
            {SPORT_LOGOS[sport] ? (
              <Image
                source={{ uri: SPORT_LOGOS[sport] }}
                style={styles.sportBadgeLogo}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.sportText}>{sport.charAt(0)}</Text>
            )}
            <Text style={styles.sportText}>{sport}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                isLive && styles.statusBadgeLive,
                !isLive && { backgroundColor: getStatusColor() },
              ]}
            >
              {isLive ? (
                <LiveBadge size="small" />
              ) : (
                <Text style={styles.statusText}>{statusText}</Text>
              )}
            </View>

            {/* Live Game Clock */}
            {isLive && (showHalfTime || hasLiveClock) && (
              <View style={styles.gameClockContainer}>
                <Text style={styles.gameClockText}>
                  {showHalfTime ? 'Half Time' : getLiveClockLabel()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Game matchup */}
        <View style={styles.matchup}>
          {/* Away team */}
          <View style={styles.team}>
            <Image
              source={{ uri: awayTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <View style={styles.teamInfo}>
              <Text style={styles.teamName} numberOfLines={1}>
                {awayTeam.displayName}
              </Text>
              {awayTeam.record && (
                <Text style={styles.teamRecord}>{awayTeam.record}</Text>
              )}
            </View>
            <Text style={[styles.score, isLive && styles.liveScore]}>
              {score.away}
            </Text>
          </View>

          {/* Divider with @ symbol */}
          <View style={styles.divider}>
            <Text style={styles.atSymbol}>@</Text>
          </View>

          {/* Home team */}
          <View style={styles.team}>
            <Image
              source={{ uri: homeTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <View style={styles.teamInfo}>
              <Text style={styles.teamName} numberOfLines={1}>
                {homeTeam.displayName}
              </Text>
              {homeTeam.record && (
                <Text style={styles.teamRecord}>{homeTeam.record}</Text>
              )}
            </View>
            <Text style={[styles.score, isLive && styles.liveScore]}>
              {score.home}
            </Text>
          </View>
        </View>

        {/* Footer: Broadcast and odds */}
        {(broadcast?.length || odds) && (
          <View style={styles.footer}>
            {broadcast && broadcast.length > 0 && (
              <View style={styles.broadcastContainer}>
                <Ionicons name="tv-outline" size={14} color="#9CA3AF" />
                <Text style={styles.broadcastText} numberOfLines={1}>
                  {broadcast.slice(0, 2).join(', ')}
                </Text>
              </View>
            )}

            {odds && (
              <View style={styles.oddsContainer}>
                <Ionicons name="stats-chart-outline" size={14} color="#9CA3AF" />
                {odds.spread && (
                  <Text style={styles.oddsText}>{odds.spread}</Text>
                )}
                {odds.overUnder && (
                  <Text style={styles.oddsText}>O/U {odds.overUnder}</Text>
                )}
              </View>
            )}
          </View>
        )}
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    // Shadow for Android
    elevation: 4,
  },
  blurContainer: {
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  liveGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 1,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  sportBadgeLogo: {
    width: 16,
    height: 16,
  },
  sportText: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 5,
  },
  statusBadgeLive: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  gameClockContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  gameClockText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  matchup: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 1,
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLogo: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 1,
  },
  teamRecord: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '400',
  },
  score: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    minWidth: 48,
    textAlign: 'right',
  },
  liveScore: {
    color: '#EF4444',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 2,
  },
  atSymbol: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  broadcastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  broadcastText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '400',
  },
  oddsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  oddsText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { PlayerProp } from '../types/playerProp';
import { EVRating } from './EVRating';
import { PlayerAvatar } from './PlayerAvatar';
import { LiveBadge } from './LiveBadge';
import { useMyPicks } from '../contexts/MyPicksContext';

interface PlayerCardProps {
  playerName: string;
  playerProps: PlayerProp[];
  onPress: () => void;
}

export function PlayerCard({ playerName, playerProps, onPress }: PlayerCardProps) {
  const { togglePick, isPicked } = useMyPicks();

  if (playerProps.length === 0) return null;

  const firstProp = playerProps[0];
  const propsCount = playerProps.length;

  // Calculate average confidence across all props
  const avgConfidence = Math.round(
    playerProps.reduce((sum, prop) => sum + prop.confidence, 0) / propsCount
  );

  // Count over/under picks
  const overCount = playerProps.filter(p => p.over).length;
  const underCount = propsCount - overCount;

  // Find highest confidence prop
  const bestProp = playerProps.reduce((best, prop) =>
    prop.confidence > best.confidence ? prop : best
  , playerProps[0]);

  const isBestPickSaved = isPicked(bestProp.id);

  const confidenceColor =
    avgConfidence >= 85 ? '#10B981' :
    avgConfidence >= 70 ? '#F59E0B' :
    '#EF4444';

  const showLiveIndicator =
    firstProp.isLive || firstProp.gameTime.toUpperCase() === 'LIVE';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardOuterContainer}>
        <BlurView intensity={60} tint="dark" style={styles.cardBlur}>
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.headerRow}>
              <PlayerAvatar
                imageUrl={firstProp.playerImage}
                teamLogo={firstProp.teamLogo}
                size={88}
                showTeamBadge={true}
              />
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{playerName}</Text>
                <View style={styles.matchupContainer}>
                  <View style={styles.teamContainer}>
                    <Text style={styles.teamName}>{firstProp.team}</Text>
                    <Image
                      source={{ uri: firstProp.teamLogo }}
                      style={styles.teamLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.vsText}>vs</Text>
                  <View style={styles.teamContainer}>
                    <Text style={styles.teamName}>{firstProp.opponent}</Text>
                    <Image
                      source={{ uri: firstProp.opponentLogo }}
                      style={styles.teamLogo}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>
              <View style={styles.badgesContainer}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportText}>{firstProp.sport}</Text>
                </View>
                {/* College-specific: Show class year badge for NCAAF/NCAAB */}
                {(firstProp.sport === 'NCAAF' || firstProp.sport === 'NCAAB') && firstProp.classYear && (
                  <View style={styles.classYearBadge}>
                    <Text style={styles.classYearText}>{firstProp.classYear}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Props Summary */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Props</Text>
                <Text style={styles.summaryValue}>{propsCount}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Avg Confidence</Text>
                <Text style={[styles.summaryValue, { color: confidenceColor }]}>
                  {avgConfidence}%
                </Text>
              </View>
            </View>

            {/* Best Pick Preview */}
            <View style={styles.bestPickContainer}>
              <View style={styles.bestPickHeader}>
                <View style={styles.bestPickLabelContainer}>
                  <Ionicons name="flame" size={16} color="#F59E0B" />
                  <Text style={styles.bestPickLabel}>Best Pick</Text>
                </View>
                <View style={styles.bestPickHeaderRight}>
                  <View style={[styles.pickBadge, bestProp.over ? styles.pickBadgeOver : styles.pickBadgeUnder]}>
                    <Text style={[styles.pickBadgeText, bestProp.over ? styles.pickBadgeTextOver : styles.pickBadgeTextUnder]}>
                      {bestProp.over ? 'OVER' : 'UNDER'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.addButton, isBestPickSaved && styles.addButtonActive]}
                    onPress={(e) => {
                      togglePick(bestProp);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isBestPickSaved ? 'checkmark' : 'add'}
                      size={16}
                      color={isBestPickSaved ? '#0F172A' : '#FFFFFF'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.bestPickType}>{bestProp.propType}</Text>
              <View style={styles.bestPickStats}>
                <Text style={styles.bestPickStat}>
                  Line: <Text style={styles.bestPickStatValue}>{bestProp.line}</Text>
                </Text>
                <Text style={styles.bestPickStat}>
                  Proj: <Text style={styles.bestPickStatValue}>{bestProp.projection}</Text>
                </Text>
                <Text style={styles.bestPickStat}>
                  Conf: <Text style={[styles.bestPickStatValue, { color: confidenceColor }]}>
                    {bestProp.confidence}%
                  </Text>
                </Text>
              </View>
              {/* EV Rating */}
              <View style={styles.evRatingContainer}>
                <EVRating
                  evPercentage={(bestProp.confidence - 70) / 5}
                  size="small"
                  showStars={true}
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              {showLiveIndicator ? (
                <LiveBadge />
              ) : (
                <View style={styles.gameTimeContainer}>
                  <Ionicons name="time-outline" size={14} color="#E5E5E7" />
                  <Text style={styles.gameTime}>{firstProp.gameTime}</Text>
                </View>
              )}
              <View style={styles.viewAllContainer}>
                <Text style={styles.viewAllText}>Tap to view all props</Text>
                <Ionicons name="arrow-forward" size={14} color="#007AFF" />
              </View>
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
  badgesContainer: {
    gap: 6,
    alignItems: 'flex-end',
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
  classYearBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  classYearText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#AEAEB2',
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bestPickContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  bestPickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bestPickLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bestPickLabel: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bestPickHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addButtonActive: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  pickBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pickBadgeOver: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  pickBadgeUnder: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  pickBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pickBadgeTextOver: {
    color: '#10B981',
  },
  pickBadgeTextUnder: {
    color: '#EF4444',
  },
  bestPickType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  bestPickStats: {
    flexDirection: 'row',
    gap: 16,
  },
  bestPickStat: {
    fontSize: 13,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  bestPickStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  evRatingContainer: {
    marginTop: 8,
    paddingTop: 8,
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
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});

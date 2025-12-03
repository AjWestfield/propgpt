/**
 * OutlierEVCard Component
 *
 * Displays a player prop with Expected Value or Arbitrage opportunity
 * Shows odds from multiple sportsbooks with EV calculations
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { OutlierOpportunity } from '../types/outlierEV';
import { PlayerAvatar } from './PlayerAvatar';
import { EVRating } from './EVRating';
import { formatAmericanOdds } from '../services/oddsApiIO';

interface OutlierEVCardProps {
  opportunity: OutlierOpportunity;
  onPress?: () => void;
}

export function OutlierEVCard({ opportunity, onPress }: OutlierEVCardProps) {
  const isArbitrage = opportunity.opportunityType === 'arbitrage';
  const { player, propType, game, allBooks, highlight, bestPlay } = opportunity;

  // Get badge configuration
  const badgeConfig = isArbitrage
    ? {
        icon: 'checkmark-circle' as const,
        text: 'ARBITRAGE',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        textColor: '#10B981',
        borderColor: '#10B981',
      }
    : {
        icon: 'star' as const,
        text: 'HIGH VALUE',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        textColor: '#F59E0B',
        borderColor: '#F59E0B',
      };

  // Sort books by best EV (for display)
  const sortedBooks = [...allBooks].sort((a, b) => {
    const aMaxEV = Math.max(
      opportunity.ev?.bestOver.ev || 0,
      opportunity.ev?.bestUnder.ev || 0
    );
    const bMaxEV = Math.max(
      opportunity.ev?.bestOver.ev || 0,
      opportunity.ev?.bestUnder.ev || 0
    );
    return bMaxEV - aMaxEV;
  });

  // Get top 4 books for preview
  const previewBooks = sortedBooks.slice(0, 4);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardOuterContainer}>
        <BlurView intensity={60} tint="dark" style={styles.cardBlur}>
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.playerSection}>
                <PlayerAvatar
                  imageUrl={`https://ui-avatars.com/api/?name=${player}&size=64`}
                  size={56}
                  showTeamBadge={false}
                />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player}</Text>
                  <Text style={styles.propType}>{propType}</Text>
                  <View style={styles.matchup}>
                    <Text style={styles.matchupText}>
                      {game.homeTeam} vs {game.awayTeam}
                    </Text>
                    <Text style={styles.gameTime}>
                      {new Date(game.gameTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Badge */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: badgeConfig.bgColor,
                    borderColor: badgeConfig.borderColor,
                  },
                ]}
              >
                <Ionicons
                  name={badgeConfig.icon}
                  size={14}
                  color={badgeConfig.textColor}
                />
                <Text
                  style={[styles.badgeText, { color: badgeConfig.textColor }]}
                >
                  {badgeConfig.text}
                </Text>
              </View>
            </View>

            {/* Highlight Section */}
            <View style={styles.highlightSection}>
              <View style={styles.highlightRow}>
                <Ionicons name="trending-up" size={20} color="#10B981" />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
              <Text style={styles.bestPlayText}>{bestPlay}</Text>
            </View>

            {/* Sportsbook Odds Preview */}
            <View style={styles.oddsSection}>
              <Text style={styles.oddsSectionTitle}>Best Odds</Text>
              <View style={styles.oddsGrid}>
                {previewBooks.map((book, index) => (
                  <View key={`${book.sportsbookKey}-${index}`} style={styles.bookCard}>
                    {/* Sportsbook Logo/Name */}
                    <View style={styles.bookHeader}>
                      {book.logoUrl ? (
                        <Image
                          source={{ uri: book.logoUrl }}
                          style={styles.bookLogo}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.bookLogoPlaceholder}>
                          <Text style={styles.bookLogoText}>
                            {book.sportsbook.substring(0, 2).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.bookName} numberOfLines={1}>
                        {book.sportsbook}
                      </Text>
                    </View>

                    {/* Over/Under Odds */}
                    <View style={styles.oddsRow}>
                      <View style={styles.oddsColumn}>
                        <Text style={styles.oddsLabel}>OVER</Text>
                        <Text style={styles.oddsValue}>
                          {formatAmericanOdds(book.overOdds)}
                        </Text>
                        {opportunity.ev && (
                          <EVRating
                            evPercentage={opportunity.ev.bestOver.ev}
                            size="small"
                            showStars={false}
                          />
                        )}
                      </View>
                      <View style={styles.oddsDivider} />
                      <View style={styles.oddsColumn}>
                        <Text style={styles.oddsLabel}>UNDER</Text>
                        <Text style={styles.oddsValue}>
                          {formatAmericanOdds(book.underOdds)}
                        </Text>
                        {opportunity.ev && (
                          <EVRating
                            evPercentage={opportunity.ev.bestUnder.ev}
                            size="small"
                            showStars={false}
                          />
                        )}
                      </View>
                    </View>

                    {/* Line */}
                    <Text style={styles.lineText}>Line: {book.line}</Text>
                  </View>
                ))}
              </View>

              {/* View More */}
              {allBooks.length > 4 && (
                <View style={styles.viewMoreContainer}>
                  <Text style={styles.viewMoreText}>
                    +{allBooks.length - 4} more books
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#AEAEB2" />
                </View>
              )}
            </View>

            {/* Footer - Line Range */}
            {opportunity.ev && (
              <View style={styles.footer}>
                <View style={styles.footerItem}>
                  <Ionicons name="analytics-outline" size={16} color="#AEAEB2" />
                  <Text style={styles.footerText}>
                    Line Range: {opportunity.ev.lineRange.min} -{' '}
                    {opportunity.ev.lineRange.max}
                  </Text>
                </View>
                {opportunity.ev.lineRange.spread > 1 && (
                  <View style={styles.spreadBadge}>
                    <Text style={styles.spreadText}>
                      {opportunity.ev.lineRange.spread}pt spread
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardOuterContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContent: {
    padding: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  playerSection: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  propType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E7',
    marginBottom: 4,
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchupText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#AEAEB2',
  },
  gameTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6E6E73',
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Highlight Section
  highlightSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  highlightText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  bestPlayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E5E7',
  },

  // Odds Section
  oddsSection: {
    marginBottom: 12,
  },
  oddsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E5E7',
    marginBottom: 12,
  },
  oddsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bookCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  bookLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  bookLogoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookLogoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E5E7',
    flex: 1,
  },
  oddsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  oddsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  oddsDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  oddsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#AEAEB2',
    marginBottom: 4,
  },
  oddsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  lineText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6E6E73',
    textAlign: 'center',
  },

  // View More
  viewMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AEAEB2',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#AEAEB2',
  },
  spreadBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spreadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
});

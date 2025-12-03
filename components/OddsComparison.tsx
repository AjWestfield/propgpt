import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { OddsComparison as OddsData, Sportsbook } from '../types/boxScore';

interface OddsComparisonProps {
  odds: OddsData | null;
  homeTeamAbbr: string;
  awayTeamAbbr: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

export function OddsComparison({
  odds,
  homeTeamAbbr,
  awayTeamAbbr,
  homeTeamLogo,
  awayTeamLogo,
}: OddsComparisonProps) {
  if (!odds || odds.sportsbooks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Odds not available for this game</Text>
      </View>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ago`;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerText}>Betting Odds</Text>
            <Text style={styles.subheaderText}>
              Updated {formatTimestamp(odds.lastUpdated)}
            </Text>
          </View>

          {/* Team Logos Row */}
          <View style={styles.teamsRow}>
            <View style={styles.teamInfo}>
              {awayTeamLogo && (
                <Image
                  source={{ uri: awayTeamLogo }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.teamAbbr}>{awayTeamAbbr}</Text>
            </View>
            <Text style={styles.vsText}>vs</Text>
            <View style={styles.teamInfo}>
              {homeTeamLogo && (
                <Image
                  source={{ uri: homeTeamLogo }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.teamAbbr}>{homeTeamAbbr}</Text>
            </View>
          </View>
        </View>

        {/* Sportsbooks */}
        {odds.sportsbooks.map((sportsbook, index) => (
          <BlurView
            key={index}
            intensity={20}
            tint="dark"
            style={styles.sportsbookCard}
          >
            {/* Sportsbook Name */}
            <View style={styles.sportsbookHeader}>
              <Text style={styles.sportsbookName}>{sportsbook.name}</Text>
              {sportsbook.lastUpdated && (
                <Text style={styles.updateTime}>
                  {formatTimestamp(sportsbook.lastUpdated)}
                </Text>
              )}
            </View>

            {/* Spread */}
            {sportsbook.spread && (
              <View style={styles.oddsSection}>
                <Text style={styles.oddsLabel}>Spread</Text>
                <View style={styles.oddsRow}>
                  <View style={styles.oddColumn}>
                    <Text style={styles.teamText}>{awayTeamAbbr}</Text>
                    <Text style={styles.oddsValue}>
                      {sportsbook.spread.away || '--'}
                    </Text>
                  </View>
                  <View style={styles.oddsSeparator} />
                  <View style={styles.oddColumn}>
                    <Text style={styles.teamText}>{homeTeamAbbr}</Text>
                    <Text style={styles.oddsValue}>
                      {sportsbook.spread.home || '--'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Moneyline */}
            {sportsbook.moneyline && (
              <View style={styles.oddsSection}>
                <Text style={styles.oddsLabel}>Moneyline</Text>
                <View style={styles.oddsRow}>
                  <View style={styles.oddColumn}>
                    <Text style={styles.teamText}>{awayTeamAbbr}</Text>
                    <Text
                      style={[
                        styles.oddsValue,
                        sportsbook.moneyline.away.startsWith('+') &&
                          styles.underdog,
                      ]}
                    >
                      {sportsbook.moneyline.away}
                    </Text>
                  </View>
                  <View style={styles.oddsSeparator} />
                  <View style={styles.oddColumn}>
                    <Text style={styles.teamText}>{homeTeamAbbr}</Text>
                    <Text
                      style={[
                        styles.oddsValue,
                        sportsbook.moneyline.home.startsWith('+') &&
                          styles.underdog,
                      ]}
                    >
                      {sportsbook.moneyline.home}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Total (Over/Under) */}
            {sportsbook.total && (
              <View style={styles.oddsSection}>
                <Text style={styles.oddsLabel}>
                  Total (O/U {sportsbook.total.line})
                </Text>
                <View style={styles.oddsRow}>
                  <View style={styles.oddColumn}>
                    <Text style={styles.teamText}>OVER</Text>
                    <Text style={styles.oddsValue}>{sportsbook.total.over}</Text>
                  </View>
                  <View style={styles.oddsSeparator} />
                  <View style={styles.oddColumn}>
                    <Text style={styles.teamText}>UNDER</Text>
                    <Text style={styles.oddsValue}>{sportsbook.total.under}</Text>
                  </View>
                </View>
              </View>
            )}
          </BlurView>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Odds displayed are for informational purposes only. Please gamble
            responsibly.
          </Text>
        </View>

        {/* Additional spacing for bottom nav */}
        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  header: {
    marginBottom: 16,
  },
  headerTop: {
    marginBottom: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subheaderText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  teamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamLogo: {
    width: 24,
    height: 24,
  },
  teamAbbr: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vsText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 12,
  },
  sportsbookCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sportsbookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sportsbookName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  updateTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  oddsSection: {
    marginBottom: 16,
  },
  oddsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  oddsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oddColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  oddsSeparator: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  teamText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  oddsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  underdog: {
    color: '#10B981', // Green for underdogs (positive odds)
  },
  disclaimer: {
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

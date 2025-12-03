import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Sport } from '../types/game';
import { TeamStats, getTeamStatCategories } from '../types/boxScore';

interface TeamBoxScoreProps {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  sport: Sport;
}

export function TeamBoxScore({ homeTeam, awayTeam, sport }: TeamBoxScoreProps) {
  const statCategories = getTeamStatCategories(sport);

  if (statCategories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Team statistics not available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Team Statistics</Text>
        </View>

        {/* Stats Grid */}
        <BlurView intensity={20} tint="dark" style={styles.statsCard}>
          <View style={styles.statsTable}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <View style={styles.statLabelCell}>
                <Text style={styles.tableTitleText}>Category</Text>
              </View>
              <View style={styles.statValueCell}>
                {awayTeam.teamLogo && (
                  <Image
                    source={{ uri: awayTeam.teamLogo }}
                    style={styles.teamLogo}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.tableHeaderText}>{awayTeam.teamName}</Text>
              </View>
              <View style={styles.statValueCell}>
                {homeTeam.teamLogo && (
                  <Image
                    source={{ uri: homeTeam.teamLogo }}
                    style={styles.teamLogo}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.tableHeaderText}>{homeTeam.teamName}</Text>
              </View>
            </View>

            {/* Stats Rows */}
            {statCategories.map((category, index) => {
              const awayValue = awayTeam.stats[category.key];
              const homeValue = homeTeam.stats[category.key];

              return (
                <View
                  key={category.key}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 && styles.alternateRow,
                  ]}
                >
                  <View style={styles.statLabelCell}>
                    <Text style={styles.statLabel}>{category.label}</Text>
                  </View>
                  <View style={styles.statValueCell}>
                    <Text style={styles.statValue}>
                      {awayValue !== undefined ? awayValue : '--'}
                    </Text>
                  </View>
                  <View style={styles.statValueCell}>
                    <Text style={styles.statValue}>
                      {homeValue !== undefined ? homeValue : '--'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </BlurView>

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
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsTable: {
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  alternateRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  statLabelCell: {
    flex: 2,
  },
  statValueCell: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  teamLogo: {
    width: 24,
    height: 24,
  },
  tableTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

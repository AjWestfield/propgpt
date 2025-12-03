import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Sport } from '../types/game';
import { PlayerStat, getPlayerStatCategories } from '../types/boxScore';
import { getTeamNameOnly } from '../utils/teamUtils';

interface PlayerBoxScoreProps {
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homePlayers: PlayerStat[];
  awayPlayers: PlayerStat[];
  sport: Sport;
}

export function PlayerBoxScore({
  homeTeamName,
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo,
  homePlayers,
  awayPlayers,
  sport,
}: PlayerBoxScoreProps) {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('away');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const statCategories = getPlayerStatCategories(sport);

  const players = selectedTeam === 'home' ? homePlayers : awayPlayers;
  const teamName = selectedTeam === 'home' ? homeTeamName : awayTeamName;

  // Sort players
  const sortedPlayers = useMemo(() => {
    if (!sortBy) {
      return players;
    }

    return [...players].sort((a, b) => {
      const aValue = a.stats[sortBy];
      const bValue = b.stats[sortBy];

      // Handle different value types
      const aNum = typeof aValue === 'number' ? aValue : parseFloat(aValue as string) || 0;
      const bNum = typeof bValue === 'number' ? bValue : parseFloat(bValue as string) || 0;

      if (sortDirection === 'asc') {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    });
  }, [players, sortBy, sortDirection]);

  const handleSort = (statKey: string, sortable: boolean) => {
    if (!sortable) return;

    if (sortBy === statKey) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort column
      setSortBy(statKey);
      setSortDirection('desc');
    }
  };

  if (statCategories.length === 0 || players.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Player statistics not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Team Selector */}
      <View style={styles.teamSelector}>
        <TouchableOpacity
          style={[
            styles.teamButton,
            selectedTeam === 'away' && styles.teamButtonActive,
          ]}
          onPress={() => setSelectedTeam('away')}
        >
          {awayTeamLogo && (
            <Image
              source={{ uri: awayTeamLogo }}
              style={styles.teamButtonLogo}
              resizeMode="contain"
            />
          )}
          <Text
            style={[
              styles.teamButtonText,
              selectedTeam === 'away' && styles.teamButtonTextActive,
            ]}
          >
            {getTeamNameOnly(awayTeamName)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.teamButton,
            selectedTeam === 'home' && styles.teamButtonActive,
          ]}
          onPress={() => setSelectedTeam('home')}
        >
          {homeTeamLogo && (
            <Image
              source={{ uri: homeTeamLogo }}
              style={styles.teamButtonLogo}
              resizeMode="contain"
            />
          )}
          <Text
            style={[
              styles.teamButtonText,
              selectedTeam === 'home' && styles.teamButtonTextActive,
            ]}
          >
            {getTeamNameOnly(homeTeamName)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Table */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tableScroll}
      >
        <BlurView intensity={20} tint="dark" style={styles.tableCard}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <View style={styles.playerNameHeaderCell}>
              <Text style={styles.headerText}>PLAYER</Text>
            </View>
            <View style={styles.positionHeaderCell}>
              <Text style={styles.headerText}>POS</Text>
            </View>
            {statCategories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={styles.statHeaderCell}
                onPress={() => handleSort(category.key, category.sortable)}
                disabled={!category.sortable}
              >
                <Text
                  style={[
                    styles.headerText,
                    sortBy === category.key && styles.headerTextActive,
                  ]}
                >
                  {category.label}
                  {sortBy === category.key && (
                    <Text style={styles.sortIndicator}>
                      {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Player Rows */}
          <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
            {sortedPlayers.map((player, index) => (
              <View
                key={player.playerId || index}
                style={[
                  styles.playerRow,
                  index % 2 === 0 && styles.alternateRow,
                  player.starter && styles.starterRow,
                ]}
              >
                <View style={styles.playerNameCell}>
                  {player.headshot ? (
                    <Image
                      source={{ uri: player.headshot }}
                      style={styles.playerHeadshot}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderHeadshot}>
                      <Text style={styles.placeholderText}>
                        {player.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.name}
                  </Text>
                  {player.starter && (
                    <View style={styles.starterBadge}>
                      <Text style={styles.starterText}>S</Text>
                    </View>
                  )}
                </View>
                <View style={styles.positionCell}>
                  <Text style={styles.positionText}>{player.position || '--'}</Text>
                </View>
                {statCategories.map((category) => {
                  const value = player.stats[category.key];
                  return (
                    <View key={category.key} style={styles.statCell}>
                      <Text style={styles.statText}>
                        {value !== undefined ? value : '--'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </BlurView>
      </ScrollView>

      {/* Sort Instructions */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap column headers to sort • S = Starter
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
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
  teamSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  teamButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  teamButtonActive: {
    backgroundColor: '#1A1A1A',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  teamButtonLogo: {
    width: 20,
    height: 20,
  },
  teamButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  teamButtonTextActive: {
    color: '#FFFFFF',
  },
  tableScroll: {
    flex: 1,
  },
  tableCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerNameHeaderCell: {
    width: 180,
    justifyContent: 'center',
  },
  positionHeaderCell: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statHeaderCell: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTextActive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sortIndicator: {
    fontSize: 10,
  },
  tableBody: {
    maxHeight: 500,
  },
  playerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  alternateRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  starterRow: {
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  playerNameCell: {
    width: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerHeadshot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholderHeadshot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  playerName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  starterBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  positionCell: {
    width: 50,
    alignItems: 'center',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statCell: {
    width: 60,
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SportsAPI } from '../services/sportsApi';

interface RankingsWidgetProps {
  sport: 'NCAAF' | 'NCAAB';
  limit?: number;
}

interface RankedTeam {
  rank: number;
  previousRank: number;
  team: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
  };
  record: string;
  points?: number;
}

export function RankingsWidget({ sport, limit = 10 }: RankingsWidgetProps) {
  const [rankings, setRankings] = useState<RankedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
  }, [sport]);

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await SportsAPI.getCollegeRankings(sport);

      if (!data || !data.rankings || data.rankings.length === 0) {
        setError('Rankings not available');
        setRankings([]);
        return;
      }

      // ESPN returns multiple polls (AP, Coaches, etc.)
      // Use the first poll (usually AP Poll)
      const poll = data.rankings[0];
      const rankedTeams: RankedTeam[] = poll.ranks.map((rank: any) => ({
        rank: rank.current,
        previousRank: rank.previous || rank.current,
        team: {
          id: rank.team.id,
          name: rank.team.displayName || rank.team.name,
          abbreviation: rank.team.abbreviation || rank.team.shortName,
          logo: rank.team.logo || rank.team.logos?.[0]?.href || '',
        },
        record: rank.recordSummary || '',
        points: rank.points,
      }));

      setRankings(rankedTeams);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError('Failed to load rankings');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="trophy" size={18} color="#FFD700" />
          <Text style={styles.headerText}>Top 25 Rankings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      </View>
    );
  }

  if (error || rankings.length === 0) {
    return null; // Don't show widget if no rankings available
  }

  const displayedRankings = expanded ? rankings : rankings.slice(0, limit);

  const getRankChangeIcon = (current: number, previous: number) => {
    if (current < previous) {
      return <Ionicons name="arrow-up" size={12} color="#22c55e" />;
    } else if (current > previous) {
      return <Ionicons name="arrow-down" size={12} color="#ef4444" />;
    }
    return <Ionicons name="remove" size={12} color="#9ca3af" />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={18} color="#FFD700" />
          <Text style={styles.headerText}>Top 25 Rankings</Text>
        </View>
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.expandButton}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>
            {expanded ? 'Show Less' : `Show All (${rankings.length})`}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.rankingsList}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {displayedRankings.map((rankedTeam) => (
          <View key={rankedTeam.rank} style={styles.rankingItem}>
            <View style={styles.rankColumn}>
              <Text style={styles.rankNumber}>{rankedTeam.rank}</Text>
              {getRankChangeIcon(rankedTeam.rank, rankedTeam.previousRank)}
            </View>

            {rankedTeam.team.logo ? (
              <Image
                source={{ uri: rankedTeam.team.logo }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.teamLogoPlaceholder} />
            )}

            <View style={styles.teamInfo}>
              <Text style={styles.teamName} numberOfLines={1}>
                {rankedTeam.team.name}
              </Text>
              <Text style={styles.teamRecord}>{rankedTeam.record}</Text>
            </View>

            {rankedTeam.points && (
              <Text style={styles.points}>{rankedTeam.points} pts</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  rankingsList: {
    maxHeight: 400,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankColumn: {
    width: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    width: 24,
  },
  teamLogo: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  teamLogoPlaceholder: {
    width: 28,
    height: 28,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 14,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  teamRecord: {
    fontSize: 12,
    color: '#666',
  },
  points: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginLeft: 8,
  },
});

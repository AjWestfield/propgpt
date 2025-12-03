import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGameDetail } from '../hooks/useGameDetail';
import { GameDetailHeader } from '../components/GameDetailHeader';
import { TeamBoxScore } from '../components/TeamBoxScore';
import { PlayerBoxScore } from '../components/PlayerBoxScore';
import { OddsComparison } from '../components/OddsComparison';
import { Sport } from '../types/game';
import { SportsAPI } from '../services/sportsApi';
import { isHalftime } from '../utils/gameStatus';

type RootStackParamList = {
  GameDetail: {
    gameId: string;
    sport: Sport;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'GameDetail'>;

type TabType = 'overview' | 'team' | 'player' | 'odds';

export function GameDetailScreen({ route, navigation }: Props) {
  const { gameId, sport } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const {
    gameData,
    loading,
    refreshing,
    error,
    isLive,
    lastUpdated,
    refresh,
  } = useGameDetail(gameId, sport);

  // Loading state
  if (loading && !gameData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Details</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Loading game details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !gameData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Details</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!gameData) {
    return null;
  }

  // Extract game info with improved path resolution
  console.log('[GameDetailScreen] Processing gameData:', {
    hasHeader: !!gameData.gameInfo.header,
    hasCompetitions: !!gameData.gameInfo.competitions,
    hasBoxScore: !!gameData.boxScore,
    hasOdds: !!gameData.odds,
  });

  console.log('[GameDetailScreen] gameInfo structure:', {
    topLevelKeys: Object.keys(gameData.gameInfo),
    headerKeys: gameData.gameInfo.header ? Object.keys(gameData.gameInfo.header) : null,
    hasHeaderCompetitions: !!gameData.gameInfo.header?.competitions,
    headerCompetitionsLength: gameData.gameInfo.header?.competitions?.length,
  });

  const competition =
    gameData.gameInfo.header?.competitions?.[0] ||
    gameData.gameInfo.competitions?.[0];

  console.log('[GameDetailScreen] Competition found:', {
    found: !!competition,
    fromHeader: !!gameData.gameInfo.header?.competitions?.[0],
    fromRoot: !!gameData.gameInfo.competitions?.[0],
  });

  if (!competition) {
    console.error('[GameDetailScreen] No competition data found in gameInfo');
    console.error('[GameDetailScreen] Full gameInfo keys:', Object.keys(gameData.gameInfo));
    console.error('[GameDetailScreen] Header keys:', gameData.gameInfo.header ? Object.keys(gameData.gameInfo.header) : 'no header');
    console.error('[GameDetailScreen] Header.competitions:', gameData.gameInfo.header?.competitions);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Details</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Unable to load game data</Text>
          <Text style={styles.errorSubtext}>Competition data not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const competitors = competition.competitors || [];
  const homeTeam = competitors.find((c: any) => c.homeAway === 'home');
  const awayTeam = competitors.find((c: any) => c.homeAway === 'away');

  console.log('[GameDetailScreen] Teams extracted:', {
    hasHomeTeam: !!homeTeam,
    hasAwayTeam: !!awayTeam,
    competitorsCount: competitors.length,
    homeTeamName: homeTeam?.team?.displayName,
    awayTeamName: awayTeam?.team?.displayName,
    competitorsStructure: competitors.map((c: any) => ({
      homeAway: c.homeAway,
      teamName: c.team?.displayName,
      teamId: c.team?.id,
    })),
  });

  if (!homeTeam || !awayTeam) {
    console.error('[GameDetailScreen] Missing team data:', {
      homeTeamFound: !!homeTeam,
      awayTeamFound: !!awayTeam,
      competitorsCount: competitors.length,
    });
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Details</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Unable to load team data</Text>
          <Text style={styles.errorSubtext}>Team information not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = competition?.status?.type;
  const gameStatus = status?.completed ? 'final' : isLive ? 'in_progress' : 'scheduled';
  const period = competition.status?.period;
  const clock = competition.status?.displayClock;
  const halftime = isHalftime(
    sport,
    period,
    clock,
    status?.description || status?.detail || status?.shortDetail
  );

  // Format status text
  let statusText = status?.shortDetail || 'Scheduled';
  if (isLive) {
    if (halftime) {
      statusText = 'Half Time';
    } else if (clock && period) {
      statusText = `Q${period} - ${clock}`;
    }
  }

  const score = {
    home: homeTeam.score || '0',
    away: awayTeam.score || '0',
    period,
    clock,
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'information-circle' },
    { id: 'team', label: 'Team Stats', icon: 'people' },
    { id: 'player', label: 'Players', icon: 'person' },
    { id: 'odds', label: 'Odds', icon: 'cash' },
  ];

  console.log('[GameDetailScreen] About to render main view with:', {
    homeTeamName: homeTeam.team.displayName,
    awayTeamName: awayTeam.team.displayName,
    gameStatus,
    statusText,
    score,
    activeTab,
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sport} Game</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Game Header */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#EF4444"
            colors={['#EF4444']}
          />
        }
      >
        <GameDetailHeader
          homeTeam={{
            id: homeTeam.team.id,
            displayName: homeTeam.team.displayName,
            abbreviation: homeTeam.team.abbreviation,
            logo: SportsAPI.getTeamLogoUrl(homeTeam.team.id, sport, homeTeam.team.logo),
            record: homeTeam.records?.[0]?.summary,
          }}
          awayTeam={{
            id: awayTeam.team.id,
            displayName: awayTeam.team.displayName,
            abbreviation: awayTeam.team.abbreviation,
            logo: SportsAPI.getTeamLogoUrl(awayTeam.team.id, sport, awayTeam.team.logo),
            record: awayTeam.records?.[0]?.summary,
          }}
          score={score}
          status={gameStatus}
          statusText={statusText}
          venue={competition.venue?.fullName}
          broadcast={competition.broadcasts?.flatMap((b: any) => b.names || [])}
          isLive={isLive}
        />

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? '#EF4444' : 'rgba(255, 255, 255, 0.5)'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <View style={styles.overviewTab}>
              <Text style={styles.overviewTitle}>Game Information</Text>

              {gameData.boxScore && (
                <View style={styles.overviewSection}>
                  <Text style={styles.overviewLabel}>Last Updated</Text>
                  <Text style={styles.overviewValue}>
                    {new Date(gameData.boxScore.lastUpdated).toLocaleTimeString()}
                  </Text>
                </View>
              )}

              <Text style={styles.overviewText}>
                Swipe down to refresh game data. Live games update automatically every 10-15 seconds.
              </Text>
            </View>
          )}

          {activeTab === 'team' && (
            gameData.boxScore ? (
              <TeamBoxScore
                homeTeam={gameData.boxScore.teamStats.home}
                awayTeam={gameData.boxScore.teamStats.away}
                sport={sport}
              />
            ) : (
              <View style={styles.emptyTabContainer}>
                <Ionicons name="stats-chart-outline" size={48} color="#6B7280" />
                <Text style={styles.emptyTabText}>Box score not available</Text>
                <Text style={styles.emptyTabSubtext}>
                  {status?.state === 'pre'
                    ? 'Stats will appear once the game starts'
                    : 'Unable to load box score data'}
                </Text>
              </View>
            )
          )}

          {activeTab === 'player' && (
            gameData.boxScore ? (
              <PlayerBoxScore
                homeTeamName={homeTeam.team.abbreviation}
                awayTeamName={awayTeam.team.abbreviation}
                homeTeamLogo={SportsAPI.getTeamLogoUrl(homeTeam.team.id, sport, homeTeam.team.logo)}
                awayTeamLogo={SportsAPI.getTeamLogoUrl(awayTeam.team.id, sport, awayTeam.team.logo)}
                homePlayers={gameData.boxScore.playerStats.home}
                awayPlayers={gameData.boxScore.playerStats.away}
                sport={sport}
              />
            ) : (
              <View style={styles.emptyTabContainer}>
                <Ionicons name="people-outline" size={48} color="#6B7280" />
                <Text style={styles.emptyTabText}>Player stats not available</Text>
                <Text style={styles.emptyTabSubtext}>
                  {status?.state === 'pre'
                    ? 'Player stats will appear once the game starts'
                    : 'Unable to load player data'}
                </Text>
              </View>
            )
          )}

          {activeTab === 'odds' && (
            <OddsComparison
              odds={gameData.odds}
              homeTeamAbbr={homeTeam.team.abbreviation}
              awayTeamAbbr={awayTeam.team.abbreviation}
              homeTeamLogo={SportsAPI.getTeamLogoUrl(homeTeam.team.id, sport, homeTeam.team.logo)}
              awayTeamLogo={SportsAPI.getTeamLogoUrl(awayTeam.team.id, sport, awayTeam.team.logo)}
            />
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tabTextActive: {
    color: '#EF4444',
  },
  tabContent: {
    flex: 1,
    marginTop: 16,
  },
  emptyTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyTabSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  overviewTab: {
    padding: 16,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  overviewSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overviewText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
    marginTop: 16,
  },
});

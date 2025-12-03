import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sport } from '../../types/game';
import { TrendCategory } from '../../types/trends';

interface TrendFiltersProps {
  selectedSport: Sport | 'all';
  selectedCategory: TrendCategory;
  onSportChange: (sport: Sport | 'all') => void;
  onCategoryChange: (category: TrendCategory) => void;
}

const SPORT_LOGOS: Partial<Record<Sport, string>> = {
  NBA: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
  NFL: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
  MLB: 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
  NHL: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
};

const SPORTS: Array<{ value: Sport | 'all'; label: string; logo?: string }> = [
  { value: 'all', label: 'All Sports' },
  { value: 'NBA', label: 'NBA', logo: SPORT_LOGOS.NBA },
  { value: 'NFL', label: 'NFL', logo: SPORT_LOGOS.NFL },
  { value: 'MLB', label: 'MLB', logo: SPORT_LOGOS.MLB },
  { value: 'NHL', label: 'NHL', logo: SPORT_LOGOS.NHL },
];

const CATEGORIES: Array<{ value: TrendCategory; label: string; icon: string; color: string }> = [
  { value: 'all', label: 'All', icon: 'flame', color: '#F59E0B' },
  { value: 'betting', label: 'Betting', icon: 'trending-up', color: '#EF4444' },
  { value: 'player', label: 'Players', icon: 'person', color: '#8B5CF6' },
  { value: 'team', label: 'Teams', icon: 'people', color: '#10B981' },
  { value: 'injury', label: 'Injuries', icon: 'medkit', color: '#F59E0B' },
  { value: 'news', label: 'News', icon: 'newspaper', color: '#3B82F6' },
];

export const TrendFilters: React.FC<TrendFiltersProps> = ({
  selectedSport,
  selectedCategory,
  onSportChange,
  onCategoryChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Sport filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.sportsRow}
      >
        {SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport.value}
            style={[
              styles.sportPill,
              selectedSport === sport.value && styles.sportPillActive,
            ]}
            onPress={() => onSportChange(sport.value)}
            activeOpacity={0.7}
          >
            {sport.value === 'all' ? (
              <Ionicons
                name="apps"
                size={16}
                color={selectedSport === sport.value ? '#0A0A0A' : '#9CA3AF'}
                style={styles.sportIcon}
              />
            ) : (
              <Image
                source={{ uri: sport.logo }}
                style={styles.sportLogo}
                resizeMode="contain"
              />
            )}
            <Text
              style={[
                styles.sportPillText,
                selectedSport === sport.value && styles.sportPillTextActive,
              ]}
            >
              {sport.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.categoryRow}
      >
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.value;

          return (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.categoryTab,
                isActive && [
                  styles.categoryTabActive,
                  { backgroundColor: `${category.color}20` },
                ],
              ]}
              onPress={() => onCategoryChange(category.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={isActive ? category.color : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.categoryText,
                  isActive && { color: category.color },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    paddingVertical: 12,
  },
  sportsRow: {
    marginBottom: 12,
  },
  categoryRow: {},
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sportPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  sportPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  sportPillTextActive: {
    color: '#0A0A0A',
  },
  sportLogo: {
    width: 18,
    height: 18,
  },
  sportIcon: {
    marginRight: 2,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});

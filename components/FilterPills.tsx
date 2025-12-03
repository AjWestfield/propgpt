import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export type FilterType = 'ev+' | 'boosts' | 'arbitrage' | 'middle';

interface FilterPill {
  id: FilterType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const FILTERS: FilterPill[] = [
  {
    id: 'ev+',
    label: 'EV+',
    icon: 'trending-up',
    color: '#00D9FF', // Cyan
  },
  {
    id: 'boosts',
    label: 'Boosts',
    icon: 'flash',
    color: '#F59E0B', // Amber
  },
  {
    id: 'arbitrage',
    label: 'Arbitrage',
    icon: 'shield-checkmark',
    color: '#10B981', // Green
  },
  {
    id: 'middle',
    label: 'Middle Bets',
    icon: 'analytics',
    color: '#8B5CF6', // Purple
  },
];

interface FilterPillsProps {
  activeFilters: FilterType[];
  onToggleFilter: (filter: FilterType) => void;
}

export function FilterPills({ activeFilters, onToggleFilter }: FilterPillsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilters.includes(filter.id);

          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => onToggleFilter(filter.id)}
              activeOpacity={0.7}
            >
              <BlurView
                intensity={isActive ? 70 : 50}
                tint="dark"
                style={[
                  styles.pill,
                  isActive && { backgroundColor: `${filter.color}20` },
                ]}
              >
                <View
                  style={[
                    styles.pillContent,
                    isActive && { borderColor: filter.color },
                  ]}
                >
                  <Ionicons
                    name={filter.icon}
                    size={16}
                    color={isActive ? filter.color : '#AEAEB2'}
                  />
                  <Text
                    style={[
                      styles.pillText,
                      isActive && { color: filter.color },
                    ]}
                  >
                    {filter.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.activeDot, { backgroundColor: filter.color }]} />
                  )}
                </View>
              </BlurView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {activeFilters.length > 0 && (
        <TouchableOpacity
          onPress={() => activeFilters.forEach(onToggleFilter)}
          style={styles.clearButton}
        >
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AEAEB2',
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
  },
  clearButton: {
    marginLeft: 8,
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    letterSpacing: 0.1,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentFootballWeek } from '../services/seasonDetector';

interface WeekNavigatorProps {
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
}

// College football typically has 14 regular season weeks + bowl/playoff weeks
const REGULAR_SEASON_WEEKS = Array.from({ length: 14 }, (_, i) => i + 1);
const POSTSEASON_WEEKS = [
  { number: 15, label: 'Conf Champ' },
  { number: 16, label: 'Bowl Week' },
  { number: 17, label: 'Playoff' },
];

export function WeekNavigator({ selectedWeek, onSelectWeek }: WeekNavigatorProps) {
  const currentWeek = getCurrentFootballWeek();

  const getWeekLabel = (weekNumber: number): string => {
    const postseasonWeek = POSTSEASON_WEEKS.find(w => w.number === weekNumber);
    if (postseasonWeek) {
      return postseasonWeek.label;
    }
    return `Week ${weekNumber}`;
  };

  const isCurrentWeek = (weekNumber: number): boolean => {
    return currentWeek === weekNumber;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={16} color="#666" />
        <Text style={styles.headerText}>Select Week</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Regular Season Weeks */}
        {REGULAR_SEASON_WEEKS.map((week) => {
          const isSelected = selectedWeek === week;
          const isCurrent = isCurrentWeek(week);

          return (
            <TouchableOpacity
              key={week}
              style={[
                styles.weekChip,
                isSelected && styles.weekChipSelected,
                isCurrent && !isSelected && styles.weekChipCurrent,
              ]}
              onPress={() => onSelectWeek(week)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.weekNumber,
                  isSelected && styles.weekNumberSelected,
                  isCurrent && !isSelected && styles.weekNumberCurrent,
                ]}
              >
                {week}
              </Text>
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>NOW</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Postseason Weeks */}
        {POSTSEASON_WEEKS.map((week) => {
          const isSelected = selectedWeek === week.number;
          const isCurrent = isCurrentWeek(week.number);

          return (
            <TouchableOpacity
              key={week.number}
              style={[
                styles.weekChip,
                styles.postseasonChip,
                isSelected && styles.weekChipSelected,
                isCurrent && !isSelected && styles.weekChipCurrent,
              ]}
              onPress={() => onSelectWeek(week.number)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.postseasonText,
                  isSelected && styles.weekNumberSelected,
                  isCurrent && !isSelected && styles.weekNumberCurrent,
                ]}
              >
                {week.label}
              </Text>
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>NOW</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Quick jump to current week */}
      {currentWeek && selectedWeek !== currentWeek && (
        <TouchableOpacity
          style={styles.jumpButton}
          onPress={() => onSelectWeek(currentWeek)}
          activeOpacity={0.7}
        >
          <Ionicons name="flash" size={14} color="#007AFF" />
          <Text style={styles.jumpButtonText}>Jump to Current Week</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  weekChip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  weekChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  weekChipCurrent: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  postseasonChip: {
    width: 'auto',
    minWidth: 80,
    paddingHorizontal: 12,
    borderRadius: 25,
  },
  weekNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  weekNumberSelected: {
    color: '#fff',
  },
  weekNumberCurrent: {
    color: '#22c55e',
  },
  postseasonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  currentBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  currentBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginHorizontal: 16,
    gap: 6,
  },
  jumpButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
});

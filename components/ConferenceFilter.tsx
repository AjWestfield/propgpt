import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConferenceFilterProps {
  sport: 'NCAAF' | 'NCAAB';
  selectedConference: string;
  onSelectConference: (conference: string) => void;
}

// Major conferences for college sports
const FOOTBALL_CONFERENCES = [
  { id: 'all', name: 'All Conferences', abbreviation: 'ALL' },
  { id: 'sec', name: 'SEC', abbreviation: 'SEC' },
  { id: 'big-ten', name: 'Big Ten', abbreviation: 'B1G' },
  { id: 'acc', name: 'ACC', abbreviation: 'ACC' },
  { id: 'big-12', name: 'Big 12', abbreviation: 'B12' },
  { id: 'pac-12', name: 'Pac-12', abbreviation: 'P12' },
  { id: 'aac', name: 'American', abbreviation: 'AAC' },
  { id: 'mwc', name: 'Mountain West', abbreviation: 'MWC' },
  { id: 'sun-belt', name: 'Sun Belt', abbreviation: 'SBC' },
  { id: 'cusa', name: 'C-USA', abbreviation: 'CUSA' },
  { id: 'mac', name: 'MAC', abbreviation: 'MAC' },
];

const BASKETBALL_CONFERENCES = [
  { id: 'all', name: 'All Conferences', abbreviation: 'ALL' },
  { id: 'sec', name: 'SEC', abbreviation: 'SEC' },
  { id: 'big-ten', name: 'Big Ten', abbreviation: 'B1G' },
  { id: 'acc', name: 'ACC', abbreviation: 'ACC' },
  { id: 'big-12', name: 'Big 12', abbreviation: 'B12' },
  { id: 'pac-12', name: 'Pac-12', abbreviation: 'P12' },
  { id: 'big-east', name: 'Big East', abbreviation: 'BE' },
  { id: 'aac', name: 'American', abbreviation: 'AAC' },
  { id: 'a10', name: 'Atlantic 10', abbreviation: 'A10' },
  { id: 'wcc', name: 'WCC', abbreviation: 'WCC' },
  { id: 'mwc', name: 'Mountain West', abbreviation: 'MWC' },
];

export function ConferenceFilter({
  sport,
  selectedConference,
  onSelectConference,
}: ConferenceFilterProps) {
  const conferences = sport === 'NCAAF' ? FOOTBALL_CONFERENCES : BASKETBALL_CONFERENCES;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="filter" size={16} color="#666" />
        <Text style={styles.headerText}>Filter by Conference</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {conferences.map((conference) => {
          const isSelected = selectedConference === conference.id;

          return (
            <TouchableOpacity
              key={conference.id}
              style={[
                styles.conferenceChip,
                isSelected && styles.conferenceChipSelected,
              ]}
              onPress={() => onSelectConference(conference.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.conferenceText,
                  isSelected && styles.conferenceTextSelected,
                ]}
              >
                {conference.abbreviation}
              </Text>
              {conference.id === 'all' && (
                <Ionicons
                  name="grid"
                  size={12}
                  color={isSelected ? '#fff' : '#666'}
                  style={styles.allIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  conferenceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'center',
  },
  conferenceChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  conferenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  conferenceTextSelected: {
    color: '#fff',
  },
  allIcon: {
    marginLeft: 4,
  },
});

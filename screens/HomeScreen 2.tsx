import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { PropCard } from '../components/PropCard';
import { mockPlayerProps, featuredProps, trendingProps } from '../data/mockProps';

const { width } = Dimensions.get('window');

type Sport = 'ALL' | 'NBA' | 'NFL' | 'MLB' | 'NHL';

export function HomeScreen({ navigation }: any) {
  const [selectedSport, setSelectedSport] = useState<Sport>('ALL');

  const sports: { label: Sport; icon: string }[] = [
    { label: 'ALL', icon: '⭐' },
    { label: 'NBA', icon: '🏀' },
    { label: 'NFL', icon: '🏈' },
    { label: 'MLB', icon: '⚾' },
    { label: 'NHL', icon: '🏒' },
  ];

  const filteredProps = selectedSport === 'ALL'
    ? mockPlayerProps
    : mockPlayerProps.filter(prop => prop.sport === selectedSport);

  const handlePropPress = (propId: string) => {
    // Navigate to detail screen (to be implemented)
    console.log('Prop pressed:', propId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back 👋</Text>
            <Text style={styles.title}>PropGPT</Text>
          </View>
          <BlurView intensity={60} tint="dark" style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </BlurView>
        </View>

        {/* Sports Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sportsScroll}
          contentContainerStyle={styles.sportsContent}
        >
          {sports.map((sport) => (
            <TouchableOpacity
              key={sport.label}
              onPress={() => setSelectedSport(sport.label)}
              activeOpacity={0.8}
              style={styles.sportTouchable}
            >
              <BlurView
                intensity={selectedSport === sport.label ? 80 : 50}
                tint="dark"
                style={[
                  styles.sportButton,
                  selectedSport === sport.label && styles.sportButtonActive,
                ]}
              >
                <Text style={styles.sportIcon}>{sport.icon}</Text>
                <Text
                  style={[
                    styles.sportLabel,
                    selectedSport === sport.label && styles.sportLabelActive,
                  ]}
                >
                  {sport.label}
                </Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Props Section */}
        {selectedSport === 'ALL' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Featured Props</Text>
              <Text style={styles.sectionSubtitle}>High confidence picks</Text>
            </View>
            {featuredProps.slice(0, 3).map((prop) => (
              <PropCard key={prop.id} prop={prop} onPress={() => handlePropPress(prop.id)} />
            ))}
          </View>
        )}

        {/* Trending Section */}
        {selectedSport === 'ALL' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📈 Trending Up</Text>
              <Text style={styles.sectionSubtitle}>Hot streaks & momentum</Text>
            </View>
            {trendingProps.slice(0, 2).map((prop) => (
              <PropCard key={prop.id} prop={prop} onPress={() => handlePropPress(prop.id)} />
            ))}
          </View>
        )}

        {/* All Props */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedSport === 'ALL' ? '🎯 All Props' : `${selectedSport} Props`}
            </Text>
            <Text style={styles.sectionSubtitle}>{filteredProps.length} available</Text>
          </View>
          {filteredProps.map((prop) => (
            <PropCard key={prop.id} prop={prop} onPress={() => handlePropPress(prop.id)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#AEAEB2',
    marginBottom: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
  },
  profileIcon: {
    fontSize: 20,
  },
  sportsScroll: {
    marginBottom: 24,
  },
  sportsContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  sportTouchable: {
    marginRight: 10,
  },
  sportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(28, 28, 30, 0.5)',
    minWidth: 90,
  },
  sportButtonActive: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sportIcon: {
    fontSize: 20,
  },
  sportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AEAEB2',
    letterSpacing: 0.3,
  },
  sportLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },
});

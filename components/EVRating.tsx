import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EVRatingProps {
  evPercentage: number; // Expected value percentage (e.g., 4.2 means +4.2%)
  size?: 'small' | 'medium' | 'large';
  showStars?: boolean;
}

export function EVRating({ evPercentage, size = 'medium', showStars = true }: EVRatingProps) {
  // Calculate star rating (0-5) based on EV percentage
  // 0-2% = 2 stars, 2-4% = 3 stars, 4-6% = 4 stars, 6%+ = 5 stars
  const getStarCount = (): number => {
    if (evPercentage < 0) return 1;
    if (evPercentage < 2) return 2;
    if (evPercentage < 4) return 3;
    if (evPercentage < 6) return 4;
    return 5;
  };

  const starCount = getStarCount();
  const isPositive = evPercentage > 0;

  const sizeStyles = {
    small: { text: 11, star: 12, badge: 18, badgeText: 10 },
    medium: { text: 13, star: 14, badge: 22, badgeText: 11 },
    large: { text: 15, star: 16, badge: 26, badgeText: 12 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      {showStars && (
        <View style={styles.starsContainer}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < starCount ? 'star' : 'star-outline'}
              size={currentSize.star}
              color={index < starCount ? '#F59E0B' : '#3A3A3C'}
            />
          ))}
        </View>
      )}

      <View
        style={[
          styles.evBadge,
          {
            backgroundColor: isPositive
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(239, 68, 68, 0.15)',
            height: currentSize.badge,
          },
        ]}
      >
        <Text
          style={[
            styles.evText,
            {
              color: isPositive ? '#10B981' : '#EF4444',
              fontSize: currentSize.badgeText,
            },
          ]}
        >
          {isPositive ? '+' : ''}
          {evPercentage.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  evBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    justifyContent: 'center',
  },
  evText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

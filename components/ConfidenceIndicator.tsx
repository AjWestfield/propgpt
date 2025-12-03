import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConfidenceIndicatorProps {
  confidence: number; // 0-100
  size?: 'small' | 'medium' | 'large';
}

export function ConfidenceIndicator({ confidence, size = 'medium' }: ConfidenceIndicatorProps) {
  const getColor = () => {
    if (confidence >= 85) return '#10B981'; // Green
    if (confidence >= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getLabel = () => {
    if (confidence >= 85) return 'HIGH';
    if (confidence >= 70) return 'MEDIUM';
    return 'LOW';
  };

  const barWidth = size === 'small' ? 80 : size === 'medium' ? 120 : 160;
  const barHeight = size === 'small' ? 6 : size === 'medium' ? 8 : 10;
  const fontSize = size === 'small' ? 11 : size === 'medium' ? 13 : 15;

  const color = getColor();
  const label = getLabel();

  return (
    <View style={styles.container}>
      <View style={[styles.barBackground, { width: barWidth, height: barHeight }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${confidence}%`,
              backgroundColor: color,
              height: barHeight,
            },
          ]}
        />
      </View>
      <View style={styles.labelRow}>
        <Text style={[styles.percentage, { fontSize, color }]}>{confidence}%</Text>
        <Text style={[styles.label, { fontSize: fontSize - 2, color }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  barBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentage: {
    fontWeight: '700',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

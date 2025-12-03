import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export interface ComparisonBarData {
  label: string;
  value1: number;
  value2: number;
  color1?: string;
  color2?: string;
}

interface ComparisonBarsProps {
  data: ComparisonBarData[];
  title?: string;
  subtitle?: string;
  label1?: string;
  label2?: string;
}

export function ComparisonBars({
  data,
  title,
  subtitle,
  label1 = 'Value 1',
  label2 = 'Value 2',
}: ComparisonBarsProps) {
  // Find max value for scaling
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.value1, item.value2])
  );

  return (
    <BlurView intensity={60} tint="dark" style={styles.container}>
      <View
        style={[
          styles.content,
          {
            backgroundColor: 'rgba(28, 28, 30, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
          },
        ]}
      >
        {/* Header */}
        {(title || subtitle) && (
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>{label1}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>{label2}</Text>
          </View>
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barGroup}>
              {/* Label */}
              <Text style={styles.barLabel}>{item.label}</Text>

              {/* Bar 1 */}
              <View style={styles.barRow}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${(item.value1 / maxValue) * 100}%`,
                      backgroundColor: item.color1 || '#10B981',
                    },
                  ]}
                >
                  <Text style={styles.barValue}>{item.value1.toFixed(1)}</Text>
                </View>
              </View>

              {/* Bar 2 */}
              <View style={styles.barRow}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${(item.value2 / maxValue) * 100}%`,
                      backgroundColor: item.color2 || '#EF4444',
                    },
                  ]}
                >
                  <Text style={styles.barValue}>{item.value2.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  content: {
    borderRadius: 20,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#AEAEB2',
    letterSpacing: 0.1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 12,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AEAEB2',
  },
  barsContainer: {
    gap: 16,
  },
  barGroup: {
    gap: 6,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
  },
  bar: {
    minWidth: 60,
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

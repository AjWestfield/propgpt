import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { BlurView } from 'expo-blur';

export interface BarChartDataPoint {
  x: string; // Label (e.g., game date, opponent)
  y: number; // Value
  label?: string; // Optional label to display on bar
  color?: string; // Optional color override
}

interface BarChartProps {
  data: BarChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  showValues?: boolean;
  positiveColor?: string;
  negativeColor?: string;
  threshold?: number; // Value to determine positive/negative coloring
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function BarChart({
  data,
  title,
  subtitle,
  height = 280,
  showValues = true,
  positiveColor = '#10B981',
  negativeColor = '#EF4444',
  threshold = 0,
}: BarChartProps) {
  // Prepare data for react-native-chart-kit
  const chartData = {
    labels: data.map(d => d.x),
    datasets: [
      {
        data: data.map(d => d.y),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(28, 28, 30, 0)',
    backgroundGradientTo: 'rgba(28, 28, 30, 0)',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(174, 174, 178, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '4',
      stroke: 'rgba(255, 255, 255, 0.05)',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 10,
      fontWeight: '500',
    },
    barPercentage: 0.7,
    fillShadowGradient: positiveColor,
    fillShadowGradientOpacity: 1,
  };

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

        {/* Chart */}
        <RNBarChart
          data={chartData}
          width={SCREEN_WIDTH - 64}
          height={height}
          chartConfig={chartConfig}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          yAxisLabel=""
          yAxisSuffix=""
          showValuesOnTopOfBars={showValues}
          fromZero={true}
          withInnerLines={true}
        />

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: positiveColor }]} />
            <Text style={styles.legendText}>Over/Hit</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: negativeColor }]} />
            <Text style={styles.legendText}>Under/Miss</Text>
          </View>
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
    marginBottom: 12,
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
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
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
    fontWeight: '500',
    color: '#AEAEB2',
  },
});

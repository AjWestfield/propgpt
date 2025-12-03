import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Line, Rect, Text as SvgText, G } from 'react-native-svg';
import { ChartDataPoint } from '../utils/chartDataFormatter';

interface EnhancedBarChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  thresholdValue?: number; // The betting line value
  showThresholdLine?: boolean;
  showValues?: boolean;
  showLegend?: boolean;
  containerStyle?: any;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const BAR_WIDTH = 24;
const BAR_SPACING = 12;
const PADDING = 20;
const CHART_PADDING_TOP = 40;
const CHART_PADDING_BOTTOM = 60;
const Y_AXIS_WIDTH = 40;

export function EnhancedBarChart({
  data,
  title,
  subtitle,
  height = 280,
  thresholdValue,
  showThresholdLine = true,
  showValues = true,
  showLegend = true,
  containerStyle,
}: EnhancedBarChartProps) {
  const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animate bars on mount
    Animated.stagger(
      50,
      animatedValues.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        })
      )
    ).start();
  }, []);

  if (data.length === 0) {
    return (
      <BlurView intensity={60} tint="dark" style={[styles.container, containerStyle]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </BlurView>
    );
  }

  // Calculate chart dimensions
  const chartWidth = (BAR_WIDTH + BAR_SPACING) * data.length + BAR_SPACING;
  const chartHeight = height - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  // Calculate value range with padding
  const dataMax = Math.max(...data.map(d => d.y));
  const dataMin = Math.min(...data.map(d => d.y), 0);
  const includeThreshold = thresholdValue || 0;

  // Add 10% padding to max for better visualization
  const maxValue = Math.ceil(Math.max(dataMax, includeThreshold) * 1.1);
  const minValue = 0;
  const valueRange = maxValue - minValue;

  // Helper function to convert value to Y position
  const getYPosition = (value: number): number => {
    return chartHeight - ((value - minValue) / valueRange) * chartHeight;
  };

  // Calculate threshold line position if enabled
  const thresholdY = thresholdValue ? getYPosition(thresholdValue) : 0;

  return (
    <BlurView intensity={60} tint="dark" style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.content,
          {
            backgroundColor: 'rgba(28, 28, 30, 0.2)',
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

        {/* Chart Container */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          <View style={{ width: chartWidth + Y_AXIS_WIDTH + 20, height }}>
            <Svg width={chartWidth + Y_AXIS_WIDTH + 20} height={height}>
              {/* Y-Axis Labels */}
              <G x={0} y={CHART_PADDING_TOP}>
                {[0, 0.25, 0.5, 0.75, 1].map((fraction, index) => {
                  const value = minValue + valueRange * (1 - fraction);
                  const y = chartHeight * fraction;

                  return (
                    <G key={index}>
                      {/* Horizontal grid line */}
                      <Line
                        x1={Y_AXIS_WIDTH}
                        y1={y}
                        x2={Y_AXIS_WIDTH + chartWidth}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth={1}
                        strokeDasharray="4,4"
                      />
                      {/* Y-axis label */}
                      <SvgText
                        x={Y_AXIS_WIDTH - 8}
                        y={y + 4}
                        fill="#AEAEB2"
                        fontSize={10}
                        fontWeight="500"
                        textAnchor="end"
                      >
                        {Math.round(value)}
                      </SvgText>
                    </G>
                  );
                })}
              </G>

              {/* Threshold Line (Dotted horizontal line at betting line) */}
              {showThresholdLine && thresholdValue !== undefined && (
                <G x={Y_AXIS_WIDTH} y={CHART_PADDING_TOP}>
                  <Line
                    x1={0}
                    y1={thresholdY}
                    x2={chartWidth}
                    y2={thresholdY}
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="6,4"
                  />
                  {/* Threshold label */}
                  <SvgText
                    x={chartWidth - 5}
                    y={thresholdY - 6}
                    fill="#F59E0B"
                    fontSize={11}
                    fontWeight="700"
                    textAnchor="end"
                  >
                    Line: {thresholdValue}
                  </SvgText>
                </G>
              )}

              {/* Bars and Labels */}
              <G x={Y_AXIS_WIDTH + BAR_SPACING} y={CHART_PADDING_TOP}>
                {data.map((point, index) => {
                  const x = index * (BAR_WIDTH + BAR_SPACING);
                  const barHeight = ((point.y - minValue) / valueRange) * chartHeight;
                  const y = chartHeight - barHeight;

                  return (
                    <G key={index}>
                      {/* Animated Bar */}
                      <AnimatedRect
                        x={x}
                        y={y}
                        width={BAR_WIDTH}
                        height={barHeight}
                        fill={point.color}
                        rx={12}
                        ry={12}
                        opacity={animatedValues[index]}
                      />

                      {/* Value on top of bar */}
                      {showValues && (
                        <SvgText
                          x={x + BAR_WIDTH / 2}
                          y={y - 6}
                          fill="#FFFFFF"
                          fontSize={11}
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {Math.round(point.y)}
                        </SvgText>
                      )}

                      {/* X-axis label (below chart) */}
                      <SvgText
                        x={x + BAR_WIDTH / 2}
                        y={chartHeight + 15}
                        fill="#AEAEB2"
                        fontSize={9}
                        fontWeight="500"
                        textAnchor="middle"
                      >
                        {point.x.split('\n')[0]}
                      </SvgText>
                      {point.x.split('\n')[1] && (
                        <SvgText
                          x={x + BAR_WIDTH / 2}
                          y={chartHeight + 28}
                          fill="#AEAEB2"
                          fontSize={9}
                          fontWeight="500"
                          textAnchor="middle"
                        >
                          {point.x.split('\n')[1]}
                        </SvgText>
                      )}
                      {point.x.split('\n')[2] && (
                        <SvgText
                          x={x + BAR_WIDTH / 2}
                          y={chartHeight + 41}
                          fill="#6E6E73"
                          fontSize={8}
                          fontWeight="500"
                          textAnchor="middle"
                        >
                          {point.x.split('\n')[2]}
                        </SvgText>
                      )}
                    </G>
                  );
                })}
              </G>
            </Svg>
          </View>
        </ScrollView>

        {/* Legend */}
        {showLegend && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Over</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>At Line</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Under</Text>
            </View>
          </View>
        )}
      </View>
    </BlurView>
  );
}

// Animated Rect component
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  content: {
    borderRadius: 20,
    padding: PADDING,
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
  scrollContent: {
    paddingRight: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },
});

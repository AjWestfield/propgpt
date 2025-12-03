import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface LiveBadgeProps {
  label?: string;
  size?: 'default' | 'small';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function LiveBadge({ label = 'LIVE', size = 'default', style, textStyle }: LiveBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const dotSize = size === 'small' ? 6 : 8;

  return (
    <View style={[styles.container, size === 'small' && styles.containerSmall, style]}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <Text style={[styles.text, size === 'small' && styles.textSmall, textStyle]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  containerSmall: {
    gap: 4,
  },
  dot: {
    backgroundColor: '#EF4444',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#EF4444',
  },
  textSmall: {
    fontSize: 11,
  },
});

export default LiveBadge;

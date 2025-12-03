import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GameFilterButtonProps {
  selectedGameName: string;
  onPress: () => void;
  disabled?: boolean;
}

export const GameFilterButton: React.FC<GameFilterButtonProps> = ({
  selectedGameName,
  onPress,
  disabled = false,
}) => {
  // Show "Games" if "All Games" is selected, otherwise show the count or selected game
  const displayText = selectedGameName === 'All Games'
    ? 'Games'
    : selectedGameName;

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Ionicons
          name="trophy-outline"
          size={18}
          color={disabled ? '#666' : '#EF4444'}
          style={styles.icon}
        />
        <Text style={[styles.text, disabled && styles.textDisabled]} numberOfLines={1}>
          {displayText}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={disabled ? '#666' : '#999'}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(28, 28, 30, 0.5)',
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AEAEB2',
    letterSpacing: 0.2,
  },
  textDisabled: {
    color: '#666',
  },
  chevron: {
    marginLeft: 4,
  },
});

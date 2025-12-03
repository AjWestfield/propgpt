import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlayerAvatarProps {
  imageUrl?: string;
  teamLogo?: string;
  size: number;
  showTeamBadge?: boolean;
}

export function PlayerAvatar({
  imageUrl,
  teamLogo,
  size,
  showTeamBadge = true,
}: PlayerAvatarProps) {
  const borderRadius = size / 2;
  const badgeSize = Math.round(size * 0.3); // 30% of avatar size
  const badgeBorderRadius = badgeSize / 2;
  const logoSize = Math.round(badgeSize * 0.7); // 70% of badge size
  const iconSize = Math.round(size * 0.5); // 50% of avatar for placeholder icon

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.playerImage,
            {
              width: size,
              height: size,
              borderRadius,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.playerImage,
            styles.placeholderImage,
            {
              width: size,
              height: size,
              borderRadius,
            },
          ]}
        >
          <Ionicons name="person" size={iconSize} color="#6B7280" />
        </View>
      )}

      {showTeamBadge && teamLogo && (
        <View
          style={[
            styles.teamLogoBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeBorderRadius,
              bottom: -2,
              right: -2,
            },
          ]}
        >
          <Image
            source={{ uri: teamLogo }}
            style={[
              styles.teamLogoImage,
              {
                width: logoSize,
                height: logoSize,
              },
            ]}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  playerImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  teamLogoBadge: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  teamLogoImage: {},
});

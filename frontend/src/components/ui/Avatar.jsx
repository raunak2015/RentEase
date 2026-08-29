/**
 * RentEase — Reusable Avatar Component
 *
 * Displays a user profile image with a fallback showing initials.
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

export default function Avatar({ source, name, size = 44, style }) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textSize = {
    fontSize: size * 0.4,
  };

  if (source) {
    return (
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={[styles.image, containerStyle, style]}
      />
    );
  }

  return (
    <View style={[styles.fallback, containerStyle, style]}>
      <Text style={[styles.initials, textSize]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.labelLg,
    color: colors.primary,
  },
});

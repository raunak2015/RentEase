/**
 * RentEase — Reusable Loader Component
 *
 * Displays a centered loading indicator with an optional text message.
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function Loader({
  message = 'Loading...',
  fullScreen = true,
  color = colors.primary,
  size = 'large',
  style,
}) {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        style,
      ]}
    >
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

/**
 * RentEase — Reusable ErrorState Component
 *
 * Displays error icon, title, error message, and a Retry button.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import Button from './Button';

export default function ErrorState({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  buttonTitle = 'Try Again',
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <Button
          title={buttonTitle}
          onPress={onRetry}
          variant="primary"
          size="md"
          icon={<Ionicons name="reload-outline" size={18} color={colors.onPrimary} />}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.sm,
    minWidth: 160,
  },
});

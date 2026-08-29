/**
 * RentEase — Reusable EmptyState Component
 *
 * Displays an icon, title, description, and an optional call-to-action button
 * when lists or screens have no data.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import Button from './Button';

export default function EmptyState({
  icon = 'folder-open-outline',
  title = 'No Data Found',
  description,
  buttonTitle,
  onButtonPress,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={colors.textMuted} />
      </View>

      <Text style={styles.title}>{title}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      {buttonTitle && onButtonPress ? (
        <Button
          title={buttonTitle}
          onPress={onButtonPress}
          variant="primary"
          size="md"
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
    backgroundColor: colors.surfaceContainerLow,
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
  description: {
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

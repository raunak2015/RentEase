/**
 * RentEase — Reusable Tag / Chip Component
 *
 * Used for amenities (WiFi, Gym, Parking, etc.)
 * Stitch: Light gray background (#F1F5F9), small 12px text, pill radius.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius } from '@/constants/spacing';

export default function Tag({
  label,
  icon,
  selected = false,
  onPress,
  style,
}) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.tag,
        selected && styles.tagSelected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? colors.onPrimary : colors.textSecondary}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
        ]}
      >
        {label}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  tagSelected: {
    backgroundColor: colors.primary,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.labelMd,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.onPrimary,
  },
});

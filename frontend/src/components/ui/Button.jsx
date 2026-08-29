/**
 * RentEase — Reusable Button Component
 *
 * Variants: primary, secondary, outlined, danger
 * Sizes: sm, md, lg
 * Supports loading state, disabled state, and icon placement.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius } from '@/constants/spacing';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    isDisabled && styles.textDisabled,
    textStyle,
  ];

  const loaderColor =
    variant === 'primary' || variant === 'danger'
      ? colors.white
      : colors.primary;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loaderColor} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Variants
  variant_primary: {
    backgroundColor: colors.primary,
  },
  variant_secondary: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  variant_outlined: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  variant_danger: {
    backgroundColor: colors.error,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xxl,
    minHeight: 56,
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  text_primary: {
    color: colors.onPrimary,
  },
  text_secondary: {
    color: colors.textPrimary,
  },
  text_outlined: {
    color: colors.primary,
  },
  text_danger: {
    color: colors.onError,
  },
  textSize_sm: {
    ...typography.buttonSm,
  },
  textSize_md: {
    ...typography.button,
  },
  textSize_lg: {
    ...typography.button,
    fontSize: 18,
  },
  textDisabled: {
    opacity: 0.7,
  },

  // Icons
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

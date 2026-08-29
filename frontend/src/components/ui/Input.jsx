/**
 * RentEase — Reusable Input Component
 *
 * Supports label, placeholder, error message, password toggle,
 * left/right icons, and multiline mode.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius } from '@/constants/spacing';

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  editable = true,
  style,
  inputStyle,
  onBlur,
  onFocus,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  const containerStyles = [
    styles.inputContainer,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    !editable && styles.inputDisabled,
    style,
  ];

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={containerStyles}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon && { paddingLeft: 0 },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.base,
  },
  label: {
    ...typography.labelLg,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.base,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceContainerHigh,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iconLeft: {
    marginRight: spacing.md,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

/**
 * RentEase — Reusable SearchBar Component
 *
 * Elevated search bar with trailing filter icon, per Stitch design.
 */

import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search properties...',
  onFilterPress,
  showFilter = true,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchIcon}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
      </View>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />

      {showFilter && (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    minHeight: 52,
    ...shadows.md,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
  },
});

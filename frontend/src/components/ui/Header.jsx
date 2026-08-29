/**
 * RentEase — Reusable Header Component
 *
 * Stitch: Minimalist navigation with a "Back" chevron and a clear title.
 * No bottom border; uses subtle scroll-shadow when content scrolls underneath.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function Header({
  title,
  showBack = true,
  onBackPress,
  rightIcon,
  onRightPress,
  transparent = false,
  style,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.sm },
        transparent && styles.transparent,
        style,
      ]}
    >
      <View style={styles.content}>
        {/* Left: Back button */}
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={transparent ? colors.white : colors.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Center: Title */}
        <Text
          style={[
            styles.title,
            transparent && styles.titleTransparent,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right: Action icon */}
        {rightIcon ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            {typeof rightIcon === 'string' ? (
              <Ionicons
                name={rightIcon}
                size={24}
                color={transparent ? colors.white : colors.textPrimary}
              />
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.screenPadding,
  },
  transparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  titleTransparent: {
    color: colors.white,
  },
  rightButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});

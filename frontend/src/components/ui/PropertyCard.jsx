/**
 * RentEase — Reusable PropertyCard Component
 *
 * Displays property image, title, type, price, location, rating,
 * distance, and a favorite toggle.
 * Stitch: Large image at top (4:3), 24px corner radius, 16px content padding.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

export default function PropertyCard({
  image,
  title,
  type,
  price,
  location,
  rating,
  distance,
  isFavorite = false,
  onPress,
  onFavoritePress,
  style,
}) {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Favorite Button */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.error : colors.white}
            />
          </TouchableOpacity>
        )}

        {/* Property Type Badge */}
        {type && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{type}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {rating != null && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        </View>

        {location && (
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
            {distance && (
              <Text style={styles.distanceText}>{distance}</Text>
            )}
          </View>
        )}

        <Text style={styles.price}>
          ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
          <Text style={styles.priceUnit}> / month</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    textTransform: 'uppercase',
  },
  content: {
    padding: spacing.base,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 4,
  },
  locationText: {
    ...typography.bodyMd,
    color: colors.textMuted,
    flex: 1,
  },
  distanceText: {
    ...typography.labelMd,
    color: colors.textSecondary,
  },
  price: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  priceUnit: {
    ...typography.bodyMd,
    color: colors.textMuted,
    fontWeight: '400',
  },
});

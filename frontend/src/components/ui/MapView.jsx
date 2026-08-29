import React from 'react';
import { View, Text, StyleSheet, Platform, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

// Polyfill check for react-native-maps
let NativeMapView = null;
let NativeMarker = null;

try {
  if (Platform.OS !== 'web') {
    const Maps = require('react-native-maps');
    NativeMapView = Maps.default;
    NativeMarker = Maps.Marker;
  }
} catch (e) {
  console.log('Native maps not available in this environment');
}

export default function CustomMapView({
  latitude = 23.0225,
  longitude = 72.5714,
  title = 'Property Location',
  address,
  height = 200,
  style,
}) {
  const openExternalMap = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(title);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });

    Linking.openURL(url);
  };

  if (NativeMapView && NativeMarker && latitude && longitude) {
    return (
      <View style={[styles.container, { height }, style]}>
        <NativeMapView
          style={styles.map}
          initialRegion={{
            latitude: Number(latitude),
            longitude: Number(longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <NativeMarker
            coordinate={{
              latitude: Number(latitude),
              longitude: Number(longitude),
            }}
            title={title}
            description={address}
          />
        </NativeMapView>

        <TouchableOpacity
          style={styles.openMapOverlayBtn}
          onPress={openExternalMap}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate-outline" size={16} color={colors.primary} />
          <Text style={styles.openMapText}>Open Maps</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Web / Fallback Preview Card
  return (
    <View style={[styles.fallbackContainer, { height }, style]}>
      <View style={styles.fallbackContent}>
        <View style={styles.pinCircle}>
          <Ionicons name="location" size={32} color={colors.primary} />
        </View>
        <Text style={styles.fallbackTitle}>{title}</Text>
        {address ? (
          <Text style={styles.fallbackAddress} numberOfLines={2}>
            {address}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.directionsBtn}
          onPress={openExternalMap}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={16} color={colors.onPrimary} />
          <Text style={styles.directionsBtnText}>Get Directions on Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.sm,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  openMapOverlayBtn: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
    ...shadows.md,
  },
  openMapText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  fallbackContainer: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  fallbackContent: {
    alignItems: 'center',
  },
  pinCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  fallbackTitle: {
    ...typography.headlineMd,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  fallbackAddress: {
    ...typography.bodyMd,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
    maxWidth: 260,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  directionsBtnText: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
});

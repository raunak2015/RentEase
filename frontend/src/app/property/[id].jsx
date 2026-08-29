import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { propertyService } from '@/services/propertyService';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/ui/Loader';
import ErrorState from '@/components/ui/ErrorState';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import Button from '@/components/ui/Button';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userRole } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    setError(null);
    try {
      const res = await propertyService.getPropertyById(id);
      setProperty(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (property?.propertyCode) {
      Alert.alert(
        'Property Code Copied',
        `Code: ${property.propertyCode}\nYou can paste this code into the search bar to locate this listing instantly.`
      );
    }
  };

  const handleRequestVisit = () => {
    router.push({
      pathname: '/request-visit',
      params: { propertyId: id, propertyTitle: property?.title },
    });
  };

  const handleContactOwner = () => {
    if (property?.ownerId?.phone) {
      Alert.alert(
        'Contact Property Owner',
        `Owner: ${property.ownerId.name}\nPhone: ${property.ownerId.phone}\nEmail: ${property.ownerId.email}`
      );
    } else {
      Alert.alert('Contact Owner', 'Owner contact details are unavailable.');
    }
  };

  if (loading) {
    return <Loader message="Loading property details..." />;
  }

  if (error || !property) {
    return <ErrorState message={error || 'Property not found'} onRetry={fetchDetails} />;
  }

  const images = property.images && property.images.length > 0 ? property.images : [];
  const owner = property.ownerId || {};
  const isOwner = userRole === 'owner';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Gallery / Hero Image */}
        <View style={styles.imageGalleryContainer}>
          {images.length > 0 ? (
            <Image
              source={{ uri: images[selectedImageIndex] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderHero}>
              <Ionicons name="home" size={64} color={colors.textMuted} />
              <Text style={styles.placeholderHeroText}>No Image Available</Text>
            </View>
          )}

          {/* Overlay Navigation Buttons */}
          <TouchableOpacity style={styles.backOverlayButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteOverlayButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.error : colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{property.type}</Text>
          </View>
        </View>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailStrip}
          >
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.thumbnailWrapper,
                  selectedImageIndex === idx && styles.thumbnailWrapperSelected,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Title & Core Details Card */}
        <View style={styles.mainDetailsCard}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>{property.rating || 4.5}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={styles.locationText}>{property.address}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₹{property.price?.toLocaleString('en-IN') || property.price}
              <Text style={styles.priceUnit}> / month</Text>
            </Text>

            {/* Property Code Pill */}
            <TouchableOpacity style={styles.codePill} onPress={handleCopyCode} activeOpacity={0.8}>
              <Ionicons name="copy-outline" size={14} color={colors.primary} />
              <Text style={styles.codePillText}>{property.propertyCode}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Property Description</Text>
          <Text style={styles.descriptionText}>{property.description}</Text>
        </View>

        {/* Facilities Section */}
        {property.facilities && property.facilities.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
            <View style={styles.facilityWrap}>
              {property.facilities.map((facility) => (
                <Tag key={facility} label={facility} selected={false} />
              ))}
            </View>
          </View>
        )}

        {/* Owner Details Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Listed by Owner</Text>
          <View style={styles.ownerRow}>
            <Avatar source={owner.profileImage} name={owner.name} size={54} />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{owner.name || 'Property Owner'}</Text>
              <Text style={styles.ownerContact}>{owner.email || owner.phone || 'Verified Owner'}</Text>
              {owner.bio ? (
                <Text style={styles.ownerBio} numberOfLines={2}>
                  "{owner.bio}"
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      {!isOwner && (
        <View style={styles.stickyFooter}>
          <Button
            title="Contact Owner"
            onPress={handleContactOwner}
            variant="outlined"
            size="md"
            style={styles.contactBtn}
          />
          <Button
            title="Request Visit"
            onPress={handleRequestVisit}
            variant="primary"
            size="md"
            style={styles.visitBtn}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageGalleryContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderHero: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderHeroText: {
    ...typography.bodyMd,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  backOverlayButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  favoriteOverlayButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
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
  thumbnailStrip: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    marginTop: spacing.sm,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.xs,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailWrapperSelected: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  mainDetailsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.md,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headlineLg,
    fontSize: 22,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  ratingText: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  locationText: {
    ...typography.bodyMd,
    color: colors.textMuted,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  price: {
    ...typography.display,
    fontSize: 26,
    color: colors.primary,
  },
  priceUnit: {
    ...typography.bodyMd,
    color: colors.textMuted,
    fontWeight: '400',
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  codePillText: {
    ...typography.labelMd,
    color: colors.primary,
  },
  sectionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.base,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.headlineMd,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  facilityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    ...typography.labelLg,
    fontSize: 16,
    color: colors.textPrimary,
  },
  ownerContact: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  ownerBio: {
    ...typography.bodySm,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    ...shadows.lg,
  },
  contactBtn: {
    flex: 1,
  },
  visitBtn: {
    flex: 1,
  },
});

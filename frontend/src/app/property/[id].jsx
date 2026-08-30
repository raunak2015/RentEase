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
import { favoriteService } from '@/services/favoriteService';
import { useAuth } from '@/context/AuthContext';
import { calculateHaversineDistance, getCurrentUserLocation } from '@/utils/location';
import {
  copyToClipboard,
  shareProperty,
  callPhone,
  sendEmail,
  openWhatsApp,
} from '@/utils/contacts';
import Loader from '@/components/ui/Loader';
import ErrorState from '@/components/ui/ErrorState';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import Button from '@/components/ui/Button';
import MapView from '@/components/ui/MapView';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userRole, isAuthenticated } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceText, setDistanceText] = useState(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
      fetchUserLocation();
      checkFavoriteStatus();
    }
  }, [id]);

  const checkFavoriteStatus = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await favoriteService.getFavorites();
      const favList = res.data || [];
      const isFav = favList.some((p) => p._id === id || p === id);
      setIsFavorite(isFav);
    } catch (e) {
      console.log('Error checking favorite status:', e);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to save favorite properties.', [
        { text: 'Sign In', onPress: () => router.push('/sign-in') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    const previousState = isFavorite;
    setIsFavorite(!previousState);

    try {
      if (previousState) {
        await favoriteService.removeFavorite(id);
      } else {
        await favoriteService.addFavorite(id);
      }
    } catch (err) {
      setIsFavorite(previousState);
      Alert.alert('Error', err.message || 'Failed to update favorites.');
    }
  };

  const fetchUserLocation = async () => {
    const loc = await getCurrentUserLocation();
    if (loc) {
      setUserLocation(loc);
    }
  };

  useEffect(() => {
    if (userLocation && property?.latitude && property?.longitude) {
      const dist = calculateHaversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        property.latitude,
        property.longitude
      );
      setDistanceText(dist);
    }
  }, [userLocation, property]);

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
      copyToClipboard(property.propertyCode, `Property Code "${property.propertyCode}"`);
    }
  };

  const handleShare = () => {
    shareProperty(property);
  };

  const handleRequestVisit = () => {
    router.push({
      pathname: '/request-visit',
      params: { propertyId: id, propertyTitle: property?.title },
    });
  };

  const handleContactOwner = () => {
    const owner = property?.ownerId || {};
    if (!owner.phone && !owner.email) {
      Alert.alert('Contact Owner', 'Owner contact details are unavailable.');
      return;
    }

    const actions = [];
    if (owner.phone) {
      actions.push({ text: `📞 Call ${owner.phone}`, onPress: () => callPhone(owner.phone) });
      actions.push({ text: `💬 WhatsApp`, onPress: () => openWhatsApp(owner.phone, property?.title) });
    }
    if (owner.email) {
      actions.push({ text: `📧 Email ${owner.email}`, onPress: () => sendEmail(owner.email, property?.title) });
    }
    actions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      `Contact ${owner.name || 'Owner'}`,
      'Choose how you would like to reach the owner:',
      actions
    );
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

          <View style={styles.overlayRightBtns}>
            <TouchableOpacity
              style={styles.overlayIconBtn}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.overlayIconBtn}
              onPress={handleToggleFavorite}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? colors.error : colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

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

        {/* Location & Map Section */}
        <View style={styles.sectionCard}>
          <View style={styles.locationHeaderRow}>
            <Text style={styles.sectionTitle}>Location & Map</Text>
            {distanceText && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate" size={12} color={colors.primary} />
                <Text style={styles.distanceBadgeText}>{distanceText}</Text>
              </View>
            )}
          </View>
          <Text style={styles.mapAddressText}>{property.address}</Text>

          <MapView
            latitude={property.latitude || 23.0225}
            longitude={property.longitude || 72.5714}
            title={property.title}
            address={property.address}
            height={200}
          />
        </View>

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

          {/* Quick Contact Actions */}
          <View style={styles.contactActionsRow}>
            {owner.phone && (
              <TouchableOpacity
                style={styles.contactActionBtn}
                onPress={() => callPhone(owner.phone)}
              >
                <Ionicons name="call" size={18} color={colors.success} />
                <Text style={styles.contactActionText}>Call</Text>
              </TouchableOpacity>
            )}
            {owner.phone && (
              <TouchableOpacity
                style={styles.contactActionBtn}
                onPress={() => openWhatsApp(owner.phone, property.title)}
              >
                <Ionicons name="logo-whatsapp" size={18} color={colors.success} />
                <Text style={styles.contactActionText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {owner.email && (
              <TouchableOpacity
                style={styles.contactActionBtn}
                onPress={() => sendEmail(owner.email, property.title)}
              >
                <Ionicons name="mail" size={18} color={colors.primary} />
                <Text style={styles.contactActionText}>Email</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.contactActionBtn}
              onPress={handleShare}
            >
              <Ionicons name="share-social" size={18} color={colors.textSecondary} />
              <Text style={styles.contactActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      {!isOwner && (
        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={styles.messageIconBtn}
            onPress={() =>
              router.push({
                pathname: '/chat',
                params: {
                  propertyId: id,
                  propertyTitle: property?.title,
                  otherUserId: owner._id,
                  otherUserName: owner.name,
                  otherUserImage: owner.profileImage,
                },
              })
            }
          >
            <Ionicons name="chatbubble-ellipses" size={22} color={colors.primary} />
          </TouchableOpacity>
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
  overlayRightBtns: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  overlayIconBtn: {
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
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  distanceBadgeText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
  mapAddressText: {
    ...typography.bodyMd,
    color: colors.textMuted,
    marginBottom: spacing.md,
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
  contactActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  contactActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    flex: 1,
    justifyContent: 'center',
  },
  contactActionText: {
    ...typography.labelSm,
    color: colors.textSecondary,
    fontWeight: '600',
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
  messageIconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
});

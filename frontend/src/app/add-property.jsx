import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { propertyService } from '@/services/propertyService';
import { captureCameraPhoto, pickGalleryImage } from '@/utils/camera';
import { getCurrentUserLocation, reverseGeocodeCoords } from '@/utils/location';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tag from '@/components/ui/Tag';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius } from '@/constants/spacing';

const PROPERTY_TYPES = ['Room', 'PG', 'Flat', 'Shared'];
const ALL_FACILITIES = [
  'WiFi',
  'Parking',
  'AC',
  'Food',
  'Furnished',
  'Laundry',
  'Security',
];

export default function AddPropertyScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Room');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [facilities, setFacilities] = useState(['WiFi']);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [errors, setErrors] = useState({});

  const handleUseCurrentLocation = async () => {
    setFetchingLocation(true);
    const coords = await getCurrentUserLocation();
    if (coords) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      const geoAddress = await reverseGeocodeCoords(coords.latitude, coords.longitude);
      if (geoAddress) {
        setAddress(geoAddress);
        setErrors((prev) => ({ ...prev, address: null }));
      }
    }
    setFetchingLocation(false);
  };

  const toggleFacility = (facility) => {
    if (facilities.includes(facility)) {
      setFacilities(facilities.filter((f) => f !== facility));
    } else {
      setFacilities([...facilities, facility]);
    }
  };

  const handleCameraCapture = async () => {
    setShowImageModal(false);
    const photo = await captureCameraPhoto({ aspect: [4, 3] });
    if (photo) {
      setImages((prev) => [...prev, photo]);
    }
  };

  const handleGalleryPick = async () => {
    setShowImageModal(false);
    const photo = await pickGalleryImage({ aspect: [4, 3] });
    if (photo) {
      setImages((prev) => [...prev, photo]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!price.trim() || isNaN(price) || Number(price) <= 0) {
      newErrors.price = 'Valid price per month is required';
    }
    if (!address.trim()) newErrors.address = 'Property address is required';
    if (!description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        type,
        price: Number(price),
        address: address.trim(),
        description: description.trim(),
        facilities,
        images,
        latitude,
        longitude,
      };

      const res = await propertyService.createProperty(payload);

      Alert.alert(
        'Listing Published',
        `Your property "${res.data.title}" is now live with Code: ${res.data.propertyCode}`,
        [
          {
            text: 'View My Properties',
            onPress: () => router.replace('/(tabs)/my-properties'),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Publish Failed', err.message || 'Could not post property listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Add New Property" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Property Type</Text>
            <View style={styles.typeGrid}>
              {PROPERTY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeChip,
                    type === t && styles.typeChipActive,
                  ]}
                  onPress={() => setType(t)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      type === t && styles.typeChipTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Core Info */}
          <View style={styles.section}>
            <Input
              label="Property Title"
              placeholder="e.g. Sunrise PG & Rooms"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setErrors((prev) => ({ ...prev, title: null }));
              }}
              error={errors.title}
              leftIcon={
                <Ionicons name="home-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label="Monthly Rent (₹ IN)"
              placeholder="e.g. 8500"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                setErrors((prev) => ({ ...prev, price: null }));
              }}
              keyboardType="numeric"
              error={errors.price}
              leftIcon={
                <Ionicons name="cash-outline" size={20} color={colors.textMuted} />
              }
            />

            <View style={styles.addressLabelRow}>
              <Text style={styles.inputLabel}>Full Address / Location</Text>
              <TouchableOpacity
                style={styles.locationAutoBtn}
                onPress={handleUseCurrentLocation}
                disabled={fetchingLocation}
              >
                <Ionicons name="navigate-outline" size={14} color={colors.primary} />
                <Text style={styles.locationAutoText}>
                  {fetchingLocation ? 'Fetching...' : 'Use My Current Location'}
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              placeholder="e.g. Plot 42, Near Tech Park, Gandhinagar"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                setErrors((prev) => ({ ...prev, address: null }));
              }}
              error={errors.address}
              leftIcon={
                <Ionicons name="location-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label="Description"
              placeholder="Describe room amenities, house rules, nearby landmarks..."
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setErrors((prev) => ({ ...prev, description: null }));
              }}
              multiline
              numberOfLines={4}
              error={errors.description}
              leftIcon={
                <Ionicons name="document-text-outline" size={20} color={colors.textMuted} />
              }
            />
          </View>

          {/* Facility Chips */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Facilities & Amenities</Text>
            <View style={styles.facilityWrap}>
              {ALL_FACILITIES.map((facility) => {
                const isSelected = facilities.includes(facility);
                return (
                  <Tag
                    key={facility}
                    label={facility}
                    selected={isSelected}
                    onPress={() => toggleFacility(facility)}
                  />
                );
              })}
            </View>
          </View>

          {/* Image Upload Section */}
          <View style={styles.section}>
            <View style={styles.imageHeader}>
              <Text style={styles.sectionLabel}>Property Images</Text>
              <Text style={styles.imageCount}>{images.length} added</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {/* Add Image Button */}
              <TouchableOpacity
                style={styles.addImageCard}
                onPress={() => setShowImageModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={28} color={colors.primary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>

              {/* Uploaded Image Previews */}
              {images.map((imgUri, index) => (
                <View key={index} style={styles.previewImageCard}>
                  <Image source={{ uri: imgUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageBadge}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close" size={14} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Submit CTA */}
          <Button
            title="Publish Property Listing"
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
            size="lg"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo Picker Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Property Photo</Text>

            <TouchableOpacity style={styles.modalOption} onPress={handleCameraCapture}>
              <Ionicons name="camera-outline" size={22} color={colors.primary} />
              <Text style={styles.modalOptionText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handleGalleryPick}>
              <Ionicons name="image-outline" size={22} color={colors.primary} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelOption]}
              onPress={() => setShowImageModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.base,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  inputLabel: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  locationAutoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationAutoText: {
    ...typography.labelSm,
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.labelLg,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  typeChipTextActive: {
    color: colors.white,
  },
  facilityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageCount: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  imageScroll: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  addImageCard: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.primaryLight + '30',
  },
  addImageText: {
    ...typography.labelSm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  previewImageCard: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
    marginRight: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
  },
  removeImageBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
  },
  modalTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  modalOptionText: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  modalCancelOption: {
    borderBottomWidth: 0,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  modalCancelText: {
    ...typography.button,
    color: colors.textMuted,
  },
});

import React, { useState, useEffect } from 'react';
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
  Switch,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { propertyService } from '@/services/propertyService';
import { captureCameraPhoto, pickGalleryImage } from '@/utils/camera';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tag from '@/components/ui/Tag';
import Loader from '@/components/ui/Loader';
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

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loadingProperty, setLoadingProperty] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Room');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [images, setImages] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadPropertyData();
    }
  }, [id]);

  const loadPropertyData = async () => {
    try {
      const res = await propertyService.getPropertyById(id);
      const data = res.data;
      setTitle(data.title || '');
      setType(data.type || 'Room');
      setPrice(String(data.price || ''));
      setAddress(data.address || '');
      setDescription(data.description || '');
      setFacilities(data.facilities || []);
      setImages(data.images || []);
      setIsActive(data.isActive !== undefined ? data.isActive : true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load property details', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoadingProperty(false);
    }
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
    if (photo) setImages((prev) => [...prev, photo]);
  };

  const handleGalleryPick = async () => {
    setShowImageModal(false);
    const photo = await pickGalleryImage({ aspect: [4, 3] });
    if (photo) setImages((prev) => [...prev, photo]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    if (!title.trim() || !price || !address.trim() || !description.trim()) {
      Alert.alert('Validation Error', 'Please fill out all required fields');
      return;
    }

    setSaving(true);
    try {
      await propertyService.updateProperty(id, {
        title: title.trim(),
        type,
        price: Number(price),
        address: address.trim(),
        description: description.trim(),
        facilities,
        images,
        isActive,
      });

      Alert.alert('Listing Updated', 'Property listing has been updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update property listing');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProperty) {
    return <Loader message="Loading property details..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Edit Property" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Status Switch */}
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusTitle}>Active Listing Status</Text>
              <Text style={styles.statusSubtitle}>
                {isActive ? 'Visible to tenants in search' : 'Hidden from search results'}
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isActive ? colors.primary : colors.textMuted}
            />
          </View>

          {/* Property Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Property Type</Text>
            <View style={styles.typeGrid}>
              {PROPERTY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Form */}
          <View style={styles.section}>
            <Input
              label="Property Title"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Monthly Rent (₹ IN)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Input
              label="Full Address"
              value={address}
              onChangeText={setAddress}
            />

            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Facilities */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Facilities & Amenities</Text>
            <View style={styles.facilityWrap}>
              {ALL_FACILITIES.map((facility) => (
                <Tag
                  key={facility}
                  label={facility}
                  selected={facilities.includes(facility)}
                  onPress={() => toggleFacility(facility)}
                />
              ))}
            </View>
          </View>

          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Property Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              <TouchableOpacity
                style={styles.addImageCard}
                onPress={() => setShowImageModal(true)}
              >
                <Ionicons name="camera-outline" size={28} color={colors.primary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>

              {images.map((imgUri, idx) => (
                <View key={idx} style={styles.previewImageCard}>
                  <Image source={{ uri: imgUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageBadge}
                    onPress={() => handleRemoveImage(idx)}
                  >
                    <Ionicons name="close" size={14} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <Button
            title="Save Property Changes"
            onPress={handleUpdate}
            loading={saving}
            variant="primary"
            size="lg"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Modal */}
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
  },
  statusTitle: {
    ...typography.headlineMd,
    fontSize: 16,
    color: colors.textPrimary,
  },
  statusSubtitle: {
    ...typography.bodySm,
    color: colors.textMuted,
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

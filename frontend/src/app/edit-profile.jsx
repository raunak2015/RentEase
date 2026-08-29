import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { captureCameraPhoto, pickGalleryImage } from '@/utils/camera';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius } from '@/constants/spacing';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [loading, setLoading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCameraCapture = async () => {
    setShowPhotoModal(false);
    const photoUri = await captureCameraPhoto();
    if (photoUri) {
      setProfileImage(photoUri);
    }
  };

  const handleGalleryPick = async () => {
    setShowPhotoModal(false);
    const photoUri = await pickGalleryImage();
    if (photoUri) {
      setProfileImage(photoUri);
    }
  };

  const handleRemovePhoto = () => {
    setShowPhotoModal(false);
    setProfileImage('');
  };

  const handleSaveProfile = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const updatePayload = {
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        profileImage,
      };

      const res = await userService.updateProfile(updatePayload);
      updateUser(updatePayload);

      Alert.alert('Success', 'Your profile has been updated successfully.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Edit Profile" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar & Photo Action */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar
                source={profileImage}
                name={name || user?.name}
                size={100}
              />
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={() => setShowPhotoModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setShowPhotoModal(true)}>
              <Text style={styles.changePhotoText}>Change Profile Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: null }));
              }}
              error={errors.name}
              leftIcon={
                <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              editable={false}
              leftIcon={
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label="Phone Number"
              placeholder="+91 9876543210"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setErrors((prev) => ({ ...prev, phone: null }));
              }}
              keyboardType="phone-pad"
              error={errors.phone}
              leftIcon={
                <Ionicons name="call-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label="About Me (Bio)"
              placeholder="Write a short description about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              leftIcon={
                <Ionicons name="document-text-outline" size={20} color={colors.textMuted} />
              }
            />

            {/* Save CTA */}
            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo Option Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profile Photo</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCameraCapture}
            >
              <Ionicons name="camera-outline" size={22} color={colors.primary} />
              <Text style={styles.modalOptionText}>Take Photo (Camera)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleGalleryPick}
            >
              <Ionicons name="image-outline" size={22} color={colors.primary} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            {profileImage ? (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleRemovePhoto}
              >
                <Ionicons name="trash-outline" size={22} color={colors.error} />
                <Text style={[styles.modalOptionText, { color: colors.error }]}>
                  Remove Current Photo
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelOption]}
              onPress={() => setShowPhotoModal(false)}
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
    paddingVertical: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  changePhotoText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  saveButton: {
    marginTop: spacing.lg,
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

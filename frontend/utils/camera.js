import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Request camera permissions gracefully
 */
export const requestCameraPermission = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Camera Permission Required',
      'RentEase needs camera permission to allow you to take profile photos and property images. Please enable camera access in your device settings.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
};

/**
 * Request media library (gallery) permissions gracefully
 */
export const requestMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Gallery Permission Required',
      'RentEase needs photo gallery permission to let you select photos for your profile and property listings.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
};

/**
 * Capture a photo using the device camera
 */
export const captureCameraPhoto = async (options = {}) => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
    ...options,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    // Return base64 data URI if available, otherwise uri
    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }
    return asset.uri;
  }

  return null;
};

/**
 * Pick an image from the photo gallery
 */
export const pickGalleryImage = async (options = {}) => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
    ...options,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }
    return asset.uri;
  }

  return null;
};

import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

export interface ImagePickerResult {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  fileSize?: number;
}

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    Toast.show({
      type: 'error',
      text1: 'Permission Denied',
      text2: 'Camera permission is required to take photos',
    });
    return false;
  }

  return true;
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Toast.show({
      type: 'error',
      text1: 'Permission Denied',
      text2: 'Gallery permission is required to select photos',
    });
    return false;
  }

  return true;
};

/**
 * Launch camera to capture a photo
 */
export const capturePhoto = async (): Promise<ImagePickerResult | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: false,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
    };
  } catch (error) {
    console.error('Error capturing photo:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to capture photo',
    });
    return null;
  }
};

/**
 * Launch gallery to select a photo
 */
export const selectPhoto = async (): Promise<ImagePickerResult | null> => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: false,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
    };
  } catch (error) {
    console.error('Error selecting photo:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to select photo',
    });
    return null;
  }
};

/**
 * Get file extension from URI
 */
export const getFileExtension = (uri: string): string => {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1] : 'jpg';
};

/**
 * Convert image URI to blob for upload
 */
export const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

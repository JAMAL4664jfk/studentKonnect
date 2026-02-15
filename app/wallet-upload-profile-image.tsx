import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { WalletAPI } from '@/lib/wallet-api';

export default function WalletUploadProfileImageScreen() {
  const colors = useColors();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const walletAPI = new WalletAPI();

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result;
      
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        // Using Android Photo Picker - no permissions required on Android 13+
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select or take a photo first.');
      return;
    }

    try {
      setLoading(true);

      // Convert image to base64
      const response = await fetch(image);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          
          // Upload to API
          await walletAPI.uploadProfileImage(base64data);
          
          Alert.alert(
            'Success!',
            'Profile picture uploaded successfully',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
        } catch (error: any) {
          console.error('Upload error:', error);
          Alert.alert('Upload Failed', error.message || 'Failed to upload profile picture');
        } finally {
          setLoading(false);
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to process image');
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted/20 items-center justify-center mr-4"
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-foreground">Profile Picture</Text>
            <Text className="text-sm text-muted">Upload your profile photo</Text>
          </View>
        </View>

        {/* Image Preview */}
        <View className="items-center mb-8">
          {image ? (
            <View className="relative">
              <Image
                source={{ uri: image }}
                className="w-48 h-48 rounded-full"
              />
              <TouchableOpacity
                onPress={() => setImage(null)}
                className="absolute top-0 right-0 w-10 h-10 rounded-full bg-red-500 items-center justify-center"
              >
                <IconSymbol name="xmark" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="w-48 h-48 rounded-full bg-muted/20 items-center justify-center">
              <IconSymbol name="person.circle" size={80} color={colors.muted} />
            </View>
          )}
        </View>

        {/* Photo Options */}
        {!image && (
          <View className="space-y-4 mb-8">
            <TouchableOpacity
              onPress={() => pickImage('camera')}
              className="bg-primary rounded-2xl p-4 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
                <IconSymbol name="camera.fill" size={24} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">Take Photo</Text>
                <Text className="text-white/70 text-sm">Use your camera</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickImage('gallery')}
              className="bg-card rounded-2xl p-4 flex-row items-center border border-border"
            >
              <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-4">
                <IconSymbol name="photo.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-lg">Choose from Gallery</Text>
                <Text className="text-muted text-sm">Select existing photo</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Photo Tips */}
        <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-8">
          <Text className="text-blue-600 font-semibold mb-2">Photo Tips</Text>
          <Text className="text-blue-600/80 text-sm leading-5">
            • Use a clear, recent photo{'\n'}
            • Face the camera directly{'\n'}
            • Good lighting, no shadows{'\n'}
            • No sunglasses or hats{'\n'}
            • Plain background preferred
          </Text>
        </View>

        {/* Upload Button */}
        {image && (
          <TouchableOpacity
            onPress={handleUpload}
            disabled={loading}
            className="bg-primary rounded-2xl p-4 items-center mb-4"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-lg">Upload Photo</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Retake Button */}
        {image && !loading && (
          <TouchableOpacity
            onPress={() => setImage(null)}
            className="bg-muted/20 rounded-2xl p-4 items-center"
          >
            <Text className="text-foreground font-semibold text-lg">Retake Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenContainer>
  );
}

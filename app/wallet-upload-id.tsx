import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { walletAPI } from "@/lib/wallet-api";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

type IDType = "IDENTITYBOOK" | "IDENTITYCARD";

export default function WalletUploadIDScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const customerId = params.customerId as string;
  
  const [loading, setLoading] = useState(false);
  const [idType, setIdType] = useState<IDType | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take a photo. Please enable it in your device settings.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Gallery permission is required to select a photo. Please enable it in your device settings.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Add data URI prefix for API
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw new Error("Failed to process image");
    }
  };

  const handleTakePhoto = async () => {
    if (!idType) {
      Toast.show({
        type: "error",
        text1: "Select ID Type",
        text2: "Please select your ID type first",
      });
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        
        // Convert to base64 with data URI prefix
        const base64 = await convertImageToBase64(uri);
        setImageBase64(base64);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Toast.show({
        type: "error",
        text1: "Camera Error",
        text2: "Failed to take photo. Please try again.",
      });
    }
  };

  const handleChooseFromGallery = async () => {
    if (!idType) {
      Toast.show({
        type: "error",
        text1: "Select ID Type",
        text2: "Please select your ID type first",
      });
      return;
    }

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        
        // Convert to base64 with data URI prefix
        const base64 = await convertImageToBase64(uri);
        setImageBase64(base64);
      }
    } catch (error) {
      console.error("Error choosing photo:", error);
      Toast.show({
        type: "error",
        text1: "Gallery Error",
        text2: "Failed to select photo. Please try again.",
      });
    }
  };

  const handleSubmit = async () => {
    if (!idType) {
      Toast.show({
        type: "error",
        text1: "Select ID Type",
        text2: "Please select your ID type first",
      });
      return;
    }

    if (!imageBase64) {
      Toast.show({
        type: "error",
        text1: "No Photo Selected",
        text2: "Please take a photo or choose one from your gallery",
      });
      return;
    }

    if (!customerId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Customer ID is missing. Please try again.",
      });
      return;
    }

    setLoading(true);

    try {
      const documentData = {
        customer_id: customerId,
        image_type: "NATIONAL_IDENTITY",
        identity_type: idType,
        side: "FRONT",
        image: imageBase64,
      };

      const response = await walletAPI.uploadDocument(documentData);

      Toast.show({
        type: "success",
        text1: "ID Uploaded",
        text2: response.messages || "Your ID has been uploaded successfully",
      });

      // Navigate to dashboard
      setTimeout(() => {
        router.replace("/wallet-dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Upload ID error:", error);

      let errorMessage = "Failed to upload ID. Please try again.";
      if (error.response) {
        errorMessage = error.response.messages || error.response.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
            <IconSymbol name="doc.text.fill" size={48} color={colors.primary} />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">
            Upload Your ID
          </Text>
          <Text className="text-base text-muted text-center">
            Upload a clear photo of your ID document (front side)
          </Text>
        </View>

        {/* ID Type Selection */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-3">
            Select ID Type *
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => {
                setIdType("IDENTITYBOOK");
                setImageUri(null);
                setImageBase64(null);
              }}
              className={`flex-1 py-4 px-4 rounded-xl border-2 ${
                idType === "IDENTITYBOOK"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <View className="items-center">
                <IconSymbol
                  name="book.fill"
                  size={32}
                  color={idType === "IDENTITYBOOK" ? colors.primary : colors.muted}
                />
                <Text
                  className={`text-center font-medium mt-2 ${
                    idType === "IDENTITYBOOK" ? "text-primary" : "text-muted"
                  }`}
                >
                  ID Book
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIdType("IDENTITYCARD");
                setImageUri(null);
                setImageBase64(null);
              }}
              className={`flex-1 py-4 px-4 rounded-xl border-2 ${
                idType === "IDENTITYCARD"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <View className="items-center">
                <IconSymbol
                  name="creditcard.fill"
                  size={32}
                  color={idType === "IDENTITYCARD" ? colors.primary : colors.muted}
                />
                <Text
                  className={`text-center font-medium mt-2 ${
                    idType === "IDENTITYCARD" ? "text-primary" : "text-muted"
                  }`}
                >
                  ID Card
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Preview */}
        {imageUri ? (
          <View className="items-center mb-6">
            <View className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-card border-2 border-primary mb-4">
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                setImageUri(null);
                setImageBase64(null);
              }}
              className="flex-row items-center"
            >
              <IconSymbol name="arrow.clockwise" size={16} color={colors.primary} />
              <Text className="text-primary text-sm ml-2">Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center mb-6">
            <View className="w-full aspect-[4/3] rounded-2xl bg-muted/20 border-2 border-dashed border-muted items-center justify-center mb-4">
              <IconSymbol name="doc.text" size={64} color={colors.muted} />
              <Text className="text-muted text-sm mt-4">
                {idType ? "No photo selected" : "Select ID type first"}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          {!imageUri && idType && (
            <>
              <TouchableOpacity
                onPress={handleTakePhoto}
                disabled={loading}
                className="w-full bg-primary py-4 rounded-xl flex-row items-center justify-center"
              >
                <IconSymbol name="camera.fill" size={20} color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChooseFromGallery}
                disabled={loading}
                className="w-full bg-card border border-border py-4 rounded-xl flex-row items-center justify-center"
              >
                <IconSymbol name="photo.fill" size={20} color={colors.primary} />
                <Text className="text-primary font-semibold text-base ml-2">
                  Choose from Gallery
                </Text>
              </TouchableOpacity>
            </>
          )}

          {imageUri && (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="w-full bg-primary py-4 rounded-xl items-center"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Upload ID
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start mb-2">
            <IconSymbol name="info.circle.fill" size={20} color="#3b82f6" />
            <Text className="text-foreground font-semibold ml-2">Photo Tips</Text>
          </View>
          <View className="ml-7 gap-1">
            <Text className="text-muted text-xs">• Capture the entire ID document</Text>
            <Text className="text-muted text-xs">• Ensure all text is readable</Text>
            <Text className="text-muted text-xs">• Use good lighting (no glare)</Text>
            <Text className="text-muted text-xs">• Place on a flat, dark surface</Text>
            <Text className="text-muted text-xs">• Take photo from directly above</Text>
          </View>
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          onPress={() => router.replace("/wallet-dashboard")}
          disabled={loading}
          className="w-full py-4 items-center mb-8"
        >
          <Text className="text-muted text-sm">Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

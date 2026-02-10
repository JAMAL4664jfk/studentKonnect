import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { UploadProgress } from "@/components/UploadProgress";

type PropertyType = "apartment" | "room" | "studio" | "house" | "dormitory";

export default function CreateAccommodationScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const amenitiesList = [
    "WiFi",
    "Kitchen",
    "Parking",
    "Furnished",
    "Security",
    "Garden",
    "Pool",
    "Gym",
    "Air Conditioning",
    "Laundry",
    "Pet Friendly",
    "Balcony",
  ];

  const cities = [
    "Stellenbosch",
    "Cape Town",
    "Johannesburg",
    "Pretoria",
    "Durban",
    "Port Elizabeth",
    "Bloemfontein",
    "East London",
  ];

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const urls = result.assets.map((asset) => asset.uri);
      setImageUrls([...imageUrls, ...urls]);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Title is required" });
      return false;
    }
    if (!description.trim()) {
      Toast.show({ type: "error", text1: "Description is required" });
      return false;
    }
    if (!address.trim()) {
      Toast.show({ type: "error", text1: "Address is required" });
      return false;
    }
    if (!city) {
      Toast.show({ type: "error", text1: "City is required" });
      return false;
    }
    if (!price || isNaN(parseFloat(price))) {
      Toast.show({ type: "error", text1: "Valid price is required" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setShowUploadProgress(true);
    setUploadProgress(0);
    
    try {
      // Get current user (for now using userId 1, you'll replace with actual auth)
      const userId = 1;

      // Simulate upload progress
      setUploadProgress(30);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUploadProgress(60);
      const { data, error } = await supabase
        .from("accommodations")
        .insert({
          userId,
          title: title.trim(),
          description: description.trim(),
          address: address.trim(),
          city,
          country: "South Africa",
          price: parseFloat(price),
          currency: "ZAR",
          propertyType,
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          amenities: JSON.stringify(selectedAmenities),
          images: JSON.stringify(imageUrls),
          availableFrom: new Date().toISOString(),
          isAvailable: true,
        })
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Your listing has been created",
      });

      router.back();
    } catch (error: any) {
      console.error("Error creating listing:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to create listing",
      });
    } finally {
      setLoading(false);
      setShowUploadProgress(false);
      setUploadProgress(0);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 pt-2">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-primary">
              List Your Accommodation
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Fill in the details below
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center ml-3"
          >
            <IconSymbol name="xmark" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Title */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Modern 2-Bed Apartment Near Campus"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
            />
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your accommodation..."
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Address */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Address *
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Street address"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
            />
          </View>

          {/* City */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              City *
            </Text>
            <View className="bg-surface border border-border rounded-xl overflow-hidden">
              <Picker
                selectedValue={city}
                onValueChange={setCity}
                style={{ color: colors.foreground }}
              >
                <Picker.Item label="Select city..." value="" />
                {cities.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Property Type */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Property Type *
            </Text>
            <View className="bg-surface border border-border rounded-xl overflow-hidden">
              <Picker
                selectedValue={propertyType}
                onValueChange={(value) => setPropertyType(value as PropertyType)}
                style={{ color: colors.foreground }}
              >
                <Picker.Item label="Apartment" value="apartment" />
                <Picker.Item label="Room" value="room" />
                <Picker.Item label="Studio" value="studio" />
                <Picker.Item label="House" value="house" />
                <Picker.Item label="Dormitory" value="dormitory" />
              </Picker>
            </View>
          </View>

          {/* Price */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Monthly Rent (ZAR) *
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="e.g., 8500"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              keyboardType="numeric"
            />
          </View>

          {/* Bedrooms & Bathrooms */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">
                Bedrooms *
              </Text>
              <TextInput
                value={bedrooms}
                onChangeText={setBedrooms}
                placeholder="1"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">
                Bathrooms *
              </Text>
              <TextInput
                value={bathrooms}
                onChangeText={setBathrooms}
                placeholder="1"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Amenities */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Amenities
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {amenitiesList.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  onPress={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-full ${
                    selectedAmenities.includes(amenity)
                      ? "bg-primary"
                      : "bg-surface"
                  }`}
                  style={{ borderWidth: 1, borderColor: colors.border }}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedAmenities.includes(amenity)
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Images */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Photos
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              className="bg-surface border border-border rounded-xl p-6 items-center"
            >
              <IconSymbol name="photo.fill" size={32} color={colors.primary} />
              <Text className="text-sm text-primary mt-2">
                Tap to add photos
              </Text>
            </TouchableOpacity>
            {imageUrls.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-3">
                {imageUrls.map((url, index) => (
                  <View key={index} className="relative">
                    <View className="w-20 h-20 bg-muted rounded-lg" />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive items-center justify-center"
                    >
                      <IconSymbol name="xmark" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-primary rounded-xl py-4 items-center mt-4"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? "Creating..." : "Create Listing"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
      
      <UploadProgress
        visible={showUploadProgress}
        progress={uploadProgress}
        fileName={title || "Accommodation listing"}
        uploadType="image"
      />
    </ScreenContainer>
  );
}

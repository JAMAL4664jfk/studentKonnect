import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Picker } from "@react-native-picker/picker";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { UploadProgress } from "@/components/UploadProgress";

type Category = "books" | "electronics" | "furniture" | "clothing" | "sports" | "services" | "other";
type Condition = "new" | "like-new" | "good" | "fair" | "poor";

export default function CreateMarketplaceScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("electronics");
  const [condition, setCondition] = useState<Condition>("good");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [localImages, setLocalImages] = useState<{ uri: string; type: string; name: string }[]>([]);

  const categories = [
    { label: "Textbooks", value: "books" },
    { label: "Electronics", value: "electronics" },
    { label: "Furniture", value: "furniture" },
    { label: "Clothing", value: "clothing" },
    { label: "Sports", value: "sports" },
    { label: "Services", value: "services" },
    { label: "Other", value: "other" },
  ];

  const conditions = [
    { label: "New", value: "new" },
    { label: "Like New", value: "like-new" },
    { label: "Good", value: "good" },
    { label: "Fair", value: "fair" },
    { label: "Poor", value: "poor" },
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || `image_${Date.now()}.jpg`,
      }));
      setLocalImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setLocalImages((prev) => prev.filter((_, i) => i !== index));
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
    if (!price || isNaN(parseFloat(price))) {
      Toast.show({ type: "error", text1: "Valid price is required" });
      return false;
    }
    return true;
  };

  /**
   * Upload a single image to Supabase storage using FormData (React Native safe).
   * Returns the public URL or null on failure.
   */
  const uploadImage = async (
    image: { uri: string; type: string; name: string },
    userId: string,
    index: number
  ): Promise<string | null> => {
    try {
      const ext = image.name.split(".").pop() || "jpg";
      const fileName = `marketplace/${userId}/${Date.now()}_${index}.${ext}`;

      const formData = new FormData();
      formData.append("file", {
        uri: image.uri,
        type: image.type,
        name: image.name,
      } as any);

      const { data, error } = await supabase.storage
        .from("marketplace-images")
        .upload(fileName, formData, {
          contentType: image.type,
          upsert: false,
        });

      if (error) {
        console.error("Image upload error:", error.message);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("marketplace-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (e: any) {
      console.error("Image upload exception:", e.message);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setShowUploadProgress(true);
    setUploadProgress(5);

    try {
      // 1. Get authenticated user
      const { data: { user } } = await safeGetUser();
      if (!user) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "Please log in to create a listing",
        });
        return;
      }

      // 2. Upload images to Supabase storage
      const uploadedUrls: string[] = [];
      if (localImages.length > 0) {
        const progressPerImage = 60 / localImages.length;
        for (let i = 0; i < localImages.length; i++) {
          const url = await uploadImage(localImages[i], user.id, i);
          if (url) uploadedUrls.push(url);
          setUploadProgress(5 + progressPerImage * (i + 1));
        }
      } else {
        setUploadProgress(65);
      }

      // 3. Insert listing — use "userId" (camelCase) to match the live table schema
      setUploadProgress(70);
      const { data, error } = await supabase
        .from("marketplaceItems")
        .insert({
          userId: user.id,           // camelCase — matches the live DB column
          title: title.trim(),
          description: description.trim(),
          category,
          condition,
          price: parseFloat(price),
          currency: "ZAR",
          images: JSON.stringify(uploadedUrls),
          location: location.trim() || null,
          isAvailable: true,
          isFeatured: false,
          views: 0,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error("Marketplace insert error:", JSON.stringify(error));
        throw error;
      }

      setUploadProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 400));

      Toast.show({
        type: "success",
        text1: "Listed!",
        text2: "Your item has been posted to the marketplace",
      });

      router.back();
    } catch (error: any) {
      console.error("Error creating listing:", error);
      Toast.show({
        type: "error",
        text1: "Failed to post listing",
        text2: error.message || "Please try again",
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
              List Your Item
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Sell or offer services to students
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
            <Text className="text-sm font-semibold text-foreground mb-2">
              Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., MacBook Air M1 - Like New"
              placeholderTextColor={colors.muted}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.foreground,
                fontSize: 15,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your item in detail..."
              placeholderTextColor={colors.muted}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.foreground,
                fontSize: 15,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 100,
                textAlignVertical: "top",
              }}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Category */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Category *
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Picker
                selectedValue={category}
                onValueChange={(value) => setCategory(value as Category)}
                style={{ color: colors.foreground }}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Condition */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Condition *
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Picker
                selectedValue={condition}
                onValueChange={(value) => setCondition(value as Condition)}
                style={{ color: colors.foreground }}
              >
                {conditions.map((cond) => (
                  <Picker.Item key={cond.value} label={cond.label} value={cond.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Price */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Price (ZAR) *
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="e.g., 8500"
              placeholderTextColor={colors.muted}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.foreground,
                fontSize: 15,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              keyboardType="numeric"
            />
          </View>

          {/* Location */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Location (Optional)
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Picker
                selectedValue={location}
                onValueChange={setLocation}
                style={{ color: colors.foreground }}
              >
                <Picker.Item label="Select location..." value="" />
                {cities.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Images */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Photos (Optional)
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: colors.border,
              }}
            >
              <IconSymbol name="photo.badge.plus" size={32} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
                Tap to add photos
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                {localImages.length > 0 ? `${localImages.length} photo(s) selected` : "Up to 5 photos"}
              </Text>
            </TouchableOpacity>

            {localImages.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {localImages.map((img, index) => (
                  <View key={index} style={{ position: "relative" }}>
                    <Image
                      source={{ uri: img.uri }}
                      style={{ width: 80, height: 80, borderRadius: 10 }}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: "#ef4444",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
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
            style={{
              backgroundColor: loading ? colors.muted : colors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {loading ? "Posting..." : "Post Listing"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <UploadProgress
        visible={showUploadProgress}
        progress={uploadProgress}
        fileName={title || "Marketplace listing"}
        uploadType="image"
      />
    </ScreenContainer>
  );
}

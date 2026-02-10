import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);

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
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Please log in to create a listing',
        });
        return;
      }
      const userId = user.id;

      // Simulate upload progress
      setUploadProgress(30);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUploadProgress(60);
      const { data, error } = await supabase
        .from("marketplaceItems")
        .insert({
          userId,
          title: title.trim(),
          description: description.trim(),
          category,
          condition,
          price: parseFloat(price),
          currency: "ZAR",
          images: JSON.stringify(imageUrls),
          location: location.trim() || null,
          isAvailable: true,
          isFeatured: false,
          views: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Your item has been listed",
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
              placeholderTextColor={colors.mutedForeground}
              className="bg-surface rounded-xl px-4 py-3 text-foreground"
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
              placeholder="Describe your item..."
              placeholderTextColor={colors.mutedForeground}
              className="bg-surface rounded-xl px-4 py-3 text-foreground"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Category *
            </Text>
            <View className="bg-surface rounded-xl overflow-hidden">
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
            <View className="bg-surface rounded-xl overflow-hidden">
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
              placeholderTextColor={colors.mutedForeground}
              className="bg-surface rounded-xl px-4 py-3 text-foreground"
              keyboardType="numeric"
            />
          </View>

          {/* Location */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Location (Optional)
            </Text>
            <View className="bg-surface rounded-xl overflow-hidden">
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
              Photos *
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              className="bg-surface rounded-xl p-6 items-center border-2 border-dashed border-border"
            >
              <IconSymbol name="photo" size={32} color={colors.primary} />
              <Text className="text-sm text-muted-foreground mt-2">
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
            className={`bg-primary py-4 rounded-xl items-center mt-4 ${
              loading ? "opacity-50" : ""
            }`}
          >
            <Text className="text-primary-foreground font-bold text-lg">
              {loading ? "Listing..." : "List Item"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
      
      <UploadProgress
        visible={showUploadProgress}
        progress={uploadProgress}
        fileName={title || "Marketplace item"}
        uploadType="image"
      />
    </ScreenContainer>
  );
}

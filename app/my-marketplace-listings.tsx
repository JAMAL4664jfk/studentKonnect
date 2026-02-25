import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type MarketplaceItem = {
  id: number;
  title: string;
  category: string;
  price: string;
  currency: string;
  condition: string;
  images: string;
  isAvailable: boolean;
  views: number;
  createdAt: string;
};

// Helper function to parse JSON strings
const parseJSON = (jsonString: string | null): any => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
};

// Helper function to get image URL
const getImageUrl = (images: string): string => {
  const imageArray = parseJSON(images);
  if (imageArray.length === 0) return "";
  const firstImage = imageArray[0];
  if (firstImage.startsWith("/assets")) {
    return "";
  }
  return firstImage;
};

// Helper function to get condition badge color
const getConditionColor = (condition: string) => {
  switch (condition) {
    case "new":
      return { bg: "#10b98120", text: "#10b981" };
    case "like-new":
      return { bg: "#3b82f620", text: "#3b82f6" };
    case "good":
      return { bg: "#10b98120", text: "#10b981" };
    case "fair":
      return { bg: "#f59e0b20", text: "#f59e0b" };
    case "poor":
      return { bg: "#ef444420", text: "#ef4444" };
    default:
      return { bg: "#6b728020", text: "#6b7280" };
  }
};

export default function MyMarketplaceListingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) {
        Toast.show({ type: "info", text1: "Sign in to view your listings" });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Select only non-UUID columns to avoid type mismatch on userId
      const { data, error } = await supabase
        .from("marketplaceItems")
        .select("id, title, category, price, currency, condition, images, isAvailable, views, createdAt")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false });

      if (error) {
        // If userId type mismatch, show a helpful message
        console.error("fetchMyListings error:", JSON.stringify(error));
        Toast.show({
          type: "error",
          text1: "Error loading listings",
          text2: error.message,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setListings(data || []);
      
      if (!data || data.length === 0) {
        Toast.show({
          type: "info",
          text1: "No Listings",
          text2: "You haven't posted any items yet",
        });
      }
    } catch (error: any) {
      console.error("Error fetching listings:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load your listings",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyListings();
  };

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("marketplaceItems")
        .update({ isAvailable: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: !currentStatus ? "Item activated" : "Item deactivated",
      });

      fetchMyListings();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const deleteListing = (id: number, title: string) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("marketplaceItems")
                .delete()
                .eq("id", id);

              if (error) throw error;

              Toast.show({
                type: "success",
                text1: "Deleted",
                text2: "Item removed successfully",
              });

              fetchMyListings();
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: error.message,
              });
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const imageUrl = getImageUrl(item.images);
    const conditionColors = getConditionColor(item.condition);

    return (
      <TouchableOpacity
        className="mb-4 rounded-2xl overflow-hidden bg-surface"
        style={{
          width: CARD_WIDTH,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        {/* Image Section */}
        <View className="relative">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.85 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.85 }}
              className="bg-muted items-center justify-center"
            >
              <IconSymbol name="photo" size={40} color={colors.muted} />
            </View>
          )}

          {/* Status Badge */}
          <View
            className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg ${
              item.isAvailable ? "bg-success" : "bg-muted"
            }`}
          >
            <Text className="text-xs font-bold text-white">
              {item.isAvailable ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="p-3">
          {/* Title */}
          <Text className="text-sm font-bold text-foreground mb-1" numberOfLines={2}>
            {item.title}
          </Text>

          {/* Condition Badge */}
          <View
            className="self-start px-2 py-1 rounded-md mb-2"
            style={{ backgroundColor: conditionColors.bg }}
          >
            <Text
              className="text-xs font-semibold capitalize"
              style={{ color: conditionColors.text }}
            >
              {item.condition.replace("-", " ")}
            </Text>
          </View>

          {/* Price and Views */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-primary">
              R{parseFloat(item.price).toLocaleString()}
            </Text>
            <View className="flex-row items-center gap-1">
              <IconSymbol name="eye" size={12} color={colors.muted} />
              <Text className="text-xs text-muted-foreground">{item.views}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => toggleAvailability(item.id, item.isAvailable)}
              className={`flex-1 py-2 rounded-lg ${
                item.isAvailable ? "bg-muted" : "bg-success"
              }`}
            >
              <Text className="text-xs font-semibold text-center text-foreground">
                {item.isAvailable ? "Deactivate" : "Activate"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteListing(item.id, item.title)}
              className="flex-1 bg-error/10 py-2 rounded-lg"
            >
              <Text className="text-xs font-semibold text-center text-error">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground mb-1">
              My Listings
            </Text>
            <Text className="text-sm text-muted-foreground">
              Manage your marketplace items
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          >
            <IconSymbol name="xmark" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          className="bg-primary px-5 py-3.5 rounded-xl flex-row items-center justify-center gap-2 mb-6"
          onPress={() => router.push("/create-marketplace")}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
          <Text className="text-white font-bold text-base">Post New Listing</Text>
        </TouchableOpacity>

        {/* Listings Grid */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">Loading your listings...</Text>
          </View>
        ) : listings.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <IconSymbol name="tray" size={64} color={colors.muted} />
            <Text className="text-xl font-bold text-foreground mt-4 mb-2">No listings yet</Text>
            <Text className="text-base text-muted-foreground text-center mb-6">
              Start selling by posting your first item
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/create-marketplace")}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Create Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={listings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

type MarketplaceItem = {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  currency: string;
  images: string;
  location: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
};

const CATEGORIES = [
  "All",
  "books",
  "electronics",
  "furniture",
  "clothing",
  "sports",
  "services",
  "other",
];

const CONDITIONS = ["new", "like-new", "good", "fair", "poor"];

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
  // If it's a local path, return empty (will show placeholder)
  if (firstImage.startsWith("/assets")) {
    return "";
  }
  return firstImage;
};

// Helper function to get condition badge color
const getConditionColor = (condition: string, colors: any) => {
  switch (condition) {
    case "new":
    case "like-new":
      return colors.primary;
    case "good":
      return "#10b981";
    case "fair":
      return "#f59e0b";
    case "poor":
      return "#ef4444";
    default:
      return colors.mutedForeground;
  }
};

export default function MarketplaceScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("marketplaceItems")
        .select("*")
        .eq("isAvailable", true)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched marketplace items:", data?.length);
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load marketplace items",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const incrementViews = async (itemId: number) => {
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      await supabase
        .from("marketplaceItems")
        .update({ views: item.views + 1 })
        .eq("id", itemId);
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredItems = filteredItems.filter((item) => item.isFeatured);
  const regularItems = filteredItems.filter((item) => !item.isFeatured);

  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const imageUrl = getImageUrl(item.images);
    const conditionColor = getConditionColor(item.condition, colors);

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedItem(item);
          setShowDetailModal(true);
          incrementViews(item.id);
        }}
        className="bg-surface rounded-2xl p-4 mb-4 border border-border active:opacity-70"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {item.isFeatured && (
          <View className="absolute top-2 right-2 z-10 bg-primary px-3 py-1 rounded-full flex-row items-center gap-1">
            <IconSymbol name="star.fill" size={12} color="#fff" />
            <Text className="text-xs font-semibold text-primary-foreground">Featured</Text>
          </View>
        )}

        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-48 rounded-xl mb-3"
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="w-full h-48 rounded-xl mb-3 bg-muted items-center justify-center">
            <IconSymbol name="photo" size={48} color={colors.mutedForeground} />
            <Text className="text-sm text-muted-foreground mt-2">No image</Text>
          </View>
        )}

        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground mb-1" numberOfLines={2}>
              {item.title}
            </Text>
            <View className="flex-row items-center gap-2 mb-2">
              <View
                className="px-2 py-1 rounded-md"
                style={{ backgroundColor: `${conditionColor}20` }}
              >
                <Text
                  className="text-xs font-medium capitalize"
                  style={{ color: conditionColor }}
                >
                  {item.condition.replace("-", " ")}
                </Text>
              </View>
              <View className="px-2 py-1 bg-primary/10 rounded-md">
                <Text className="text-xs font-medium text-primary capitalize">
                  {item.category}
                </Text>
              </View>
            </View>
            {item.location && (
              <View className="flex-row items-center gap-1 mb-2">
                <IconSymbol name="mappin.circle" size={14} color={colors.mutedForeground} />
                <Text className="text-xs text-muted-foreground">{item.location}</Text>
              </View>
            )}
          </View>
        </View>

        <Text className="text-sm text-muted-foreground mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        <View className="flex-row items-center justify-between pt-3 border-t border-border">
          <View>
            <Text className="text-2xl font-bold text-primary">
              {item.currency} {parseFloat(item.price).toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <IconSymbol name="eye" size={16} color={colors.mutedForeground} />
              <Text className="text-xs text-muted-foreground">{item.views}</Text>
            </View>
            <TouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg active:opacity-70"
              onPress={() => {
                setSelectedItem(item);
                setShowDetailModal(true);
                incrementViews(item.id);
              }}
            >
              <Text className="text-primary-foreground font-semibold">View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    const imagesArray = parseJSON(selectedItem.images);
    const conditionColor = getConditionColor(selectedItem.condition, colors);

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <ScreenContainer>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center justify-between mb-4 pt-2">
              <Text className="text-2xl font-bold text-foreground">Item Details</Text>
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-full bg-surface items-center justify-center active:opacity-70"
              >
                <IconSymbol name="xmark" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {imagesArray.length > 0 && !imagesArray[0].startsWith("/assets") && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {imagesArray.map((img: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    className="w-80 h-56 rounded-xl mr-3"
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            )}

            {selectedItem.isFeatured && (
              <View className="bg-primary/10 px-4 py-3 rounded-xl mb-4 flex-row items-center gap-2">
                <IconSymbol name="star.fill" size={20} color={colors.primary} />
                <Text className="text-sm font-medium text-primary">Featured Item</Text>
              </View>
            )}

            <Text className="text-2xl font-bold text-foreground mb-2">
              {selectedItem.title}
            </Text>

            <View className="flex-row items-center gap-2 mb-4">
              <View
                className="px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: `${conditionColor}20` }}
              >
                <Text
                  className="text-sm font-semibold capitalize"
                  style={{ color: conditionColor }}
                >
                  {selectedItem.condition.replace("-", " ")}
                </Text>
              </View>
              <View className="px-3 py-1.5 bg-primary/10 rounded-lg">
                <Text className="text-sm font-semibold text-primary capitalize">
                  {selectedItem.category}
                </Text>
              </View>
            </View>

            <View className="bg-surface rounded-xl p-4 mb-4">
              <Text className="text-3xl font-bold text-primary mb-1">
                {selectedItem.currency} {parseFloat(selectedItem.price).toLocaleString()}
              </Text>
              <View className="flex-row items-center gap-3 mt-2">
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="eye" size={16} color={colors.mutedForeground} />
                  <Text className="text-sm text-muted-foreground">{selectedItem.views} views</Text>
                </View>
                {selectedItem.location && (
                  <>
                    <Text className="text-muted-foreground">•</Text>
                    <View className="flex-row items-center gap-1">
                      <IconSymbol name="mappin.circle" size={16} color={colors.mutedForeground} />
                      <Text className="text-sm text-muted-foreground">{selectedItem.location}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground mb-3">Description</Text>
              <Text className="text-base text-muted-foreground leading-6">
                {selectedItem.description}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground mb-3">Posted</Text>
              <View className="bg-surface rounded-xl p-4">
                <Text className="text-sm text-muted-foreground">
                  {new Date(selectedItem.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-primary py-4 rounded-xl items-center active:opacity-70 mb-4"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Contact Feature",
                  text2: "Contact seller functionality coming soon!",
                });
              }}
            >
              <Text className="text-primary-foreground font-semibold text-lg">
                Contact Seller
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface py-4 rounded-xl items-center active:opacity-70 mb-8 flex-row justify-center gap-2"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Share Feature",
                  text2: "Share functionality coming soon!",
                });
              }}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color={colors.foreground} />
              <Text className="text-foreground font-semibold text-lg">Share Item</Text>
            </TouchableOpacity>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    );
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Marketplace</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Buy and sell with students
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center active:opacity-70"
          >
            <IconSymbol name="xmark" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-surface rounded-xl px-4 py-3 flex-row items-center gap-3 mb-4">
          <IconSymbol name="magnifyingglass" size={20} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search items..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-base text-foreground"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl ${
                selectedCategory === category ? "bg-primary" : "bg-surface"
              }`}
            >
              <Text
                className={`font-medium capitalize ${
                  selectedCategory === category ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} available
          </Text>
          {featuredItems.length > 0 && (
            <>
              <Text className="text-muted-foreground">•</Text>
              <Text className="text-sm text-primary font-medium">
                {featuredItems.length} featured
              </Text>
            </>
          )}
        </View>

        {/* Listings */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">Loading items...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <IconSymbol name="bag" size={64} color={colors.mutedForeground} />
            <Text className="text-lg text-muted-foreground mt-4">No items found</Text>
            <Text className="text-sm text-muted-foreground mt-2">Try adjusting your filters</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListHeaderComponent={
              featuredItems.length > 0 ? (
                <View className="mb-4">
                  <Text className="text-lg font-semibold text-foreground mb-3">
                    ⭐ Featured Items
                  </Text>
                </View>
              ) : null
            }
          />
        )}

        {renderDetailModal()}
      </View>
    </ScreenContainer>
  );
}

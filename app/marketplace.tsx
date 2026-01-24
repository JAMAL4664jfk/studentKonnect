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
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

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
  { key: "All", label: "All", icon: "square.grid.2x2" },
  { key: "books", label: "Textbooks", icon: "book.fill" },
  { key: "electronics", label: "Electronics", icon: "laptopcomputer" },
  { key: "furniture", label: "Furniture", icon: "lamp.table.fill" },
  { key: "clothing", label: "Clothing", icon: "tshirt.fill" },
  { key: "sports", label: "Sports", icon: "sportscourt.fill" },
  { key: "services", label: "Services", icon: "briefcase.fill" },
  { key: "other", label: "Other", icon: "ellipsis.circle.fill" },
];

type FilterTab = "all" | "popular" | "recent" | "featured";

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

export default function MarketplaceScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>("all");
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      console.log("[MARKETPLACE] Starting fetch...");
      
      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from("marketplaceItems")
        .select("count")
        .limit(1);
      
      if (testError) {
        console.error("[MARKETPLACE] Connection test failed:", testError);
        Toast.show({
          type: "error",
          text1: "Connection Error",
          text2: `Database connection failed: ${testError.message}`,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log("[MARKETPLACE] Connection test passed");

      const { data, error } = await supabase
        .from("marketplaceItems")
        .select("*")
        .eq("isAvailable", true)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("[MARKETPLACE] Supabase error:", JSON.stringify(error));
        Toast.show({
          type: "error",
          text1: "Database Error",
          text2: error.message || "Failed to fetch data",
        });
        throw error;
      }

      console.log("[MARKETPLACE] Fetched:", data?.length, "items");
      
      if (!data || data.length === 0) {
        Toast.show({
          type: "info",
          text1: "No Items",
          text2: "No marketplace items available",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Loaded",
          text2: `Found ${data.length} items`,
        });
      }
      
      setItems(data || []);
    } catch (error: any) {
      console.error("[MARKETPLACE] Fetch error:", error);
      Toast.show({
        type: "error",
        text1: "Error Loading Data",
        text2: error.message || "Please check your internet connection",
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

      // Update local state
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, views: i.views + 1 } : i))
      );
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
  };

  const getFilteredItems = () => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Apply filter tab
    switch (selectedFilter) {
      case "popular":
        filtered = filtered.sort((a, b) => b.views - a.views);
        break;
      case "recent":
        filtered = filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "featured":
        filtered = filtered.filter((item) => item.isFeatured);
        break;
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const imageUrl = getImageUrl(item.images);
    const conditionColors = getConditionColor(item.condition);
    const isFavorite = favorites.has(item.id);

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedItem(item);
          setShowDetailModal(true);
          incrementViews(item.id);
        }}
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
              <IconSymbol name="photo" size={40} color={colors.mutedForeground} />
            </View>
          )}

          {/* Category Badge */}
          <View className="absolute top-2 left-2 bg-primary px-2.5 py-1 rounded-lg">
            <Text className="text-xs font-bold text-primary-foreground capitalize">
              {item.category}
            </Text>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface/90 items-center justify-center"
          >
            <IconSymbol
              name={isFavorite ? "heart.fill" : "heart"}
              size={16}
              color={isFavorite ? "#ef4444" : colors.foreground}
            />
          </TouchableOpacity>

          {/* Featured Badge */}
          {item.isFeatured && (
            <View className="absolute bottom-2 left-2 bg-yellow-500 px-2 py-1 rounded-md flex-row items-center gap-1">
              <IconSymbol name="star.fill" size={10} color="#fff" />
              <Text className="text-xs font-bold text-white">Featured</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View className="p-3">
          {/* Title */}
          <Text className="text-sm font-bold text-foreground mb-1" numberOfLines={2}>
            {item.title}
          </Text>

          {/* Location */}
          {item.location && (
            <View className="flex-row items-center gap-1 mb-2">
              <IconSymbol name="mappin.circle" size={12} color={colors.mutedForeground} />
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}

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

          {/* Price and Stats */}
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-primary">
              R{parseFloat(item.price).toLocaleString()}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-1">
                <IconSymbol name="eye" size={12} color={colors.mutedForeground} />
                <Text className="text-xs text-muted-foreground">{item.views}</Text>
              </View>
            </View>
          </View>

          {/* Student Badge */}
          <View className="flex-row items-center gap-1 mt-2 pt-2 border-t border-border">
            <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
              <Text className="text-xs font-bold text-primary-foreground">S</Text>
            </View>
            <Text className="text-xs text-muted-foreground">Student</Text>
            <View className="ml-auto">
              <TouchableOpacity
                className="bg-primary/10 px-2 py-1 rounded-md flex-row items-center gap-1"
                onPress={(e) => {
                  e.stopPropagation();
                  Toast.show({
                    type: "info",
                    text1: "Chat Feature",
                    text2: "Chat functionality coming soon!",
                  });
                }}
              >
                <IconSymbol name="message.fill" size={12} color={colors.primary} />
                <Text className="text-xs font-semibold text-primary">Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    const imagesArray = parseJSON(selectedItem.images);
    const conditionColors = getConditionColor(selectedItem.condition);
    const isFavorite = favorites.has(selectedItem.id);

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <ScreenContainer>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pt-2">
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-full bg-surface items-center justify-center"
              >
                <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleFavorite(selectedItem.id)}
                className="w-10 h-10 rounded-full bg-surface items-center justify-center"
              >
                <IconSymbol
                  name={isFavorite ? "heart.fill" : "heart"}
                  size={22}
                  color={isFavorite ? "#ef4444" : colors.foreground}
                />
              </TouchableOpacity>
            </View>

            {/* Images Carousel */}
            {imagesArray.length > 0 && !imagesArray[0].startsWith("/assets") && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                {imagesArray.map((img: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    className="w-80 h-64 rounded-2xl mr-3"
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            )}

            {/* Title */}
            <Text className="text-3xl font-bold text-foreground mb-3">
              {selectedItem.title}
            </Text>

            {/* Badges Row */}
            <View className="flex-row items-center gap-2 mb-4">
              <View
                className="px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: conditionColors.bg }}
              >
                <Text
                  className="text-sm font-bold capitalize"
                  style={{ color: conditionColors.text }}
                >
                  {selectedItem.condition.replace("-", " ")}
                </Text>
              </View>
              <View className="px-3 py-1.5 bg-primary/20 rounded-lg">
                <Text className="text-sm font-bold text-primary capitalize">
                  {selectedItem.category}
                </Text>
              </View>
              {selectedItem.isFeatured && (
                <View className="px-3 py-1.5 bg-yellow-500/20 rounded-lg flex-row items-center gap-1">
                  <IconSymbol name="star.fill" size={14} color="#eab308" />
                  <Text className="text-sm font-bold" style={{ color: "#eab308" }}>
                    Featured
                  </Text>
                </View>
              )}
            </View>

            {/* Price Card */}
            <View className="bg-primary/10 rounded-2xl p-5 mb-6">
              <Text className="text-4xl font-bold text-primary mb-2">
                R{parseFloat(selectedItem.price).toLocaleString()}
              </Text>
              <View className="flex-row items-center gap-4 mt-2">
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

            {/* Description */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-foreground mb-3">Description</Text>
              <Text className="text-base text-muted-foreground leading-7">
                {selectedItem.description}
              </Text>
            </View>

            {/* Seller Info */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-foreground mb-3">Seller Information</Text>
              <View className="bg-surface rounded-2xl p-4 flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                  <Text className="text-xl font-bold text-primary-foreground">S</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Student</Text>
                  <Text className="text-sm text-muted-foreground">
                    Posted {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              className="bg-primary py-4 rounded-2xl items-center active:opacity-80 mb-3 flex-row justify-center gap-2"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Contact Feature",
                  text2: "Contact seller functionality coming soon!",
                });
              }}
            >
              <IconSymbol name="message.fill" size={20} color="#fff" />
              <Text className="text-primary-foreground font-bold text-lg">Contact Seller</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface py-4 rounded-2xl items-center active:opacity-80 mb-8 flex-row justify-center gap-2"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Share Feature",
                  text2: "Share functionality coming soon!",
                });
              }}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color={colors.foreground} />
              <Text className="text-foreground font-bold text-lg">Share Item</Text>
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
        <View className="mb-6 pt-2">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-4xl font-bold text-primary mb-1">Student Marketplace</Text>
              <Text className="text-sm text-muted-foreground">
                Buy, sell & trade with fellow students
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center ml-3"
            >
              <IconSymbol name="xmark" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          className="bg-surface rounded-2xl px-4 py-3.5 flex-row items-center gap-3 mb-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
          }}
        >
          <IconSymbol name="magnifyingglass" size={22} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search for items..."
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
          <TouchableOpacity
            className="bg-primary px-3 py-2 rounded-xl flex-row items-center gap-1"
            onPress={() => router.push("/create-marketplace")}
          >
            <IconSymbol name="plus" size={16} color="#fff" />
            <Text className="text-primary-foreground font-semibold text-sm">Post</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-xl ${
              selectedFilter === "all" ? "bg-primary" : "bg-surface"
            }`}
          >
            <Text
              className={`font-semibold ${
                selectedFilter === "all" ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedFilter("popular")}
            className={`px-4 py-2 rounded-xl flex-row items-center gap-1.5 ${
              selectedFilter === "popular" ? "bg-primary" : "bg-surface"
            }`}
          >
            <IconSymbol
              name="chart.bar.fill"
              size={14}
              color={selectedFilter === "popular" ? "#fff" : colors.foreground}
            />
            <Text
              className={`font-semibold ${
                selectedFilter === "popular" ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              Popular
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedFilter("recent")}
            className={`px-4 py-2 rounded-xl flex-row items-center gap-1.5 ${
              selectedFilter === "recent" ? "bg-primary" : "bg-surface"
            }`}
          >
            <IconSymbol
              name="clock.fill"
              size={14}
              color={selectedFilter === "recent" ? "#fff" : colors.foreground}
            />
            <Text
              className={`font-semibold ${
                selectedFilter === "recent" ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedFilter("featured")}
            className={`px-4 py-2 rounded-xl flex-row items-center gap-1.5 ${
              selectedFilter === "featured" ? "bg-primary" : "bg-surface"
            }`}
          >
            <IconSymbol
              name="star.fill"
              size={14}
              color={selectedFilter === "featured" ? "#fff" : colors.foreground}
            />
            <Text
              className={`font-semibold ${
                selectedFilter === "featured" ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              Featured
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2.5 rounded-xl flex-row items-center gap-2 ${
                selectedCategory === cat.key
                  ? "bg-primary/20 border-2 border-primary"
                  : "bg-surface"
              }`}
            >
              <IconSymbol
                name={cat.icon}
                size={16}
                color={selectedCategory === cat.key ? colors.primary : colors.foreground}
              />
              <Text
                className={`font-medium ${
                  selectedCategory === cat.key ? "text-primary" : "text-foreground"
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-sm font-medium text-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </Text>
        </View>

        {/* Grid Listings */}
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
            numColumns={2}
            columnWrapperStyle={{ gap: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        {renderDetailModal()}
      </View>
    </ScreenContainer>
  );
}

import { useState, useEffect, useCallback } from "react";
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
  ActivityIndicator,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { FEATURE_DESCRIPTIONS } from "@/constants/feature-descriptions";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type SellerProfile = {
  full_name: string | null;
  avatar_url: string | null;
};

type MarketplaceItem = {
  id: number;
  userId: string;
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
  seller?: SellerProfile;
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

const parseJSON = (jsonString: string | null): any => {
  if (!jsonString) return [];
  try { return JSON.parse(jsonString); } catch { return []; }
};

const getImageUrl = (images: string): string => {
  const arr = parseJSON(images);
  if (!arr.length) return "";
  const first = arr[0];
  return first.startsWith("/assets") ? "" : first;
};

const getConditionColor = (condition: string) => {
  switch (condition) {
    case "new": return { bg: "#10b98120", text: "#10b981" };
    case "like-new": return { bg: "#3b82f620", text: "#3b82f6" };
    case "good": return { bg: "#10b98120", text: "#10b981" };
    case "fair": return { bg: "#f59e0b20", text: "#f59e0b" };
    case "poor": return { bg: "#ef444420", text: "#ef4444" };
    default: return { bg: "#6b728020", text: "#6b7280" };
  }
};

export default function MarketplaceScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await safeGetUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchItems = async () => {
    try {
      // Step 1: fetch listings
      const { data, error } = await supabase
        .from("marketplaceItems")
        .select("id, userId, title, description, category, condition, price, currency, images, location, isAvailable, isFeatured, views, createdAt, updatedAt")
        .eq("isAvailable", true)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("[MARKETPLACE] Fetch error:", JSON.stringify(error));
        Toast.show({ type: "error", text1: "Error fetching listings", text2: error.message || "Please try again" });
        return;
      }

      const listings: MarketplaceItem[] = data || [];

      // Step 2: batch-fetch seller profiles
      const sellerIds = [...new Set(listings.map((l) => l.userId).filter(Boolean))];
      let profileMap: Record<string, SellerProfile> = {};

      if (sellerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", sellerIds);

        if (profiles) {
          profiles.forEach((p: any) => {
            profileMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
          });
        }
      }

      // Step 3: attach seller to each listing
      const enriched = listings.map((item) => ({
        ...item,
        seller: profileMap[item.userId] || null,
      }));

      setItems(enriched);
    } catch (error: any) {
      console.error("[MARKETPLACE] Exception:", error);
      Toast.show({ type: "error", text1: "Error fetching listings", text2: error.message || "Please check your connection" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const incrementViews = async (itemId: number) => {
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      await supabase.from("marketplaceItems").update({ views: item.views + 1 }).eq("id", itemId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, views: i.views + 1 } : i)));
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
  };

  // ─── Chat with seller ────────────────────────────────────────────────────────
  const handleChatWithSeller = useCallback(async (item: MarketplaceItem) => {
    if (!currentUserId) {
      Toast.show({ type: "info", text1: "Sign in to chat with sellers" });
      return;
    }
    if (item.userId === currentUserId) {
      Toast.show({ type: "info", text1: "This is your own listing" });
      return;
    }
    setChatLoading(true);
    try {
      // Find or create conversation
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(participant1_id.eq.${currentUserId},participant2_id.eq.${item.userId}),and(participant1_id.eq.${item.userId},participant2_id.eq.${currentUserId})`)
        .maybeSingle();

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({ participant1_id: currentUserId, participant2_id: item.userId })
          .select()
          .maybeSingle();

        if (convError) throw convError;
        conversationId = newConv?.id;

        // Send an opening message about the item
        if (conversationId) {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: `Hi! I'm interested in your listing: "${item.title}" (R${parseFloat(item.price).toLocaleString()}). Is it still available?`,
            message_type: "text",
          });
        }
      }

      if (conversationId) {
        setShowDetailModal(false);
        router.push({
          pathname: "/chat-detail",
          params: {
            conversationId,
            otherUserName: item.seller?.full_name || "Seller",
            otherUserPhoto: item.seller?.avatar_url || "",
            otherUserId: item.userId,
          },
        });
      }
    } catch (error: any) {
      console.error("Error starting chat:", error);
      Toast.show({ type: "error", text1: "Failed to start chat", text2: error.message });
    } finally {
      setChatLoading(false);
    }
  }, [currentUserId, router]);

  const getFilteredItems = () => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    switch (selectedFilter) {
      case "popular": filtered = filtered.sort((a, b) => b.views - a.views); break;
      case "recent": filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "featured": filtered = filtered.filter((item) => item.isFeatured); break;
    }
    return filtered;
  };

  const filteredItems = getFilteredItems();

  // ─── Card Renderer ───────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const imageUrl = getImageUrl(item.images);
    const conditionColors = getConditionColor(item.condition);
    const isFavorite = favorites.has(item.id);
    const sellerName = item.seller?.full_name || "Student";
    const sellerAvatar = item.seller?.avatar_url;
    const sellerInitial = sellerName.charAt(0).toUpperCase();
    const isOwnListing = item.userId === currentUserId;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedItem(item);
          setShowDetailModal(true);
          incrementViews(item.id);
        }}
        className="mb-4 rounded-2xl overflow-hidden bg-surface"
        style={{ width: CARD_WIDTH, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}
      >
        {/* Image Section */}
        <View className="relative">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.85 }} contentFit="cover" transition={200} cachePolicy="memory-disk" />
          ) : (
            <View style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.85 }} className="bg-muted items-center justify-center">
              <IconSymbol name="photo" size={40} color={colors.muted} />
            </View>
          )}
          <View className="absolute top-2 left-2 bg-primary px-2.5 py-1 rounded-lg">
            <Text className="text-xs font-bold text-white capitalize">{item.category}</Text>
          </View>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface/90 items-center justify-center"
          >
            <IconSymbol name={isFavorite ? "heart.fill" : "heart"} size={16} color={isFavorite ? "#ef4444" : colors.foreground} />
          </TouchableOpacity>
          {item.isFeatured && (
            <View className="absolute bottom-2 left-2 bg-yellow-500 px-2 py-1 rounded-md flex-row items-center gap-1">
              <IconSymbol name="star.fill" size={10} color="#fff" />
              <Text className="text-xs font-bold text-white">Featured</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View className="p-3">
          <Text className="text-sm font-bold text-foreground mb-1" numberOfLines={2}>{item.title}</Text>
          {item.location && (
            <View className="flex-row items-center gap-1 mb-2">
              <IconSymbol name="mappin.circle" size={12} color={colors.muted} />
              <Text className="text-xs text-muted" numberOfLines={1}>{item.location}</Text>
            </View>
          )}
          <View className="self-start px-2 py-1 rounded-md mb-2" style={{ backgroundColor: conditionColors.bg }}>
            <Text className="text-xs font-semibold capitalize" style={{ color: conditionColors.text }}>{item.condition.replace("-", " ")}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-primary">R{parseFloat(item.price).toLocaleString()}</Text>
            <View className="flex-row items-center gap-1">
              <IconSymbol name="eye" size={12} color={colors.muted} />
              <Text className="text-xs text-muted">{item.views}</Text>
            </View>
          </View>

          {/* Seller Row */}
          <View className="flex-row items-center gap-1 mt-2 pt-2 border-t border-border">
            {sellerAvatar ? (
              <Image source={{ uri: sellerAvatar }} className="w-5 h-5 rounded-full" contentFit="cover" />
            ) : (
              <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                <Text className="text-xs font-bold text-white">{sellerInitial}</Text>
              </View>
            )}
            <Text className="text-xs text-muted flex-1" numberOfLines={1}>{sellerName}</Text>
            {!isOwnListing && (
              <TouchableOpacity
                className="bg-primary/10 px-2 py-1 rounded-md flex-row items-center gap-1"
                onPress={(e) => { e.stopPropagation(); handleChatWithSeller(item); }}
              >
                {chatLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <IconSymbol name="message.fill" size={12} color={colors.primary} />
                    <Text className="text-xs font-semibold text-primary">Chat</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {isOwnListing && (
              <View className="bg-muted/30 px-2 py-1 rounded-md">
                <Text className="text-xs font-semibold text-muted">Your listing</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Detail Modal ────────────────────────────────────────────────────────────
  const renderDetailModal = () => {
    if (!selectedItem) return null;
    const imagesArray = parseJSON(selectedItem.images);
    const conditionColors = getConditionColor(selectedItem.condition);
    const isFavorite = favorites.has(selectedItem.id);
    const sellerName = selectedItem.seller?.full_name || "Student Seller";
    const sellerAvatar = selectedItem.seller?.avatar_url;
    const sellerInitial = sellerName.charAt(0).toUpperCase();
    const isOwnListing = selectedItem.userId === currentUserId;

    return (
      <Modal visible={showDetailModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDetailModal(false)}>
        <ScreenContainer>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pt-2">
              <TouchableOpacity onPress={() => setShowDetailModal(false)} className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleFavorite(selectedItem.id)} className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                <IconSymbol name={isFavorite ? "heart.fill" : "heart"} size={22} color={isFavorite ? "#ef4444" : colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Images Carousel */}
            {imagesArray.length > 0 && !imagesArray[0].startsWith("/assets") && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                {imagesArray.map((img: string, index: number) => (
                  <Image key={index} source={{ uri: img }} className="w-80 h-64 rounded-2xl mr-3" contentFit="cover" />
                ))}
              </ScrollView>
            )}

            <Text className="text-3xl font-bold text-foreground mb-3">{selectedItem.title}</Text>

            {/* Badges */}
            <View className="flex-row items-center gap-2 mb-4">
              <View className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: conditionColors.bg }}>
                <Text className="text-sm font-bold capitalize" style={{ color: conditionColors.text }}>{selectedItem.condition.replace("-", " ")}</Text>
              </View>
              <View className="px-3 py-1.5 bg-primary/20 rounded-lg">
                <Text className="text-sm font-bold text-primary capitalize">{selectedItem.category}</Text>
              </View>
              {selectedItem.isFeatured && (
                <View className="px-3 py-1.5 bg-yellow-500/20 rounded-lg flex-row items-center gap-1">
                  <IconSymbol name="star.fill" size={14} color="#eab308" />
                  <Text className="text-sm font-bold" style={{ color: "#eab308" }}>Featured</Text>
                </View>
              )}
            </View>

            {/* Price Card */}
            <View className="bg-primary/10 rounded-2xl p-5 mb-6">
              <Text className="text-4xl font-bold text-primary mb-2">R{parseFloat(selectedItem.price).toLocaleString()}</Text>
              <View className="flex-row items-center gap-4 mt-2">
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="eye" size={16} color={colors.muted} />
                  <Text className="text-sm text-muted">{selectedItem.views} views</Text>
                </View>
                {selectedItem.location && (
                  <>
                    <Text className="text-muted">•</Text>
                    <View className="flex-row items-center gap-1">
                      <IconSymbol name="mappin.circle" size={16} color={colors.muted} />
                      <Text className="text-sm text-muted">{selectedItem.location}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-foreground mb-3">Description</Text>
              <Text className="text-base text-muted leading-7">{selectedItem.description}</Text>
            </View>

            {/* Seller Info */}
            <View className="bg-surface rounded-2xl p-5 mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">Seller Information</Text>
              <View className="flex-row items-center gap-3">
                {sellerAvatar ? (
                  <Image source={{ uri: sellerAvatar }} className="w-14 h-14 rounded-full" contentFit="cover" />
                ) : (
                  <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
                    <Text className="text-2xl font-bold text-white">{sellerInitial}</Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">{sellerName}</Text>
                  <Text className="text-sm text-muted">Verified Student</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            {!isOwnListing ? (
              <TouchableOpacity
                className="bg-primary py-4 rounded-2xl items-center active:opacity-80 mb-3 flex-row justify-center gap-2"
                onPress={() => handleChatWithSeller(selectedItem)}
                disabled={chatLoading}
              >
                {chatLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <IconSymbol name="message.fill" size={20} color="#fff" />
                    <Text className="text-white font-bold text-lg">Chat with Seller</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View className="bg-muted/20 py-4 rounded-2xl items-center mb-3 border border-border">
                <Text className="text-muted font-semibold text-base">This is your listing</Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-surface py-4 rounded-2xl items-center active:opacity-80 mb-8 flex-row justify-center gap-2 border border-border"
              onPress={async () => {
                try {
                  await Share.share({ message: `Check out this item on StudentKonnect: "${selectedItem.title}" for R${parseFloat(selectedItem.price).toLocaleString()}` });
                } catch {}
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
        <View className="pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <Text className="text-2xl font-bold text-foreground">Marketplace</Text>
              <Text className="text-sm text-muted">Buy and sell with fellow students</Text>
            </View>
            <TouchableOpacity onPress={() => setHeaderExpanded(!headerExpanded)} className="w-10 h-10 rounded-full bg-surface items-center justify-center">
              <IconSymbol name={headerExpanded ? "chevron.up" : "chevron.down"} size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {headerExpanded && (
            <View>
              {/* Search */}
              <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border mb-3">
                <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search for items..."
                  placeholderTextColor={colors.muted}
                  className="flex-1 text-foreground text-base"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Dropdown */}
              <View className="mb-3">
                <TouchableOpacity
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="bg-surface border border-border rounded-xl px-5 py-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <IconSymbol name={CATEGORIES.find(c => c.key === selectedCategory)?.icon || "square.grid.2x2"} size={20} color={colors.foreground} />
                    <Text className="text-base font-semibold text-foreground">{CATEGORIES.find(c => c.key === selectedCategory)?.label || "All"}</Text>
                  </View>
                  <IconSymbol name="chevron.down" size={20} color={colors.foreground} />
                </TouchableOpacity>
                {showCategoryDropdown && (
                  <View className="bg-surface border border-border rounded-xl mt-2 overflow-hidden">
                    {CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category.key}
                        onPress={() => { setSelectedCategory(category.key); setShowCategoryDropdown(false); }}
                        className={`px-5 py-4 flex-row items-center gap-3 ${selectedCategory === category.key ? "bg-primary/10" : ""}`}
                      >
                        <IconSymbol name={category.icon} size={20} color={selectedCategory === category.key ? colors.primary : colors.foreground} />
                        <Text className={`text-base font-semibold ${selectedCategory === category.key ? "text-primary" : "text-foreground"}`}>{category.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity className="flex-1 bg-primary px-5 py-3.5 rounded-xl flex-row items-center justify-center gap-2" onPress={() => router.push("/create-marketplace")}>
                  <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                  <Text className="text-white font-bold text-base">Post Listing</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-surface border border-primary px-5 py-3.5 rounded-xl flex-row items-center justify-center gap-2" onPress={() => router.push("/my-marketplace-listings")}>
                  <IconSymbol name="list.bullet" size={20} color={colors.primary} />
                  <Text className="text-primary font-bold text-base">My Listings</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Items Grid */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
            <Text className="text-muted mt-2">Loading items...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <IconSymbol name="tray" size={64} color={colors.muted} />
            <Text className="text-xl font-bold text-foreground mt-4 mb-2">No items found</Text>
            <Text className="text-base text-muted text-center">Try adjusting your filters or search query</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          />
        )}

        {renderDetailModal()}
      </View>
    </ScreenContainer>
  );
}

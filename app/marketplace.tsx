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
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string;
  location: string;
  images: string[];
  likes_count: number;
  views_count: number;
  created_at: string;
  user_id: string;
  sold: boolean;
  seller?: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

type TabType = "all" | "popular" | "recent" | "mylistings" | "favorites";

const CATEGORIES = [
  "All",
  "Textbooks",
  "Electronics",
  "Furniture",
  "Clothing",
  "Services",
  "Transport",
  "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

// Helper function to get full Supabase Storage URL
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const supabaseUrl = "https://jxvfhwpvnwbvjpqcvmxp.supabase.co";
  return `${supabaseUrl}/storage/v1/object/public/marketplace/${imagePath}`;
};

export default function MarketplaceScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [listings, setListings] = useState<Listing[]>([]);
  const [likedListings, setLikedListings] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  
  // Post listing modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
    category: "Textbooks",
    condition: "Good",
    location: "",
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  
  // Detail modal state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const tabs = [
    { key: "all" as TabType, label: "All", icon: "square.grid.2x2" },
    { key: "popular" as TabType, label: "Popular", icon: "chart.bar.fill" },
    { key: "recent" as TabType, label: "Recent", icon: "clock.fill" },
    { key: "mylistings" as TabType, label: "My Listings", icon: "bag.fill" },
    { key: "favorites" as TabType, label: "Favorites", icon: "heart.fill" },
  ];

  useEffect(() => {
    checkAuth();
    fetchListings();
    fetchUserLikes();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchListings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data: listingsData, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("sold", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch seller profiles
      const userIds = [...new Set(listingsData?.map((l) => l.user_id) || [])];
      let profilesMap = new Map();

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
      }

      const listingsWithSellers =
        listingsData?.map((listing) => ({
          ...listing,
          seller: profilesMap.get(listing.user_id) || {
            full_name: null,
            avatar_url: null,
          },
        })) || [];

      setListings(listingsWithSellers);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load listings",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("marketplace_likes")
        .select("listing_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setLikedListings(new Set(data?.map((like) => like.listing_id) || []));
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings(false);
    await fetchUserLikes();
  };

  const handleLike = async (listingId: string) => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to like listings",
      });
      return;
    }

    const isLiked = likedListings.has(listingId);

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from("marketplace_likes")
          .delete()
          .eq("listing_id", listingId)
          .eq("user_id", currentUser.id);

        setLikedListings((prev) => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
      } else {
        // Like
        await supabase.from("marketplace_likes").insert({
          listing_id: listingId,
          user_id: currentUser.id,
        });

        setLikedListings((prev) => new Set(prev).add(listingId));
      }

      // Refresh to get updated counts
      await fetchListings(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update like",
      });
    }
  };

  const handleContact = async (listing: Listing) => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to contact sellers",
      });
      return;
    }

    if (listing.user_id === currentUser.id) {
      Toast.show({
        type: "info",
        text1: "Your Listing",
        text2: "This is your own listing",
      });
      return;
    }

    try {
      // Check if conversation exists
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant1_id.eq.${currentUser.id},participant2_id.eq.${listing.user_id}),and(participant1_id.eq.${listing.user_id},participant2_id.eq.${currentUser.id})`
        )
        .single();

      let conversationId = existingConv?.id;

      if (!conversationId) {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({
            participant1_id: currentUser.id,
            participant2_id: listing.user_id,
          })
          .select()
          .single();

        if (error) throw error;
        conversationId = newConv.id;

        // Send initial message
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: `Hi! I'm interested in your listing: "${listing.title}" for R${listing.price.toLocaleString()}`,
        });

        await supabase
          .from("conversations")
          .update({
            last_message: `Hi! I'm interested in your listing: "${listing.title}"`,
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conversationId);
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Opening chat with seller",
      });
      setShowDetailModal(false);
      router.push("/(tabs)/chat");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to start conversation",
      });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from("marketplace_listings")
        .delete()
        .eq("id", listingId)
        .eq("user_id", currentUser?.id);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Listing deleted",
      });
      setShowDetailModal(false);
      await fetchListings(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete listing",
      });
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      setSelectedImages(result.assets.map((asset) => asset.uri));
    }
  };

  const handlePostListing = async () => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to post listings",
      });
      return;
    }

    if (!newListing.title || !newListing.price) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in title and price",
      });
      return;
    }

    setPosting(true);
    try {
      // Upload images if any
      const uploadedImages: string[] = [];
      for (const imageUri of selectedImages) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from("marketplace")
          .upload(fileName, blob);

        if (!uploadError) {
          uploadedImages.push(fileName);
        }
      }

      // Create listing
      const { error } = await supabase.from("marketplace_listings").insert({
        title: newListing.title,
        description: newListing.description || null,
        price: parseFloat(newListing.price),
        category: newListing.category,
        condition: newListing.condition,
        location: newListing.location || "Not specified",
        images: uploadedImages,
        user_id: currentUser.id,
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Listing posted successfully",
      });

      // Reset form
      setNewListing({
        title: "",
        description: "",
        price: "",
        category: "Textbooks",
        condition: "Good",
        location: "",
      });
      setSelectedImages([]);
      setShowPostModal(false);
      await fetchListings(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to post listing",
      });
    } finally {
      setPosting(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSortedListings = () => {
    if (activeTab === "mylistings") {
      return filteredListings.filter((l) => l.user_id === currentUser?.id);
    }

    if (activeTab === "favorites") {
      return filteredListings.filter((l) => likedListings.has(l.id));
    }

    const othersListings = currentUser
      ? filteredListings.filter((l) => l.user_id !== currentUser.id)
      : filteredListings;

    switch (activeTab) {
      case "popular":
        return [...othersListings].sort((a, b) => b.likes_count - a.likes_count);
      case "recent":
        return [...othersListings].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return othersListings;
    }
  };

  const displayListings = getSortedListings();

  const renderListing = ({ item }: { item: Listing }) => {
    const isLiked = likedListings.has(item.id);
    const isOwn = item.user_id === currentUser?.id;

    return (
      <TouchableOpacity
        className="bg-surface rounded-2xl p-4 mb-4 border border-border active:opacity-70"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={() => {
          setSelectedListing(item);
          setShowDetailModal(true);
        }}
      >
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: getImageUrl(item.images[0]) }}
            className="w-full h-48 rounded-xl mb-3"
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="w-full h-48 rounded-xl mb-3 bg-surface items-center justify-center border border-border">
            <IconSymbol name="photo.fill" size={48} color={colors.muted} />
            <Text className="text-sm text-muted mt-2">No image</Text>
          </View>
        )}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground mb-1">
              {item.title}
            </Text>
            <Text className="text-2xl font-bold text-primary">
              R{item.price.toLocaleString()}
            </Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <Text className="text-xs font-medium" style={{ color: colors.primary }}>
              {item.condition}
            </Text>
          </View>
        </View>
        {item.description && (
          <Text className="text-sm text-muted mb-3" numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleLike(item.id);
              }}
              className="flex-row items-center gap-1"
            >
              <IconSymbol
                name={isLiked ? "heart.fill" : "heart"}
                size={20}
                color={isLiked ? "#EF4444" : colors.muted}
              />
              <Text className="text-xs text-muted">{item.likes_count}</Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-1">
              <IconSymbol name="eye.fill" size={16} color={colors.muted} />
              <Text className="text-xs text-muted">{item.views_count}</Text>
            </View>
          </View>
          {!isOwn && (
            <TouchableOpacity
              className="bg-primary px-4 py-2 rounded-full active:opacity-70"
              onPress={(e) => {
                e.stopPropagation();
                handleContact(item);
              }}
            >
              <Text className="text-white text-xs font-semibold">Contact</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <Text className="text-2xl font-bold text-foreground">Marketplace</Text>
              <Text className="text-sm text-muted">Buy, sell & trade with students</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowPostModal(true)}
              className="bg-primary px-4 py-2 rounded-full active:opacity-70"
            >
              <Text className="text-white text-sm font-semibold">Post</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border mb-3">
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search listings..."
              placeholderTextColor={colors.muted}
              className="flex-1 text-foreground text-base"
            />
          </View>
        </View>

        {/* Tabs */}
        <View className="border-b border-border">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={index === 0 ? "pl-4 pr-4 py-3" : "px-4 py-3"}
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: activeTab === tab.key ? colors.primary : "transparent",
                }}
              >
                <View className="flex-row items-center gap-2">
                  <IconSymbol
                    name={tab.icon as any}
                    size={18}
                    color={activeTab === tab.key ? colors.primary : colors.muted}
                  />
                  <Text
                    className="font-semibold text-sm"
                    style={{
                      color: activeTab === tab.key ? colors.primary : colors.muted,
                    }}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View className="py-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category ? "bg-primary" : "bg-surface"
                }`}
                style={{
                  borderWidth: 1,
                  borderColor:
                    selectedCategory === category ? colors.primary : colors.border,
                }}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedCategory === category ? "text-white" : "text-foreground"
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Listings */}
        <FlatList
          data={displayListings}
          renderItem={renderListing}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <IconSymbol name="cart.fill" size={48} color={colors.muted} />
              <Text className="text-muted text-center mt-4">
                {loading ? "Loading listings..." : "No listings found"}
              </Text>
            </View>
          }
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        />
      </View>

      {/* Post Listing Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPostModal(false)}
      >
        <ScreenContainer>
          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Post Listing</Text>
              <TouchableOpacity onPress={() => setShowPostModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Title *</Text>
                  <TextInput
                    value={newListing.title}
                    onChangeText={(text) => setNewListing({ ...newListing, title: text })}
                    placeholder="e.g., MacBook Pro 2020"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Price (R) *</Text>
                  <TextInput
                    value={newListing.price}
                    onChangeText={(text) => setNewListing({ ...newListing, price: text })}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setNewListing({ ...newListing, category: cat })}
                        className={`px-4 py-2 rounded-full ${
                          newListing.category === cat ? "bg-primary" : "bg-surface"
                        }`}
                        style={{ borderWidth: 1, borderColor: colors.border }}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            newListing.category === cat ? "text-white" : "text-foreground"
                          }`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Condition</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    {CONDITIONS.map((cond) => (
                      <TouchableOpacity
                        key={cond}
                        onPress={() => setNewListing({ ...newListing, condition: cond })}
                        className={`px-4 py-2 rounded-full ${
                          newListing.condition === cond ? "bg-primary" : "bg-surface"
                        }`}
                        style={{ borderWidth: 1, borderColor: colors.border }}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            newListing.condition === cond ? "text-white" : "text-foreground"
                          }`}
                        >
                          {cond}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
                  <TextInput
                    value={newListing.description}
                    onChangeText={(text) => setNewListing({ ...newListing, description: text })}
                    placeholder="Describe your item..."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Location</Text>
                  <TextInput
                    value={newListing.location}
                    onChangeText={(text) => setNewListing({ ...newListing, location: text })}
                    placeholder="e.g., Campus, Res Name"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Images</Text>
                  <TouchableOpacity
                    onPress={pickImages}
                    className="bg-surface border border-border rounded-xl p-4 items-center justify-center"
                    style={{ minHeight: 100 }}
                  >
                    <IconSymbol name="photo.fill" size={32} color={colors.primary} />
                    <Text className="text-sm text-primary mt-2">
                      {selectedImages.length > 0
                        ? `${selectedImages.length} image(s) selected`
                        : "Tap to select images"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handlePostListing}
              disabled={posting}
              className="bg-primary rounded-xl py-4 items-center mt-4"
              style={{ opacity: posting ? 0.5 : 1 }}
            >
              <Text className="text-white font-semibold text-base">
                {posting ? "Posting..." : "Post Listing"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        {selectedListing && (
          <ScreenContainer>
            <View className="flex-1">
              <View className="flex-row items-center justify-between p-4 border-b border-border">
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-foreground">Listing Details</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView className="flex-1">
                {/* Images */}
                {selectedListing.images && selectedListing.images.length > 0 ? (
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                  >
                    {selectedListing.images.map((img, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: getImageUrl(img) }}
                        style={{ width: 400, height: 300 }}
                        contentFit="cover"
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View
                    className="bg-surface items-center justify-center border-b border-border"
                    style={{ height: 300 }}
                  >
                    <IconSymbol name="photo.fill" size={64} color={colors.muted} />
                  </View>
                )}

                <View className="p-4 gap-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-foreground mb-2">
                        {selectedListing.title}
                      </Text>
                      <Text className="text-3xl font-bold text-primary">
                        R{selectedListing.price.toLocaleString()}
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                        {selectedListing.condition}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                      onPress={() => handleLike(selectedListing.id)}
                      className="flex-row items-center gap-2"
                    >
                      <IconSymbol
                        name={likedListings.has(selectedListing.id) ? "heart.fill" : "heart"}
                        size={24}
                        color={likedListings.has(selectedListing.id) ? "#EF4444" : colors.muted}
                      />
                      <Text className="text-sm text-muted">{selectedListing.likes_count} likes</Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-2">
                      <IconSymbol name="eye.fill" size={20} color={colors.muted} />
                      <Text className="text-sm text-muted">{selectedListing.views_count} views</Text>
                    </View>
                  </View>

                  {selectedListing.description && (
                    <View>
                      <Text className="text-lg font-semibold text-foreground mb-2">Description</Text>
                      <Text className="text-base text-muted leading-relaxed">
                        {selectedListing.description}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-muted mb-1">Category</Text>
                      <Text className="text-base text-foreground">{selectedListing.category}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-muted mb-1">Location</Text>
                      <Text className="text-base text-foreground">{selectedListing.location}</Text>
                    </View>
                  </View>

                  {selectedListing.seller && (
                    <View>
                      <Text className="text-lg font-semibold text-foreground mb-2">Seller</Text>
                      <View className="flex-row items-center gap-3">
                        <View
                          className="w-12 h-12 rounded-full bg-primary items-center justify-center"
                        >
                          <Text className="text-white font-semibold text-lg">
                            {selectedListing.seller.full_name?.charAt(0) || "?"}
                          </Text>
                        </View>
                        <Text className="text-base text-foreground">
                          {selectedListing.seller.full_name || "Anonymous"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>

              <View className="p-4 border-t border-border">
                {selectedListing.user_id === currentUser?.id ? (
                  <TouchableOpacity
                    onPress={() => handleDeleteListing(selectedListing.id)}
                    className="bg-error rounded-xl py-4 items-center"
                  >
                    <Text className="text-white font-semibold text-base">Delete Listing</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleContact(selectedListing)}
                    className="bg-primary rounded-xl py-4 items-center"
                  >
                    <Text className="text-white font-semibold text-base">Contact Seller</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScreenContainer>
        )}
      </Modal>
    </ScreenContainer>
  );
}

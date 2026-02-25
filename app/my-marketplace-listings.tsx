import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  ActivityIndicator,
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
  description: string;
  category: string;
  price: string;
  currency: string;
  condition: string;
  location: string | null;
  images: string;
  isAvailable: boolean;
  views: number;
  createdAt: string;
};

type Category = "books" | "electronics" | "furniture" | "clothing" | "sports" | "services" | "other";
type Condition = "new" | "like-new" | "good" | "fair" | "poor";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "books", label: "Textbooks" },
  { key: "electronics", label: "Electronics" },
  { key: "furniture", label: "Furniture" },
  { key: "clothing", label: "Clothing" },
  { key: "sports", label: "Sports" },
  { key: "services", label: "Services" },
  { key: "other", label: "Other" },
];

const CONDITIONS: { key: Condition; label: string }[] = [
  { key: "new", label: "New" },
  { key: "like-new", label: "Like New" },
  { key: "good", label: "Good" },
  { key: "fair", label: "Fair" },
  { key: "poor", label: "Poor" },
];

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

export default function MyMarketplaceListingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("electronics");
  const [editCondition, setEditCondition] = useState<Condition>("good");
  const [editLocation, setEditLocation] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);

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

      const { data, error } = await supabase
        .from("marketplaceItems")
        .select("id, title, description, category, price, currency, condition, location, images, isAvailable, views, createdAt")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("fetchMyListings error:", JSON.stringify(error));
        Toast.show({ type: "error", text1: "Error loading listings", text2: error.message });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setListings(data || []);
    } catch (error: any) {
      console.error("Error fetching listings:", error);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load your listings" });
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
      const { error } = await supabase.from("marketplaceItems").update({ isAvailable: !currentStatus }).eq("id", id);
      if (error) throw error;
      Toast.show({ type: "success", text1: !currentStatus ? "Item activated" : "Item deactivated" });
      fetchMyListings();
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Error", text2: error.message });
    }
  };

  const deleteListing = (id: number, title: string) => {
    Alert.alert("Delete Item", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.from("marketplaceItems").delete().eq("id", id);
            if (error) throw error;
            Toast.show({ type: "success", text1: "Deleted", text2: "Item removed successfully" });
            fetchMyListings();
          } catch (error: any) {
            Toast.show({ type: "error", text1: "Error", text2: error.message });
          }
        },
      },
    ]);
  };

  // ─── Open Edit Modal ─────────────────────────────────────────────────────────
  const openEditModal = (item: MarketplaceItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditPrice(item.price.toString());
    setEditCategory((item.category as Category) || "other");
    setEditCondition((item.condition as Condition) || "good");
    setEditLocation(item.location || "");
    setShowCategoryPicker(false);
    setShowConditionPicker(false);
    setShowEditModal(true);
  };

  // ─── Save Edit ───────────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editTitle.trim()) { Toast.show({ type: "error", text1: "Title is required" }); return; }
    if (!editDescription.trim()) { Toast.show({ type: "error", text1: "Description is required" }); return; }
    if (!editPrice || isNaN(parseFloat(editPrice))) { Toast.show({ type: "error", text1: "Valid price is required" }); return; }

    setEditSaving(true);
    try {
      const { error } = await supabase
        .from("marketplaceItems")
        .update({
          title: editTitle.trim(),
          description: editDescription.trim(),
          price: parseFloat(editPrice),
          category: editCategory,
          condition: editCondition,
          location: editLocation.trim() || null,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", editingItem.id);

      if (error) throw error;

      Toast.show({ type: "success", text1: "Listing updated!", text2: "Your changes have been saved." });
      setShowEditModal(false);
      setEditingItem(null);
      fetchMyListings();
    } catch (error: any) {
      console.error("Error updating listing:", error);
      Toast.show({ type: "error", text1: "Update failed", text2: error.message });
    } finally {
      setEditSaving(false);
    }
  };

  // ─── Edit Modal UI ───────────────────────────────────────────────────────────
  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEditModal(false)}
    >
      <ScreenContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6 pt-2">
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <IconSymbol name="xmark" size={18} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Edit Listing</Text>
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={editSaving}
              className="bg-primary px-4 py-2 rounded-xl"
            >
              {editSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white font-bold">Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Title *</Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Item title"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Description *</Text>
            <TextInput
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Describe your item..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </View>

          {/* Price */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Price (R) *</Text>
            <TextInput
              value={editPrice}
              onChangeText={setEditPrice}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
            />
          </View>

          {/* Category Picker */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Category</Text>
            <TouchableOpacity
              onPress={() => { setShowCategoryPicker(!showCategoryPicker); setShowConditionPicker(false); }}
              className="bg-surface border border-border rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-foreground text-base">{CATEGORIES.find(c => c.key === editCategory)?.label || editCategory}</Text>
              <IconSymbol name="chevron.down" size={16} color={colors.muted} />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View className="bg-surface border border-border rounded-xl mt-1 overflow-hidden">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => { setEditCategory(cat.key); setShowCategoryPicker(false); }}
                    className={`px-4 py-3 ${editCategory === cat.key ? "bg-primary/10" : ""}`}
                  >
                    <Text className={`text-base ${editCategory === cat.key ? "text-primary font-semibold" : "text-foreground"}`}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Condition Picker */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Condition</Text>
            <TouchableOpacity
              onPress={() => { setShowConditionPicker(!showConditionPicker); setShowCategoryPicker(false); }}
              className="bg-surface border border-border rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-foreground text-base">{CONDITIONS.find(c => c.key === editCondition)?.label || editCondition}</Text>
              <IconSymbol name="chevron.down" size={16} color={colors.muted} />
            </TouchableOpacity>
            {showConditionPicker && (
              <View className="bg-surface border border-border rounded-xl mt-1 overflow-hidden">
                {CONDITIONS.map((cond) => (
                  <TouchableOpacity
                    key={cond.key}
                    onPress={() => { setEditCondition(cond.key); setShowConditionPicker(false); }}
                    className={`px-4 py-3 ${editCondition === cond.key ? "bg-primary/10" : ""}`}
                  >
                    <Text className={`text-base ${editCondition === cond.key ? "text-primary font-semibold" : "text-foreground"}`}>{cond.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-foreground mb-2">Location (optional)</Text>
            <TextInput
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="e.g. Library, Res Block A"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
            />
          </View>
        </ScrollView>
      </ScreenContainer>
    </Modal>
  );

  // ─── Card Renderer ───────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const imageUrl = getImageUrl(item.images);
    const conditionColors = getConditionColor(item.condition);

    return (
      <TouchableOpacity
        className="mb-4 rounded-2xl overflow-hidden bg-surface"
        style={{ width: CARD_WIDTH, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}
      >
        {/* Image */}
        <View className="relative">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.85 }} contentFit="cover" transition={200} cachePolicy="memory-disk" />
          ) : (
            <View style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.85 }} className="bg-muted items-center justify-center">
              <IconSymbol name="photo" size={40} color={colors.muted} />
            </View>
          )}
          <View className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg ${item.isAvailable ? "bg-green-500" : "bg-gray-400"}`}>
            <Text className="text-xs font-bold text-white">{item.isAvailable ? "Active" : "Inactive"}</Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-3">
          <Text className="text-sm font-bold text-foreground mb-1" numberOfLines={2}>{item.title}</Text>
          <View className="self-start px-2 py-1 rounded-md mb-2" style={{ backgroundColor: conditionColors.bg }}>
            <Text className="text-xs font-semibold capitalize" style={{ color: conditionColors.text }}>{item.condition.replace("-", " ")}</Text>
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-primary">R{parseFloat(item.price).toLocaleString()}</Text>
            <View className="flex-row items-center gap-1">
              <IconSymbol name="eye" size={12} color={colors.muted} />
              <Text className="text-xs text-muted">{item.views}</Text>
            </View>
          </View>

          {/* 3 Action Buttons: Edit | Toggle | Delete */}
          <View className="flex-row gap-1.5">
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              className="flex-1 bg-primary/10 py-2 rounded-lg flex-row items-center justify-center gap-1"
            >
              <IconSymbol name="pencil" size={12} color={colors.primary} />
              <Text className="text-xs font-semibold text-primary">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleAvailability(item.id, item.isAvailable)}
              className={`flex-1 py-2 rounded-lg ${item.isAvailable ? "bg-muted/30" : "bg-green-500/20"}`}
            >
              <Text className={`text-xs font-semibold text-center ${item.isAvailable ? "text-muted" : "text-green-600"}`}>
                {item.isAvailable ? "Deactivate" : "Activate"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteListing(item.id, item.title)}
              className="flex-1 bg-red-500/10 py-2 rounded-lg"
            >
              <Text className="text-xs font-semibold text-center text-red-500">Delete</Text>
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
            <Text className="text-3xl font-bold text-foreground mb-1">My Listings</Text>
            <Text className="text-sm text-muted">Manage your marketplace items</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-muted items-center justify-center">
            <IconSymbol name="xmark" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Post New Listing */}
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
            <ActivityIndicator color={colors.primary} />
            <Text className="text-muted mt-2">Loading your listings...</Text>
          </View>
        ) : listings.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <IconSymbol name="tray" size={64} color={colors.muted} />
            <Text className="text-xl font-bold text-foreground mt-4 mb-2">No listings yet</Text>
            <Text className="text-base text-muted text-center mb-6">Start selling by posting your first item</Text>
            <TouchableOpacity onPress={() => router.push("/create-marketplace")} className="bg-primary px-6 py-3 rounded-xl">
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          />
        )}
      </View>

      {renderEditModal()}
    </ScreenContainer>
  );
}

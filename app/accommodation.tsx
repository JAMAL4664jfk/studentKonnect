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
import * as ImagePicker from "expo-image-picker";

type Accommodation = {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  location: string;
  distance: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  verified: boolean;
  available: boolean;
  user_id: string;
  created_at: string;
};

const TYPES = ["All", "Apartment", "Shared Room", "Studio", "House", "Private Room"];

// Helper function to get full Supabase Storage URL
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const supabaseUrl = "https://jxvfhwpvnwbvjpqcvmxp.supabase.co";
  return `${supabaseUrl}/storage/v1/object/public/accommodations/${imagePath}`;
};

type TabType = "browse" | "my-listings";

export default function AccommodationScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [myListings, setMyListings] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Create listing form state
  const [listingForm, setListingForm] = useState({
    title: "",
    description: "",
    type: "Apartment",
    price: "",
    location: "",
    distance: "",
    bedrooms: "",
    bathrooms: "",
    amenities: "",
  });
  const [listingImages, setListingImages] = useState<string[]>([]);

  useEffect(() => {
    getCurrentUser();
    fetchAccommodations();
  }, []);

  useEffect(() => {
    if (currentUserId && activeTab === "my-listings") {
      fetchMyListings();
    }
  }, [currentUserId, activeTab]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchAccommodations = async () => {
    try {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccommodations(data || []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load accommodations",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMyListings = async () => {
    if (!currentUserId) return;
    try {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyListings(data || []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load your listings",
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "browse") {
      await fetchAccommodations();
    } else {
      await fetchMyListings();
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map((asset) => asset.uri);
      setListingImages([...listingImages, ...uris].slice(0, 6));
    }
  };

  const uploadImages = async (imageUris: string[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const uri of imageUris) {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileExt = uri.split(".").pop();
        const fileName = `${currentUserId}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("accommodations")
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("accommodations").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error("Image upload error:", error);
      }
    }

    return uploadedUrls;
  };

  const handleCreateListing = async () => {
    if (
      !listingForm.title ||
      !listingForm.description ||
      !listingForm.price ||
      !listingForm.location ||
      !listingForm.distance ||
      !listingForm.bedrooms ||
      !listingForm.bathrooms ||
      !listingForm.amenities
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields",
      });
      return;
    }

    if (listingImages.length === 0) {
      Toast.show({
        type: "error",
        text1: "Missing Images",
        text2: "Please add at least one image",
      });
      return;
    }

    try {
      Toast.show({
        type: "info",
        text1: "Uploading...",
        text2: "Please wait while we upload your listing",
      });

      const uploadedImageUrls = await uploadImages(listingImages);
      const amenitiesArray = listingForm.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const { error } = await supabase.from("accommodations").insert({
        user_id: currentUserId,
        title: listingForm.title,
        description: listingForm.description,
        type: listingForm.type,
        price: parseFloat(listingForm.price),
        location: listingForm.location,
        distance: listingForm.distance,
        bedrooms: parseInt(listingForm.bedrooms),
        bathrooms: parseInt(listingForm.bathrooms),
        amenities: amenitiesArray,
        images: uploadedImageUrls,
        available: true,
        verified: false,
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Your accommodation has been listed",
      });

      setShowCreateModal(false);
      setListingForm({
        title: "",
        description: "",
        type: "Apartment",
        price: "",
        location: "",
        distance: "",
        bedrooms: "",
        bathrooms: "",
        amenities: "",
      });
      setListingImages([]);
      fetchAccommodations();
      fetchMyListings();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to create listing",
      });
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      const { error } = await supabase.from("accommodations").delete().eq("id", id);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: "Listing removed successfully",
      });

      fetchMyListings();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete listing",
      });
    }
  };

  const filteredAccommodations = accommodations.filter((acc) => {
    const matchesSearch =
      acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || acc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderAccommodation = ({ item }: { item: Accommodation }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedAccommodation(item);
        setShowDetailModal(true);
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
      {item.images && item.images.length > 0 ? (
        <Image
          source={{ uri: getImageUrl(item.images[0]) }}
          className="w-full h-48 rounded-xl mb-3"
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      ) : (
        <View className="w-full h-48 rounded-xl mb-3 bg-surface items-center justify-center">
          <IconSymbol name="building.fill" size={48} color={colors.muted} />
          <Text className="text-sm text-muted mt-2">No image</Text>
        </View>
      )}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground mb-1">
            {item.title}
          </Text>
          <View className="flex-row items-center gap-2 mb-2">
            <IconSymbol name="mappin" size={14} color={colors.muted} />
            <Text className="text-sm text-muted">{item.location}</Text>
          </View>
        </View>
        {item.verified && (
          <View
            className="px-2 py-1 rounded-full flex-row items-center gap-1"
            style={{ backgroundColor: colors.success + "20" }}
          >
            <IconSymbol name="checkmark.shield.fill" size={14} color={colors.success} />
            <Text className="text-xs font-medium" style={{ color: colors.success }}>
              Verified
            </Text>
          </View>
        )}
      </View>
      <Text className="text-sm text-muted mb-3" numberOfLines={2}>
        {item.description}
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <IconSymbol name="bed.double.fill" size={16} color={colors.muted} />
            <Text className="text-xs text-muted">{item.bedrooms} bed</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <IconSymbol name="shower.fill" size={16} color={colors.muted} />
            <Text className="text-xs text-muted">{item.bathrooms} bath</Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-primary">
          R{item.price.toLocaleString()}/mo
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMyListing = ({ item }: { item: Accommodation }) => (
    <View
      className="bg-surface rounded-2xl p-4 mb-4 border border-border"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
        <View className="w-full h-48 rounded-xl mb-3 bg-surface items-center justify-center">
          <IconSymbol name="building.fill" size={48} color={colors.muted} />
          <Text className="text-sm text-muted mt-2">No image</Text>
        </View>
      )}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground mb-1">
            {item.title}
          </Text>
          <View className="flex-row items-center gap-2 mb-2">
            <IconSymbol name="mappin" size={14} color={colors.muted} />
            <Text className="text-sm text-muted">{item.location}</Text>
          </View>
        </View>
        <View
          className="px-2 py-1 rounded-full"
          style={{
            backgroundColor: item.available
              ? colors.success + "20"
              : colors.error + "20",
          }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: item.available ? colors.success : colors.error }}
          >
            {item.available ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          onPress={() => {
            setSelectedAccommodation(item);
            setShowDetailModal(true);
          }}
          className="flex-1 bg-primary px-4 py-3 rounded-xl items-center active:opacity-70"
        >
          <Text className="text-white text-sm font-semibold">View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteListing(item.id)}
          className="flex-1 px-4 py-3 rounded-xl items-center active:opacity-70"
          style={{ backgroundColor: colors.error }}
        >
          <Text className="text-white text-sm font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1 gap-4 p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1 ml-4">
            <Text className="text-2xl font-bold text-foreground">
              Accommodation
            </Text>
            <Text className="text-sm text-muted">Find student housing</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="bg-primary px-4 py-2 rounded-full active:opacity-70"
          >
            <Text className="text-white text-sm font-semibold">+ List</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab("browse")}
            className="flex-1 py-3 rounded-xl items-center"
            style={{
              backgroundColor:
                activeTab === "browse" ? colors.primary : colors.surface,
            }}
          >
            <Text
              className="font-semibold"
              style={{
                color: activeTab === "browse" ? "#fff" : colors.foreground,
              }}
            >
              Browse
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("my-listings")}
            className="flex-1 py-3 rounded-xl items-center"
            style={{
              backgroundColor:
                activeTab === "my-listings" ? colors.primary : colors.surface,
            }}
          >
            <Text
              className="font-semibold"
              style={{
                color: activeTab === "my-listings" ? "#fff" : colors.foreground,
              }}
            >
              My Listings
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "browse" && (
          <>
            {/* Search Bar */}
            <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border">
              <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search location or name..."
                placeholderTextColor={colors.muted}
                className="flex-1 text-foreground text-base"
              />
            </View>

            {/* Type Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-2"
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full ${
                    selectedType === type ? "bg-primary" : "bg-surface"
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor:
                      selectedType === type ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedType === type ? "text-white" : "text-foreground"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Accommodations List */}
            <FlatList
              data={filteredAccommodations}
              renderItem={renderAccommodation}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <IconSymbol name="house.fill" size={48} color={colors.muted} />
                  <Text className="text-muted text-center mt-4">
                    {loading
                      ? "Loading accommodations..."
                      : "No accommodations found"}
                  </Text>
                </View>
              }
              contentContainerStyle={{ flexGrow: 1 }}
            />
          </>
        )}

        {activeTab === "my-listings" && (
          <FlatList
            data={myListings}
            renderItem={renderMyListing}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <IconSymbol name="house.fill" size={48} color={colors.muted} />
                <Text className="text-muted text-center mt-4">
                  No listings yet. Create your first listing!
                </Text>
              </View>
            }
            contentContainerStyle={{ flexGrow: 1 }}
          />
        )}
      </View>

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "90%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Details
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {selectedAccommodation && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Images Gallery */}
                {selectedAccommodation.images &&
                  selectedAccommodation.images.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="mb-4"
                    >
                      {selectedAccommodation.images.map((img, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: getImageUrl(img) }}
                          className="w-80 h-64 rounded-xl mr-3"
                          contentFit="cover"
                        />
                      ))}
                    </ScrollView>
                  )}

                <Text className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>
                  {selectedAccommodation.title}
                </Text>

                <View className="flex-row items-center gap-2 mb-4">
                  <IconSymbol name="mappin" size={16} color={colors.muted} />
                  <Text className="text-base" style={{ color: colors.muted }}>
                    {selectedAccommodation.location}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                  <View className="items-center flex-1">
                    <IconSymbol name="bed.double.fill" size={24} color={colors.primary} />
                    <Text className="text-2xl font-bold mt-2" style={{ color: colors.foreground }}>
                      {selectedAccommodation.bedrooms}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>Bedrooms</Text>
                  </View>
                  <View className="items-center flex-1">
                    <IconSymbol name="shower.fill" size={24} color={colors.primary} />
                    <Text className="text-2xl font-bold mt-2" style={{ color: colors.foreground }}>
                      {selectedAccommodation.bathrooms}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>Bathrooms</Text>
                  </View>
                  <View className="items-center flex-1">
                    <IconSymbol name="mappin" size={24} color={colors.primary} />
                    <Text className="text-base font-bold mt-2" style={{ color: colors.foreground }}>
                      {selectedAccommodation.distance}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>From Campus</Text>
                  </View>
                </View>

                <Text className="text-lg font-semibold mb-2" style={{ color: colors.foreground }}>
                  About This Property
                </Text>
                <Text className="text-base mb-6" style={{ color: colors.muted }}>
                  {selectedAccommodation.description}
                </Text>

                {selectedAccommodation.amenities &&
                  selectedAccommodation.amenities.length > 0 && (
                    <>
                      <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
                        Amenities
                      </Text>
                      <View className="flex-row flex-wrap gap-2 mb-6">
                        {selectedAccommodation.amenities.map((amenity, idx) => (
                          <View
                            key={idx}
                            className="px-3 py-2 rounded-lg flex-row items-center gap-2"
                            style={{ backgroundColor: colors.surface }}
                          >
                            <IconSymbol
                              name="checkmark.shield.fill"
                              size={16}
                              color={colors.primary}
                            />
                            <Text style={{ color: colors.foreground }}>{amenity}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                <View className="flex-row items-center justify-between mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.primary }}>
                  <Text className="text-white text-lg font-semibold">Monthly Rent</Text>
                  <Text className="text-white text-3xl font-bold">
                    R{selectedAccommodation.price.toLocaleString()}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      Toast.show({
                        type: "success",
                        text1: "Booking Request Sent",
                        text2: "The owner will contact you soon",
                      });
                      setShowDetailModal(false);
                    }}
                    className="flex-1 py-4 rounded-xl items-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-white font-semibold text-base">
                      Book Viewing
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Toast.show({
                        type: "success",
                        text1: "Message Sent",
                        text2: "The owner will reply soon",
                      });
                      setShowDetailModal(false);
                    }}
                    className="flex-1 py-4 rounded-xl items-center border-2"
                    style={{ borderColor: colors.primary }}
                  >
                    <Text className="font-semibold text-base" style={{ color: colors.primary }}>
                      Contact Owner
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Listing Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "90%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                List Accommodation
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Title *
                </Text>
                <TextInput
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  placeholder="e.g., Modern 2 Bedroom Apartment"
                  placeholderTextColor={colors.muted}
                  value={listingForm.title}
                  onChangeText={(text) =>
                    setListingForm({ ...listingForm, title: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Description *
                </Text>
                <TextInput
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  placeholder="Describe your accommodation"
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={4}
                  value={listingForm.description}
                  onChangeText={(text) =>
                    setListingForm({ ...listingForm, description: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Type *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TYPES.filter((t) => t !== "All").map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setListingForm({ ...listingForm, type })}
                      className="mr-2 px-4 py-2 rounded-full"
                      style={{
                        backgroundColor:
                          listingForm.type === type ? colors.primary : colors.surface,
                      }}
                    >
                      <Text
                        style={{
                          color: listingForm.type === type ? "#fff" : colors.foreground,
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                    Monthly Rent (R) *
                  </Text>
                  <TextInput
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: colors.surface, color: colors.foreground }}
                    placeholder="3500"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    value={listingForm.price}
                    onChangeText={(text) =>
                      setListingForm({ ...listingForm, price: text })
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                    Bedrooms *
                  </Text>
                  <TextInput
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: colors.surface, color: colors.foreground }}
                    placeholder="2"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    value={listingForm.bedrooms}
                    onChangeText={(text) =>
                      setListingForm({ ...listingForm, bedrooms: text })
                    }
                  />
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                    Bathrooms *
                  </Text>
                  <TextInput
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: colors.surface, color: colors.foreground }}
                    placeholder="1"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    value={listingForm.bathrooms}
                    onChangeText={(text) =>
                      setListingForm({ ...listingForm, bathrooms: text })
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                    Distance *
                  </Text>
                  <TextInput
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: colors.surface, color: colors.foreground }}
                    placeholder="1.5 km"
                    placeholderTextColor={colors.muted}
                    value={listingForm.distance}
                    onChangeText={(text) =>
                      setListingForm({ ...listingForm, distance: text })
                    }
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Location *
                </Text>
                <TextInput
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  placeholder="e.g., Hatfield, Pretoria"
                  placeholderTextColor={colors.muted}
                  value={listingForm.location}
                  onChangeText={(text) =>
                    setListingForm({ ...listingForm, location: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Amenities (comma-separated) *
                </Text>
                <TextInput
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  placeholder="WiFi, Laundry, Security, Parking"
                  placeholderTextColor={colors.muted}
                  value={listingForm.amenities}
                  onChangeText={(text) =>
                    setListingForm({ ...listingForm, amenities: text })
                  }
                />
              </View>

              <View className="mb-6">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Images (Max 6) *
                </Text>
                <TouchableOpacity
                  onPress={pickImages}
                  className="p-4 rounded-xl border-2 border-dashed items-center"
                  style={{ borderColor: colors.border }}
                >
                  <IconSymbol name="photo" size={32} color={colors.muted} />
                  <Text className="mt-2" style={{ color: colors.muted }}>
                    Tap to select images ({listingImages.length}/6)
                  </Text>
                </TouchableOpacity>
                {listingImages.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-3"
                  >
                    {listingImages.map((uri, idx) => (
                      <View key={idx} className="mr-2">
                        <Image
                          source={{ uri }}
                          className="w-24 h-24 rounded-lg"
                          contentFit="cover"
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setListingImages(listingImages.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 bg-error rounded-full p-1"
                        >
                          <IconSymbol name="xmark" size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              <TouchableOpacity
                onPress={handleCreateListing}
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold text-base">
                  Create Listing
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast />
    </ScreenContainer>
  );
}

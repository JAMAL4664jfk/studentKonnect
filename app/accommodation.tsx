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
const CARD_WIDTH = width - 32;

type Accommodation = {
  id: number;
  userId: number;
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  price: string;
  currency: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string;
  images: string;
  availableFrom: string;
  availableUntil: string | null;
  isAvailable: boolean;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string;
};

const TYPES = ["All", "apartment", "room", "studio", "house", "dormitory"];

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

// Amenity icons mapping
const getAmenityIcon = (amenity: string): string => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes("wifi") || amenityLower.includes("internet")) return "wifi";
  if (amenityLower.includes("kitchen")) return "flame";
  if (amenityLower.includes("parking")) return "car.fill";
  if (amenityLower.includes("laundry") || amenityLower.includes("washing")) return "washer.fill";
  if (amenityLower.includes("furnished")) return "sofa.fill";
  if (amenityLower.includes("gym") || amenityLower.includes("fitness")) return "figure.run";
  if (amenityLower.includes("pool")) return "drop.fill";
  if (amenityLower.includes("garden") || amenityLower.includes("yard")) return "leaf.fill";
  if (amenityLower.includes("security") || amenityLower.includes("secure")) return "lock.shield.fill";
  if (amenityLower.includes("air") || amenityLower.includes("ac")) return "snowflake";
  return "checkmark.circle.fill";
};

type FilterType = "all" | "favorites" | "verified";

export default function AccommodationScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      console.log("[ACCOMMODATION] Starting fetch...");
      
      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from("accommodations")
        .select("count")
        .limit(1);
      
      if (testError) {
        console.error("[ACCOMMODATION] Connection test failed:", testError);
        Toast.show({
          type: "error",
          text1: "Connection Error",
          text2: `Database connection failed: ${testError.message}`,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log("[ACCOMMODATION] Connection test passed");
      
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("isAvailable", true)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("[ACCOMMODATION] Supabase error:", JSON.stringify(error));
        Toast.show({
          type: "error",
          text1: "Database Error",
          text2: error.message || "Failed to fetch data",
        });
        throw error;
      }
      
      console.log("[ACCOMMODATION] Fetched:", data?.length, "items");
      
      if (!data || data.length === 0) {
        Toast.show({
          type: "info",
          text1: "No Accommodations",
          text2: "No listings available at the moment",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Loaded",
          text2: `Found ${data.length} accommodations`,
        });
      }
      
      setAccommodations(data || []);
    } catch (error: any) {
      console.error("[ACCOMMODATION] Fetch error:", error);
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

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        Toast.show({
          type: "info",
          text1: "Removed from favorites",
        });
      } else {
        newSet.add(id);
        Toast.show({
          type: "success",
          text1: "Added to favorites",
        });
      }
      return newSet;
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccommodations();
  };

  const filteredAccommodations = accommodations.filter((acc) => {
    const matchesSearch =
      acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || acc.propertyType === selectedType;
    const matchesFavorites = selectedFilter !== "favorites" || favorites.has(acc.id);
    return matchesSearch && matchesType && matchesFavorites;
  });

  const renderAccommodation = ({ item }: { item: Accommodation }) => {
    const amenitiesArray = parseJSON(item.amenities);
    const imageUrl = getImageUrl(item.images);
    const isFavorite = favorites.has(item.id);
    const isVerified = item.id % 2 === 0; // Mock verification (in real app, this would be a DB field)

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedAccommodation(item);
          setShowDetailModal(true);
        }}
        className="mb-4 rounded-3xl overflow-hidden bg-surface"
        style={{
          width: CARD_WIDTH,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {/* Image Section */}
        <View className="relative">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-56"
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <View className="w-full h-56 bg-muted items-center justify-center">
              <IconSymbol name="building.2.fill" size={64} color={colors.mutedForeground} />
            </View>
          )}
          
          {/* Favorite Button */}
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-surface/90 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
          >
            <IconSymbol
              name={isFavorite ? "heart.fill" : "heart"}
              size={20}
              color={isFavorite ? "#ef4444" : colors.foreground}
            />
          </TouchableOpacity>

          {/* Verified Badge */}
          {isVerified && (
            <View className="absolute top-3 left-3 bg-primary px-3 py-1.5 rounded-full flex-row items-center gap-1">
              <IconSymbol name="checkmark.seal.fill" size={14} color="#fff" />
              <Text className="text-xs font-semibold text-white">Verified</Text>
            </View>
          )}

          {/* Property Type Badge */}
          <View className="absolute bottom-3 left-3 bg-surface/90 px-3 py-1.5 rounded-lg">
            <Text className="text-xs font-semibold text-foreground capitalize">
              {item.propertyType}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="p-4">
          {/* Title and Price */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-foreground mb-1" numberOfLines={2}>
                {item.title}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <IconSymbol name="mappin.circle.fill" size={14} color={colors.primary} />
                <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                  {item.city}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-primary">
                R{parseFloat(item.price).toLocaleString()}
              </Text>
              <Text className="text-xs text-muted-foreground">per month</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center gap-4 mb-3">
            <View className="flex-row items-center gap-1.5">
              <IconSymbol name="bed.double.fill" size={18} color={colors.primary} />
              <Text className="text-sm font-medium text-foreground">{item.bedrooms}</Text>
              <Text className="text-xs text-muted-foreground">bed</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <IconSymbol name="shower.fill" size={18} color={colors.primary} />
              <Text className="text-sm font-medium text-foreground">{item.bathrooms}</Text>
              <Text className="text-xs text-muted-foreground">bath</Text>
            </View>
            {item.latitude && item.longitude && (
              <View className="flex-row items-center gap-1.5">
                <IconSymbol name="location.fill" size={18} color={colors.primary} />
                <Text className="text-xs text-muted-foreground">3km from SU</Text>
              </View>
            )}
          </View>

          {/* Amenities Preview */}
          {amenitiesArray.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {amenitiesArray.slice(0, 3).map((amenity: string, index: number) => (
                <View
                  key={index}
                  className="flex-row items-center gap-1.5 bg-primary/10 px-2.5 py-1.5 rounded-lg"
                >
                  <IconSymbol name={getAmenityIcon(amenity)} size={12} color={colors.primary} />
                  <Text className="text-xs font-medium text-primary">{amenity}</Text>
                </View>
              ))}
              {amenitiesArray.length > 3 && (
                <View className="bg-muted px-2.5 py-1.5 rounded-lg">
                  <Text className="text-xs font-medium text-muted-foreground">
                    +{amenitiesArray.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* View Details Button */}
          <TouchableOpacity
            className="bg-primary py-3 rounded-xl items-center active:opacity-80"
            onPress={() => {
              setSelectedAccommodation(item);
              setShowDetailModal(true);
            }}
          >
            <Text className="text-primary-foreground font-semibold text-base">View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedAccommodation) return null;

    const amenitiesArray = parseJSON(selectedAccommodation.amenities);
    const imagesArray = parseJSON(selectedAccommodation.images);
    const isFavorite = favorites.has(selectedAccommodation.id);

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
                onPress={() => toggleFavorite(selectedAccommodation.id)}
                className="w-10 h-10 rounded-full bg-surface items-center justify-center"
              >
                <IconSymbol
                  name={isFavorite ? "heart.fill" : "heart"}
                  size={22} color={isFavorite ? "#ef4444" : colors.foreground}
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

            {/* Title and Price */}
            <Text className="text-3xl font-bold text-foreground mb-2">
              {selectedAccommodation.title}
            </Text>

            <View className="flex-row items-center gap-2 mb-6">
              <IconSymbol name="mappin.circle.fill" size={20} color={colors.primary} />
              <Text className="text-base text-muted-foreground flex-1">
                {selectedAccommodation.address}, {selectedAccommodation.city}
              </Text>
            </View>

            {/* Price Card */}
            <View className="bg-primary/10 rounded-2xl p-5 mb-6">
              <Text className="text-4xl font-bold text-primary mb-2">
                R{parseFloat(selectedAccommodation.price).toLocaleString()}
              </Text>
              <Text className="text-sm text-muted-foreground">per month</Text>
            </View>

            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
                <IconSymbol name="bed.double.fill" size={28} color={colors.primary} />
                <Text className="text-2xl font-bold text-foreground mt-2">
                  {selectedAccommodation.bedrooms}
                </Text>
                <Text className="text-sm text-muted-foreground">Bedrooms</Text>
              </View>
              <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
                <IconSymbol name="shower.fill" size={28} color={colors.primary} />
                <Text className="text-2xl font-bold text-foreground mt-2">
                  {selectedAccommodation.bathrooms}
                </Text>
                <Text className="text-sm text-muted-foreground">Bathrooms</Text>
              </View>
              <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
                <IconSymbol name="location.fill" size={28} color={colors.primary} />
                <Text className="text-lg font-bold text-foreground mt-2">3km</Text>
                <Text className="text-sm text-muted-foreground">From SU</Text>
              </View>
            </View>

            {/* About This Property */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-foreground mb-3">About This Property</Text>
              <Text className="text-base text-muted-foreground leading-7">
                {selectedAccommodation.description}
              </Text>
            </View>

            {/* Amenities */}
            {amenitiesArray.length > 0 && (
              <View className="mb-6">
                <Text className="text-xl font-bold text-foreground mb-4">Amenities</Text>
                <View className="flex-row flex-wrap gap-3">
                  {amenitiesArray.map((amenity: string, index: number) => (
                    <View
                      key={index}
                      className="bg-surface px-4 py-3 rounded-xl flex-row items-center gap-2"
                      style={{ width: "48%" }}
                    >
                      <IconSymbol name={getAmenityIcon(amenity)} size={20} color={colors.primary} />
                      <Text className="text-sm font-medium text-foreground flex-1" numberOfLines={1}>
                        {amenity}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Availability */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-foreground mb-3">Availability</Text>
              <View className="bg-surface rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <IconSymbol name="calendar" size={18} color={colors.primary} />
                  <Text className="text-sm text-muted-foreground">
                    Available from: {new Date(selectedAccommodation.availableFrom).toLocaleDateString()}
                  </Text>
                </View>
                {selectedAccommodation.availableUntil && (
                  <View className="flex-row items-center gap-2">
                    <IconSymbol name="calendar" size={18} color={colors.primary} />
                    <Text className="text-sm text-muted-foreground">
                      Until: {new Date(selectedAccommodation.availableUntil).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Contact Button */}
            <TouchableOpacity
              className="bg-primary py-4 rounded-2xl items-center active:opacity-80 mb-8"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Contact Feature",
                  text2: "Contact functionality coming soon!",
                });
              }}
            >
              <Text className="text-primary-foreground font-bold text-lg">Contact Owner</Text>
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
              <Text className="text-4xl font-bold text-primary mb-1">Student Accommodation</Text>
              <Text className="text-sm text-muted-foreground">
                Find safe, affordable, and verified student housing near your campus
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
        <View className="bg-surface rounded-2xl px-4 py-3.5 flex-row items-center gap-3 mb-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
          }}
        >
          <IconSymbol name="magnifyingglass" size={22} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search by name, location, or university..."
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

        {/* Filter Tabs */}
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-xl ${selectedFilter === "all" ? "bg-primary" : "bg-surface"}`}
          >
            <Text className={`font-semibold ${selectedFilter === "all" ? "text-primary-foreground" : "text-foreground"}`}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedFilter("favorites")}
            className={`px-4 py-2 rounded-xl flex-row items-center gap-2 ${selectedFilter === "favorites" ? "bg-primary" : "bg-surface"}`}
          >
            <IconSymbol
              name="heart.fill"
              size={16}
              color={selectedFilter === "favorites" ? "#fff" : colors.foreground}
            />
            <Text className={`font-semibold ${selectedFilter === "favorites" ? "text-primary-foreground" : "text-foreground"}`}>
              Favorites ({favorites.size})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="ml-auto bg-primary px-4 py-2 rounded-xl flex-row items-center gap-2"
            onPress={() => router.push("/create-accommodation")}
          >
            <IconSymbol name="plus.circle.fill" size={18} color="#fff" />
            <Text className="text-primary-foreground font-semibold">List</Text>
          </TouchableOpacity>
        </View>

        {/* Type Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              className={`px-4 py-2.5 rounded-xl ${
                selectedType === type ? "bg-primary/20 border-2 border-primary" : "bg-surface"
              }`}
            >
              <Text
                className={`font-medium capitalize ${
                  selectedType === type ? "text-primary" : "text-foreground"
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-sm font-medium text-foreground">
            Found {filteredAccommodations.length} accommodations
          </Text>
        </View>

        {/* Listings */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">Loading accommodations...</Text>
          </View>
        ) : filteredAccommodations.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <IconSymbol name="building.2" size={64} color={colors.mutedForeground} />
            <Text className="text-lg text-muted-foreground mt-4">No accommodations found</Text>
            <Text className="text-sm text-muted-foreground mt-2">Try adjusting your filters</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAccommodations}
            renderItem={renderAccommodation}
            keyExtractor={(item) => item.id.toString()}
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

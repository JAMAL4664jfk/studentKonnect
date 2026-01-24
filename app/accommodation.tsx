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
  // If it's a local path, return placeholder
  if (firstImage.startsWith("/assets")) {
    return ""; // Will show placeholder
  }
  return firstImage;
};

type TabType = "browse" | "search";

export default function AccommodationScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("isAvailable", true)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Fetched accommodations:", data?.length);
      setAccommodations(data || []);
    } catch (error: any) {
      console.error("Fetch error:", error);
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
    return matchesSearch && matchesType;
  });

  const renderAccommodation = ({ item }: { item: Accommodation }) => {
    const amenitiesArray = parseJSON(item.amenities);
    const imageUrl = getImageUrl(item.images);

    return (
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
            <IconSymbol name="building.2.fill" size={48} color={colors.mutedForeground} />
            <Text className="text-sm text-muted-foreground mt-2">No image</Text>
          </View>
        )}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground mb-1">
              {item.title}
            </Text>
            <View className="flex-row items-center gap-2 mb-2">
              <IconSymbol name="mappin.circle.fill" size={16} color={colors.primary} />
              <Text className="text-sm text-muted-foreground flex-1">
                {item.city}, {item.country}
              </Text>
            </View>
            <View className="flex-row items-center gap-4 mb-2">
              <View className="flex-row items-center gap-1">
                <IconSymbol name="bed.double.fill" size={16} color={colors.mutedForeground} />
                <Text className="text-xs text-muted-foreground">{item.bedrooms} bed</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <IconSymbol name="shower.fill" size={16} color={colors.mutedForeground} />
                <Text className="text-xs text-muted-foreground">{item.bathrooms} bath</Text>
              </View>
              <View className="px-2 py-1 bg-primary/10 rounded-md">
                <Text className="text-xs font-medium text-primary capitalize">
                  {item.propertyType}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-between pt-3 border-t border-border">
          <View>
            <Text className="text-2xl font-bold text-primary">
              {item.currency} {parseFloat(item.price).toLocaleString()}
            </Text>
            <Text className="text-xs text-muted-foreground">per month</Text>
          </View>
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-lg active:opacity-70"
            onPress={() => {
              setSelectedAccommodation(item);
              setShowDetailModal(true);
            }}
          >
            <Text className="text-primary-foreground font-semibold">View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedAccommodation) return null;

    const amenitiesArray = parseJSON(selectedAccommodation.amenities);
    const imagesArray = parseJSON(selectedAccommodation.images);

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
              <Text className="text-2xl font-bold text-foreground">Details</Text>
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

            <Text className="text-2xl font-bold text-foreground mb-2">
              {selectedAccommodation.title}
            </Text>

            <View className="flex-row items-center gap-2 mb-4">
              <IconSymbol name="mappin.circle.fill" size={20} color={colors.primary} />
              <Text className="text-base text-muted-foreground">
                {selectedAccommodation.address}, {selectedAccommodation.city}, {selectedAccommodation.country}
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-4 mb-4">
              <Text className="text-3xl font-bold text-primary mb-1">
                {selectedAccommodation.currency} {parseFloat(selectedAccommodation.price).toLocaleString()}
              </Text>
              <Text className="text-sm text-muted-foreground">per month</Text>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-surface rounded-xl p-4">
                <IconSymbol name="bed.double.fill" size={24} color={colors.primary} />
                <Text className="text-2xl font-bold text-foreground mt-2">
                  {selectedAccommodation.bedrooms}
                </Text>
                <Text className="text-sm text-muted-foreground">Bedrooms</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4">
                <IconSymbol name="shower.fill" size={24} color={colors.primary} />
                <Text className="text-2xl font-bold text-foreground mt-2">
                  {selectedAccommodation.bathrooms}
                </Text>
                <Text className="text-sm text-muted-foreground">Bathrooms</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4">
                <IconSymbol name="building.2.fill" size={24} color={colors.primary} />
                <Text className="text-sm font-bold text-foreground mt-2 capitalize">
                  {selectedAccommodation.propertyType}
                </Text>
                <Text className="text-sm text-muted-foreground">Type</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground mb-3">Description</Text>
              <Text className="text-base text-muted-foreground leading-6">
                {selectedAccommodation.description}
              </Text>
            </View>

            {amenitiesArray.length > 0 && (
              <View className="mb-4">
                <Text className="text-lg font-semibold text-foreground mb-3">Amenities</Text>
                <View className="flex-row flex-wrap gap-2">
                  {amenitiesArray.map((amenity: string, index: number) => (
                    <View
                      key={index}
                      className="bg-primary/10 px-3 py-2 rounded-lg flex-row items-center gap-2"
                    >
                      <IconSymbol name="checkmark.circle.fill" size={16} color={colors.primary} />
                      <Text className="text-sm text-primary font-medium">{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground mb-3">Availability</Text>
              <View className="bg-surface rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <IconSymbol name="calendar" size={16} color={colors.mutedForeground} />
                  <Text className="text-sm text-muted-foreground">
                    Available from: {new Date(selectedAccommodation.availableFrom).toLocaleDateString()}
                  </Text>
                </View>
                {selectedAccommodation.availableUntil && (
                  <View className="flex-row items-center gap-2">
                    <IconSymbol name="calendar" size={16} color={colors.mutedForeground} />
                    <Text className="text-sm text-muted-foreground">
                      Until: {new Date(selectedAccommodation.availableUntil).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              className="bg-primary py-4 rounded-xl items-center active:opacity-70 mb-8"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Contact Feature",
                  text2: "Contact functionality coming soon!",
                });
              }}
            >
              <Text className="text-primary-foreground font-semibold text-lg">Contact Owner</Text>
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
            <Text className="text-3xl font-bold text-foreground">Accommodation</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Find your perfect student home
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
            placeholder="Search by location or title..."
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
              className={`px-4 py-2 rounded-xl ${
                selectedType === type ? "bg-primary" : "bg-surface"
              }`}
            >
              <Text
                className={`font-medium capitalize ${
                  selectedType === type ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-sm text-muted-foreground">
            {filteredAccommodations.length} {filteredAccommodations.length === 1 ? 'listing' : 'listings'} available
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
          />
        )}

        {renderDetailModal()}
      </View>
    </ScreenContainer>
  );
}

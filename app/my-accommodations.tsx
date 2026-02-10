import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
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
  title: string;
  city: string;
  price: string;
  currency: string;
  propertyType: string;
  images: string;
  isAvailable: boolean;
  createdAt: string;
};

export default function MyAccommodationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [listings, setListings] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Toast.show({
          type: "error",
          text1: "Not logged in",
          text2: "Please log in to view your listings",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      setListings(data || []);
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
        .from("accommodations")
        .update({ isAvailable: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: !currentStatus ? "Listing activated" : "Listing deactivated",
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
      "Delete Listing",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("accommodations")
                .delete()
                .eq("id", id);

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
                text2: error.message,
              });
            }
          },
        },
      ]
    );
  };

  const getImageUrl = (images: string): string => {
    try {
      const imageArray = JSON.parse(images);
      return imageArray.length > 0 ? imageArray[0] : "";
    } catch {
      return "";
    }
  };

  const renderListing = ({ item }: { item: Accommodation }) => {
    const imageUrl = getImageUrl(item.images);

    return (
      <View className="mb-4 rounded-2xl overflow-hidden bg-surface">
        <View className="flex-row">
          {/* Image */}
          <View className="w-32 h-32">
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <View className="w-full h-full bg-muted items-center justify-center">
                <IconSymbol name="building.2.fill" size={32} color={colors.mutedForeground} />
              </View>
            )}
          </View>

          {/* Content */}
          <View className="flex-1 p-3">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 pr-2">
                <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-sm text-muted-foreground capitalize">
                  {item.propertyType} • {item.city}
                </Text>
              </View>
              <View
                className={`px-2 py-1 rounded-lg ${
                  item.isAvailable ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    item.isAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.isAvailable ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>

            <Text className="text-lg font-bold text-primary mb-3">
              R{parseFloat(item.price).toLocaleString()}/mo
            </Text>

            {/* Actions */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => toggleAvailability(item.id, item.isAvailable)}
                className="flex-1 bg-primary/10 py-2 rounded-lg items-center"
              >
                <Text className="text-xs font-semibold text-primary">
                  {item.isAvailable ? "Deactivate" : "Activate"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/edit-accommodation?id=${item.id}`)}
                className="flex-1 bg-surface border border-border py-2 rounded-lg items-center"
              >
                <Text className="text-xs font-semibold text-foreground">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteListing(item.id, item.title)}
                className="flex-1 bg-destructive/10 py-2 rounded-lg items-center"
              >
                <Text className="text-xs font-semibold text-destructive">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 pt-2">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-primary">My Accommodations</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Manage your listings
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center ml-3"
          >
            <IconSymbol name="xmark" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Listings */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">Loading your listings...</Text>
          </View>
        ) : listings.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <IconSymbol name="building.2" size={64} color={colors.mutedForeground} />
            <Text className="text-lg text-muted-foreground mt-4">No listings yet</Text>
            <TouchableOpacity
              onPress={() => router.push("/create-accommodation")}
              className="bg-primary px-6 py-3 rounded-xl mt-4"
            >
              <Text className="text-primary-foreground font-semibold">
                Create Your First Listing
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={listings}
            renderItem={renderListing}
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
      </View>
    </ScreenContainer>
  );
}

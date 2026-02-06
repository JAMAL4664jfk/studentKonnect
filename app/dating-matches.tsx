import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  partner: {
    id: string;
    display_name: string;
    profile_photo_url: string | null;
    age: number;
    institution: string | null;
  };
}

export default function DatingMatchesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return;

      const { data: matchesData } = await supabase
        .from("dating_matches")
        .select(`
          id,
          user1_id,
          user2_id,
          created_at
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (matchesData) {
        // Load partner profiles
        const matchesWithProfiles = await Promise.all(
          matchesData.map(async (match) => {
            const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            const { data: profile } = await supabase
              .from("dating_profiles")
              .select("*")
              .eq("user_id", partnerId)
              .single();

            return {
              ...match,
              partner: profile ? {
                id: profile.user_id,
                display_name: profile.display_name,
                profile_photo_url: profile.profile_photo_url,
                age: profile.age,
                institution: profile.institution,
              } : null,
            };
          })
        );

        setMatches(matchesWithProfiles.filter((m) => m.partner) as Match[]);
      }
    } catch (error) {
      console.error("Error loading matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      onPress={() => router.push(`/dating-chat?matchId=${item.id}&partnerId=${item.partner.id}` as any)}
      className="flex-row items-center gap-4 bg-surface rounded-2xl p-4 mb-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {item.partner.profile_photo_url ? (
        <Image
          source={{ uri: item.partner.profile_photo_url }}
          style={{ width: 64, height: 64, borderRadius: 32 }}
        />
      ) : (
        <View
          className="items-center justify-center bg-primary/10"
          style={{ width: 64, height: 64, borderRadius: 32 }}
        >
          <IconSymbol name="person.fill" size={32} color={colors.primary} />
        </View>
      )}

      <View className="flex-1">
        <Text className="text-lg font-bold text-foreground">
          {item.partner.display_name}, {item.partner.age}
        </Text>
        {item.partner.institution && (
          <Text className="text-sm text-muted mt-1">{item.partner.institution}</Text>
        )}
        <Text className="text-xs text-muted mt-1">
          Matched {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <IconSymbol name="chevron.right" size={24} color={colors.muted} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center gap-4 mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Your Matches</Text>
            <Text className="text-sm text-muted">{matches.length} matches</Text>
          </View>
        </View>

        {/* Matches List */}
        {matches.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <IconSymbol name="heart.fill" size={64} color={colors.muted} />
            <Text className="text-xl font-bold text-foreground mt-4 text-center">
              No Matches Yet
            </Text>
            <Text className="text-sm text-muted mt-2 text-center px-8">
              Keep swiping to find your perfect match!
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-primary rounded-xl px-6 py-3 mt-6"
            >
              <Text className="text-white font-semibold">Start Swiping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={matches}
            renderItem={renderMatch}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

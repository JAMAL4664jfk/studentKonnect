import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";

export default function DatingScreen() {
  const colors = useColors();
  const router = useRouter();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (user) {
        const { data: profile } = await supabase
          .from('dating_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSwiping = () => {
    if (userProfile) {
      // Navigate to swipe screen
      router.push('/dating-swipe' as any);
    } else {
      // Show profile creation form
      setShowProfileForm(true);
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Student Dating</Text>
              <Text className="text-sm text-muted">Connect with fellow students</Text>
            </View>
          </View>

          <View className="bg-primary rounded-2xl p-6" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <IconSymbol name="heart.fill" size={48} color="white" />
            <Text className="text-white text-2xl font-bold mt-4 mb-2">Student Dating</Text>
            <Text className="text-white text-base opacity-90">Meet and connect with students at your campus</Text>
          </View>

          <TouchableOpacity 
            onPress={handleStartSwiping}
            className="bg-primary rounded-2xl p-4 items-center active:opacity-70 mb-6"
          >
            <Text className="text-white text-base font-semibold">
              {loading ? 'Loading...' : userProfile ? 'Start Swiping' : 'Create Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SwipeableCard } from "@/components/SwipeableCard";

interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  bio: string | null;
  interests: string[] | null;
  profile_photo_url: string | null;
  institution: string | null;
  course: string | null;
  looking_for: string | null;
}

export default function DatingSwipeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<DatingProfile | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    display_name: "",
    age: "18",
    bio: "",
    interests: "",
    institution: "",
    course: "",
    looking_for: "friendship",
  });
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) {
        router.replace("/auth" as any);
        return;
      }

      const { data: profile } = await supabase
        .from("dating_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        loadProfiles();
      } else {
        // Pre-fill form with user data
        const { data: userProfileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (userProfileData) {
          setFormData({
            display_name: userProfileData.full_name || "",
            age: "18",
            bio: "",
            interests: "",
            institution: userProfileData.institution_name || "",
            course: userProfileData.course_program || "",
            looking_for: "friendship",
          });
          setPhotoUri(userProfileData.avatar_url);
        }
        setShowProfileForm(true);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return;

      // Get profiles excluding current user and already swiped
      const { data: swipedIds } = await supabase
        .from("dating_swipes")
        .select("swiped_id")
        .eq("swiper_id", user.id);

      const excludeIds = [user.id, ...(swipedIds?.map((s) => s.swiped_id) || [])];

      const { data: profilesData } = await supabase
        .from("dating_profiles")
        .select("*")
        .not("user_id", "in", `(${excludeIds.join(",")})`)
        .limit(20);

      setProfiles(profilesData || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return null;

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `dating-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      return null;
    }
  };

  const createProfile = async () => {
    if (!formData.display_name || !formData.age) {
      Alert.alert("Error", "Please fill in required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return;

      let photoUrl = photoUri;
      if (photoUri && photoUri.startsWith("file://")) {
        photoUrl = await uploadPhoto(photoUri);
      }

      const { data, error } = await supabase
        .from("dating_profiles")
        .insert({
          user_id: user.id,
          display_name: formData.display_name,
          age: parseInt(formData.age),
          bio: formData.bio || null,
          interests: formData.interests ? formData.interests.split(",").map((i) => i.trim()) : null,
          profile_photo_url: photoUrl,
          institution: formData.institution || null,
          course: formData.course || null,
          looking_for: formData.looking_for,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      setUserProfile(data);
      setShowProfileForm(false);
      loadProfiles();
      Toast.show({
        type: "success",
        text1: "Profile Created!",
        text2: "Start swiping to find matches",
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwipe = async (isLike: boolean) => {
    if (!userProfile || !profiles[currentIndex]) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const swipedProfile = profiles[currentIndex];

    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return;

      // Record swipe
      await supabase.from("dating_swipes").insert({
        swiper_id: user.id,
        swiped_id: swipedProfile.user_id,
        is_like: isLike,
      });

      if (isLike) {
        // Check for match
        const { data: reverseSwipe } = await supabase
          .from("dating_swipes")
          .select("*")
          .eq("swiper_id", swipedProfile.user_id)
          .eq("swiped_id", user.id)
          .eq("is_like", true)
          .maybeSingle();

        if (reverseSwipe) {
          // It's a match!
          await supabase.from("dating_matches").insert({
            user1_id: user.id,
            user2_id: swipedProfile.user_id,
          });

          Toast.show({
            type: "success",
            text1: "It's a Match! 💕",
            text2: `You and ${swipedProfile.display_name} matched!`,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Error swiping:", error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // Profile Creation Form
  if (showProfileForm) {
    return (
      <ScreenContainer edges={["top", "left", "right"]}>
        <ScrollView className="flex-1 p-4">
          <View className="gap-4">
            <View className="flex-row items-center gap-4 mb-4">
              <TouchableOpacity onPress={() => router.back()}>
                <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">Create Your Profile</Text>
                <Text className="text-sm text-muted">Find your perfect match</Text>
              </View>
            </View>

            {/* Profile Photo */}
            <View className="items-center mb-4">
              <TouchableOpacity onPress={pickImage}>
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={{ width: 120, height: 120, borderRadius: 60 }}
                  />
                ) : (
                  <View
                    className="items-center justify-center bg-surface"
                    style={{ width: 120, height: 120, borderRadius: 60 }}
                  >
                    <IconSymbol name="camera.fill" size={40} color={colors.muted} />
                  </View>
                )}
                <View
                  className="absolute bottom-0 right-0 bg-primary rounded-full p-2"
                  style={{ width: 36, height: 36 }}
                >
                  <IconSymbol name="camera.fill" size={20} color="white" />
                </View>
              </TouchableOpacity>
              <Text className="text-sm text-muted mt-2">Tap to add photo</Text>
            </View>

            {/* Display Name */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Display Name *
              </Text>
              <TextInput
                value={formData.display_name}
                onChangeText={(text) => setFormData({ ...formData, display_name: text })}
                placeholder="How should we call you?"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              />
            </View>

            {/* Age */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Age *</Text>
              <TextInput
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="18"
                keyboardType="number-pad"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              />
            </View>

            {/* Institution */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Institution</Text>
              <TextInput
                value={formData.institution}
                onChangeText={(text) => setFormData({ ...formData, institution: text })}
                placeholder="Your university"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              />
            </View>

            {/* Course */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Course/Program
              </Text>
              <TextInput
                value={formData.course}
                onChangeText={(text) => setFormData({ ...formData, course: text })}
                placeholder="What are you studying?"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              />
            </View>

            {/* Bio */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Bio</Text>
              <TextInput
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Tell potential matches about yourself..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Interests */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Interests (comma-separated)
              </Text>
              <TextInput
                value={formData.interests}
                onChangeText={(text) => setFormData({ ...formData, interests: text })}
                placeholder="e.g., Music, Sports, Reading, Gaming"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              />
            </View>

            {/* Looking For */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Looking For</Text>
              <View className="flex-row gap-2">
                {["friendship", "relationship", "hookup"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFormData({ ...formData, looking_for: type })}
                    className={`flex-1 py-3 rounded-xl border ${
                      formData.looking_for === type
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text
                      className={`text-center font-semibold capitalize ${
                        formData.looking_for === type ? "text-white" : "text-foreground"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={createProfile}
              disabled={submitting}
              className="bg-primary rounded-xl py-4 items-center mt-4 mb-8"
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-semibold">Create Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Swipe Screen
  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center p-4">
          <IconSymbol name="heart.fill" size={64} color={colors.muted} />
          <Text className="text-xl font-bold text-foreground mt-4 text-center">
            No More Profiles
          </Text>
          <Text className="text-sm text-muted mt-2 text-center">
            Check back later for new matches
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary rounded-xl px-6 py-3 mt-6"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenContainer edges={["top", "left", "right"]}>
        <View className="flex-1 p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground">Student Dating</Text>
            <TouchableOpacity onPress={() => router.push("/dating-matches" as any)}>
              <IconSymbol name="heart.fill" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Swipeable Cards Stack */}
          <View className="flex-1 items-center justify-center" style={{ marginBottom: 20, marginTop: 10 }}>
            {profiles.slice(currentIndex, currentIndex + 2).reverse().map((profile, index) => (
              <SwipeableCard
                key={profile.id}
                profile={profile}
                onSwipeLeft={() => handleSwipe(false)}
                onSwipeRight={() => handleSwipe(true)}
                isTop={index === 1}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center justify-center gap-8" style={{ paddingBottom: 20 }}>
            <TouchableOpacity
              onPress={() => handleSwipe(false)}
              activeOpacity={0.7}
              style={{
                backgroundColor: "#EF4444",
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <IconSymbol name="xmark" size={36} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSwipe(true)}
              activeOpacity={0.7}
              style={{
                backgroundColor: "#10B981",
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <IconSymbol name="heart.fill" size={36} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    </GestureHandlerRootView>
  );
}

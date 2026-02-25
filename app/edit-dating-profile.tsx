import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";

export default function EditDatingProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    institution: "",
    course: "",
    bio: "",
    interests: [] as string[],
    images: [] as string[],
    instagram: "",
    tiktok: "",
    twitter: "",
  });

  const interestOptions = [
    "Music", "Sports", "Movies", "Travel", "Food", "Art", "Gaming",
    "Reading", "Fitness", "Photography", "Dancing", "Cooking"
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setProfile({ ...profile, images: [...profile.images, ...newImages].slice(0, 6) });
    }
  };

  const removeImage = (index: number) => {
    const newImages = profile.images.filter((_, i) => i !== index);
    setProfile({ ...profile, images: newImages });
  };

  const toggleInterest = (interest: string) => {
    if (profile.interests.includes(interest)) {
      setProfile({
        ...profile,
        interests: profile.interests.filter((i) => i !== interest),
      });
    } else {
      if (profile.interests.length < 5) {
        setProfile({ ...profile, interests: [...profile.interests, interest] });
      } else {
        Toast.show({
          type: "info",
          text1: "Maximum Reached",
          text2: "You can select up to 5 interests",
        });
      }
    }
  };

  const handleSave = async () => {
    if (!profile.name || !profile.age || !profile.bio) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields",
      });
      return;
    }

    if (profile.images.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Photos",
        text2: "Please add at least one photo",
      });
      return;
    }

    setLoading(true);
    try {
      // Save to database
      const { error } = await supabase.from("datingProfiles").upsert({
        name: profile.name,
        age: parseInt(profile.age),
        institution: profile.institution,
        course: profile.course,
        bio: profile.bio,
        interests: JSON.stringify(profile.interests),
        images: JSON.stringify(profile.images),
        isActive: true,
        instagram: profile.instagram || null,
        tiktok: profile.tiktok || null,
        twitter: profile.twitter || null,
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Profile Saved!",
        text2: "Your dating profile has been updated",
      });
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Edit Dating Profile</Text>
            <Text className="text-sm text-muted-foreground">Make your profile stand out!</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          >
            <IconSymbol name="xmark" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Photos */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">Photos (up to 6)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            {profile.images.map((image, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: image }}
                  style={{ width: 120, height: 160, borderRadius: 16 }}
                  contentFit="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-error items-center justify-center"
                >
                  <IconSymbol name="xmark" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {profile.images.length < 6 && (
              <TouchableOpacity
                onPress={pickImage}
                className="w-32 h-40 rounded-2xl border-2 border-dashed border-border items-center justify-center"
              >
                <IconSymbol name="plus.circle.fill" size={40} color={colors.primary} />
                <Text className="text-sm text-muted-foreground mt-2">Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Basic Info */}
        <View className="gap-4 mb-6">
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Name *</Text>
            <TextInput
              className="bg-muted rounded-xl px-4 py-3 text-foreground"
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Age *</Text>
            <TextInput
              className="bg-muted rounded-xl px-4 py-3 text-foreground"
              placeholder="Your age"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              value={profile.age}
              onChangeText={(text) => setProfile({ ...profile, age: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Institution</Text>
            <TextInput
              className="bg-muted rounded-xl px-4 py-3 text-foreground"
              placeholder="Your university/college"
              placeholderTextColor={colors.muted}
              value={profile.institution}
              onChangeText={(text) => setProfile({ ...profile, institution: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Course/Major</Text>
            <TextInput
              className="bg-muted rounded-xl px-4 py-3 text-foreground"
              placeholder="What are you studying?"
              placeholderTextColor={colors.muted}
              value={profile.course}
              onChangeText={(text) => setProfile({ ...profile, course: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Bio *</Text>
            <TextInput
              className="bg-muted rounded-xl px-4 py-3 text-foreground"
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              maxLength={500}
            />
            <Text className="text-xs text-muted-foreground mt-1">
              {profile.bio.length}/500 characters
            </Text>
          </View>
        </View>

        {/* Interests */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">
            Interests (select up to 5)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full ${
                  profile.interests.includes(interest)
                    ? "bg-primary"
                    : "bg-muted border border-border"
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    profile.interests.includes(interest) ? "text-white" : "text-foreground"
                  }`}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Social Media Links */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-1">Social Media Links</Text>
          <Text className="text-xs text-muted mb-3">Optional — share your handles so matches can find you</Text>
          <View className="gap-3">
            {[
              { key: "instagram", label: "Instagram", placeholder: "@username", emoji: "📸", color: "#E1306C" },
              { key: "tiktok", label: "TikTok", placeholder: "@username", emoji: "🎵", color: "#010101" },
              { key: "twitter", label: "X / Twitter", placeholder: "@handle", emoji: "𝕏", color: "#1DA1F2" },
            ].map((social) => (
              <View key={social.key} className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: social.color + "22" }}
                >
                  <Text style={{ fontSize: 18 }}>{social.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">{social.label}</Text>
                  <TextInput
                    className="bg-muted rounded-xl px-4 py-3 text-foreground"
                    placeholder={social.placeholder}
                    placeholderTextColor={colors.muted}
                    value={(profile as any)[social.key]}
                    onChangeText={(text) => setProfile({ ...profile, [social.key]: text })}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-primary py-4 rounded-xl items-center mb-8"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

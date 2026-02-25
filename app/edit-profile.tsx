import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";

const INSTITUTIONS = [
  "University of South Africa (UNISA)",
  "University of the Witwatersrand",
  "University of Cape Town",
  "University of Pretoria",
  "Stellenbosch University",
  "University of Johannesburg",
  "University of KwaZulu-Natal",
  "Rhodes University",
  "Nelson Mandela University",
  "North-West University",
  "University of the Free State",
  "University of Limpopo",
  "University of Venda",
  "University of Zululand",
  "Walter Sisulu University",
  "Cape Peninsula University of Technology",
  "Durban University of Technology",
  "Tshwane University of Technology",
  "Vaal University of Technology",
  "Central University of Technology",
  "Mangosuthu University of Technology",
  "Other",
];

export default function EditProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
    institution: "",
    year_of_study: "",
    course: "",
    instagram: "",
    tiktok: "",
    twitter: "",
    facebook: "",
    linkedin: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, bio, avatar_url, institution, year_of_study, course, instagram, tiktok, twitter, facebook, linkedin")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          institution: data.institution || "",
          year_of_study: data.year_of_study || "",
          course: data.course || "",
          instagram: data.instagram || "",
          tiktok: data.tiktok || "",
          twitter: data.twitter || "",
          facebook: data.facebook || "",
          linkedin: data.linkedin || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickAndUploadAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const asset = result.assets[0];
      const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;

      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        type: "image/jpeg",
        name: fileName,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, formData, { contentType: "image/jpeg", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));

      Toast.show({ type: "success", text1: "Photo Updated", text2: "Profile picture changed successfully" });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      Toast.show({ type: "error", text1: "Upload Failed", text2: error.message || "Could not upload photo" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.full_name.trim()) {
      Toast.show({ type: "error", text1: "Name Required", text2: "Please enter your full name" });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name.trim(),
          bio: profile.bio.trim() || null,
          avatar_url: profile.avatar_url || null,
          institution: profile.institution || null,
          year_of_study: profile.year_of_study || null,
          course: profile.course || null,
          instagram: profile.instagram.trim() || null,
          tiktok: profile.tiktok.trim() || null,
          twitter: profile.twitter.trim() || null,
          facebook: profile.facebook.trim() || null,
          linkedin: profile.linkedin.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      Toast.show({ type: "success", text1: "Profile Saved!", text2: "Your profile has been updated" });
      router.back();
    } catch (error: any) {
      console.error("Save profile error:", error);
      Toast.show({ type: "error", text1: "Save Failed", text2: error.message || "Could not save profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-3">Loading profile...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Edit Profile</Text>
            <Text className="text-sm text-muted">Update your personal information</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center"
          >
            <IconSymbol name="xmark" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickAndUploadAvatar} disabled={uploading} className="relative">
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
                contentFit="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
                <IconSymbol name="person.fill" size={48} color="white" />
              </View>
            )}
            <View
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-background"
              style={{ backgroundColor: colors.primary }}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <IconSymbol name="camera.fill" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
          <Text className="text-xs text-muted mt-2">Tap to change photo</Text>
        </View>

        {/* Basic Info */}
        <View className="mb-6">
          <Text className="text-base font-bold text-foreground mb-4">Basic Information</Text>
          <View className="gap-4">
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Full Name *</Text>
              <TextInput
                className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                placeholder="Your full name"
                placeholderTextColor={colors.muted}
                value={profile.full_name}
                onChangeText={(text) => setProfile((p) => ({ ...p, full_name: text }))}
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Bio</Text>
              <TextInput
                className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                placeholder="Tell others about yourself..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={profile.bio}
                onChangeText={(text) => setProfile((p) => ({ ...p, bio: text }))}
                maxLength={300}
              />
              <Text className="text-xs text-muted mt-1 text-right">{profile.bio.length}/300</Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Institution</Text>
              <TouchableOpacity
                onPress={() => setShowInstitutionPicker(true)}
                className="bg-surface rounded-xl px-4 py-3 border border-border flex-row items-center justify-between"
              >
                <Text className={profile.institution ? "text-foreground" : "text-muted"}>
                  {profile.institution || "Select your institution"}
                </Text>
                <IconSymbol name="chevron.down" size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Course / Major</Text>
              <TextInput
                className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                placeholder="e.g. Computer Science"
                placeholderTextColor={colors.muted}
                value={profile.course}
                onChangeText={(text) => setProfile((p) => ({ ...p, course: text }))}
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Year of Study</Text>
              <View className="flex-row gap-2 flex-wrap">
                {["1st Year", "2nd Year", "3rd Year", "4th Year", "Honours", "Masters", "PhD"].map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setProfile((p) => ({ ...p, year_of_study: year }))}
                    className={`px-4 py-2 rounded-full border ${
                      profile.year_of_study === year
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        profile.year_of_study === year ? "text-white" : "text-foreground"
                      }`}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Social Media Links */}
        <View className="mb-8">
          <Text className="text-base font-bold text-foreground mb-1">Social Media</Text>
          <Text className="text-xs text-muted mb-4">Optional — let others connect with you</Text>
          <View className="gap-3">
            {[
              { key: "instagram", label: "Instagram", placeholder: "@username", emoji: "📸", color: "#E1306C" },
              { key: "tiktok", label: "TikTok", placeholder: "@username", emoji: "🎵", color: "#010101" },
              { key: "twitter", label: "X / Twitter", placeholder: "@handle", emoji: "𝕏", color: "#1DA1F2" },
              { key: "facebook", label: "Facebook", placeholder: "Profile name or URL", emoji: "👥", color: "#1877F2" },
              { key: "linkedin", label: "LinkedIn", placeholder: "Profile URL or name", emoji: "💼", color: "#0A66C2" },
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
                    className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                    placeholder={social.placeholder}
                    placeholderTextColor={colors.muted}
                    value={(profile as any)[social.key]}
                    onChangeText={(text) => setProfile((p) => ({ ...p, [social.key]: text }))}
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
          disabled={saving}
          className="py-4 rounded-2xl items-center"
          style={{ backgroundColor: colors.primary }}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Institution Picker Modal */}
      {showInstitutionPicker && (
        <View
          className="absolute inset-0 bg-black/60 items-center justify-end"
          style={{ zIndex: 100 }}
        >
          <View className="bg-background rounded-t-3xl w-full max-h-[70%]">
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">Select Institution</Text>
              <TouchableOpacity onPress={() => setShowInstitutionPicker(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {INSTITUTIONS.map((inst) => (
                <TouchableOpacity
                  key={inst}
                  onPress={() => {
                    setProfile((p) => ({ ...p, institution: inst }));
                    setShowInstitutionPicker(false);
                  }}
                  className={`px-4 py-4 border-b border-border flex-row items-center justify-between ${
                    profile.institution === inst ? "bg-primary/10" : ""
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      profile.institution === inst ? "text-primary font-semibold" : "text-foreground"
                    }`}
                  >
                    {inst}
                  </Text>
                  {profile.institution === inst && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

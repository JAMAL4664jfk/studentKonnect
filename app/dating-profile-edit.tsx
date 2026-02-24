import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

const INTERESTS = [
  "Music", "Sports", "Art", "Travel", "Food", "Gaming",
  "Reading", "Movies", "Fitness", "Photography", "Dancing",
  "Cooking", "Technology", "Fashion", "Nature", "Pets",
];

export default function DatingProfileEdit() {
  const colors = useColors();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = "00000000-0000-0000-0000-000000000001";
      
      const { data, error } = await supabase
        .from("dating_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setAge(data.age?.toString() || "");
        setBio(data.bio || "");
        setSelectedInterests(data.interests || []);
        setPhotos(data.photos || []);
        setLocation(data.location || "");
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (photos.length >= 6) {
      Toast.show({
        type: "info",
        text1: "Maximum Photos",
        text2: "You can upload up to 6 photos",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      if (selectedInterests.length < 10) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  const handleSave = async () => {
    if (!displayName || !age || !bio) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields",
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("dating_profiles")
        .update({
          display_name: displayName,
          age: parseInt(age),
          bio,
          interests: selectedInterests,
          photos,
          location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Profile Updated! 💕",
        text2: "Your changes have been saved",
      });

      router.back();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading profile...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={["#ec4899", "#f43f5e", "#fb7185"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>✏️</Text>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <Text style={styles.headerSubtitle}>Update your dating profile</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Photos */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Photos 📸
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    style={styles.removePhotoButton}
                  >
                    <IconSymbol name="xmark.circle.fill" size={24} color="#ef4444" />
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={styles.mainPhotoBadge}>
                      <Text style={styles.mainPhotoText}>Main</Text>
                    </View>
                  )}
                </View>
              ))}
              
              {photos.length < 6 && (
                <TouchableOpacity onPress={pickImage} style={styles.addPhotoButton}>
                  <IconSymbol name="plus.circle.fill" size={48} color={colors.primary} />
                  <Text style={[styles.addPhotoText, { color: colors.mutedForeground }]}>
                    Add Photo
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Basic Information
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Display Name *</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Age *</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="18+"
                keyboardType="number-pad"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Location</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="City, Country"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              />
            </View>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              About You 💬
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others about yourself..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.bioInput, { color: colors.foreground, borderColor: colors.border }]}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
              {bio.length}/500
            </Text>
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Interests ⭐
            </Text>
            <View style={styles.interestsGrid}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest) && styles.interestChipActive,
                    {
                      backgroundColor: selectedInterests.includes(interest)
                        ? "#ec489920"
                        : colors.surface,
                      borderColor: selectedInterests.includes(interest) ? "#ec4899" : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.interestText,
                      {
                        color: selectedInterests.includes(interest) ? "#ec4899" : colors.foreground,
                      },
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          >
            <LinearGradient
              colors={["#ec4899", "#f43f5e"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  photosScroll: {
    marginTop: 8,
  },
  photoContainer: {
    marginRight: 12,
    position: "relative",
  },
  photo: {
    width: 120,
    height: 160,
    borderRadius: 16,
  },
  removePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  mainPhotoBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#ec4899",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mainPhotoText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  addPhotoButton: {
    width: 120,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  bioInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: "top",
    minHeight: 100,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    marginTop: 4,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestChipActive: {},
  interestText: {
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

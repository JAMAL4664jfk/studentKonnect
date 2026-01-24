import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
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

const LOOKING_FOR_OPTIONS = [
  { value: "friendship", label: "Friendship", icon: "person.2.fill" },
  { value: "dating", label: "Dating", icon: "heart.fill" },
  { value: "relationship", label: "Relationship", icon: "heart.circle.fill" },
  { value: "networking", label: "Networking", icon: "person.3.fill" },
];

export default function DatingProfileSetup() {
  const colors = useColors();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [lookingFor, setLookingFor] = useState("dating");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [institution, setInstitution] = useState("");
  const [faculty, setFaculty] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [loading, setLoading] = useState(false);

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
      } else {
        Toast.show({
          type: "info",
          text1: "Maximum Interests",
          text2: "You can select up to 10 interests",
        });
      }
    }
  };

  const handleSave = async () => {
    // Validation
    if (!displayName || !age || !gender || !bio) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields",
      });
      return;
    }

    if (parseInt(age) < 18) {
      Toast.show({
        type: "error",
        text1: "Age Requirement",
        text2: "You must be at least 18 years old",
      });
      return;
    }

    if (photos.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Photos",
        text2: "Please add at least one photo",
      });
      return;
    }

    if (selectedInterests.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Interests",
        text2: "Please select at least one interest",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user (in real app, get from auth)
      const userId = "00000000-0000-0000-0000-000000000001"; // Replace with actual user ID

      // Insert dating profile
      const { data: profile, error: profileError } = await supabase
        .from("dating_profiles")
        .insert({
          user_id: userId,
          display_name: displayName,
          age: parseInt(age),
          gender,
          bio,
          interests: selectedInterests,
          looking_for: lookingFor,
          photos,
          location,
          institution,
          faculty,
          year_of_study: yearOfStudy ? parseInt(yearOfStudy) : null,
          is_active: true,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Insert default preferences
      const { error: prefsError } = await supabase
        .from("dating_preferences")
        .insert({
          dating_profile_id: profile.id,
          min_age: 18,
          max_age: 30,
          preferred_gender: ["any"],
          max_distance: 50,
          show_me_on_platform: true,
        });

      if (prefsError) throw prefsError;

      Toast.show({
        type: "success",
        text1: "Profile Created! 💕",
        text2: "Start swiping to find your match",
      });

      router.push("/dating-swipe" as any);
    } catch (error: any) {
      console.error("Error creating dating profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to create profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Love Theme */}
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
            <Text style={styles.headerEmoji}>💕</Text>
            <Text style={styles.headerTitle}>Create Your Dating Profile</Text>
            <Text style={styles.headerSubtitle}>Find your perfect match on campus</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Photos Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Photos (Required) 📸
            </Text>
            <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
              Add up to 6 photos. First photo will be your main profile picture.
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
              Basic Information ℹ️
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Display Name *</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="How should we call you?"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                maxLength={50}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.foreground }]}>Age *</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="18+"
                  keyboardType="number-pad"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                  maxLength={2}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.foreground }]}>Gender *</Text>
                <TextInput
                  value={gender}
                  onChangeText={setGender}
                  placeholder="Male/Female/Other"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                />
              </View>
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
              placeholder="Tell others about yourself... What makes you unique?"
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

          {/* Looking For */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Looking For 🎯
            </Text>
            <View style={styles.lookingForGrid}>
              {LOOKING_FOR_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setLookingFor(option.value)}
                  style={[
                    styles.lookingForCard,
                    lookingFor === option.value && styles.lookingForCardActive,
                    { borderColor: lookingFor === option.value ? "#ec4899" : colors.border },
                  ]}
                >
                  <IconSymbol
                    name={option.icon as any}
                    size={28}
                    color={lookingFor === option.value ? "#ec4899" : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.lookingForLabel,
                      { color: lookingFor === option.value ? "#ec4899" : colors.foreground },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Interests (Select up to 10) ⭐
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

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Additional Information (Optional) 🎓
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Location</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Stellenbosch, Cape Town"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Institution</Text>
              <TextInput
                value={institution}
                onChangeText={setInstitution}
                placeholder="e.g., University of Stellenbosch"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.foreground }]}>Faculty</Text>
                <TextInput
                  value={faculty}
                  onChangeText={setFaculty}
                  placeholder="e.g., Engineering"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.foreground }]}>Year</Text>
                <TextInput
                  value={yearOfStudy}
                  onChangeText={setYearOfStudy}
                  placeholder="1-4"
                  keyboardType="number-pad"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                  maxLength={1}
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={styles.saveButton}
          >
            <LinearGradient
              colors={["#ec4899", "#f43f5e"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGradient}
            >
              <IconSymbol name="heart.fill" size={20} color="white" />
              <Text style={styles.saveButtonText}>
                {loading ? "Creating Profile..." : "Create Profile & Start Swiping"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
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
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 14,
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
  row: {
    flexDirection: "row",
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
  lookingForGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  lookingForCard: {
    width: "48%",
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  lookingForCardActive: {
    backgroundColor: "#ec489910",
  },
  lookingForLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
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

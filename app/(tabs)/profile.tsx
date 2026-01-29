import { ScrollView, Text, View, TouchableOpacity, Image, Modal, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { capturePhoto, selectPhoto, uriToBlob, getFileExtension } from "@/lib/image-picker-utils";

type MenuItem = {
  id: string;
  title: string;
  icon: any;
  color: string;
  action: () => void;
};

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { balance } = useWallet();
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("scholar@student.ac.za");
  const [userName, setUserName] = useState<string>("Student Account");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || "scholar@student.ac.za");

        // Load profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name || "Student Account");
          setProfilePicture(profile.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleImageCapture = async () => {
    setShowImageOptions(false);
    const result = await capturePhoto();
    if (result) {
      await uploadProfilePicture(result.uri);
    }
  };

  const handleImageSelect = async () => {
    setShowImageOptions(false);
    const result = await selectPhoto();
    if (result) {
      await uploadProfilePicture(result.uri);
    }
  };

  const uploadProfilePicture = async (uri: string) => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User not authenticated',
      });
      return;
    }

    setUploading(true);

    try {
      // Convert URI to blob
      const blob = await uriToBlob(uri);
      const fileExtension = getFileExtension(uri);
      const fileName = `${userId}-${Date.now()}.${fileExtension}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExtension}`,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      setProfilePicture(publicUrl);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile picture updated successfully',
      });
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error.message || 'Failed to upload profile picture',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      Toast.show({
        type: "success",
        text1: "Signed Out",
        text2: "You have been signed out successfully",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to sign out",
      });
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: "analytics",
      title: "Financial Analytics",
      icon: "chart.bar.fill",
      color: colors.primary,
      action: () => router.push("/financial-analytics"),
    },
    {
      id: "rewards",
      title: "Lifestyle Rewards",
      icon: "heart.fill",
      color: "#FF6B9D",
      action: () => router.push("/lifestyle-rewards"),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "bell.fill",
      color: colors.warning,
      action: () => router.push("/notifications"),
    },
    {
      id: "settings",
      title: "Settings",
      icon: "gear",
      color: colors.muted,
      action: () => router.push("/settings"),
    },
  ];

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header with Profile Picture */}
          <View className="items-center gap-3 pt-4">
            <TouchableOpacity
              onPress={() => setShowImageOptions(true)}
              className="relative"
              disabled={uploading}
            >
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  className="w-24 h-24 rounded-full"
                  style={{ backgroundColor: colors.surface }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
                  <IconSymbol name="person.fill" size={48} color="white" />
                </View>
              )}
              
              {/* Camera Icon Overlay */}
              <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-background">
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <IconSymbol name="camera.fill" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">
                {userName}
              </Text>
              <Text className="text-sm text-muted">{userEmail}</Text>
            </View>
          </View>

          {/* Balance Card */}
          <View
            className="bg-primary rounded-2xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white text-sm mb-2 opacity-90">
              Wallet Balance
            </Text>
            <Text className="text-white text-4xl font-bold">
              R{balance.toFixed(2)}
            </Text>
          </View>

          {/* Menu Items */}
          <View className="gap-3">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.action}
                className="bg-surface rounded-2xl p-4 border border-border active:opacity-70"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: item.color + "20" }}
                  >
                    <IconSymbol name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text className="flex-1 text-base font-medium text-foreground">
                    {item.title}
                  </Text>
                  <IconSymbol
                    name="chevron.right"
                    size={20}
                    color={colors.muted}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-error rounded-2xl p-4 items-center active:opacity-70 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-white text-base font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-background rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              Change Profile Picture
            </Text>

            <TouchableOpacity
              onPress={handleImageCapture}
              className="flex-row items-center gap-4 p-4 bg-surface rounded-2xl mb-3 active:opacity-70"
            >
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                <IconSymbol name="camera.fill" size={24} color="white" />
              </View>
              <Text className="text-base font-medium text-foreground">
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleImageSelect}
              className="flex-row items-center gap-4 p-4 bg-surface rounded-2xl mb-3 active:opacity-70"
            >
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                <IconSymbol name="photo.fill" size={24} color="white" />
              </View>
              <Text className="text-base font-medium text-foreground">
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowImageOptions(false)}
              className="p-4 bg-muted/20 rounded-2xl items-center active:opacity-70"
            >
              <Text className="text-base font-medium text-muted">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}

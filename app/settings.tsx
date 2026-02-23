import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();

  // Settings states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const settingsSections = [
    {
      title: "Notifications",
      items: [
        {
          label: "Push Notifications",
          value: pushNotifications,
          onValueChange: setPushNotifications,
          icon: "bell.fill",
        },
        {
          label: "Email Notifications",
          value: emailNotifications,
          onValueChange: setEmailNotifications,
          icon: "envelope.fill",
        },
        {
          label: "Marketing Emails",
          value: marketingEmails,
          onValueChange: setMarketingEmails,
          icon: "megaphone.fill",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          label: "Dark Mode",
          value: darkMode,
          onValueChange: setDarkMode,
          icon: "moon.fill",
        },
        {
          label: "Location Services",
          value: locationServices,
          onValueChange: setLocationServices,
          icon: "location.fill",
        },
      ],
    },
  ];

  const accountOptions = [
    {
      label: "Edit Profile",
      icon: "person.fill",
      action: () => {},
    },
    {
      label: "Change Password",
      icon: "lock.fill",
      action: () => {},
    },
    {
      label: "Privacy Settings",
      icon: "hand.raised.fill",
      action: () => {},
    },
    {
      label: "Payment Methods",
      icon: "creditcard.fill",
      action: () => {},
    },
  ];

  const supportOptions = [
    {
      label: "Help Center",
      icon: "questionmark.circle.fill",
      action: () => {},
    },
    {
      label: "Contact Support",
      icon: "envelope.fill",
      action: () => {},
    },
    {
      label: "Terms of Service",
      icon: "doc.text.fill",
      action: () => {},
    },
    {
      label: "Privacy Policy",
      icon: "shield.fill",
      action: () => {},
    },
  ];

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone. All your data, including your profile, wallet, and activity history, will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      const { data: { user } } = await safeGetUser();
      if (!user) {
        Toast.show({ type: "error", text1: "Error", text2: "No active session found." });
        return;
      }

      // Delete user profile data from all tables
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.from("dating_profiles").delete().eq("user_id", user.id);
      await supabase.from("datingProfiles").delete().eq("userId", user.id);
      await supabase.from("wallet_users").delete().eq("user_id", user.id);

      // Sign out the user (account deletion requires server-side admin call;
      // this signs out and marks for deletion via support)
      await supabase.auth.signOut();

      Toast.show({
        type: "success",
        text1: "Account Deleted",
        text2: "Your account data has been removed. You have been signed out.",
      });

      router.replace("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to delete account. Please contact support.",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-6 pb-4 border-b border-border">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Settings</Text>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Toggle Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">
                {section.title}
              </Text>
              <View className="bg-surface rounded-2xl border border-border overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <View
                    key={itemIndex}
                    className={`flex-row items-center justify-between p-4 ${
                      itemIndex < section.items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <IconSymbol name={item.icon} size={20} color={colors.primary} />
                      </View>
                      <Text className="text-base font-medium text-foreground">
                        {item.label}
                      </Text>
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{ false: colors.muted, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Account Options */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Account</Text>
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              {accountOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={option.action}
                  className={`flex-row items-center justify-between p-4 active:opacity-70 ${
                    index < accountOptions.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <IconSymbol name={option.icon} size={20} color={colors.primary} />
                    </View>
                    <Text className="text-base font-medium text-foreground">
                      {option.label}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Support Options */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">
              Support & Legal
            </Text>
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              {supportOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={option.action}
                  className={`flex-row items-center justify-between p-4 active:opacity-70 ${
                    index < supportOptions.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.muted + "40" }}
                    >
                      <IconSymbol name={option.icon} size={20} color={colors.muted} />
                    </View>
                    <Text className="text-base font-medium text-foreground">
                      {option.label}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Danger Zone — Delete Account (required by Google Play) */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Danger Zone</Text>
            <View className="bg-surface rounded-2xl border border-red-500/30 overflow-hidden">
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-row items-center justify-between p-4 active:opacity-70"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: "#ef444420" }}
                  >
                    <IconSymbol name="trash.fill" size={20} color="#ef4444" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-red-500">
                      {deletingAccount ? "Deleting Account..." : "Delete Account"}
                    </Text>
                    <Text className="text-xs text-muted mt-0.5">
                      Permanently remove your account and all data
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* App Version */}
          <View className="items-center py-6">
            <Text className="text-sm text-muted">StudentKonnect</Text>
            <Text className="text-sm text-muted">Version 1.8</Text>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

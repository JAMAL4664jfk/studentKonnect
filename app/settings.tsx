import { ScrollView, Text, View, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();

  // Settings states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

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

          {/* App Version */}
          <View className="items-center py-6">
            <Text className="text-sm text-muted">StudentKonnect</Text>
            <Text className="text-sm text-muted">Version 1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

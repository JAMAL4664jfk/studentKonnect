import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  ActivityIndicator,
  Clipboard,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";

const APP_URL = "https://www.student-konnect.com";

export default function ReferralScreen() {
  const router = useRouter();
  const colors = useColors();

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [signupCount, setSignupCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    initReferral();
  }, []);

  const initReferral = async () => {
    try {
      setInitialLoading(true);
      const { data: { user } } = await safeGetUser();
      setUser(user);

      if (user) {
        // Fetch existing referral code
        const { data } = await supabase
          .from("referral_codes")
          .select("id, code")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setReferralCode(data.code);
          // Fetch signup count
          const { count } = await supabase
            .from("referral_signups")
            .select("*", { count: "exact", head: true })
            .eq("referral_code_id", data.id);
          setSignupCount(count || 0);
        }
      }
    } catch (error) {
      console.error("Error loading referral data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const generateCode = async () => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Please log in",
        text2: "You need to be logged in to generate a referral code.",
      });
      return;
    }
    setLoading(true);
    try {
      const code =
        "SK-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from("referral_codes").insert({
        user_id: user.id,
        code,
      });
      if (error) throw error;
      setReferralCode(code);
      Toast.show({
        type: "success",
        text1: "Referral Code Generated! 🎉",
        text2: `Your code is ${code}. Share it with friends!`,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to generate referral code",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (referralCode) {
      Clipboard.setString(referralCode);
      setCopied(true);
      Toast.show({
        type: "success",
        text1: "Copied!",
        text2: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = async () => {
    const signupLink = `${APP_URL}/auth?ref=${referralCode || ""}`;
    Clipboard.setString(signupLink);
    Toast.show({
      type: "success",
      text1: "Link Copied!",
      text2: "Sign-up link copied to clipboard",
    });
  };

  const shareMessage = `Hey! Join me on Student Konnect — the all-in-one student ecosystem! Use my referral code ${referralCode} to sign up: ${APP_URL}/auth?ref=${referralCode}`;

  const shareGeneral = async () => {
    try {
      await Share.share({
        message: shareMessage,
        title: "Join Student Konnect!",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const shareWhatsApp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(url).catch(() => {
      // Fallback to web WhatsApp
      Linking.openURL(
        `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
      );
    });
  };

  const shareGmail = () => {
    const subject = encodeURIComponent("Join me on Student Konnect!");
    const body = encodeURIComponent(shareMessage);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  };

  const steps = [
    {
      step: "1",
      title: "Generate Your Code",
      description: "Create your unique referral code with one tap",
      icon: "sparkles",
      color: "#6366f1",
    },
    {
      step: "2",
      title: "Share With Friends",
      description: "Send your code via WhatsApp, email, or any platform",
      icon: "square.and.arrow.up",
      color: "#8b5cf6",
    },
    {
      step: "3",
      title: "Friends Sign Up",
      description: "Your friends use your code when registering",
      icon: "person.badge.plus",
      color: "#a855f7",
    },
    {
      step: "4",
      title: "Grow the Community",
      description: "Track how many students you've brought on board",
      icon: "chart.line.uptrend.xyaxis",
      color: "#ec4899",
    },
  ];

  if (initialLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm text-muted mt-4">Loading referral...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <LinearGradient
          colors={["#6366f1", "#8b5cf6", "#a855f7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 16, paddingBottom: 40, paddingHorizontal: 20 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-6"
          >
            <IconSymbol name="chevron.left" size={20} color="white" />
            <Text className="text-white text-base font-medium">Back</Text>
          </TouchableOpacity>

          <View className="items-center gap-4">
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <IconSymbol name="gift.fill" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-white text-center">
              Refer & Grow
            </Text>
            <Text className="text-white/80 text-base text-center px-4">
              Invite fellow students to join Student Konnect and grow our
              community together
            </Text>
          </View>
        </LinearGradient>

        <View className="px-4 -mt-6 gap-4">
          {/* Referral Code Card */}
          <View
            className="bg-surface rounded-3xl p-6 border border-border"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text className="text-lg font-bold text-foreground mb-1">
              Your Referral Code
            </Text>
            <Text className="text-sm text-muted mb-4">
              Share this code with friends to invite them
            </Text>

            {referralCode ? (
              <>
                {/* Code Display */}
                <View className="bg-primary/10 rounded-2xl p-4 mb-4 items-center border border-primary/20">
                  <Text
                    className="text-3xl font-bold tracking-widest"
                    style={{ color: colors.primary }}
                  >
                    {referralCode}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mb-4">
                  <TouchableOpacity
                    onPress={copyCode}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl p-3 border border-border active:opacity-70"
                    style={{ backgroundColor: copied ? "#22c55e20" : colors.surface }}
                  >
                    <IconSymbol
                      name={copied ? "checkmark.circle.fill" : "doc.on.doc.fill"}
                      size={18}
                      color={copied ? "#22c55e" : colors.primary}
                    />
                    <Text
                      className="font-semibold text-sm"
                      style={{ color: copied ? "#22c55e" : colors.primary }}
                    >
                      {copied ? "Copied!" : "Copy Code"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={shareGeneral}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl p-3 active:opacity-70"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <IconSymbol
                      name="square.and.arrow.up"
                      size={18}
                      color="white"
                    />
                    <Text className="text-white font-semibold text-sm">
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Share Channels */}
                <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                  Share via
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={shareWhatsApp}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl p-3 border border-border active:opacity-70"
                  >
                    <Text className="text-lg">💬</Text>
                    <Text className="text-sm font-medium text-foreground">
                      WhatsApp
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={shareGmail}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl p-3 border border-border active:opacity-70"
                  >
                    <Text className="text-lg">📧</Text>
                    <Text className="text-sm font-medium text-foreground">
                      Email
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={copyLink}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl p-3 border border-border active:opacity-70"
                  >
                    <IconSymbol
                      name="link"
                      size={16}
                      color={colors.primary}
                    />
                    <Text className="text-sm font-medium text-foreground">
                      Link
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View className="items-center gap-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <IconSymbol name="qrcode" size={32} color={colors.primary} />
                </View>
                <Text className="text-sm text-muted text-center">
                  Generate your unique referral code and start inviting friends
                  to join Student Konnect!
                </Text>
                <TouchableOpacity
                  onPress={generateCode}
                  disabled={loading}
                  className="w-full rounded-2xl p-4 items-center active:opacity-70"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Generate My Referral Code
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stats Card */}
          {referralCode && (
            <View
              className="rounded-3xl overflow-hidden border border-border"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={["#6366f120", "#8b5cf620"]}
                style={{ padding: 20 }}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <IconSymbol
                      name="person.2.fill"
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-4xl font-bold"
                      style={{ color: colors.primary }}
                    >
                      {signupCount}
                    </Text>
                    <Text className="text-sm text-muted">
                      {signupCount === 1 ? "friend has" : "friends have"}{" "}
                      signed up with your code
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: "#22c55e" }}
                    >
                      Active
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* How It Works */}
          <View
            className="bg-surface rounded-3xl p-6 border border-border"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowHowItWorks(!showHowItWorks)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-lg font-bold text-foreground">
                How It Works
              </Text>
              <IconSymbol
                name={showHowItWorks ? "chevron.up" : "chevron.down"}
                size={20}
                color={colors.muted}
              />
            </TouchableOpacity>

            {showHowItWorks && (
              <View className="mt-4 gap-4">
                {steps.map((item, index) => (
                  <View key={index} className="flex-row gap-4 items-start">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: item.color + "20" }}
                    >
                      <IconSymbol
                        name={item.icon as any}
                        size={20}
                        color={item.color}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View
                          className="w-5 h-5 rounded-full items-center justify-center"
                          style={{ backgroundColor: item.color }}
                        >
                          <Text className="text-white text-xs font-bold">
                            {item.step}
                          </Text>
                        </View>
                        <Text className="text-sm font-bold text-foreground">
                          {item.title}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted leading-relaxed">
                        {item.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Community Banner */}
          <LinearGradient
            colors={["#6366f1", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 24, padding: 20 }}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <IconSymbol name="heart.fill" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">
                  Grow the Community
                </Text>
                <Text className="text-white/80 text-xs mt-1 leading-relaxed">
                  Every student you invite strengthens the Student Konnect
                  ecosystem for everyone.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

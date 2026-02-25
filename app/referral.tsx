import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  ActivityIndicator,
  ImageBackground,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";

const APP_URL = "https://www.student-konnect.com";

// Safe clipboard helper — uses the deprecated but still-functional RN Clipboard API
// with a Share fallback for devices where it doesn't work
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try the built-in RN Clipboard (works on Expo managed workflow)
    const { Clipboard } = require("react-native");
    if (Clipboard && typeof Clipboard.setString === "function") {
      Clipboard.setString(text);
      return true;
    }
  } catch (_) {}
  // Fallback: open share sheet so user can copy from there
  try {
    await Share.share({ message: text });
    return true;
  } catch (_) {}
  return false;
}

export default function ReferralScreen() {
  const router = useRouter();
  const colors = useColors();

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCodeId, setReferralCodeId] = useState<string | null>(null);
  const [signupCount, setSignupCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initReferral = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);

      const { data: { user: authUser }, error: authError } = await safeGetUser();
      if (authError || !authUser) {
        setError("Please log in to access referrals.");
        return;
      }
      setUser(authUser);

      // Fetch existing referral code for this user
      const { data: codeData, error: codeError } = await supabase
        .from("referral_codes")
        .select("id, code")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (codeError) {
        console.error("Error fetching referral code:", JSON.stringify(codeError));
        // Table may not exist yet — show a friendly message
        if (codeError.code === "42P01") {
          setError("Referral system is being set up. Please run the database migration.");
        } else {
          setError(codeError.message);
        }
        return;
      }

      if (codeData) {
        setReferralCode(codeData.code);
        setReferralCodeId(codeData.id);

        // Fetch signup count
        const { count, error: countError } = await supabase
          .from("referral_signups")
          .select("*", { count: "exact", head: true })
          .eq("referral_code_id", codeData.id);

        if (!countError) {
          setSignupCount(count || 0);
        }
      }
    } catch (err: any) {
      console.error("initReferral error:", err);
      setError(err.message || "Failed to load referral data");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    initReferral();
  }, [initReferral]);

  const generateCode = async () => {
    if (!user) {
      Toast.show({ type: "error", text1: "Please log in first" });
      return;
    }
    setLoading(true);
    try {
      // Generate a unique code — retry up to 3 times on collision
      let code = "";
      let inserted = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        code = "SK-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        const { data, error } = await supabase
          .from("referral_codes")
          .insert({ user_id: user.id, code })
          .select("id, code")
          .maybeSingle();

        if (!error && data) {
          setReferralCode(data.code);
          setReferralCodeId(data.id);
          setSignupCount(0);
          inserted = true;
          break;
        }

        // If it's a unique constraint violation, try again
        if (error && error.code !== "23505") {
          console.error("Code generation error:", JSON.stringify(error));
          throw error;
        }
      }

      if (inserted) {
        Toast.show({
          type: "success",
          text1: "Referral Code Generated! 🎉",
          text2: `Your code is ${code}`,
        });
      } else {
        throw new Error("Could not generate a unique code. Please try again.");
      }
    } catch (err: any) {
      console.error("generateCode error:", err);
      Toast.show({
        type: "error",
        text1: "Error generating code",
        text2: err.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const signupLink = `${APP_URL}/auth?ref=${referralCode || ""}`;
  const shareMessage = `Hey! Join me on Student Konnect — the all-in-one student ecosystem! 🎓\n\nUse my referral code *${referralCode}* to sign up:\n${signupLink}`;

  const copyCode = async () => {
    if (!referralCode) return;
    const ok = await copyToClipboard(referralCode);
    if (ok) {
      setCodeCopied(true);
      Toast.show({ type: "success", text1: "Code copied!", text2: referralCode });
      setTimeout(() => setCodeCopied(false), 2500);
    }
  };

  const copyLink = async () => {
    const ok = await copyToClipboard(signupLink);
    if (ok) {
      setLinkCopied(true);
      Toast.show({ type: "success", text1: "Link copied!", text2: "Share it with friends" });
      setTimeout(() => setLinkCopied(false), 2500);
    }
  };

  const shareGeneral = async () => {
    try {
      await Share.share({ message: shareMessage, title: "Join Student Konnect!" });
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const shareWhatsApp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`);
    });
  };

  const shareGmail = () => {
    const subject = encodeURIComponent("Join me on Student Konnect!");
    const body = encodeURIComponent(shareMessage);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  };

  const steps = [
    { step: "1", title: "Generate Your Code", description: "Create your unique referral code with one tap", icon: "sparkles", color: "#6366f1" },
    { step: "2", title: "Share With Friends", description: "Send your code via WhatsApp, email, or any platform", icon: "square.and.arrow.up", color: "#8b5cf6" },
    { step: "3", title: "Friends Sign Up", description: "Your friends use your code when registering", icon: "person.badge.plus", color: "#a855f7" },
    { step: "4", title: "Grow the Community", description: "Track how many students you've brought on board", icon: "chart.line.uptrend.xyaxis", color: "#ec4899" },
  ];

  if (initialLoading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted, marginTop: 12, fontSize: 14 }}>Loading referral...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header with Background Image */}
        <ImageBackground
          source={require("@/assets/images/hero-multiracial-students.jpg")}
          style={{ paddingTop: 16, paddingBottom: 48 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.45)", "rgba(99,102,241,0.75)", "rgba(139,92,246,0.90)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ paddingTop: 16, paddingBottom: 0, paddingHorizontal: 20 }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 }}
            >
              <IconSymbol name="chevron.left" size={20} color="white" />
              <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>Back</Text>
            </TouchableOpacity>

            <View style={{ alignItems: "center", gap: 12, paddingBottom: 48 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" }}>
                <IconSymbol name="gift.fill" size={40} color="white" />
              </View>
              <Text style={{ fontSize: 28, fontWeight: "800", color: "white", textAlign: "center", textShadowColor: "rgba(0,0,0,0.4)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>Refer & Grow</Text>
              <Text style={{ color: "rgba(255,255,255,0.92)", fontSize: 15, textAlign: "center", paddingHorizontal: 16, lineHeight: 22 }}>
                Invite fellow students to join Student Konnect and grow our community together
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={{ paddingHorizontal: 16, marginTop: -24, gap: 16 }}>

          {/* Error State */}
          {error && (
            <View style={{ backgroundColor: "#ef444420", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#ef4444" }}>
              <Text style={{ color: "#ef4444", fontSize: 14, fontWeight: "600", marginBottom: 4 }}>Setup Required</Text>
              <Text style={{ color: "#ef4444", fontSize: 13 }}>{error}</Text>
              <TouchableOpacity onPress={initReferral} style={{ marginTop: 12, backgroundColor: "#ef4444", borderRadius: 10, paddingVertical: 8, alignItems: "center" }}>
                <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Referral Code Card */}
          {!error && (
            <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 4 }}>Your Referral Code</Text>
              <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>Share this code with friends to invite them</Text>

              {referralCode ? (
                <>
                  {/* Code Display */}
                  <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 20, marginBottom: 16, alignItems: "center", borderWidth: 1, borderColor: colors.primary + "30" }}>
                    <Text style={{ fontSize: 32, fontWeight: "800", letterSpacing: 6, color: colors.primary }}>{referralCode}</Text>
                  </View>

                  {/* Copy + Share row */}
                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={copyCode}
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 12, borderWidth: 1, borderColor: codeCopied ? "#22c55e" : colors.border, backgroundColor: codeCopied ? "#22c55e15" : colors.surface }}
                    >
                      <IconSymbol name={codeCopied ? "checkmark.circle.fill" : "doc.on.doc.fill"} size={18} color={codeCopied ? "#22c55e" : colors.primary} />
                      <Text style={{ fontWeight: "600", fontSize: 14, color: codeCopied ? "#22c55e" : colors.primary }}>{codeCopied ? "Copied!" : "Copy Code"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={shareGeneral}
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 12, backgroundColor: colors.primary }}
                    >
                      <IconSymbol name="square.and.arrow.up" size={18} color="white" />
                      <Text style={{ fontWeight: "700", fontSize: 14, color: "white" }}>Share</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Share via label */}
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Share via</Text>

                  {/* Share channels */}
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      onPress={shareWhatsApp}
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
                    >
                      <Text style={{ fontSize: 18 }}>💬</Text>
                      <Text style={{ fontSize: 13, fontWeight: "500", color: colors.foreground }}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={shareGmail}
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
                    >
                      <Text style={{ fontSize: 18 }}>📧</Text>
                      <Text style={{ fontSize: 13, fontWeight: "500", color: colors.foreground }}>Email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={copyLink}
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 14, paddingVertical: 12, borderWidth: 1, borderColor: linkCopied ? "#22c55e" : colors.border, backgroundColor: linkCopied ? "#22c55e15" : colors.surface }}
                    >
                      <IconSymbol name="link" size={16} color={linkCopied ? "#22c55e" : colors.primary} />
                      <Text style={{ fontSize: 13, fontWeight: "500", color: linkCopied ? "#22c55e" : colors.foreground }}>{linkCopied ? "Copied!" : "Link"}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* Generate Code State */
                <View style={{ alignItems: "center", gap: 16 }}>
                  <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" }}>
                    <IconSymbol name="qrcode" size={36} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 }}>
                    Generate your unique referral code and start inviting friends to join Student Konnect!
                  </Text>
                  <TouchableOpacity
                    onPress={generateCode}
                    disabled={loading}
                    style={{ width: "100%", borderRadius: 16, paddingVertical: 16, alignItems: "center", backgroundColor: loading ? colors.muted : colors.primary }}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>Generate My Referral Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Stats Card — only shown when code exists */}
          {referralCode && (
            <View style={{ borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
              <LinearGradient colors={["#6366f115", "#8b5cf615"]} style={{ padding: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" }}>
                    <IconSymbol name="person.2.fill" size={28} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 40, fontWeight: "800", color: colors.primary }}>{signupCount}</Text>
                    <Text style={{ fontSize: 13, color: colors.muted }}>
                      {signupCount === 1 ? "friend has" : "friends have"} signed up with your code
                    </Text>
                  </View>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#22c55e20" }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#22c55e" }}>Active</Text>
                  </View>
                </View>

                {/* Signup link display */}
                <View style={{ marginTop: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Your signup link</Text>
                  <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "500" }} numberOfLines={1}>{signupLink}</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* How It Works */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border }}>
            <TouchableOpacity
              onPress={() => setShowHowItWorks(!showHowItWorks)}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 17, fontWeight: "700", color: colors.foreground }}>How It Works</Text>
              <IconSymbol name={showHowItWorks ? "chevron.up" : "chevron.down"} size={20} color={colors.muted} />
            </TouchableOpacity>

            {showHowItWorks && (
              <View style={{ marginTop: 16, gap: 16 }}>
                {steps.map((item, index) => (
                  <View key={index} style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: item.color + "20", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <IconSymbol name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: item.color, alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>{item.step}</Text>
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>{item.title}</Text>
                      </View>
                      <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>{item.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Community Banner with Background Image */}
          <View style={{ borderRadius: 24, overflow: "hidden" }}>
            <ImageBackground
              source={require("@/assets/images/lifestyle-rewards-banner.jpg")}
              style={{ padding: 20 }}
              resizeMode="cover"
            >
              <LinearGradient
                colors={["rgba(99,102,241,0.82)", "rgba(139,92,246,0.88)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, padding: 20 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" }}>
                    <IconSymbol name="heart.fill" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "white", fontWeight: "700", fontSize: 16, marginBottom: 4 }}>Grow the Community</Text>
                    <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 18 }}>
                      Every student you invite strengthens the Student Konnect ecosystem for everyone.
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

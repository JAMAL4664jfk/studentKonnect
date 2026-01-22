import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthState } from "@/hooks/use-auth-state";
import { useColors } from "@/hooks/use-colors";

/**
 * Root index that handles authentication routing
 * Redirects to auth screen if not authenticated, otherwise to tabs
 */
export default function Index() {
  const { isAuthenticated, loading } = useAuthState();
  const segments = useSegments();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and on auth screen
      router.replace("/(tabs)");
    } else if (!inAuthGroup && !inTabsGroup) {
      // Default redirect based on auth state
      router.replace(isAuthenticated ? "/(tabs)" : "/auth");
    }
  }, [isAuthenticated, loading, segments]);

  // Show loading indicator while checking auth
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

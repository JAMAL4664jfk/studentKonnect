import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "@/lib/supabase";

// Expo Go does not support remote push notifications from SDK 53+
// Only register for push tokens in standalone/development builds
const IS_EXPO_GO = Constants.appOwnership === "expo";

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export type PushNotificationState = {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
};

/**
 * Registers the device for Expo push notifications, saves the token to Supabase,
 * and returns the current notification state.
 */
export function usePushNotifications(): PushNotificationState {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          savePushTokenToSupabase(token);
        }
      })
      .catch((err) => {
        setError(err.message);
        console.warn("[PushNotifications] Registration error:", err.message);
      });

    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    // Listen for user tapping on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[PushNotifications] Notification tapped:", response.notification.request.content);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return { expoPushToken, notification, error };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications are not supported in Expo Go (SDK 53+)
  if (IS_EXPO_GO) {
    console.log("[PushNotifications] Skipping push registration in Expo Go — use a development build");
    return null;
  }

  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log("[PushNotifications] Must use physical device for push notifications");
    return null;
  }

  // Web is not supported
  if (Platform.OS === "web") {
    return null;
  }

  // Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[PushNotifications] Permission not granted");
    return null;
  }

  // Get the Expo push token
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn("[PushNotifications] No project ID found in config");
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (err: any) {
    console.warn("[PushNotifications] Failed to get push token:", err.message);
    return null;
  }
}

async function savePushTokenToSupabase(token: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Upsert the push token — one token per user per device
    const { error } = await supabase
      .from("push_tokens")
      .upsert(
        {
          user_id: user.id,
          token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,token" }
      );

    if (error) {
      // Silently skip if the push_tokens table doesn't exist yet (migration pending)
      const isMissingTable = error.message?.includes("push_tokens") || error.code === "42P01" || error.code === "PGRST200";
      if (!isMissingTable) {
        console.warn("[PushNotifications] Failed to save token:", error.message);
      }
    } else {
      console.log("[PushNotifications] Token saved successfully");
    }
  } catch (err: any) {
    console.warn("[PushNotifications] Exception saving token:", err.message);
  }
}

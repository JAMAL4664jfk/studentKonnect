import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

type CallStatus = "connecting" | "ringing" | "connected" | "ended" | "failed";

export default function VoiceCallScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const otherUserId = params.userId as string;
  const otherUserName = params.userName as string;

  const [callStatus, setCallStatus] = useState<CallStatus>("connecting");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchOtherUser();
    initiateCall();

    return () => {
      endCall();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (callStatus === "ringing" || callStatus === "connecting") {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callStatus]);

  useEffect(() => {
    if (callStatus === "connected") {
      durationInterval.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callStatus]);

  const fetchOtherUser = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherUserId)
        .maybeSingle();

      if (error) throw error;
      setOtherUser(data);
    } catch (error: any) {
      console.error("Error fetching user:", error);
    }
  };

  const initiateCall = async () => {
    // Simulate call initiation
    setTimeout(() => {
      setCallStatus("ringing");
    }, 1000);

    // Simulate call connection (in real app, this would be WebRTC signaling)
    setTimeout(() => {
      setCallStatus("connected");
      Toast.show({
        type: "success",
        text1: "Call connected",
      });
    }, 3000);
  };

  const endCall = () => {
    setCallStatus("ended");
    setTimeout(() => {
      router.back();
    }, 1000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    Toast.show({
      type: "info",
      text1: isMuted ? "Microphone on" : "Microphone muted",
    });
  };

  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
    Toast.show({
      type: "info",
      text1: isSpeaker ? "Speaker off" : "Speaker on",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case "connecting":
        return "Connecting...";
      case "ringing":
        return "Ringing...";
      case "connected":
        return formatDuration(duration);
      case "ended":
        return "Call ended";
      case "failed":
        return "Call failed";
      default:
        return "";
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-between py-12 px-6">
        {/* Top Section */}
        <View className="items-center">
          <Text className="text-muted-foreground text-sm mb-2">Voice Call</Text>
          <Text className="text-foreground text-lg font-semibold">
            {getStatusText()}
          </Text>
        </View>

        {/* User Avatar */}
        <View className="items-center">
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            {otherUser?.avatar_url ? (
              <Image
                source={{ uri: otherUser.avatar_url }}
                className="w-32 h-32 rounded-full"
                contentFit="cover"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-primary/20 items-center justify-center">
                <Text className="text-5xl font-bold text-primary">
                  {otherUserName?.[0] || "U"}
                </Text>
              </View>
            )}
          </Animated.View>

          <Text className="text-2xl font-bold text-foreground mt-6">
            {otherUserName || "User"}
          </Text>

          {callStatus === "connected" && (
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-green-500 text-sm">Connected</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View className="w-full">
          {callStatus === "connected" && (
            <View className="flex-row justify-center gap-6 mb-8">
              {/* Mute */}
              <TouchableOpacity
                onPress={toggleMute}
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  isMuted ? "bg-destructive" : "bg-surface"
                }`}
              >
                <IconSymbol
                  name={isMuted ? "mic.slash.fill" : "mic.fill"}
                  size={24}
                  color={isMuted ? colors.destructiveForeground : colors.foreground}
                />
              </TouchableOpacity>

              {/* Speaker */}
              <TouchableOpacity
                onPress={toggleSpeaker}
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  isSpeaker ? "bg-primary" : "bg-surface"
                }`}
              >
                <IconSymbol
                  name="speaker.wave.3.fill"
                  size={24}
                  color={isSpeaker ? colors.primaryForeground : colors.foreground}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* End Call Button */}
          <TouchableOpacity
            onPress={endCall}
            className="w-20 h-20 rounded-full bg-destructive items-center justify-center self-center"
            disabled={callStatus === "ended"}
          >
            <IconSymbol
              name="phone.down.fill"
              size={32}
              color={colors.destructiveForeground}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

type CallStatus = "connecting" | "ringing" | "connected" | "ended" | "failed";

const { width, height } = Dimensions.get("window");

export default function VideoCallScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const otherUserId = params.userId as string;
  const otherUserName = params.userName as string;

  const [callStatus, setCallStatus] = useState<CallStatus>("connecting");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showControls, setShowControls] = useState(true);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchOtherUser();
    initiateCall();

    return () => {
      endCall();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
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

      // Auto-hide controls after 3 seconds
      hideControlsAfterDelay();
    } else if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callStatus]);

  const hideControlsAfterDelay = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (!showControls) {
      hideControlsAfterDelay();
    }
  };

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
        text1: "Video call connected",
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

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    Toast.show({
      type: "info",
      text1: isVideoOff ? "Camera on" : "Camera off",
    });
  };

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    Toast.show({
      type: "info",
      text1: isFrontCamera ? "Switched to back camera" : "Switched to front camera",
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
    <View className="flex-1 bg-black">
      <TouchableOpacity
        activeOpacity={1}
        onPress={toggleControls}
        className="flex-1"
      >
        {/* Remote Video (Full Screen) */}
        {callStatus === "connected" ? (
          <View className="flex-1 bg-gray-900 items-center justify-center">
            {/* Placeholder for remote video stream */}
            {otherUser?.avatar_url ? (
              <Image
                source={{ uri: otherUser.avatar_url }}
                style={{ width, height }}
                contentFit="cover"
              />
            ) : (
              <View className="items-center">
                <View className="w-32 h-32 rounded-full bg-primary/20 items-center justify-center mb-4">
                  <Text className="text-5xl font-bold text-primary">
                    {otherUserName?.[0] || "U"}
                  </Text>
                </View>
                <Text className="text-white text-xl font-semibold">
                  {otherUserName || "User"}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View className="flex-1 bg-gray-900 items-center justify-center">
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

            <Text className="text-white text-2xl font-bold mt-6">
              {otherUserName || "User"}
            </Text>
            <Text className="text-gray-400 text-sm mt-2">{getStatusText()}</Text>
          </View>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {callStatus === "connected" && !isVideoOff && (
          <View
            className="absolute top-12 right-4 w-24 h-32 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white"
          >
            {/* Placeholder for local video stream */}
            <View className="flex-1 items-center justify-center">
              <IconSymbol name="person.fill" size={32} color="white" />
            </View>
          </View>
        )}

        {/* Top Bar */}
        {showControls && (
          <View className="absolute top-0 left-0 right-0 bg-black/50 p-4 pt-12">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-lg font-semibold">
                  {otherUserName || "User"}
                </Text>
                {callStatus === "connected" && (
                  <Text className="text-gray-300 text-sm">
                    {formatDuration(duration)}
                  </Text>
                )}
              </View>
              {callStatus !== "connected" && (
                <Text className="text-gray-300 text-sm">{getStatusText()}</Text>
              )}
            </View>
          </View>
        )}

        {/* Bottom Controls */}
        {showControls && (
          <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-6 pb-12">
            <View className="flex-row justify-center gap-6">
              {/* Mute */}
              <TouchableOpacity
                onPress={toggleMute}
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  isMuted ? "bg-red-600" : "bg-white/20"
                }`}
              >
                <IconSymbol
                  name={isMuted ? "mic.slash.fill" : "mic.fill"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              {/* End Call */}
              <TouchableOpacity
                onPress={endCall}
                className="w-20 h-20 rounded-full bg-red-600 items-center justify-center"
                disabled={callStatus === "ended"}
              >
                <IconSymbol name="phone.down.fill" size={32} color="white" />
              </TouchableOpacity>

              {/* Video Toggle */}
              <TouchableOpacity
                onPress={toggleVideo}
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  isVideoOff ? "bg-red-600" : "bg-white/20"
                }`}
              >
                <IconSymbol
                  name={isVideoOff ? "video.slash.fill" : "video.fill"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              {/* Camera Switch */}
              {!isVideoOff && (
                <TouchableOpacity
                  onPress={toggleCamera}
                  className="w-16 h-16 rounded-full bg-white/20 items-center justify-center"
                >
                  <IconSymbol name="arrow.triangle.2.circlepath.camera" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

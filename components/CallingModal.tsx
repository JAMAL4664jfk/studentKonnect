import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

type CallingModalProps = {
  visible: boolean;
  onClose: () => void;
  callType: "voice" | "video";
  otherUserName: string;
  otherUserPhoto: string;
  isIncoming?: boolean;
};

export function CallingModal({
  visible,
  onClose,
  callType,
  otherUserName,
  otherUserPhoto,
  isIncoming = false,
}: CallingModalProps) {
  const colors = useColors();
  const [callStatus, setCallStatus] = useState<"ringing" | "connected" | "ended">("ringing");
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const handleAnswer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCallStatus("connected");
  };

  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCallStatus("ended");
    setTimeout(() => {
      onClose();
      setCallStatus("ringing");
      setCallDuration(0);
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="pt-16 px-6 items-center">
          <Text className="text-sm text-muted mb-2">
            {callType === "video" ? "Video Call" : "Voice Call"}
          </Text>
          <Text className="text-2xl font-bold text-foreground mb-1">
            {otherUserName}
          </Text>
          <Text className="text-base text-muted">
            {callStatus === "ringing"
              ? isIncoming
                ? "Incoming call..."
                : "Calling..."
              : callStatus === "connected"
              ? formatDuration(callDuration)
              : "Call ended"}
          </Text>
        </View>

        {/* User Avatar */}
        <View className="flex-1 items-center justify-center">
          <View
            className="w-40 h-40 rounded-full overflow-hidden mb-8"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Image
              source={{ uri: otherUserPhoto || "https://via.placeholder.com/160" }}
              style={{ width: "100%", height: "100%" }}
            />
          </View>

          {callStatus === "ringing" && !isIncoming && (
            <View className="flex-row gap-4">
              <View className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <View className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
              <View className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
            </View>
          )}
        </View>

        {/* Call Controls */}
        <View className="px-6 pb-12">
          {callStatus === "ringing" && isIncoming ? (
            <View className="flex-row justify-center gap-8">
              <TouchableOpacity
                onPress={handleDecline}
                className="w-20 h-20 rounded-full bg-error items-center justify-center active:opacity-70"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <IconSymbol name="phone.down.fill" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAnswer}
                className="w-20 h-20 rounded-full bg-success items-center justify-center active:opacity-70"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <IconSymbol name="phone.fill" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center">
              <TouchableOpacity
                onPress={handleDecline}
                className="w-20 h-20 rounded-full bg-error items-center justify-center active:opacity-70"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <IconSymbol name="phone.down.fill" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

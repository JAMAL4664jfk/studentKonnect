import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { GazooAIChat } from "@/components/GazooAIChat";

export default function GazooAIScreen() {
  const colors = useColors();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <ScreenContainer>
      <ImageBackground
        source={require("@/assets/images/chat-bg.jpg")}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.1 }}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-3 border-b border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.back()}>
                <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                  <IconSymbol name="sparkles" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text className="text-xl font-bold text-foreground">Gazoo AI</Text>
                  <Text className="text-xs text-muted-foreground">Your AI Assistant</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Chat Interface */}
        <View className="flex-1">
          {isChatOpen && (
            <GazooAIChat
              visible={isChatOpen}
              onClose={() => {
                setIsChatOpen(false);
                router.back();
              }}
            />
          )}
        </View>
      </ImageBackground>
    </ScreenContainer>
  );
}

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function EHailingScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">E-Hailing</Text>
              <Text className="text-sm text-muted">Book rides with students</Text>
            </View>
          </View>

          <View className="bg-primary rounded-2xl p-6" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <IconSymbol name="car.fill" size={48} color="white" />
            <Text className="text-white text-2xl font-bold mt-4 mb-2">Student Rides</Text>
            <Text className="text-white text-base opacity-90">Safe and affordable rides with fellow students</Text>
          </View>

          <TouchableOpacity className="bg-primary rounded-2xl p-4 items-center active:opacity-70 mb-6">
            <Text className="text-white text-base font-semibold">Book a Ride</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

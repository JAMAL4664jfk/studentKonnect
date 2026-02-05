import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";

export default function StudyMaterialCheckoutScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Checkout</Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 items-center justify-center px-6 py-12">
            {/* Coming Soon Icon */}
            <View className="mb-8">
              <LinearGradient
                colors={["#3b82f6", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-32 h-32 rounded-full items-center justify-center"
              >
                <IconSymbol name="cart.fill.badge.plus" size={64} color="white" />
              </LinearGradient>
            </View>

            {/* Coming Soon Text */}
            <View className="items-center gap-4 mb-8">
              <Text className="text-3xl font-bold text-foreground text-center">
                Coming Soon!
              </Text>
              <Text className="text-lg text-muted text-center leading-7">
                We're working hard to bring you a seamless checkout experience for purchasing your study materials.
              </Text>
            </View>

            {/* Features List */}
            <View className="w-full bg-surface rounded-2xl p-6 border border-border gap-4 mb-8">
              <Text className="text-xl font-bold text-foreground mb-2">
                What to Expect:
              </Text>
              
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                  <IconSymbol name="creditcard.fill" size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    Secure Payment Options
                  </Text>
                  <Text className="text-sm text-muted">
                    Multiple payment methods including card, EFT, and mobile money
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-success/10 rounded-full items-center justify-center">
                  <IconSymbol name="shippingbox.fill" size={20} color={colors.success} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    Fast Delivery
                  </Text>
                  <Text className="text-sm text-muted">
                    Quick delivery to your campus or residence within 2-3 business days
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center">
                  <IconSymbol name="tag.fill" size={20} color={colors.secondary} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    Student Discounts
                  </Text>
                  <Text className="text-sm text-muted">
                    Exclusive discounts and deals for verified students
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-accent/10 rounded-full items-center justify-center">
                  <IconSymbol name="arrow.triangle.2.circlepath" size={20} color={colors.accent} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    Easy Returns
                  </Text>
                  <Text className="text-sm text-muted">
                    Hassle-free returns within 7 days for unused items
                  </Text>
                </View>
              </View>
            </View>

            {/* Notification Banner */}
            <View className="w-full bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
              <View className="flex-row items-center gap-3 mb-2">
                <IconSymbol name="bell.badge.fill" size={24} color="#3b82f6" />
                <Text className="text-base font-bold text-blue-600">
                  Get Notified
                </Text>
              </View>
              <Text className="text-sm text-blue-600">
                We'll notify you as soon as the checkout feature is available. Keep browsing and adding items to your cart!
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View className="px-4 py-4 border-t border-border gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary py-4 rounded-xl items-center"
          >
            <Text className="text-white font-bold text-lg">Continue Shopping</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push("/(tabs)" as any)}
            className="bg-surface border border-border py-4 rounded-xl items-center"
          >
            <Text className="text-foreground font-semibold text-base">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

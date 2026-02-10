import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface NetworkErrorProps {
  onRetry: () => void;
  message?: string;
}

export function NetworkError({ onRetry, message }: NetworkErrorProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="items-center">
        <View className="w-24 h-24 rounded-full bg-muted/20 items-center justify-center mb-4">
          <IconSymbol name="wifi.slash" size={48} color="#6b7280" />
        </View>
        <Text className="text-2xl font-bold text-foreground mb-2 text-center">
          No Internet Connection
        </Text>
        <Text className="text-base text-muted text-center mb-8">
          {message || "Please check your internet connection and try again."}
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          className="bg-primary py-4 px-8 rounded-2xl items-center active:opacity-80"
        >
          <View className="flex-row items-center gap-2">
            <IconSymbol name="arrow.clockwise" size={20} color="white" />
            <Text className="text-primary-foreground font-bold text-lg">
              Try Again
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

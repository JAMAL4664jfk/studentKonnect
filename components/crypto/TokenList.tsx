import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useCryptoWallet, type Token } from "@/contexts/CryptoWalletContext";

interface TokenListProps {
  onTokenPress?: (token: Token) => void;
}

export const TokenList: React.FC<TokenListProps> = ({ onTokenPress }) => {
  const colors = useColors();
  const { tokens, isLoading, refreshBalances } = useCryptoWallet();

  if (isLoading && tokens.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading tokens...</Text>
      </View>
    );
  }

  if (tokens.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <IconSymbol name="wallet.fill" size={48} color={colors.muted} />
        <Text className="text-muted mt-4 text-center">No tokens found</Text>
        <TouchableOpacity
          onPress={refreshBalances}
          className="mt-4 bg-primary px-6 py-3 rounded-full active:opacity-70"
        >
          <Text className="text-primary-foreground font-semibold">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="gap-3">
        {tokens.map((token) => (
          <TouchableOpacity
            key={token.address}
            onPress={() => onTokenPress?.(token)}
            className="bg-surface rounded-2xl p-4 border border-border active:opacity-70"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-3">
              {/* Token Icon */}
              <View
                className="w-12 h-12 rounded-full items-center justify-center overflow-hidden"
                style={{ backgroundColor: colors.muted + "20" }}
              >
                {token.icon ? (
                  <Image
                    source={{ uri: token.icon }}
                    style={{ width: 40, height: 40 }}
                    contentFit="contain"
                  />
                ) : (
                  <IconSymbol name="bitcoinsign.circle.fill" size={32} color={colors.primary} />
                )}
              </View>

              {/* Token Info */}
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-bold text-foreground">{token.symbol}</Text>
                  <View className="bg-primary/10 px-2 py-0.5 rounded">
                    <Text className="text-primary text-xs font-semibold">{token.name}</Text>
                  </View>
                </View>
                <Text className="text-xs text-muted mt-1">
                  {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </Text>
              </View>

              {/* Balance */}
              <View className="items-end">
                <Text className="text-lg font-bold text-foreground">
                  {parseFloat(token.balance).toFixed(4)}
                </Text>
                {token.priceUSD && (
                  <Text className="text-xs text-muted mt-1">
                    ${(parseFloat(token.balance) * token.priceUSD).toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

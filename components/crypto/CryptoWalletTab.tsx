import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useCryptoWallet } from "@/contexts/CryptoWalletContext";
import { TokenList } from "./TokenList";
import { SwapInterface } from "./SwapInterface";
import { SendTokens } from "./SendTokens";
import { BlockchainChart } from "./BlockchainChart";

type CryptoView = "tokens" | "swap" | "send" | "charts";

export const CryptoWalletTab: React.FC = () => {
  const colors = useColors();
  const { address, isConnected, connectWallet, disconnectWallet, isLoading, refreshBalances } =
    useCryptoWallet();
  const [activeView, setActiveView] = useState<CryptoView>("tokens");

  if (!isConnected) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <View className="bg-surface rounded-3xl p-8 items-center border border-border w-full max-w-md">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <IconSymbol name="bitcoinsign.circle.fill" size={48} color={colors.primary} />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-2">Crypto Wallet</Text>
          <Text className="text-muted text-center mb-6">
            Connect your wallet to access Web3 features including token swaps, transfers, and
            blockchain analytics
          </Text>
          <TouchableOpacity
            onPress={connectWallet}
            disabled={isLoading}
            className="bg-primary rounded-xl px-8 py-4 active:opacity-70 w-full"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text className="text-primary-foreground text-center font-bold text-lg">
                Connect Wallet
              </Text>
            )}
          </TouchableOpacity>
          <View className="mt-6 gap-2">
            <View className="flex-row items-center gap-2">
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text className="text-sm text-muted">Automatic wallet generation</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text className="text-sm text-muted">Secure encrypted storage</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text className="text-sm text-muted">Multi-token support</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const renderActionButtons = () => (
    <View className="flex-row gap-2 p-4 bg-surface border-b border-border">
      <TouchableOpacity
        onPress={() => setActiveView("tokens")}
        className={`flex-1 rounded-xl p-3 ${
          activeView === "tokens" ? "bg-primary" : "bg-background border border-border"
        } active:opacity-70`}
      >
        <View className="items-center gap-1">
          <IconSymbol
            name="wallet.fill"
            size={20}
            color={activeView === "tokens" ? colors.primaryForeground : colors.foreground}
          />
          <Text
            className={`text-xs font-semibold ${
              activeView === "tokens" ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Tokens
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveView("swap")}
        className={`flex-1 rounded-xl p-3 ${
          activeView === "swap" ? "bg-primary" : "bg-background border border-border"
        } active:opacity-70`}
      >
        <View className="items-center gap-1">
          <IconSymbol
            name="arrow.left.arrow.right"
            size={20}
            color={activeView === "swap" ? colors.primaryForeground : colors.foreground}
          />
          <Text
            className={`text-xs font-semibold ${
              activeView === "swap" ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Swap
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveView("send")}
        className={`flex-1 rounded-xl p-3 ${
          activeView === "send" ? "bg-primary" : "bg-background border border-border"
        } active:opacity-70`}
      >
        <View className="items-center gap-1">
          <IconSymbol
            name="paperplane.fill"
            size={20}
            color={activeView === "send" ? colors.primaryForeground : colors.foreground}
          />
          <Text
            className={`text-xs font-semibold ${
              activeView === "send" ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Send
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveView("charts")}
        className={`flex-1 rounded-xl p-3 ${
          activeView === "charts" ? "bg-primary" : "bg-background border border-border"
        } active:opacity-70`}
      >
        <View className="items-center gap-1">
          <IconSymbol
            name="chart.line.uptrend.xyaxis"
            size={20}
            color={activeView === "charts" ? colors.primaryForeground : colors.foreground}
          />
          <Text
            className={`text-xs font-semibold ${
              activeView === "charts" ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Charts
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeView) {
      case "tokens":
        return <TokenList />;
      case "swap":
        return <SwapInterface />;
      case "send":
        return <SendTokens />;
      case "charts":
        return <BlockchainChart />;
      default:
        return <TokenList />;
    }
  };

  return (
    <View className="flex-1">
      {/* Wallet Header */}
      <View className="bg-surface p-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-muted mb-1">Connected Wallet</Text>
            <Text className="text-base font-mono font-bold text-foreground">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={refreshBalances}
              className="bg-background rounded-full p-2 border border-border active:opacity-70"
            >
              <IconSymbol name="arrow.clockwise" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={disconnectWallet}
              className="bg-destructive/10 rounded-full p-2 border border-destructive active:opacity-70"
            >
              <IconSymbol name="power" size={20} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Content */}
      <View className="flex-1">{renderContent()}</View>
    </View>
  );
};

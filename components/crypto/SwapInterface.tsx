import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useCryptoWallet, type Token } from "@/contexts/CryptoWalletContext";

export const SwapInterface: React.FC = () => {
  const colors = useColors();
  const { tokens, swapTokens, isLoading } = useCryptoWallet();

  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [showTokenInModal, setShowTokenInModal] = useState(false);
  const [showTokenOutModal, setShowTokenOutModal] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState("0.5"); // 0.5% slippage

  useEffect(() => {
    // Calculate estimated output amount
    if (tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0) {
      calculateOutputAmount();
    } else {
      setAmountOut("");
    }
  }, [tokenIn, tokenOut, amountIn]);

  const calculateOutputAmount = async () => {
    if (!tokenIn || !tokenOut || !amountIn) return;

    try {
      // In a real app, this would call the backend to get the expected output
      // For now, we'll use a simple mock calculation
      const mockRate = 2000; // 1 SKETH = 2000 SKUSD (example)
      const estimated = parseFloat(amountIn) * mockRate;
      setAmountOut(estimated.toFixed(6));
    } catch (error) {
      console.error("Error calculating output:", error);
    }
  };

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !amountOut) {
      return;
    }

    try {
      setIsSwapping(true);

      // Calculate minimum amount out with slippage
      const slippagePercent = parseFloat(slippage) / 100;
      const minAmountOut = (parseFloat(amountOut) * (1 - slippagePercent)).toString();

      await swapTokens(tokenIn.address, tokenOut.address, amountIn, minAmountOut);

      // Reset form
      setAmountIn("");
      setAmountOut("");
    } catch (error) {
      console.error("Swap error:", error);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwitchTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn("");
    setAmountOut("");
  };

  const renderTokenSelector = (
    token: Token | null,
    onPress: () => void,
    label: string
  ) => (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        className="bg-surface rounded-xl p-3 border border-border active:opacity-70"
      >
        <View className="flex-row items-center justify-between">
          {token ? (
            <View className="flex-row items-center gap-2">
              {token.icon ? (
                <Image
                  source={{ uri: token.icon }}
                  style={{ width: 24, height: 24 }}
                  contentFit="contain"
                />
              ) : (
                <IconSymbol name="bitcoinsign.circle.fill" size={24} color={colors.primary} />
              )}
              <Text className="text-base font-bold text-foreground">{token.symbol}</Text>
            </View>
          ) : (
            <Text className="text-muted">Select token</Text>
          )}
          <IconSymbol name="chevron.down" size={20} color={colors.foreground} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderTokenModal = (
    visible: boolean,
    onClose: () => void,
    onSelect: (token: Token) => void,
    excludeToken?: Token | null
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-background rounded-t-3xl">
          <View className="p-4 border-b border-border">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Select Token</Text>
              <TouchableOpacity onPress={onClose} className="active:opacity-70">
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView className="flex-1 p-4">
            {tokens
              .filter((t) => t.address !== excludeToken?.address)
              .map((token) => (
                <TouchableOpacity
                  key={token.address}
                  onPress={() => {
                    onSelect(token);
                    onClose();
                  }}
                  className="bg-surface rounded-xl p-4 mb-3 border border-border active:opacity-70"
                >
                  <View className="flex-row items-center gap-3">
                    {token.icon ? (
                      <Image
                        source={{ uri: token.icon }}
                        style={{ width: 32, height: 32 }}
                        contentFit="contain"
                      />
                    ) : (
                      <IconSymbol name="bitcoinsign.circle.fill" size={32} color={colors.primary} />
                    )}
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground">{token.symbol}</Text>
                      <Text className="text-xs text-muted">{token.name}</Text>
                    </View>
                    <Text className="text-sm font-semibold text-foreground">
                      {parseFloat(token.balance).toFixed(4)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 p-4">
      <View className="bg-surface rounded-2xl p-4 border border-border gap-4">
        {/* Token In */}
        <View>
          {renderTokenSelector(tokenIn, () => setShowTokenInModal(true), "From")}
          <TextInput
            className="bg-background rounded-xl p-4 mt-2 text-foreground text-lg font-semibold"
            placeholder="0.0"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={amountIn}
            onChangeText={setAmountIn}
          />
          {tokenIn && (
            <Text className="text-xs text-muted mt-1">
              Balance: {parseFloat(tokenIn.balance).toFixed(4)} {tokenIn.symbol}
            </Text>
          )}
        </View>

        {/* Switch Button */}
        <View className="items-center">
          <TouchableOpacity
            onPress={handleSwitchTokens}
            className="bg-primary w-10 h-10 rounded-full items-center justify-center active:opacity-70"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <IconSymbol name="arrow.up.arrow.down" size={20} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>

        {/* Token Out */}
        <View>
          {renderTokenSelector(tokenOut, () => setShowTokenOutModal(true), "To")}
          <TextInput
            className="bg-background rounded-xl p-4 mt-2 text-foreground text-lg font-semibold"
            placeholder="0.0"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={amountOut}
            editable={false}
          />
          {amountOut && (
            <Text className="text-xs text-muted mt-1">
              Estimated output (slippage: {slippage}%)
            </Text>
          )}
        </View>

        {/* Swap Button */}
        <TouchableOpacity
          onPress={handleSwap}
          disabled={!tokenIn || !tokenOut || !amountIn || isSwapping}
          className={`rounded-xl p-4 items-center ${
            !tokenIn || !tokenOut || !amountIn || isSwapping
              ? "bg-muted"
              : "bg-primary active:opacity-70"
          }`}
        >
          {isSwapping ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text className="text-primary-foreground text-lg font-bold">Swap</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Token Selection Modals */}
      {renderTokenModal(showTokenInModal, () => setShowTokenInModal(false), setTokenIn, tokenOut)}
      {renderTokenModal(showTokenOutModal, () => setShowTokenOutModal(false), setTokenOut, tokenIn)}
    </View>
  );
};

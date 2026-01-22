import React, { useState } from "react";
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
import Toast from "react-native-toast-message";

export const SendTokens: React.FC = () => {
  const colors = useColors();
  const { tokens, sendToken } = useCryptoWallet();

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!selectedToken || !recipientAddress || !amount) {
      Toast.show({
        type: "error",
        text1: "Invalid Input",
        text2: "Please fill in all fields",
      });
      return;
    }

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      Toast.show({
        type: "error",
        text1: "Invalid Address",
        text2: "Please enter a valid Ethereum address",
      });
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid amount",
      });
      return;
    }

    if (amountNum > parseFloat(selectedToken.balance)) {
      Toast.show({
        type: "error",
        text1: "Insufficient Balance",
        text2: "You don't have enough tokens",
      });
      return;
    }

    try {
      setIsSending(true);
      await sendToken(selectedToken.address, recipientAddress, amount);

      // Reset form
      setRecipientAddress("");
      setAmount("");
      setSelectedToken(null);
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const setMaxAmount = () => {
    if (selectedToken) {
      setAmount(selectedToken.balance);
    }
  };

  const renderTokenModal = () => (
    <Modal visible={showTokenModal} animationType="slide" transparent>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-background rounded-t-3xl">
          <View className="p-4 border-b border-border">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Select Token</Text>
              <TouchableOpacity
                onPress={() => setShowTokenModal(false)}
                className="active:opacity-70"
              >
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView className="flex-1 p-4">
            {tokens.map((token) => (
              <TouchableOpacity
                key={token.address}
                onPress={() => {
                  setSelectedToken(token);
                  setShowTokenModal(false);
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Token Selection */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Token</Text>
            <TouchableOpacity
              onPress={() => setShowTokenModal(true)}
              className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                {selectedToken ? (
                  <View className="flex-row items-center gap-3">
                    {selectedToken.icon ? (
                      <Image
                        source={{ uri: selectedToken.icon }}
                        style={{ width: 32, height: 32 }}
                        contentFit="contain"
                      />
                    ) : (
                      <IconSymbol name="bitcoinsign.circle.fill" size={32} color={colors.primary} />
                    )}
                    <View>
                      <Text className="text-base font-bold text-foreground">
                        {selectedToken.symbol}
                      </Text>
                      <Text className="text-xs text-muted">
                        Balance: {parseFloat(selectedToken.balance).toFixed(4)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text className="text-muted">Select token</Text>
                )}
                <IconSymbol name="chevron.down" size={20} color={colors.foreground} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Recipient Address */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Recipient Address</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 border border-border text-foreground"
              placeholder="0x..."
              placeholderTextColor={colors.muted}
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Amount */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Amount</Text>
              {selectedToken && (
                <TouchableOpacity onPress={setMaxAmount} className="active:opacity-70">
                  <Text className="text-primary text-sm font-semibold">MAX</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              className="bg-surface rounded-xl p-4 border border-border text-foreground text-lg font-semibold"
              placeholder="0.0"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Transaction Summary */}
          {selectedToken && amount && parseFloat(amount) > 0 && (
            <View className="bg-surface rounded-xl p-4 border border-border gap-2">
              <Text className="text-sm font-semibold text-foreground">Transaction Summary</Text>
              <View className="flex-row justify-between">
                <Text className="text-muted">Token</Text>
                <Text className="text-foreground font-semibold">{selectedToken.symbol}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Amount</Text>
                <Text className="text-foreground font-semibold">
                  {amount} {selectedToken.symbol}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Network Fee</Text>
                <Text className="text-foreground font-semibold">~0.001 ETH</Text>
              </View>
            </View>
          )}

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={!selectedToken || !recipientAddress || !amount || isSending}
            className={`rounded-xl p-4 items-center mt-4 ${
              !selectedToken || !recipientAddress || !amount || isSending
                ? "bg-muted"
                : "bg-primary active:opacity-70"
            }`}
          >
            {isSending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text className="text-primary-foreground text-lg font-bold">Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Token Selection Modal */}
      {renderTokenModal()}
    </View>
  );
};

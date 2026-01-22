import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

type TabType = "banking" | "crypto";

interface WalletTabsProps {
  onTabChange?: (tab: TabType) => void;
  bankingContent: React.ReactNode;
  cryptoContent: React.ReactNode;
}

export const WalletTabs: React.FC<WalletTabsProps> = ({
  onTabChange,
  bankingContent,
  cryptoContent,
}) => {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>("banking");

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <View className="flex-1">
      {/* Tab Headers */}
      <View className="flex-row bg-surface border-b border-border">
        <TouchableOpacity
          onPress={() => handleTabChange("banking")}
          className={`flex-1 flex-row items-center justify-center gap-2 py-4 ${
            activeTab === "banking" ? "border-b-2" : ""
          } active:opacity-70`}
          style={{
            borderBottomColor: activeTab === "banking" ? colors.primary : "transparent",
          }}
        >
          <IconSymbol
            name="creditcard.fill"
            size={20}
            color={activeTab === "banking" ? colors.primary : colors.muted}
          />
          <Text
            className={`font-semibold ${
              activeTab === "banking" ? "text-primary" : "text-muted"
            }`}
          >
            Banking
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabChange("crypto")}
          className={`flex-1 flex-row items-center justify-center gap-2 py-4 ${
            activeTab === "crypto" ? "border-b-2" : ""
          } active:opacity-70`}
          style={{
            borderBottomColor: activeTab === "crypto" ? colors.primary : "transparent",
          }}
        >
          <IconSymbol
            name="bitcoinsign.circle.fill"
            size={20}
            color={activeTab === "crypto" ? colors.primary : colors.muted}
          />
          <Text
            className={`font-semibold ${
              activeTab === "crypto" ? "text-primary" : "text-muted"
            }`}
          >
            Crypto
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTab === "banking" ? bankingContent : cryptoContent}
      </View>
    </View>
  );
};

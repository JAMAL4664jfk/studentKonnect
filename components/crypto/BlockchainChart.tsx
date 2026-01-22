import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useColors } from "@/hooks/use-colors";
import { useCryptoWallet } from "@/contexts/CryptoWalletContext";

type ChartType = "balance" | "volume" | "distribution";

export const BlockchainChart: React.FC = () => {
  const colors = useColors();
  const { tokens } = useCryptoWallet();
  const [selectedChart, setSelectedChart] = useState<ChartType>("balance");

  const screenWidth = Dimensions.get("window").width - 32;

  // Mock data for balance history
  const balanceData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [3200, 3450, 3300, 3600, 3800, 3700, 3900],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Mock data for transaction volume
  const volumeData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [120, 180, 150, 220, 190, 240, 200],
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Token distribution data
  const distributionData = tokens.map((token, index) => {
    const colors = [
      "#3b82f6", // blue
      "#22c55e", // green
      "#f59e0b", // amber
      "#8b5cf6", // purple
      "#ec4899", // pink
    ];
    
    return {
      name: token.symbol,
      balance: parseFloat(token.balance),
      color: colors[index % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    };
  });

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => colors.foreground,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
  };

  const renderChart = () => {
    switch (selectedChart) {
      case "balance":
        return (
          <View>
            <Text className="text-lg font-bold text-foreground mb-2">Balance History</Text>
            <Text className="text-sm text-muted mb-4">Last 7 days</Text>
            <LineChart
              data={balanceData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                borderRadius: 16,
              }}
            />
            <View className="mt-4 bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted">Current Balance</Text>
                <Text className="text-foreground font-bold">$3,900</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted">7-Day Change</Text>
                <Text className="text-success font-bold">+21.9%</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">All-Time High</Text>
                <Text className="text-foreground font-bold">$4,200</Text>
              </View>
            </View>
          </View>
        );

      case "volume":
        return (
          <View>
            <Text className="text-lg font-bold text-foreground mb-2">Transaction Volume</Text>
            <Text className="text-sm text-muted mb-4">Daily transactions (last 7 days)</Text>
            <LineChart
              data={volumeData}
              width={screenWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
              }}
              bezier
              style={{
                borderRadius: 16,
              }}
            />
            <View className="mt-4 bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted">Total Transactions</Text>
                <Text className="text-foreground font-bold">1,300</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted">Avg. Daily Volume</Text>
                <Text className="text-foreground font-bold">186</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Peak Day</Text>
                <Text className="text-foreground font-bold">Saturday (240)</Text>
              </View>
            </View>
          </View>
        );

      case "distribution":
        return (
          <View>
            <Text className="text-lg font-bold text-foreground mb-2">Token Distribution</Text>
            <Text className="text-sm text-muted mb-4">Portfolio breakdown</Text>
            {distributionData.length > 0 ? (
              <>
                <PieChart
                  data={distributionData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="balance"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  style={{
                    borderRadius: 16,
                  }}
                />
                <View className="mt-4 gap-2">
                  {tokens.map((token, index) => (
                    <View
                      key={token.address}
                      className="bg-surface rounded-xl p-3 border border-border flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: distributionData[index]?.color || "#3b82f6",
                          }}
                        />
                        <Text className="text-foreground font-semibold">{token.symbol}</Text>
                      </View>
                      <Text className="text-foreground font-bold">
                        {parseFloat(token.balance).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
                <Text className="text-muted text-center">No tokens to display</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      {/* Chart Type Selector */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          onPress={() => setSelectedChart("balance")}
          className={`flex-1 rounded-xl p-3 ${
            selectedChart === "balance" ? "bg-primary" : "bg-surface border border-border"
          } active:opacity-70`}
        >
          <Text
            className={`text-center font-semibold ${
              selectedChart === "balance" ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Balance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedChart("volume")}
          className={`flex-1 rounded-xl p-3 ${
            selectedChart === "volume" ? "bg-primary" : "bg-surface border border-border"
          } active:opacity-70`}
        >
          <Text
            className={`text-center font-semibold ${
              selectedChart === "volume" ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Volume
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedChart("distribution")}
          className={`flex-1 rounded-xl p-3 ${
            selectedChart === "distribution" ? "bg-primary" : "bg-surface border border-border"
          } active:opacity-70`}
        >
          <Text
            className={`text-center font-semibold ${
              selectedChart === "distribution" ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Distribution
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Display */}
      {renderChart()}
    </ScrollView>
  );
};

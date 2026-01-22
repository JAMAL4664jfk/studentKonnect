import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useWallet } from "@/contexts/WalletContext";
import { CryptoWalletProvider } from "@/contexts/CryptoWalletContext";
import { WalletTabs } from "@/components/wallet/WalletTabs";
import { CryptoWalletTab } from "@/components/crypto/CryptoWalletTab";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { generateTransactionStatement, shareTransactionStatement } from "@/lib/pdf-generator";
import { ActivityIndicator } from "react-native";

type TransactionType = "credit" | "debit";
type TransactionCategory = "general" | "food" | "transport" | "accommodation" | "education" | "entertainment" | "deposit" | "refund" | "reward";

type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  category: TransactionCategory;
  created_at: string;
  recipient_id?: string;
};

type FilterType = "all" | "credit" | "debit";

const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  general: "hsl(231, 48%, 48%)",
  food: "hsl(29, 95%, 55%)",
  transport: "hsl(179, 75%, 45%)",
  accommodation: "hsl(30, 90%, 50%)",
  education: "hsl(142, 76%, 36%)",
  entertainment: "hsl(280, 80%, 55%)",
  deposit: "hsl(142, 76%, 36%)",
  refund: "hsl(179, 75%, 45%)",
  reward: "hsl(330, 81%, 60%)",
};

const CATEGORY_ICONS: Record<TransactionCategory, any> = {
  general: "wallet.fill",
  food: "cart.fill",
  transport: "car.fill",
  accommodation: "building.fill",
  education: "graduation.cap.fill",
  entertainment: "music.note",
  deposit: "plus.circle.fill",
  refund: "arrow.left",
  reward: "heart.fill",
};

function BankingTransactions() {
  const colors = useColors();
  const router = useRouter();
  const { walletId } = useWallet();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [userName, setUserName] = useState<string>("Student Account");
  const [userEmail, setUserEmail] = useState<string>("scholar@student.ac.za");

  const fetchTransactions = async () => {
    try {
      if (!walletId) {
        // Use mock transactions for testing
        const mockTransactions: Transaction[] = [
          {
            id: "1",
            amount: 150.0,
            type: "debit",
            description: "Lunch at Campus Cafeteria",
            category: "food",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            amount: 500.0,
            type: "credit",
            description: "NSFAS Allowance",
            category: "deposit",
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "3",
            amount: 75.5,
            type: "debit",
            description: "Uber to Campus",
            category: "transport",
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("wallet_id", walletId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load transactions",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [walletId]);

  useEffect(() => {
    // Apply filter
    if (filterType === "all") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter((t) => t.type === filterType)
      );
    }
  }, [filterType, transactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "credit";
    const categoryColor = CATEGORY_COLORS[item.category];
    const categoryIcon = CATEGORY_ICONS[item.category];

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedTransaction(item);
          setDetailModalVisible(true);
        }}
        className="bg-surface rounded-2xl p-4 mb-3 active:opacity-70"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: categoryColor + "20" }}
          >
            <IconSymbol name={categoryIcon} size={24} color={categoryColor} />
          </View>

          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground mb-1">
              {item.description}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-muted capitalize">
                {item.category}
              </Text>
              <Text className="text-xs text-muted">•</Text>
              <Text className="text-xs text-muted">
                {formatDate(item.created_at)}
              </Text>
            </View>
          </View>

          <Text
            className={`text-lg font-bold ${
              isCredit ? "text-success" : "text-foreground"
            }`}
          >
            {isCredit ? "+" : "-"}R{Math.abs(item.amount).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Filter Buttons */}
      <View className="flex-row gap-2 p-4 bg-surface border-b border-border">
        <TouchableOpacity
          onPress={() => setFilterType("all")}
          className={`flex-1 rounded-xl p-3 ${
            filterType === "all" ? "bg-primary" : "bg-background border border-border"
          } active:opacity-70`}
        >
          <Text
            className={`text-center font-semibold ${
              filterType === "all" ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterType("credit")}
          className={`flex-1 rounded-xl p-3 ${
            filterType === "credit" ? "bg-success" : "bg-background border border-border"
          } active:opacity-70`}
        >
          <Text
            className={`text-center font-semibold ${
              filterType === "credit" ? "text-white" : "text-foreground"
            }`}
          >
            Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterType("debit")}
          className={`flex-1 rounded-xl p-3 ${
            filterType === "debit" ? "bg-destructive" : "bg-background border border-border"
          } active:opacity-70`}
        >
          <Text
            className={`text-center font-semibold ${
              filterType === "debit" ? "text-white" : "text-foreground"
            }`}
          >
            Expenses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <IconSymbol name="doc.text" size={48} color={colors.muted} />
            <Text className="text-muted mt-4 text-center">
              No transactions found
            </Text>
          </View>
        }
      />
    </View>
  );
}

export default function TransactionsWithTabsScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <CryptoWalletProvider>
      <ScreenContainer className="flex-1" edges={["top", "left", "right"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 bg-surface border-b border-border">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="active:opacity-70"
            >
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Wallet</Text>
          </View>
        </View>

        {/* Tabbed Content */}
        <WalletTabs
          bankingContent={<BankingTransactions />}
          cryptoContent={<CryptoWalletTab />}
        />
      </ScreenContainer>
    </CryptoWalletProvider>
  );
}

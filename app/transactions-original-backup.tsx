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
import { supabase, safeGetUser } from "@/lib/supabase";
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

export default function TransactionsScreen() {
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
          {
            id: "4",
            amount: 200.0,
            type: "debit",
            description: "Textbooks",
            category: "education",
            created_at: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: "5",
            amount: 1000.0,
            type: "credit",
            description: "Monthly Allowance",
            category: "deposit",
            created_at: new Date(Date.now() - 604800000).toISOString(),
          },
          {
            id: "6",
            amount: 300.0,
            type: "debit",
            description: "Accommodation Payment",
            category: "accommodation",
            created_at: new Date(Date.now() - 864000000).toISOString(),
          },
          {
            id: "7",
            amount: 50.0,
            type: "credit",
            description: "Referral Reward",
            category: "reward",
            created_at: new Date(Date.now() - 1209600000).toISOString(),
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
    loadUserProfile();
  }, [walletId]);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (user) {
        setUserEmail(user.email || "scholar@student.ac.za");
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserName(profile.full_name || "Student Account");
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleDownloadStatement = async () => {
    if (filteredTransactions.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No Transactions',
        text2: 'There are no transactions to export',
      });
      return;
    }

    setGeneratingPDF(true);

    try {
      // Convert transactions to PDF format
      const pdfTransactions = filteredTransactions.map(t => ({
        id: t.id,
        type: t.type === 'credit' ? 'income' as const : 'expense' as const,
        amount: t.amount,
        description: t.description,
        category: t.category,
        date: t.created_at,
      }));

      // Generate PDF
      const pdfUri = await generateTransactionStatement({
        transactions: pdfTransactions,
        userName,
        userEmail,
      });

      if (!pdfUri) {
        throw new Error('Failed to generate PDF');
      }

      // Share PDF
      const shared = await shareTransactionStatement(pdfUri);

      if (shared) {
        Toast.show({
          type: 'success',
          text1: 'Statement Generated',
          text2: 'Your transaction statement has been created',
        });
      }
    } catch (error: any) {
      console.error('Error generating statement:', error);
      Toast.show({
        type: 'error',
        text1: 'Generation Failed',
        text2: error.message || 'Failed to generate statement',
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

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

  const openTransactionDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "credit";
    const categoryColor = CATEGORY_COLORS[item.category];
    const categoryIcon = CATEGORY_ICONS[item.category];

    return (
      <TouchableOpacity
        onPress={() => openTransactionDetail(item)}
        className="bg-surface rounded-2xl p-4 mb-3 active:opacity-70"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-3">
          {/* Icon */}
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: categoryColor + "20" }}
          >
            <IconSymbol name={categoryIcon} size={24} color={categoryColor} />
          </View>

          {/* Transaction Info */}
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

          {/* Amount */}
          <View className="items-end">
            <Text
              className={`text-lg font-bold ${
                isCredit ? "text-success" : "text-foreground"
              }`}
            >
              {isCredit ? "+" : "-"}R{Math.abs(item.amount).toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      onPress={() => setFilterType(type)}
      className={`px-4 py-2 rounded-full ${
        filterType === type ? "bg-primary" : "bg-surface"
      }`}
      style={{
        borderWidth: 1,
        borderColor: filterType === type ? "transparent" : colors.border,
      }}
    >
      <Text
        className={`text-sm font-medium ${
          filterType === type ? "text-white" : "text-foreground"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const totalCredit = filteredTransactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = filteredTransactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <View className="flex-1 gap-4">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">
              Transactions
            </Text>
            <Text className="text-sm text-muted">
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleDownloadStatement}
              disabled={generatingPDF}
              className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-70"
              style={{ opacity: generatingPDF ? 0.5 : 1 }}
            >
              {generatingPDF ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <IconSymbol name="arrow.down.circle.fill" size={20} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center active:opacity-70"
            >
              <IconSymbol name="arrow.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        <View className="flex-row gap-3">
          <View
            className="flex-1 bg-success rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-white text-xs opacity-90 mb-1">Income</Text>
            <Text className="text-white text-2xl font-bold">
              R{totalCredit.toFixed(2)}
            </Text>
          </View>
          <View
            className="flex-1 bg-error rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-white text-xs opacity-90 mb-1">Expenses</Text>
            <Text className="text-white text-2xl font-bold">
              R{totalDebit.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View className="flex-row gap-2">
          {renderFilterButton("all", "All")}
          {renderFilterButton("credit", "Income")}
          {renderFilterButton("debit", "Expenses")}
        </View>

        {/* Transaction List */}
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <IconSymbol
                name="wallet.fill"
                size={48}
                color={colors.muted}
              />
              <Text className="text-muted text-base mt-4">
                No transactions yet
              </Text>
            </View>
          }
        />
      </View>

      {/* Transaction Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="bg-background rounded-t-3xl p-6"
            style={{
              maxHeight: "80%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedTransaction && (
                <View className="gap-6">
                  {/* Header */}
                  <View className="items-center gap-3">
                    <View
                      className="w-16 h-16 rounded-full items-center justify-center"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[selectedTransaction.category] + "20",
                      }}
                    >
                      <IconSymbol
                        name={CATEGORY_ICONS[selectedTransaction.category]}
                        size={32}
                        color={CATEGORY_COLORS[selectedTransaction.category]}
                      />
                    </View>
                    <Text
                      className={`text-4xl font-bold ${
                        selectedTransaction.type === "credit"
                          ? "text-success"
                          : "text-foreground"
                      }`}
                    >
                      {selectedTransaction.type === "credit" ? "+" : "-"}R
                      {Math.abs(selectedTransaction.amount).toFixed(2)}
                    </Text>
                    <Text className="text-lg font-semibold text-foreground text-center">
                      {selectedTransaction.description}
                    </Text>
                  </View>

                  {/* Details */}
                  <View className="gap-4">
                    <View className="flex-row justify-between py-3 border-b border-border">
                      <Text className="text-muted">Type</Text>
                      <Text className="text-foreground font-medium capitalize">
                        {selectedTransaction.type}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-3 border-b border-border">
                      <Text className="text-muted">Category</Text>
                      <Text className="text-foreground font-medium capitalize">
                        {selectedTransaction.category}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-3 border-b border-border">
                      <Text className="text-muted">Date</Text>
                      <Text className="text-foreground font-medium">
                        {new Date(
                          selectedTransaction.created_at
                        ).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-3 border-b border-border">
                      <Text className="text-muted">Time</Text>
                      <Text className="text-foreground font-medium">
                        {new Date(
                          selectedTransaction.created_at
                        ).toLocaleTimeString("en-ZA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-3">
                      <Text className="text-muted">Transaction ID</Text>
                      <Text className="text-foreground font-medium font-mono text-xs">
                        {selectedTransaction.id.substring(0, 8).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                    className="bg-primary rounded-xl py-4 items-center active:opacity-80 mt-4"
                  >
                    <Text className="text-white text-base font-semibold">
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

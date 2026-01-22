import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, type Wallet, type Transaction } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface WalletContextType {
  balance: number;
  walletId: string | null;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
  deductFromBalance: (
    amount: number,
    description: string,
    category?: string,
    recipientId?: string
  ) => Promise<boolean>;
  addToBalance: (
    amount: number,
    description: string,
    type?: "deposit" | "refund" | "reward",
    category?: string
  ) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWalletBalance = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Use mock balance for testing when not authenticated
        setBalance(3245.5);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("fiat_wallets")
        .select("id, balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBalance(Number(data.balance));
        setWalletId(data.id);
      } else {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: insertError } = await supabase
          .from("fiat_wallets")
          .insert({ user_id: user.id, balance: 1000.0 })
          .select("id, balance")
          .single();

        if (insertError) throw insertError;

        if (newWallet) {
          setBalance(Number(newWallet.balance));
          setWalletId(newWallet.id);
        }
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load wallet balance",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  const deductFromBalance = async (
    amount: number,
    description: string,
    category?: string,
    recipientId?: string
  ): Promise<boolean> => {
    if (amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Amount must be greater than zero",
      });
      return false;
    }

    if (balance < amount) {
      Toast.show({
        type: "error",
        text1: "Insufficient Funds",
        text2: "You don't have enough balance for this transaction",
      });
      return false;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !walletId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please log in to continue",
        });
        return false;
      }

      const newBalance = balance - amount;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from("fiat_wallets")
        .update({ balance: newBalance })
        .eq("id", walletId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        wallet_id: walletId,
        amount: -amount,
        type: "debit",
        description,
        category: category || "general",
        recipient_id: recipientId,
      });

      if (transactionError) throw transactionError;

      setBalance(newBalance);

      Toast.show({
        type: "success",
        text1: "Transaction Successful",
        text2: `R${amount.toFixed(2)} deducted from your wallet`,
      });

      return true;
    } catch (error) {
      console.error("Error deducting from balance:", error);
      Toast.show({
        type: "error",
        text1: "Transaction Failed",
        text2: "Failed to process transaction",
      });
      return false;
    }
  };

  const addToBalance = async (
    amount: number,
    description: string,
    type: "deposit" | "refund" | "reward" = "deposit",
    category?: string
  ): Promise<boolean> => {
    if (amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Amount must be greater than zero",
      });
      return false;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !walletId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please log in to continue",
        });
        return false;
      }

      const newBalance = balance + amount;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from("fiat_wallets")
        .update({ balance: newBalance })
        .eq("id", walletId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        wallet_id: walletId,
        amount: amount,
        type: "credit",
        description,
        category: category || type,
      });

      if (transactionError) throw transactionError;

      setBalance(newBalance);

      Toast.show({
        type: "success",
        text1: "Transaction Successful",
        text2: `R${amount.toFixed(2)} added to your wallet`,
      });

      return true;
    } catch (error) {
      console.error("Error adding to balance:", error);
      Toast.show({
        type: "error",
        text1: "Transaction Failed",
        text2: "Failed to process transaction",
      });
      return false;
    }
  };

  const refreshBalance = async () => {
    await fetchWalletBalance();
  };

  useEffect(() => {
    fetchWalletBalance();

    // Set up real-time subscription for wallet updates
    let channel: RealtimeChannel | null = null;

    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && walletId) {
        channel = supabase
          .channel(`wallet:${walletId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "wallets",
              filter: `id=eq.${walletId}`,
            },
            (payload: any) => {
              if (payload.new && payload.new.balance !== undefined) {
                setBalance(Number(payload.new.balance));
              }
            }
          )
          .subscribe();
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [walletId]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        walletId,
        isLoading,
        refreshBalance,
        updateBalance,
        deductFromBalance,
        addToBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

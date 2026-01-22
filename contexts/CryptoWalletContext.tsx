import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";
import Toast from "react-native-toast-message";
import { getApiBaseUrl, getRpcUrl, API_ENDPOINTS, apiRequest } from "@/utils/api-config";

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: string;
  icon: string;
  priceUSD?: number;
}

interface CryptoTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
}

interface CryptoWalletContextType {
  address: string | null;
  isConnected: boolean;
  tokens: Token[];
  transactions: CryptoTransaction[];
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalances: () => Promise<void>;
  getTokenBalance: (tokenAddress: string) => Promise<string>;
  sendToken: (tokenAddress: string, to: string, amount: string) => Promise<string>;
  swapTokens: (
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
    minAmountOut: string
  ) => Promise<string>;
}

const CryptoWalletContext = createContext<CryptoWalletContextType | undefined>(undefined);

// Token configurations with icons
const TOKEN_CONFIGS: Omit<Token, "balance">[] = [
  {
    symbol: "SKETH",
    name: "Student Konnect ETH",
    address: "", // Will be set after deployment
    decimals: 18,
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    symbol: "SKUSD",
    name: "Student Konnect USD",
    address: "",
    decimals: 6,
    icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  },
  {
    symbol: "SKBTC",
    name: "Student Konnect BTC",
    address: "",
    decimals: 8,
    icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  },
  {
    symbol: "SKDAI",
    name: "Student Konnect DAI",
    address: "",
    decimals: 18,
    icon: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
  },
];

export const CryptoWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);

  useEffect(() => {
    // Initialize provider
    const initProvider = async () => {
      try {
        // Connect to blockchain RPC (automatically handles platform differences)
        const rpcUrl = getRpcUrl();
        console.log("Connecting to RPC:", rpcUrl);
        const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
        setProvider(rpcProvider);
      } catch (error) {
        console.error("Failed to initialize provider:", error);
      }
    };

    initProvider();
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);

      // Create wallet via backend API (automatically handles platform differences)
      console.log("Connecting to API:", getApiBaseUrl());
      
      const data = await apiRequest(API_ENDPOINTS.createWallet, {
        method: "POST",
        body: JSON.stringify({
          userId: "default-user"
        }),
      });
      setAddress(data.address);
      setIsConnected(true);

      // Load token configurations from backend
      await loadTokenConfigs();
      await refreshBalances();

      Toast.show({
        type: "success",
        text1: "Wallet Connected",
        text2: `Address: ${data.address.slice(0, 6)}...${data.address.slice(-4)}`,
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      Toast.show({
        type: "error",
        text1: "Connection Failed",
        text2: error.message || "Failed to connect wallet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setTokens([]);
    setTransactions([]);

    Toast.show({
      type: "info",
      text1: "Wallet Disconnected",
      text2: "Your wallet has been disconnected",
    });
  };

  const loadTokenConfigs = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.getTokens);
      // Update TOKEN_CONFIGS with deployed addresses
      TOKEN_CONFIGS.forEach((config, index) => {
        if (data.tokens[config.symbol]) {
          TOKEN_CONFIGS[index].address = data.tokens[config.symbol];
        }
      });
    } catch (error) {
      console.error("Error loading token configs:", error);
    }
  };

  const refreshBalances = async () => {
    if (!address || !provider) return;

    try {
      setIsLoading(true);

      const updatedTokens: Token[] = [];

      for (const tokenConfig of TOKEN_CONFIGS) {
        if (!tokenConfig.address) continue;

        const balance = await getTokenBalance(tokenConfig.address);
        updatedTokens.push({
          ...tokenConfig,
          balance,
        });
      }

      setTokens(updatedTokens);
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenBalance = async (tokenAddress: string): Promise<string> => {
    if (!address || !provider) return "0";

    try {
      const tokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];

      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
      const balance = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();

      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0";
    }
  };

  const sendToken = async (
    tokenAddress: string,
    to: string,
    amount: string
  ): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");

    try {
      // Call backend API to send tokens
      const data = await apiRequest(API_ENDPOINTS.sendTransaction, {
        method: "POST",
        body: JSON.stringify({
          from: address,
          to,
          tokenAddress,
          amount,
        }),
      });

      Toast.show({
        type: "success",
        text1: "Transaction Sent",
        text2: "Your transaction is being processed",
      });

      // Refresh balances after transaction
      setTimeout(() => refreshBalances(), 3000);

      return data.txHash;
    } catch (error: any) {
      console.error("Error sending token:", error);
      Toast.show({
        type: "error",
        text1: "Transaction Failed",
        text2: error.message || "Failed to send transaction",
      });
      throw error;
    }
  };

  const swapTokens = async (
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
    minAmountOut: string
  ): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");

    try {
      // Call backend API to swap tokens
      const data = await apiRequest(API_ENDPOINTS.swapTransaction, {
        method: "POST",
        body: JSON.stringify({
          from: address,
          tokenInAddress,
          tokenOutAddress,
          amountIn,
          minAmountOut,
        }),
      });

      Toast.show({
        type: "success",
        text1: "Swap Successful",
        text2: `Swapped ${amountIn} tokens`,
      });

      // Refresh balances after swap
      setTimeout(() => refreshBalances(), 3000);

      return data.txHash;
    } catch (error: any) {
      console.error("Error swapping tokens:", error);
      Toast.show({
        type: "error",
        text1: "Swap Failed",
        text2: error.message || "Failed to swap tokens",
      });
      throw error;
    }
  };

  return (
    <CryptoWalletContext.Provider
      value={{
        address,
        isConnected,
        tokens,
        transactions,
        isLoading,
        connectWallet,
        disconnectWallet,
        refreshBalances,
        getTokenBalance,
        sendToken,
        swapTokens,
      }}
    >
      {children}
    </CryptoWalletContext.Provider>
  );
};

export const useCryptoWallet = () => {
  const context = useContext(CryptoWalletContext);
  if (context === undefined) {
    throw new Error("useCryptoWallet must be used within a CryptoWalletProvider");
  }
  return context;
};

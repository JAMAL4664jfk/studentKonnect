import { Router } from "express";
import {
  createWallet,
  getWalletAddress,
  initializeHardhatWallets,
} from "./wallet-service";
import {
  getTokenBalance,
  getTokenInfo,
  sendTokens,
  swapTokens,
  getSwapQuote,
  getDeployedTokens,
  reloadDeploymentInfo,
} from "./blockchain-service";
import { ensureBlockchainInitialized } from "./blockchain-init";
import { getAutoFundingService } from "./auto-funding";

const router = Router();

/**
 * POST /api/crypto/wallet/create
 * Create or get wallet for user
 */
router.post("/wallet/create", async (req, res) => {
  try {
    // Ensure blockchain is initialized
    await ensureBlockchainInitialized();

    // In production, get userId from authenticated session
    const userId = req.body.userId || "default-user";

    const wallet = await createWallet(userId);

    // Auto-fund wallet in development mode
    const autoFunding = getAutoFundingService();
    await autoFunding.autoFundIfNeeded(wallet.address);

    res.json({
      success: true,
      address: wallet.address,
    });
  } catch (error: any) {
    console.error("Error creating wallet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create wallet",
    });
  }
});

/**
 * GET /api/crypto/wallet/:address
 * Get wallet info
 */
router.get("/wallet/:address", async (req, res) => {
  try {
    const { address } = req.params;

    // Return basic wallet info
    res.json({
      success: true,
      address,
      network: "Hardhat Local",
      chainId: 1337,
    });
  } catch (error: any) {
    console.error("Error getting wallet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get wallet",
    });
  }
});

/**
 * GET /api/crypto/wallet/:address/balance
 * Get token balances for wallet
 */
router.get("/wallet/:address/balance", async (req, res) => {
  try {
    const { address } = req.params;
    const tokens = getDeployedTokens();

    const balances: Record<string, string> = {};

    for (const [symbol, tokenAddress] of Object.entries(tokens)) {
      if (symbol === "TokenSwap") continue;
      if (!tokenAddress) continue;

      try {
        const balance = await getTokenBalance(address, tokenAddress);
        balances[symbol] = balance;
      } catch (error) {
        console.error(`Error getting balance for ${symbol}:`, error);
        balances[symbol] = "0";
      }
    }

    res.json({
      success: true,
      balances,
    });
  } catch (error: any) {
    console.error("Error getting balances:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get balances",
    });
  }
});

/**
 * POST /api/crypto/transaction/send
 * Send tokens
 */
router.post("/transaction/send", async (req, res) => {
  try {
    const { from, to, tokenAddress, amount } = req.body;

    if (!from || !to || !tokenAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // In production, get userId from authenticated session
    const userId = "default-user";

    const result = await sendTokens(userId, tokenAddress, to, amount);

    res.json({
      success: true,
      txHash: result.txHash,
    });
  } catch (error: any) {
    console.error("Error sending tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send tokens",
    });
  }
});

/**
 * POST /api/crypto/transaction/swap
 * Swap tokens
 */
router.post("/transaction/swap", async (req, res) => {
  try {
    const { from, tokenInAddress, tokenOutAddress, amountIn, minAmountOut } = req.body;

    if (!from || !tokenInAddress || !tokenOutAddress || !amountIn || !minAmountOut) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // In production, get userId from authenticated session
    const userId = "default-user";

    const result = await swapTokens(
      userId,
      tokenInAddress,
      tokenOutAddress,
      amountIn,
      minAmountOut
    );

    res.json({
      success: true,
      txHash: result.txHash,
      amountOut: result.amountOut,
    });
  } catch (error: any) {
    console.error("Error swapping tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to swap tokens",
    });
  }
});

/**
 * GET /api/crypto/transaction/:hash
 * Get transaction status
 */
router.get("/transaction/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    // In a real app, query the blockchain for transaction status
    res.json({
      success: true,
      hash,
      status: "confirmed",
      blockNumber: 12345,
    });
  } catch (error: any) {
    console.error("Error getting transaction:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get transaction",
    });
  }
});

/**
 * GET /api/crypto/tokens
 * Get list of supported tokens
 */
router.get("/tokens", async (req, res) => {
  try {
    const tokens = getDeployedTokens();

    res.json({
      success: true,
      tokens,
    });
  } catch (error: any) {
    console.error("Error getting tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get tokens",
    });
  }
});

/**
 * GET /api/crypto/tokens/:address/info
 * Get token info
 */
router.get("/tokens/:address/info", async (req, res) => {
  try {
    const { address } = req.params;

    const info = await getTokenInfo(address);

    res.json({
      success: true,
      ...info,
    });
  } catch (error: any) {
    console.error("Error getting token info:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get token info",
    });
  }
});

/**
 * POST /api/crypto/swap/quote
 * Get swap quote
 */
router.post("/swap/quote", async (req, res) => {
  try {
    const { tokenInAddress, tokenOutAddress, amountIn } = req.body;

    if (!tokenInAddress || !tokenOutAddress || !amountIn) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const quote = await getSwapQuote(tokenInAddress, tokenOutAddress, amountIn);

    res.json({
      success: true,
      ...quote,
    });
  } catch (error: any) {
    console.error("Error getting swap quote:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get swap quote",
    });
  }
});

/**
 * POST /api/crypto/reload
 * Reload deployment info (for development)
 */
router.post("/reload", async (req, res) => {
  try {
    reloadDeploymentInfo();
    await initializeHardhatWallets();

    res.json({
      success: true,
      message: "Deployment info reloaded",
    });
  } catch (error: any) {
    console.error("Error reloading:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to reload",
    });
  }
});

export default router;

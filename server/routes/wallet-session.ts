import { Router } from "express";
import {
  upsertWalletSession,
  getWalletSessionByPhone,
  updateAccessToken,
  deactivateWalletSession,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  TokenData,
} from "../wallet-session-db";

const router = Router();

/**
 * Store wallet session tokens
 * POST /api/wallet-session/store
 */
router.post("/wallet-session/store", async (req, res) => {
  try {
    const { userId, phoneNumber, customerId, tokenData } = req.body;

    if (!userId || !phoneNumber || !tokenData) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, phoneNumber, tokenData",
      });
    }

    await upsertWalletSession(userId, phoneNumber, customerId, tokenData);

    res.json({
      success: true,
      message: "Session stored successfully",
    });
  } catch (error: any) {
    console.error("[Wallet Session API] Store error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to store session",
    });
  }
});

/**
 * Get wallet session by phone number
 * GET /api/wallet-session/:phoneNumber
 */
router.get("/wallet-session/:phoneNumber", async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const session = await getWalletSessionByPhone(phoneNumber);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active session found",
      });
    }

    // Check if tokens are expired
    const accessExpired = isAccessTokenExpired(session);
    const refreshExpired = isRefreshTokenExpired(session);

    res.json({
      success: true,
      session: {
        phoneNumber: session.phoneNumber,
        customerId: session.customerId,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        accessTokenExpiresAt: session.accessTokenExpiresAt,
        refreshTokenExpiresAt: session.refreshTokenExpiresAt,
        isAccessTokenExpired: accessExpired,
        isRefreshTokenExpired: refreshExpired,
      },
    });
  } catch (error: any) {
    console.error("[Wallet Session API] Get error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get session",
    });
  }
});

/**
 * Update access token after refresh
 * POST /api/wallet-session/refresh
 */
router.post("/wallet-session/refresh", async (req, res) => {
  try {
    const { phoneNumber, accessToken, accessTokenExpiresIn } = req.body;

    if (!phoneNumber || !accessToken || !accessTokenExpiresIn) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: phoneNumber, accessToken, accessTokenExpiresIn",
      });
    }

    await updateAccessToken(phoneNumber, accessToken, accessTokenExpiresIn);

    res.json({
      success: true,
      message: "Access token updated successfully",
    });
  } catch (error: any) {
    console.error("[Wallet Session API] Refresh error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update access token",
    });
  }
});

/**
 * Logout - deactivate session
 * POST /api/wallet-session/logout
 */
router.post("/wallet-session/logout", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    await deactivateWalletSession(phoneNumber);

    res.json({
      success: true,
      message: "Session deactivated successfully",
    });
  } catch (error: any) {
    console.error("[Wallet Session API] Logout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to deactivate session",
    });
  }
});

export default router;

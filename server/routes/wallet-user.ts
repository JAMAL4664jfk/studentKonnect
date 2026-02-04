import { Router } from "express";
import { getDb } from "../db";
import { users, walletSessions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Get or create a user for wallet authentication
 * POST /api/wallet-user/get-or-create
 */
router.post("/wallet-user/get-or-create", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database not available",
      });
    }

    // Check if wallet session already exists for this phone number
    const existingSession = await db
      .select()
      .from(walletSessions)
      .where(eq(walletSessions.phoneNumber, phoneNumber))
      .limit(1);

    if (existingSession.length > 0) {
      // User already exists, return their ID
      return res.json({
        success: true,
        userId: existingSession[0].userId,
        message: "User found",
      });
    }

    // Create a new temporary user for wallet-only authentication
    const openId = `wallet_${phoneNumber}_${Date.now()}`;
    
    const newUser = await db
      .insert(users)
      .values({
        openId,
        name: phoneNumber,
        email: null,
        loginMethod: "wallet",
        role: "user",
      })
      .returning();

    if (newUser.length > 0) {
      console.log(`✅ [Wallet User API] Created temp user for wallet: ${phoneNumber}`);
      return res.json({
        success: true,
        userId: newUser[0].id,
        message: "User created",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to create user",
      });
    }
  } catch (error: any) {
    console.error("[Wallet User API] Get/Create error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get or create user",
    });
  }
});

/**
 * Link wallet account to OAuth user
 * POST /api/wallet-user/link
 */
router.post("/wallet-user/link", async (req, res) => {
  try {
    const { userId, phoneNumber } = req.body;

    if (!userId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, phoneNumber",
      });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database not available",
      });
    }

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update wallet session to link to this user
    const existingSession = await db
      .select()
      .from(walletSessions)
      .where(eq(walletSessions.phoneNumber, phoneNumber))
      .limit(1);

    if (existingSession.length > 0) {
      // Update existing session with new userId
      await db
        .update(walletSessions)
        .set({
          userId,
          updatedAt: new Date(),
        })
        .where(eq(walletSessions.phoneNumber, phoneNumber));

      console.log(`✅ [Wallet User API] Linked wallet ${phoneNumber} to user ${userId}`);
    }

    res.json({
      success: true,
      message: "Wallet linked successfully",
    });
  } catch (error: any) {
    console.error("[Wallet User API] Link error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to link wallet",
    });
  }
});

/**
 * Check if user has a linked wallet
 * GET /api/wallet-user/check/:userId
 */
router.get("/wallet-user/check/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database not available",
      });
    }

    const session = await db
      .select()
      .from(walletSessions)
      .where(eq(walletSessions.userId, userId))
      .limit(1);

    res.json({
      success: true,
      hasWallet: session.length > 0,
      phoneNumber: session.length > 0 ? session[0].phoneNumber : null,
    });
  } catch (error: any) {
    console.error("[Wallet User API] Check error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check wallet",
    });
  }
});

export default router;

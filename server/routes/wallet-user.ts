import { Router } from "express";
import { getDb } from "../db";
import { users, walletSessions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Get or create a standalone wallet user (NOT linked to OAuth)
 * POST /api/wallet-user/get-or-create
 * 
 * This creates independent wallet users that are separate from OAuth accounts.
 * Each wallet user is identified by their phone number.
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
      // Wallet user already exists, return their ID
      console.log(`✅ [Wallet User API] Found existing wallet user for: ${phoneNumber}`);
      return res.json({
        success: true,
        userId: existingSession[0].userId,
        message: "Wallet user found",
      });
    }

    // Create a new standalone wallet user
    // This user is INDEPENDENT from OAuth and only used for wallet features
    const openId = `wallet_${phoneNumber}_${Date.now()}`;
    
    const newUser = await db
      .insert(users)
      .values({
        openId,
        name: `Wallet User ${phoneNumber}`,
        email: null,
        loginMethod: "wallet",
        role: "user",
      })
      .returning();

    if (newUser.length > 0) {
      console.log(`✅ [Wallet User API] Created standalone wallet user for: ${phoneNumber}`);
      return res.json({
        success: true,
        userId: newUser[0].id,
        message: "Wallet user created",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to create wallet user",
      });
    }
  } catch (error: any) {
    console.error("[Wallet User API] Get/Create error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get or create wallet user",
    });
  }
});

export default router;

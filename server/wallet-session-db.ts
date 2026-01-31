import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { walletSessions, InsertWalletSession, WalletSession } from "../drizzle/schema";

/**
 * Wallet Session Database Service
 * Manages wallet authentication tokens in Supabase PostgreSQL
 */

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number; // seconds
  refreshTokenExpiresIn: number; // seconds
}

/**
 * Store or update wallet session tokens
 */
export async function upsertWalletSession(
  userId: number,
  phoneNumber: string,
  customerId: string | null,
  tokenData: TokenData
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[WalletSessionDB] Cannot upsert session: database not available");
    throw new Error("Database not available");
  }

  try {
    const now = new Date();
    const accessTokenExpiresAt = new Date(now.getTime() + tokenData.accessTokenExpiresIn * 1000);
    const refreshTokenExpiresAt = new Date(now.getTime() + tokenData.refreshTokenExpiresIn * 1000);

    const sessionData: InsertWalletSession = {
      userId,
      phoneNumber,
      customerId: customerId || null,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      isActive: true,
      lastRefreshedAt: now,
      updatedAt: now,
    };

    // Check if session exists for this phone number
    const existingSession = await db
      .select()
      .from(walletSessions)
      .where(eq(walletSessions.phoneNumber, phoneNumber))
      .limit(1);

    if (existingSession.length > 0) {
      // Update existing session
      await db
        .update(walletSessions)
        .set({
          userId,
          customerId: customerId || null,
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          isActive: true,
          lastRefreshedAt: now,
          updatedAt: now,
        })
        .where(eq(walletSessions.phoneNumber, phoneNumber));
      
      console.log(`✅ [WalletSessionDB] Updated session for phone: ${phoneNumber}`);
    } else {
      // Insert new session
      await db.insert(walletSessions).values(sessionData);
      console.log(`✅ [WalletSessionDB] Created new session for phone: ${phoneNumber}`);
    }
  } catch (error) {
    console.error("[WalletSessionDB] Failed to upsert session:", error);
    throw error;
  }
}

/**
 * Get active wallet session by phone number
 */
export async function getWalletSessionByPhone(phoneNumber: string): Promise<WalletSession | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[WalletSessionDB] Cannot get session: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(walletSessions)
      .where(
        and(
          eq(walletSessions.phoneNumber, phoneNumber),
          eq(walletSessions.isActive, true)
        )
      )
      .limit(1);

    if (result.length > 0) {
      console.log(`✅ [WalletSessionDB] Found session for phone: ${phoneNumber}`);
      return result[0];
    }

    console.log(`ℹ️ [WalletSessionDB] No active session found for phone: ${phoneNumber}`);
    return null;
  } catch (error) {
    console.error("[WalletSessionDB] Failed to get session:", error);
    return null;
  }
}

/**
 * Get active wallet session by user ID
 */
export async function getWalletSessionByUserId(userId: number): Promise<WalletSession | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[WalletSessionDB] Cannot get session: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(walletSessions)
      .where(
        and(
          eq(walletSessions.userId, userId),
          eq(walletSessions.isActive, true)
        )
      )
      .limit(1);

    if (result.length > 0) {
      console.log(`✅ [WalletSessionDB] Found session for userId: ${userId}`);
      return result[0];
    }

    console.log(`ℹ️ [WalletSessionDB] No active session found for userId: ${userId}`);
    return null;
  } catch (error) {
    console.error("[WalletSessionDB] Failed to get session:", error);
    return null;
  }
}

/**
 * Update access token after refresh
 */
export async function updateAccessToken(
  phoneNumber: string,
  accessToken: string,
  accessTokenExpiresIn: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[WalletSessionDB] Cannot update token: database not available");
    throw new Error("Database not available");
  }

  try {
    const now = new Date();
    const accessTokenExpiresAt = new Date(now.getTime() + accessTokenExpiresIn * 1000);

    await db
      .update(walletSessions)
      .set({
        accessToken,
        accessTokenExpiresAt,
        lastRefreshedAt: now,
        updatedAt: now,
      })
      .where(eq(walletSessions.phoneNumber, phoneNumber));

    console.log(`✅ [WalletSessionDB] Updated access token for phone: ${phoneNumber}`);
  } catch (error) {
    console.error("[WalletSessionDB] Failed to update access token:", error);
    throw error;
  }
}

/**
 * Deactivate wallet session (logout)
 */
export async function deactivateWalletSession(phoneNumber: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[WalletSessionDB] Cannot deactivate session: database not available");
    return;
  }

  try {
    await db
      .update(walletSessions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(walletSessions.phoneNumber, phoneNumber));

    console.log(`✅ [WalletSessionDB] Deactivated session for phone: ${phoneNumber}`);
  } catch (error) {
    console.error("[WalletSessionDB] Failed to deactivate session:", error);
  }
}

/**
 * Check if access token is expired
 */
export function isAccessTokenExpired(session: WalletSession, bufferMinutes: number = 5): boolean {
  const now = new Date();
  const expiryWithBuffer = new Date(session.accessTokenExpiresAt.getTime() - bufferMinutes * 60 * 1000);
  return now >= expiryWithBuffer;
}

/**
 * Check if refresh token is expired
 */
export function isRefreshTokenExpired(session: WalletSession): boolean {
  const now = new Date();
  return now >= session.refreshTokenExpiresAt;
}

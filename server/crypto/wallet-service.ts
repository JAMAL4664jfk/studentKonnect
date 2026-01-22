import { ethers } from "ethers";
import crypto from "crypto";

interface WalletData {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

interface EncryptedWallet {
  address: string;
  encryptedPrivateKey: string;
  iv: string;
}

// In-memory storage for demo (in production, use a database)
const wallets = new Map<string, EncryptedWallet>();

// Encryption key (in production, use environment variable)
const ENCRYPTION_KEY = process.env.PRIVATE_KEY_ENCRYPTION_KEY || 
  crypto.randomBytes(32).toString("hex");

/**
 * Encrypt private key
 */
function encryptPrivateKey(privateKey: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypt private key
 */
function decryptPrivateKey(encrypted: string, iv: string): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(iv, "hex")
  );

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Create a new wallet
 */
export async function createWallet(userId: string): Promise<{ address: string }> {
  try {
    // Check if wallet already exists for user
    if (wallets.has(userId)) {
      const existing = wallets.get(userId)!;
      return { address: existing.address };
    }

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    const privateKey = wallet.privateKey;

    // Encrypt and store private key
    const { encrypted, iv } = encryptPrivateKey(privateKey);
    wallets.set(userId, {
      address,
      encryptedPrivateKey: encrypted,
      iv,
    });

    console.log(`Created wallet for user ${userId}: ${address}`);

    return { address };
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw new Error("Failed to create wallet");
  }
}

/**
 * Get wallet for user
 */
export async function getWallet(userId: string): Promise<ethers.Wallet | null> {
  try {
    const walletData = wallets.get(userId);
    if (!walletData) {
      return null;
    }

    // Decrypt private key
    const privateKey = decryptPrivateKey(
      walletData.encryptedPrivateKey,
      walletData.iv
    );

    // Create wallet instance
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const wallet = new ethers.Wallet(privateKey, provider);

    return wallet;
  } catch (error) {
    console.error("Error getting wallet:", error);
    return null;
  }
}

/**
 * Get wallet address for user
 */
export async function getWalletAddress(userId: string): Promise<string | null> {
  const walletData = wallets.get(userId);
  return walletData ? walletData.address : null;
}

/**
 * Get all wallets (for testing)
 */
export function getAllWallets(): Map<string, EncryptedWallet> {
  return wallets;
}

/**
 * Initialize wallets from Hardhat accounts
 */
export async function initializeHardhatWallets(): Promise<void> {
  try {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    
    // Get Hardhat accounts
    const accounts = await provider.listAccounts();
    
    console.log(`Initialized ${accounts.length} Hardhat accounts`);
    
    // Store first account as default admin wallet
    if (accounts.length > 0) {
      const adminSigner = await provider.getSigner(0);
      const adminAddress = await adminSigner.getAddress();
      console.log(`Admin wallet: ${adminAddress}`);
    }
  } catch (error) {
    console.error("Error initializing Hardhat wallets:", error);
  }
}

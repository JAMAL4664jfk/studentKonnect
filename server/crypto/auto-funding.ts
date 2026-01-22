import { ethers } from "ethers";
import { getWallet } from "./wallet-service";
import fs from "fs";
import path from "path";

/**
 * Automatic Wallet Funding Service
 * 
 * Automatically funds new wallets with initial tokens for testing/development
 */
export class AutoFundingService {
  private provider: ethers.JsonRpcProvider;
  private funderWallet: ethers.Wallet | null = null;
  private deploymentInfo: any = null;

  constructor(rpcUrl: string = "http://localhost:8545") {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.loadDeploymentInfo();
  }

  /**
   * Load deployment info
   */
  private loadDeploymentInfo(): void {
    try {
      const deploymentPath = path.join(__dirname, "../../blockchain/deployments.json");
      if (fs.existsSync(deploymentPath)) {
        this.deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
      }
    } catch (error) {
      console.error("Error loading deployment info:", error);
    }
  }

  /**
   * Initialize funder wallet (uses Hardhat account #0)
   */
  async initializeFunder(): Promise<void> {
    const funderPrivateKey = process.env.ADMIN_PRIVATE_KEY || 
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    
    this.funderWallet = new ethers.Wallet(funderPrivateKey, this.provider);
  }

  /**
   * Check if wallet needs funding
   */
  async needsFunding(address: string): Promise<boolean> {
    if (!this.deploymentInfo) return false;

    try {
      const tokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
      ];

      // Check SKETH balance (main token)
      const skethAddress = this.deploymentInfo.contracts.SKETH;
      const tokenContract = new ethers.Contract(skethAddress, tokenABI, this.provider);
      const balance = await tokenContract.balanceOf(address);

      // If balance is 0, needs funding
      return balance === BigInt(0);
    } catch (error) {
      console.error("Error checking balance:", error);
      return false;
    }
  }

  /**
   * Fund a wallet with initial tokens
   */
  async fundWallet(address: string): Promise<boolean> {
    if (!this.funderWallet || !this.deploymentInfo) {
      console.error("Funder wallet or deployment info not available");
      return false;
    }

    try {
      console.log(`Funding wallet: ${address}`);

      const tokenABI = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ];

      // Initial funding amounts
      const fundingAmounts = [
        { symbol: "SKETH", amount: "100", decimals: 18 },
        { symbol: "SKUSD", amount: "10000", decimals: 6 },
        { symbol: "SKBTC", amount: "1", decimals: 8 },
        { symbol: "SKDAI", amount: "5000", decimals: 18 },
      ];

      for (const funding of fundingAmounts) {
        const tokenAddress = this.deploymentInfo.contracts[funding.symbol];
        if (!tokenAddress) continue;

        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, this.funderWallet);
        const amount = ethers.parseUnits(funding.amount, funding.decimals);

        const tx = await tokenContract.transfer(address, amount);
        await tx.wait();

        console.log(`✅ Transferred ${funding.amount} ${funding.symbol} to ${address}`);
      }

      console.log(`🎉 Wallet ${address} funded successfully`);
      return true;
    } catch (error) {
      console.error(`Error funding wallet ${address}:`, error);
      return false;
    }
  }

  /**
   * Auto-fund wallet if needed
   */
  async autoFundIfNeeded(address: string): Promise<void> {
    // Only auto-fund in development mode
    if (process.env.NODE_ENV === "production") {
      return;
    }

    if (!this.funderWallet) {
      await this.initializeFunder();
    }

    const needs Funding = await this.needsFunding(address);
    if (needsFunding) {
      await this.fundWallet(address);
    }
  }
}

// Singleton instance
let autoFundingInstance: AutoFundingService | null = null;

/**
 * Get or create auto-funding service instance
 */
export function getAutoFundingService(): AutoFundingService {
  if (!autoFundingInstance) {
    autoFundingInstance = new AutoFundingService();
  }
  return autoFundingInstance;
}

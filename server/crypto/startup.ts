import { ensureBlockchainInitialized } from "./blockchain-init";
import { getAutoFundingService } from "./auto-funding";

/**
 * Server Startup Initialization
 * 
 * This runs when the server starts and ensures:
 * 1. Blockchain is available
 * 2. Smart contracts are deployed
 * 3. Auto-funding service is ready
 */
export async function initializeOnStartup(): Promise<void> {
  console.log("\n🔄 Initializing blockchain services...\n");

  try {
    // Initialize blockchain and deploy contracts if needed
    const deploymentInfo = await ensureBlockchainInitialized();
    
    console.log("✅ Blockchain services initialized");
    console.log(`   Network: ${deploymentInfo.network}`);
    console.log(`   Deployer: ${deploymentInfo.deployer}`);
    console.log(`   Contracts: ${Object.keys(deploymentInfo.contracts).length} deployed\n`);

    // Initialize auto-funding service
    const autoFunding = getAutoFundingService();
    await autoFunding.initializeFunder();
    console.log("✅ Auto-funding service ready\n");

    console.log("🎉 All blockchain services are ready!\n");
  } catch (error: any) {
    console.error("❌ Failed to initialize blockchain services:", error.message);
    console.error("\n⚠️  Please ensure Hardhat node is running:");
    console.error("   cd blockchain && npx hardhat node\n");
    
    // Don't crash the server, just warn
    console.log("⚠️  Server will continue but crypto features may not work\n");
  }
}

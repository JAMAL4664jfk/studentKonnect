import { ethers } from "ethers";
import fs from "fs";
import path from "path";

interface DeploymentInfo {
  network: string;
  deployer: string;
  timestamp: string;
  contracts: {
    SKETH: string;
    SKUSD: string;
    SKBTC: string;
    SKDAI: string;
    TokenSwap: string;
  };
}

/**
 * Automated Blockchain Initialization Service
 * 
 * This service automatically:
 * 1. Checks if Hardhat node is running
 * 2. Deploys smart contracts if not already deployed
 * 3. Sets up exchange rates
 * 4. Funds the TokenSwap contract with liquidity
 * 5. Saves deployment info for the backend to use
 */
export class BlockchainInitializer {
  private provider: ethers.JsonRpcProvider;
  private deployer: ethers.Wallet | null = null;
  private deploymentPath: string;
  private contractsPath: string;

  constructor(rpcUrl: string = "http://localhost:8545") {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.deploymentPath = path.join(__dirname, "../../blockchain/deployments.json");
    this.contractsPath = path.join(__dirname, "../../blockchain/contracts");
  }

  /**
   * Check if blockchain is accessible
   */
  async isBlockchainAvailable(): Promise<boolean> {
    try {
      await this.provider.getBlockNumber();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if contracts are already deployed
   */
  isDeployed(): boolean {
    if (!fs.existsSync(this.deploymentPath)) {
      return false;
    }

    try {
      const deploymentInfo = JSON.parse(fs.readFileSync(this.deploymentPath, "utf8"));
      return !!(
        deploymentInfo.contracts?.SKETH &&
        deploymentInfo.contracts?.SKUSD &&
        deploymentInfo.contracts?.SKBTC &&
        deploymentInfo.contracts?.SKDAI &&
        deploymentInfo.contracts?.TokenSwap
      );
    } catch {
      return false;
    }
  }

  /**
   * Initialize deployer wallet
   */
  async initializeDeployer(): Promise<void> {
    // Use first Hardhat account as deployer
    const accounts = await this.provider.listAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts available on blockchain");
    }

    // Get the first account's private key (Hardhat default account)
    // In Hardhat, account #0 has this well-known private key
    const deployerPrivateKey = process.env.ADMIN_PRIVATE_KEY || 
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    
    this.deployer = new ethers.Wallet(deployerPrivateKey, this.provider);
    console.log(`Deployer address: ${this.deployer.address}`);
  }

  /**
   * Deploy StudentToken contract
   */
  async deployToken(
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: number
  ): Promise<string> {
    if (!this.deployer) {
      throw new Error("Deployer not initialized");
    }

    console.log(`Deploying ${symbol}...`);

    // StudentToken ABI and bytecode
    const tokenABI = [
      "constructor(string memory name, string memory symbol, uint8 decimals, uint256 initialSupply)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address owner) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)",
      "function mint(address to, uint256 amount) external",
      "function burn(uint256 amount) external",
    ];

    // Read compiled contract
    const contractPath = path.join(
      __dirname,
      "../../blockchain/artifacts/contracts/StudentToken.sol/StudentToken.json"
    );

    if (!fs.existsSync(contractPath)) {
      throw new Error(
        `Contract artifact not found at ${contractPath}. Please compile contracts first with: cd blockchain && npx hardhat compile`
      );
    }

    const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const bytecode = contractJson.bytecode;

    // Deploy contract
    const factory = new ethers.ContractFactory(tokenABI, bytecode, this.deployer);
    const contract = await factory.deploy(name, symbol, decimals, initialSupply);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`✅ ${symbol} deployed to: ${address}`);

    return address;
  }

  /**
   * Deploy TokenSwap contract
   */
  async deployTokenSwap(feeRecipient: string): Promise<string> {
    if (!this.deployer) {
      throw new Error("Deployer not initialized");
    }

    console.log("Deploying TokenSwap...");

    const swapABI = [
      "constructor(address _feeRecipient)",
      "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) returns (uint256)",
      "function setExchangeRate(address tokenA, address tokenB, uint256 rate) external",
      "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256 amountOut, uint256 fee)",
    ];

    const contractPath = path.join(
      __dirname,
      "../../blockchain/artifacts/contracts/TokenSwap.sol/TokenSwap.json"
    );

    if (!fs.existsSync(contractPath)) {
      throw new Error(
        `Contract artifact not found. Please compile contracts first with: cd blockchain && npx hardhat compile`
      );
    }

    const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const bytecode = contractJson.bytecode;

    const factory = new ethers.ContractFactory(swapABI, bytecode, this.deployer);
    const contract = await factory.deploy(feeRecipient);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`✅ TokenSwap deployed to: ${address}`);

    return address;
  }

  /**
   * Set up exchange rates
   */
  async setupExchangeRates(
    swapAddress: string,
    tokens: { SKETH: string; SKUSD: string; SKBTC: string; SKDAI: string }
  ): Promise<void> {
    if (!this.deployer) {
      throw new Error("Deployer not initialized");
    }

    console.log("Setting up exchange rates...");

    const swapABI = [
      "function setExchangeRate(address tokenA, address tokenB, uint256 rate) external",
    ];

    const swapContract = new ethers.Contract(swapAddress, swapABI, this.deployer);

    // Set exchange rates
    const rates = [
      { from: tokens.SKETH, to: tokens.SKUSD, rate: ethers.parseEther("2000") },
      { from: tokens.SKUSD, to: tokens.SKETH, rate: ethers.parseEther("0.0005") },
      { from: tokens.SKETH, to: tokens.SKBTC, rate: ethers.parseUnits("0.05", 8) },
      { from: tokens.SKBTC, to: tokens.SKETH, rate: ethers.parseEther("20") },
      { from: tokens.SKETH, to: tokens.SKDAI, rate: ethers.parseEther("2000") },
      { from: tokens.SKDAI, to: tokens.SKETH, rate: ethers.parseEther("0.0005") },
      { from: tokens.SKUSD, to: tokens.SKDAI, rate: ethers.parseEther("1") },
      { from: tokens.SKDAI, to: tokens.SKUSD, rate: ethers.parseEther("1") },
    ];

    for (const rate of rates) {
      const tx = await swapContract.setExchangeRate(rate.from, rate.to, rate.rate);
      await tx.wait();
    }

    console.log("✅ Exchange rates configured");
  }

  /**
   * Fund TokenSwap with liquidity
   */
  async fundSwapContract(
    swapAddress: string,
    tokens: { SKETH: string; SKUSD: string; SKBTC: string; SKDAI: string }
  ): Promise<void> {
    if (!this.deployer) {
      throw new Error("Deployer not initialized");
    }

    console.log("Funding TokenSwap with liquidity...");

    const tokenABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
    ];

    // Transfer liquidity to swap contract
    const transfers = [
      { token: tokens.SKETH, amount: ethers.parseEther("10000") },
      { token: tokens.SKUSD, amount: ethers.parseUnits("20000000", 6) },
      { token: tokens.SKBTC, amount: ethers.parseUnits("500", 8) },
      { token: tokens.SKDAI, amount: ethers.parseEther("10000000") },
    ];

    for (const transfer of transfers) {
      const tokenContract = new ethers.Contract(transfer.token, tokenABI, this.deployer);
      const tx = await tokenContract.transfer(swapAddress, transfer.amount);
      await tx.wait();
    }

    console.log("✅ TokenSwap funded with liquidity");
  }

  /**
   * Save deployment info
   */
  saveDeploymentInfo(deploymentInfo: DeploymentInfo): void {
    const dir = path.dirname(this.deploymentPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved");
  }

  /**
   * Main initialization function
   */
  async initialize(): Promise<DeploymentInfo> {
    console.log("🚀 Starting automated blockchain initialization...\n");

    // Check if blockchain is available
    const isAvailable = await this.isBlockchainAvailable();
    if (!isAvailable) {
      throw new Error(
        "Blockchain not available. Please start Hardhat node with: cd blockchain && npx hardhat node"
      );
    }

    console.log("✅ Blockchain is available");

    // Check if already deployed
    if (this.isDeployed()) {
      console.log("✅ Contracts already deployed, loading existing deployment...");
      const deploymentInfo = JSON.parse(fs.readFileSync(this.deploymentPath, "utf8"));
      return deploymentInfo;
    }

    console.log("📝 Contracts not deployed, starting deployment...\n");

    // Initialize deployer
    await this.initializeDeployer();

    // Deploy tokens
    const SKETH = await this.deployToken("Student Konnect ETH", "SKETH", 18, 1000000);
    const SKUSD = await this.deployToken("Student Konnect USD", "SKUSD", 6, 10000000);
    const SKBTC = await this.deployToken("Student Konnect BTC", "SKBTC", 8, 21000);
    const SKDAI = await this.deployToken("Student Konnect DAI", "SKDAI", 18, 5000000);

    // Deploy TokenSwap
    const TokenSwap = await this.deployTokenSwap(this.deployer!.address);

    // Setup exchange rates
    await this.setupExchangeRates(TokenSwap, { SKETH, SKUSD, SKBTC, SKDAI });

    // Fund swap contract
    await this.fundSwapContract(TokenSwap, { SKETH, SKUSD, SKBTC, SKDAI });

    // Save deployment info
    const deploymentInfo: DeploymentInfo = {
      network: "hardhat",
      deployer: this.deployer!.address,
      timestamp: new Date().toISOString(),
      contracts: {
        SKETH,
        SKUSD,
        SKBTC,
        SKDAI,
        TokenSwap,
      },
    };

    this.saveDeploymentInfo(deploymentInfo);

    console.log("\n🎉 Blockchain initialization completed successfully!");
    console.log("========================");
    console.log("Contract Addresses:");
    console.log("SKETH:", SKETH);
    console.log("SKUSD:", SKUSD);
    console.log("SKBTC:", SKBTC);
    console.log("SKDAI:", SKDAI);
    console.log("TokenSwap:", TokenSwap);
    console.log("========================\n");

    return deploymentInfo;
  }
}

/**
 * Auto-initialize blockchain on module load
 */
let initializationPromise: Promise<DeploymentInfo> | null = null;

export async function ensureBlockchainInitialized(): Promise<DeploymentInfo> {
  if (!initializationPromise) {
    const initializer = new BlockchainInitializer();
    initializationPromise = initializer.initialize();
  }
  return initializationPromise;
}

import { ethers } from "ethers";
import { getWallet } from "./wallet-service";
import fs from "fs";
import path from "path";

// Load deployment info
let deploymentInfo: any = null;

function loadDeploymentInfo() {
  try {
    const deploymentPath = path.join(__dirname, "../../blockchain/deployments.json");
    if (fs.existsSync(deploymentPath)) {
      deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
      console.log("Loaded deployment info:", deploymentInfo);
    }
  } catch (error) {
    console.error("Error loading deployment info:", error);
  }
}

// Load deployment info on module load
loadDeploymentInfo();

// ERC20 ABI
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];

// TokenSwap ABI
const TOKEN_SWAP_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) returns (uint256)",
  "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256 amountOut, uint256 fee)",
  "function exchangeRates(address tokenA, address tokenB) view returns (uint256)",
  "function swapFeePercent() view returns (uint256)",
];

/**
 * Get token balance
 */
export async function getTokenBalance(
  userAddress: string,
  tokenAddress: string
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();

    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw new Error("Failed to get token balance");
  }
}

/**
 * Get token info
 */
export async function getTokenInfo(tokenAddress: string): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}> {
  try {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply(),
    ]);

    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.formatUnits(totalSupply, decimals),
    };
  } catch (error) {
    console.error("Error getting token info:", error);
    throw new Error("Failed to get token info");
  }
}

/**
 * Send tokens
 */
export async function sendTokens(
  userId: string,
  tokenAddress: string,
  toAddress: string,
  amount: string
): Promise<{ txHash: string }> {
  try {
    const wallet = await getWallet(userId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);

    // Send transaction
    const tx = await tokenContract.transfer(toAddress, amountWei);
    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    await tx.wait();
    console.log(`Transaction confirmed: ${tx.hash}`);

    return { txHash: tx.hash };
  } catch (error: any) {
    console.error("Error sending tokens:", error);
    throw new Error(error.message || "Failed to send tokens");
  }
}

/**
 * Swap tokens
 */
export async function swapTokens(
  userId: string,
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: string,
  minAmountOut: string
): Promise<{ txHash: string; amountOut: string }> {
  try {
    if (!deploymentInfo || !deploymentInfo.contracts.TokenSwap) {
      throw new Error("TokenSwap contract not deployed");
    }

    const wallet = await getWallet(userId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const tokenInContract = new ethers.Contract(tokenInAddress, ERC20_ABI, wallet);
    const tokenSwapContract = new ethers.Contract(
      deploymentInfo.contracts.TokenSwap,
      TOKEN_SWAP_ABI,
      wallet
    );

    // Get token decimals
    const decimalsIn = await tokenInContract.decimals();
    const amountInWei = ethers.parseUnits(amountIn, decimalsIn);

    // Check allowance
    const allowance = await tokenInContract.allowance(
      wallet.address,
      deploymentInfo.contracts.TokenSwap
    );

    // Approve if needed
    if (allowance < amountInWei) {
      console.log("Approving token spend...");
      const approveTx = await tokenInContract.approve(
        deploymentInfo.contracts.TokenSwap,
        amountInWei
      );
      await approveTx.wait();
      console.log("Approval confirmed");
    }

    // Get expected output
    const [expectedOut, fee] = await tokenSwapContract.getAmountOut(
      tokenInAddress,
      tokenOutAddress,
      amountInWei
    );

    console.log(`Expected output: ${ethers.formatUnits(expectedOut, 18)}`);
    console.log(`Fee: ${ethers.formatUnits(fee, 18)}`);

    // Perform swap
    const tokenOutContract = new ethers.Contract(tokenOutAddress, ERC20_ABI, wallet);
    const decimalsOut = await tokenOutContract.decimals();
    const minAmountOutWei = ethers.parseUnits(minAmountOut, decimalsOut);

    const swapTx = await tokenSwapContract.swap(
      tokenInAddress,
      tokenOutAddress,
      amountInWei,
      minAmountOutWei
    );

    console.log(`Swap transaction sent: ${swapTx.hash}`);

    // Wait for confirmation
    await swapTx.wait();
    console.log(`Swap confirmed: ${swapTx.hash}`);

    return {
      txHash: swapTx.hash,
      amountOut: ethers.formatUnits(expectedOut, decimalsOut),
    };
  } catch (error: any) {
    console.error("Error swapping tokens:", error);
    throw new Error(error.message || "Failed to swap tokens");
  }
}

/**
 * Get swap quote
 */
export async function getSwapQuote(
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: string
): Promise<{ amountOut: string; fee: string }> {
  try {
    if (!deploymentInfo || !deploymentInfo.contracts.TokenSwap) {
      throw new Error("TokenSwap contract not deployed");
    }

    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const tokenInContract = new ethers.Contract(tokenInAddress, ERC20_ABI, provider);
    const tokenSwapContract = new ethers.Contract(
      deploymentInfo.contracts.TokenSwap,
      TOKEN_SWAP_ABI,
      provider
    );

    const decimalsIn = await tokenInContract.decimals();
    const amountInWei = ethers.parseUnits(amountIn, decimalsIn);

    const [amountOut, fee] = await tokenSwapContract.getAmountOut(
      tokenInAddress,
      tokenOutAddress,
      amountInWei
    );

    const tokenOutContract = new ethers.Contract(tokenOutAddress, ERC20_ABI, provider);
    const decimalsOut = await tokenOutContract.decimals();

    return {
      amountOut: ethers.formatUnits(amountOut, decimalsOut),
      fee: ethers.formatUnits(fee, decimalsOut),
    };
  } catch (error) {
    console.error("Error getting swap quote:", error);
    throw new Error("Failed to get swap quote");
  }
}

/**
 * Get deployed token addresses
 */
export function getDeployedTokens(): Record<string, string> {
  if (!deploymentInfo || !deploymentInfo.contracts) {
    return {};
  }

  return {
    SKETH: deploymentInfo.contracts.SKETH || "",
    SKUSD: deploymentInfo.contracts.SKUSD || "",
    SKBTC: deploymentInfo.contracts.SKBTC || "",
    SKDAI: deploymentInfo.contracts.SKDAI || "",
    TokenSwap: deploymentInfo.contracts.TokenSwap || "",
  };
}

/**
 * Reload deployment info (useful after redeployment)
 */
export function reloadDeploymentInfo() {
  loadDeploymentInfo();
}

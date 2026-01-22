import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy tokens
  console.log("📝 Deploying tokens...");

  // Deploy SKETH (Student Konnect ETH equivalent)
  const SKETHToken = await ethers.getContractFactory("StudentToken");
  const sketh = await SKETHToken.deploy("Student Konnect ETH", "SKETH", 18, 1000000);
  await sketh.waitForDeployment();
  const skethAddress = await sketh.getAddress();
  console.log("✅ SKETH deployed to:", skethAddress);

  // Deploy SKUSD (Student Konnect USD stablecoin)
  const SKUSDToken = await ethers.getContractFactory("StudentToken");
  const skusd = await SKUSDToken.deploy("Student Konnect USD", "SKUSD", 6, 10000000);
  await skusd.waitForDeployment();
  const skusdAddress = await skusd.getAddress();
  console.log("✅ SKUSD deployed to:", skusdAddress);

  // Deploy SKBTC (Student Konnect BTC equivalent)
  const SKBTCToken = await ethers.getContractFactory("StudentToken");
  const skbtc = await SKBTCToken.deploy("Student Konnect BTC", "SKBTC", 8, 21000);
  await skbtc.waitForDeployment();
  const skbtcAddress = await skbtc.getAddress();
  console.log("✅ SKBTC deployed to:", skbtcAddress);

  // Deploy SKDAI (Student Konnect DAI equivalent)
  const SKDAIToken = await ethers.getContractFactory("StudentToken");
  const skdai = await SKDAIToken.deploy("Student Konnect DAI", "SKDAI", 18, 5000000);
  await skdai.waitForDeployment();
  const skdaiAddress = await skdai.getAddress();
  console.log("✅ SKDAI deployed to:", skdaiAddress);

  console.log("\n📝 Deploying TokenSwap contract...");

  // Deploy TokenSwap
  const TokenSwap = await ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(deployer.address);
  await tokenSwap.waitForDeployment();
  const tokenSwapAddress = await tokenSwap.getAddress();
  console.log("✅ TokenSwap deployed to:", tokenSwapAddress);

  console.log("\n⚙️  Setting up exchange rates...");

  // Set exchange rates (1 SKETH = 2000 SKUSD, etc.)
  await tokenSwap.setExchangeRate(skethAddress, skusdAddress, ethers.parseEther("2000"));
  console.log("✅ SKETH -> SKUSD rate set");

  await tokenSwap.setExchangeRate(skusdAddress, skethAddress, ethers.parseEther("0.0005"));
  console.log("✅ SKUSD -> SKETH rate set");

  await tokenSwap.setExchangeRate(skethAddress, skbtcAddress, ethers.parseUnits("0.05", 8));
  console.log("✅ SKETH -> SKBTC rate set");

  await tokenSwap.setExchangeRate(skbtcAddress, skethAddress, ethers.parseEther("20"));
  console.log("✅ SKBTC -> SKETH rate set");

  await tokenSwap.setExchangeRate(skethAddress, skdaiAddress, ethers.parseEther("2000"));
  console.log("✅ SKETH -> SKDAI rate set");

  await tokenSwap.setExchangeRate(skdaiAddress, skethAddress, ethers.parseEther("0.0005"));
  console.log("✅ SKDAI -> SKETH rate set");

  await tokenSwap.setExchangeRate(skusdAddress, skdaiAddress, ethers.parseEther("1"));
  console.log("✅ SKUSD -> SKDAI rate set");

  await tokenSwap.setExchangeRate(skdaiAddress, skusdAddress, ethers.parseEther("1"));
  console.log("✅ SKDAI -> SKUSD rate set");

  console.log("\n💰 Funding TokenSwap with liquidity...");

  // Transfer tokens to swap contract for liquidity
  await sketh.transfer(tokenSwapAddress, ethers.parseEther("10000"));
  console.log("✅ Transferred 10,000 SKETH to swap");

  await skusd.transfer(tokenSwapAddress, ethers.parseUnits("20000000", 6));
  console.log("✅ Transferred 20,000,000 SKUSD to swap");

  await skbtc.transfer(tokenSwapAddress, ethers.parseUnits("500", 8));
  console.log("✅ Transferred 500 SKBTC to swap");

  await skdai.transfer(tokenSwapAddress, ethers.parseEther("10000000"));
  console.log("✅ Transferred 10,000,000 SKDAI to swap");

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("SKETH:", skethAddress);
  console.log("SKUSD:", skusdAddress);
  console.log("SKBTC:", skbtcAddress);
  console.log("SKDAI:", skdaiAddress);
  console.log("TokenSwap:", tokenSwapAddress);
  console.log("========================\n");

  // Save deployment info
  const deploymentInfo = {
    network: "hardhat",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      SKETH: skethAddress,
      SKUSD: skusdAddress,
      SKBTC: skbtcAddress,
      SKDAI: skdaiAddress,
      TokenSwap: tokenSwapAddress,
    },
  };

  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to deployments.json\n");

  console.log("🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

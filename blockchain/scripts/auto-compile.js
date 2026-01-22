const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Auto-compile smart contracts if artifacts don't exist
 */
function autoCompile() {
  const artifactsPath = path.join(__dirname, "../artifacts");
  
  // Check if artifacts exist
  if (fs.existsSync(artifactsPath)) {
    console.log("✅ Contract artifacts found, skipping compilation");
    return;
  }

  console.log("📝 Compiling smart contracts...");
  
  try {
    execSync("npx hardhat compile", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });
    console.log("✅ Contracts compiled successfully");
  } catch (error) {
    console.error("❌ Failed to compile contracts:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  autoCompile();
}

module.exports = { autoCompile };

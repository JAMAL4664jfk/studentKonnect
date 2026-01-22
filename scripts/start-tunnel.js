const ngrok = require("@ngrok/ngrok");
const fs = require("fs");
const path = require("path");

/**
 * Start ngrok tunnel for backend server
 * This allows React Native apps to access the local development server
 */
async function startTunnel() {
  console.log("🌐 Starting ngrok tunnel for backend server...\n");

  try {
    // Start ngrok tunnel on port 3000
    const listener = await ngrok.forward({
      addr: 3000,
      authtoken_from_env: true, // Will use NGROK_AUTHTOKEN env var if available
    });

    const url = listener.url();
    console.log("✅ Ngrok tunnel started!");
    console.log("📍 Public URL:", url);
    console.log("\n");

    // Save tunnel URL to file for the app to use
    const tunnelInfoPath = path.join(__dirname, "../.tunnel-url.json");
    const tunnelInfo = {
      url,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(tunnelInfoPath, JSON.stringify(tunnelInfo, null, 2));
    console.log("💾 Tunnel URL saved to .tunnel-url.json");
    console.log("\n");

    // Display instructions
    console.log("📱 To use this tunnel in your React Native app:");
    console.log(`   1. The app will automatically use: ${url}`);
    console.log("   2. Just restart your app to pick up the new URL");
    console.log("\n");

    console.log("⚠️  Keep this terminal open to maintain the tunnel!");
    console.log("   Press Ctrl+C to stop the tunnel\n");

    // Keep the process running
    process.on("SIGINT", async () => {
      console.log("\n\n🛑 Stopping ngrok tunnel...");
      await listener.close();
      
      // Clean up tunnel info file
      if (fs.existsSync(tunnelInfoPath)) {
        fs.unlinkSync(tunnelInfoPath);
      }
      
      console.log("✅ Tunnel stopped\n");
      process.exit(0);
    });

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error("❌ Failed to start ngrok tunnel:", error.message);
    console.error("\n");
    
    if (error.message.includes("authtoken")) {
      console.error("💡 Ngrok requires an auth token for tunneling.");
      console.error("   Get your free token at: https://dashboard.ngrok.com/get-started/your-authtoken");
      console.error("   Then set it as an environment variable:");
      console.error("   export NGROK_AUTHTOKEN=your_token_here");
      console.error("\n");
      console.error("   Or add it to your .env file:");
      console.error("   NGROK_AUTHTOKEN=your_token_here");
      console.error("\n");
    }
    
    process.exit(1);
  }
}

startTunnel();

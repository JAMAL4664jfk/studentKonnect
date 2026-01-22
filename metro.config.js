const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add resolver configuration for ethers and crypto polyfills
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    crypto: path.resolve(__dirname, "node_modules/react-native-crypto"),
    stream: path.resolve(__dirname, "node_modules/readable-stream"),
    buffer: path.resolve(__dirname, "node_modules/buffer"),
  },
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});

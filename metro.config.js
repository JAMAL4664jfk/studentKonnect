const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add resolver configuration for ethers and crypto polyfills
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    crypto: require.resolve("react-native-crypto"),
    stream: require.resolve("readable-stream"),
    buffer: require.resolve("buffer"),
  },
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});

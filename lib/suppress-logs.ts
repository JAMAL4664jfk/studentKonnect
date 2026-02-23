/**
 * suppress-logs.ts
 *
 * Silences all console output in production builds.
 * This prevents sensitive data from appearing in device logs
 * and prevents the React Native red error overlay from showing
 * technical details to end users.
 *
 * Import this file ONCE at the very top of app/_layout.tsx.
 * It is a no-op in development (__DEV__ === true).
 */

if (!__DEV__) {
  // Silence all console methods in production
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.debug = noop;
  console.trace = noop;
  // Keep console.error as a silent noop too — errors are caught by ErrorBoundary
  console.error = noop;

  // Suppress React Native's LogBox (yellow/red warning overlays)
  try {
    const LogBox = require('react-native').LogBox;
    if (LogBox) {
      LogBox.ignoreAllLogs(true);
    }
  } catch {
    // LogBox not available — safe to ignore
  }
}

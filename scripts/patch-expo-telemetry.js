/**
 * patch-expo-telemetry.js
 *
 * Postinstall script that fixes known pnpm/Node.js version mismatch issues
 * in expo's nested @expo/cli and @expo/metro-config packages.
 *
 * Fixes:
 * 1. TypeError: _undici(...).RetryAgent is not a constructor
 *    - Patches FetchClient.js to fall back to Agent() when RetryAgent is missing
 *
 * 2. Error loading Metro config: Only URLs with a scheme in: file, data, and node are supported
 *    - Installs missing @isaacs/brace-expansion for nested minimatch v10
 *    - This prevents metro-config from falling back to ESM import() which fails on Windows
 *
 * Run automatically via postinstall in package.json.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

// ─── Fix 1: Patch FetchClient.js for RetryAgent ───────────────────────────────

const FETCH_CLIENT_TARGETS = [
  path.join(ROOT, 'node_modules', '@expo', 'cli', 'build', 'src', 'utils', 'telemetry', 'clients', 'FetchClient.js'),
  path.join(ROOT, 'node_modules', 'expo', 'node_modules', '@expo', 'cli', 'build', 'src', 'utils', 'telemetry', 'clients', 'FetchClient.js'),
];

const ORIGINAL_RETRY = `const agent = new (_undici()).RetryAgent(new (_undici()).Agent(), {
        maxRetries: 3,
        retryAfter: true,
        minTimeout: 500,
        maxTimeout: 2000,
        timeoutFactor: 2
    });`;

const PATCHED_RETRY = `const _undiciMod = _undici();
    const agent = _undiciMod.RetryAgent
        ? new _undiciMod.RetryAgent(new _undiciMod.Agent(), {
            maxRetries: 3,
            retryAfter: true,
            minTimeout: 500,
            maxTimeout: 2000,
            timeoutFactor: 2
          })
        : new _undiciMod.Agent();`;

let patchedCount = 0;

for (const target of FETCH_CLIENT_TARGETS) {
  if (!fs.existsSync(target)) {
    console.log(`[postinstall] Skipping (not found): ${path.relative(ROOT, target)}`);
    continue;
  }

  const content = fs.readFileSync(target, 'utf8');

  if (content.includes('_undiciMod.RetryAgent')) {
    console.log(`[postinstall] Already patched: ${path.relative(ROOT, target)}`);
    patchedCount++;
    continue;
  }

  if (!content.includes('RetryAgent')) {
    console.log(`[postinstall] No RetryAgent found (fixed upstream?): ${path.relative(ROOT, target)}`);
    continue;
  }

  const newContent = content.replace(ORIGINAL_RETRY, PATCHED_RETRY);

  if (newContent === content) {
    console.warn(`[postinstall] WARNING: Could not patch RetryAgent in: ${path.relative(ROOT, target)}`);
    continue;
  }

  fs.writeFileSync(target, newContent, 'utf8');
  console.log(`[postinstall] Patched RetryAgent fix: ${path.relative(ROOT, target)}`);
  patchedCount++;
}

// ─── Fix 2: Install @isaacs/brace-expansion for nested minimatch v10 ──────────
// @expo/metro-config bundles glob v13 which uses minimatch v10 which needs
// @isaacs/brace-expansion v5. pnpm doesn't always install this nested dep.

const NESTED_MINIMATCH = path.join(
  ROOT,
  'node_modules', '@expo', 'metro-config', 'node_modules', 'glob',
  'node_modules', 'minimatch'
);

const BRACE_EXPANSION_TARGET = path.join(NESTED_MINIMATCH, 'node_modules', '@isaacs', 'brace-expansion');

if (fs.existsSync(NESTED_MINIMATCH)) {
  if (fs.existsSync(BRACE_EXPANSION_TARGET)) {
    console.log('[postinstall] @isaacs/brace-expansion already present in nested minimatch.');
  } else {
    console.log('[postinstall] Installing @isaacs/brace-expansion@5 for nested minimatch v10...');
    try {
      // Create the @isaacs directory
      const isaacDir = path.join(NESTED_MINIMATCH, 'node_modules', '@isaacs');
      fs.mkdirSync(isaacDir, { recursive: true });

      // Download and install via npm into the nested location
      execSync(
        `npm install --prefix "${NESTED_MINIMATCH}" @isaacs/brace-expansion@5 --no-save --no-package-lock --loglevel=error`,
        { stdio: 'pipe', cwd: ROOT }
      );
      console.log('[postinstall] Successfully installed @isaacs/brace-expansion@5.');
    } catch (err) {
      console.warn('[postinstall] WARNING: Could not auto-install @isaacs/brace-expansion:', err.message);
      console.warn('[postinstall] Run manually: npm install --prefix node_modules/@expo/metro-config/node_modules/glob/node_modules/minimatch @isaacs/brace-expansion@5 --no-save');
    }
  }
} else {
  console.log('[postinstall] Nested minimatch not found (pnpm resolved it correctly).');
}

console.log(`[postinstall] Done.`);

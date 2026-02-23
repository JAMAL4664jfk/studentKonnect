/**
 * patch-expo-telemetry.js
 *
 * Postinstall script that fixes known pnpm/Node.js version mismatch issues
 * in expo's nested packages on Windows.
 *
 * Fixes:
 * 1. TypeError: _undici(...).RetryAgent is not a constructor
 *    - Patches FetchClient.js to fall back to Agent() when RetryAgent is missing
 *
 * 2. Cannot find module '@isaacs/brace-expansion'
 *    - Installs missing @isaacs/brace-expansion for ALL nested minimatch v10 locations:
 *      a) @expo/metro-config/node_modules/glob/node_modules/minimatch
 *      b) @expo/fingerprint/node_modules/glob/node_modules/minimatch  <-- NEW (eas build)
 *      c) Any other nested minimatch v10 found under @expo namespace
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

for (const target of FETCH_CLIENT_TARGETS) {
  if (!fs.existsSync(target)) {
    console.log(`[postinstall] Skipping (not found): ${path.relative(ROOT, target)}`);
    continue;
  }
  const content = fs.readFileSync(target, 'utf8');
  if (content.includes('_undiciMod.RetryAgent')) {
    console.log(`[postinstall] Already patched: ${path.relative(ROOT, target)}`);
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
}

// ─── Fix 2: Install @isaacs/brace-expansion for ALL nested minimatch v10 ──────
function installBraceExpansion(minimatchDir) {
  if (!fs.existsSync(minimatchDir)) return;

  // Check if this is actually minimatch v10+
  const pkgPath = path.join(minimatchDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const major = parseInt((pkg.version || '0').split('.')[0]);
      if (major < 10) return; // Only minimatch v10+ needs @isaacs/brace-expansion
    } catch {}
  }

  const braceTarget = path.join(minimatchDir, 'node_modules', '@isaacs', 'brace-expansion');
  if (fs.existsSync(braceTarget)) {
    console.log(`[postinstall] @isaacs/brace-expansion already present: ${path.relative(ROOT, minimatchDir)}`);
    return;
  }

  console.log(`[postinstall] Installing @isaacs/brace-expansion@5 into: ${path.relative(ROOT, minimatchDir)}`);
  try {
    const isaacDir = path.join(minimatchDir, 'node_modules', '@isaacs');
    fs.mkdirSync(isaacDir, { recursive: true });
    execSync(
      `npm install --prefix "${minimatchDir}" @isaacs/brace-expansion@5 --no-save --no-package-lock --loglevel=error`,
      { stdio: 'pipe', cwd: ROOT }
    );
    console.log(`[postinstall] Done: ${path.relative(ROOT, minimatchDir)}`);
  } catch (err) {
    console.warn(`[postinstall] WARNING: Failed for ${path.relative(ROOT, minimatchDir)}:`, err.message);
  }
}

// Explicit known locations (fastest path)
const KNOWN_NESTED_MINIMATCH = [
  // @expo/metro-config nested glob (metro.config.js load on Windows)
  path.join(ROOT, 'node_modules', '@expo', 'metro-config', 'node_modules', 'glob', 'node_modules', 'minimatch'),
  // @expo/fingerprint nested glob (eas build fingerprint step)
  path.join(ROOT, 'node_modules', '@expo', 'fingerprint', 'node_modules', 'glob', 'node_modules', 'minimatch'),
  // expo's own nested @expo/fingerprint (doubly nested)
  path.join(ROOT, 'node_modules', 'expo', 'node_modules', '@expo', 'fingerprint', 'node_modules', 'glob', 'node_modules', 'minimatch'),
];

for (const loc of KNOWN_NESTED_MINIMATCH) {
  installBraceExpansion(loc);
}

// Deep scan: find any other nested minimatch v10 under @expo (future-proof)
function scanForNestedMinimatch(dir, depth) {
  if (depth > 7) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === '.bin' || entry.name === '.cache') continue;
      const full = path.join(dir, entry.name);
      if (entry.name === 'minimatch') {
        installBraceExpansion(full);
      } else {
        scanForNestedMinimatch(full, depth + 1);
      }
    }
  } catch {}
}

const expoNs = path.join(ROOT, 'node_modules', '@expo');
if (fs.existsSync(expoNs)) {
  scanForNestedMinimatch(expoNs, 0);
}

console.log('[postinstall] All patches applied.');

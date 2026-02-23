/**
 * patch-expo-telemetry.js
 *
 * Patches @expo/cli's FetchClient.js to gracefully fall back when
 * undici.RetryAgent is not available (undici v5 vs v6 mismatch).
 *
 * This fixes: TypeError: _undici(...).RetryAgent is not a constructor
 *
 * Run automatically via postinstall in package.json.
 */

const fs = require('fs');
const path = require('path');

const targets = [
  // Standard location
  path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'src', 'utils', 'telemetry', 'clients', 'FetchClient.js'),
  // Nested inside expo package (Windows pnpm hoisting issue)
  path.join(__dirname, '..', 'node_modules', 'expo', 'node_modules', '@expo', 'cli', 'build', 'src', 'utils', 'telemetry', 'clients', 'FetchClient.js'),
];

const ORIGINAL = `const agent = new (_undici()).RetryAgent(new (_undici()).Agent(), {
        maxRetries: 3,
        retryAfter: true,
        minTimeout: 500,
        maxTimeout: 2000,
        timeoutFactor: 2
    });`;

const PATCHED = `const _undiciMod = _undici();
    const agent = _undiciMod.RetryAgent
        ? new _undiciMod.RetryAgent(new _undiciMod.Agent(), {
            maxRetries: 3,
            retryAfter: true,
            minTimeout: 500,
            maxTimeout: 2000,
            timeoutFactor: 2
          })
        : new _undiciMod.Agent();`;

let patched = 0;

for (const target of targets) {
  if (!fs.existsSync(target)) {
    console.log(`[patch-expo-telemetry] Skipping (not found): ${target}`);
    continue;
  }

  const content = fs.readFileSync(target, 'utf8');

  if (content.includes('_undiciMod.RetryAgent')) {
    console.log(`[patch-expo-telemetry] Already patched: ${target}`);
    patched++;
    continue;
  }

  if (!content.includes('RetryAgent')) {
    console.log(`[patch-expo-telemetry] No RetryAgent found (already fixed upstream?): ${target}`);
    continue;
  }

  const newContent = content.replace(ORIGINAL, PATCHED);

  if (newContent === content) {
    console.warn(`[patch-expo-telemetry] WARNING: Could not apply patch to: ${target}`);
    console.warn('[patch-expo-telemetry] The file format may have changed. Manual fix may be needed.');
    continue;
  }

  fs.writeFileSync(target, newContent, 'utf8');
  console.log(`[patch-expo-telemetry] Successfully patched: ${target}`);
  patched++;
}

if (patched === 0) {
  console.log('[patch-expo-telemetry] No files were patched. This may be fine if expo was updated.');
} else {
  console.log(`[patch-expo-telemetry] Done. Patched ${patched} file(s).`);
}

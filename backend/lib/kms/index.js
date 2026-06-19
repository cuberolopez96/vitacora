// Simple pluggable KMS loader
// Usage: const kms = require('./lib/kms'); await kms.fetchKey(); // returns path to unwrapped key

const path = require('path');
const providers = {
  gcp: require('./providers/gcp'),
  simulate: require('./providers/simulate')
};

function getProviderName() {
  return (process.env.ENCRYPTION_KMS_PROVIDER || 'simulate').toLowerCase();
}

function getProvider() {
  const name = getProviderName();
  const p = providers[name];
  if (!p) throw new Error(`Unknown KMS provider: ${name}`);
  return p;
}

const os = require('os');
const fs = require('fs');

// TTL in seconds to reuse an existing unwrapped key file when present
const DEFAULT_TTL = parseInt(process.env.ENCRYPTION_KEY_CACHE_TTL || '300', 10);

function defaultOutPath() {
  // Allow explicit override via ENCRYPTION_KEY_PATH (recommended), else use OS temp dir
  if (process.env.ENCRYPTION_KEY_PATH) return require('path').resolve(process.env.ENCRYPTION_KEY_PATH);
  return require('path').join(os.tmpdir(), 'vitacora_unwrapped.key');
}

async function fetchKey(opts = {}) {
  const provider = getProvider();
  const outPath = opts.outPath || defaultOutPath();

  // If a key already exists and is fresh, reuse it
  try {
    if (fs.existsSync(outPath)) {
      const stat = fs.statSync(outPath);
      const age = (Date.now() - stat.mtimeMs) / 1000;
      if (age <= DEFAULT_TTL) {
        return outPath;
      }
    }
  } catch (e) {
    // ignore and proceed to fetch
  }

  // provider.fetchKey should accept { outPath }
  const res = await provider.fetchKey(Object.assign({}, opts, { outPath }));

  // Ensure result is a path; if provider wrote to a different path, prefer that
  if (typeof res === 'string' && res) return res;
  if (fs.existsSync(outPath)) return outPath;
  throw new Error('KMS provider did not produce an unwrapped key file');
}

module.exports = { getProviderName, getProvider, fetchKey };

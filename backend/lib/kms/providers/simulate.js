const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Simulated KMS provider for CI and local testing.
// It delegates to scripts/kms_simulate.sh which produces unwrapped.key when run with KMS_PASS set.

async function fetchKey(opts = {}) {
  // Default locations relative to repo root
  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const wrapped = path.resolve(repoRoot, 'data.key.enc');
  const outPath = opts.outPath || (process.env.ENCRYPTION_KEY_PATH ? path.resolve(process.env.ENCRYPTION_KEY_PATH) : path.join(require('os').tmpdir(), 'vitacora_unwrapped.key'));

  // If key already exists at outPath, return it
  if (fs.existsSync(outPath)) return outPath;

  // Try to use scripts/kms_simulate.sh to unwrap
  const script = path.resolve(repoRoot, 'scripts', 'kms_simulate.sh');
  if (!fs.existsSync(script)) {
    throw new Error('simulate KMS provider requires scripts/kms_simulate.sh to be present in repo');
  }

  const pass = process.env.ENCRYPTION_KMS_PASS || process.env.KMS_PASS || 'test-wrap-pass';
  try {
    // generate data.key/data.key.enc if missing (idempotent)
    execSync(`${script} generate`, { cwd: repoRoot, stdio: 'inherit' });
    // unwrap using provided pass; instruct script to write to outPath if supported via KMS_UNWRAP_OUT
    const env = Object.assign({}, process.env, { KMS_PASS: pass, KMS_UNWRAP_OUT: outPath });
    execSync(`${script} unwrap`, { cwd: repoRoot, env, stdio: 'inherit' });
  } catch (e) {
    throw new Error('simulate KMS unwrap failed: ' + e.message);
  }

  if (!fs.existsSync(outPath)) throw new Error('simulate provider failed to create unwrapped.key at ' + outPath);
  return outPath;
}

module.exports = { fetchKey };

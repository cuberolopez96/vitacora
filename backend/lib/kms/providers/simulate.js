const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Simulated KMS provider for CI and local testing.
// It delegates to scripts/kms_simulate.sh which produces unwrapped.key when run with KMS_PASS set.

async function fetchKey() {
  // Default locations relative to repo root
  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const wrapped = path.resolve(repoRoot, 'data.key.enc');
  const unwrapped = path.resolve(repoRoot, 'unwrapped.key');

  // If unwrapped.key already exists, return it
  if (fs.existsSync(unwrapped)) return unwrapped;

  // Try to use scripts/kms_simulate.sh to unwrap
  const script = path.resolve(repoRoot, 'scripts', 'kms_simulate.sh');
  if (!fs.existsSync(script)) {
    throw new Error('simulate KMS provider requires scripts/kms_simulate.sh to be present in repo');
  }

  const pass = process.env.ENCRYPTION_KMS_PASS || process.env.KMS_PASS || 'test-wrap-pass';
  try {
    // generate data.key/data.key.enc if missing (idempotent)
    execSync(`${script} generate`, { cwd: repoRoot, stdio: 'inherit' });
    // unwrap using provided pass
    execSync(`${script} unwrap`, { cwd: repoRoot, env: Object.assign({}, process.env, { KMS_PASS: pass }), stdio: 'inherit' });
  } catch (e) {
    throw new Error('simulate KMS unwrap failed: ' + e.message);
  }

  if (!fs.existsSync(unwrapped)) throw new Error('simulate provider failed to create unwrapped.key');
  return unwrapped;
}

module.exports = { fetchKey };

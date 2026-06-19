const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Knex = require('knex');

jest.setTimeout(120000);

test('knex opens SQLCipher encrypted DB when ENCRYPTION_ENABLED and ENCRYPTION_KEY_PATH set', async () => {
  // skip if sqlcipher not installed
  try {
    execSync('sqlcipher -version', { stdio: 'ignore' });
  } catch (e) {
    console.warn('sqlcipher not available; skipping SQLCipher integration test');
    return;
  }

  const repoRoot = path.resolve(__dirname, '..', '..', '..');

  // The CI job prepares and unwraps the key (scripts/kms_simulate.sh). The test requires unwrapped.key to exist.
  const keyPath = path.resolve(repoRoot, 'unwrapped.key');
  if (!fs.existsSync(keyPath)) {
    throw new Error('Required unwrapped.key not found. Ensure the CI workflow ran the KMS unwrap step or create unwrapped.key before running this test.');
  }
  expect(fs.existsSync(keyPath)).toBe(true);

  // Create encrypted DB using the PoC sqlcipher script
  try {
    execSync(path.join(repoRoot, 'scripts', 'sqlcipher_poc.sh') + ` create --key-file ${keyPath}`, { stdio: 'inherit' });
  } catch (e) {
    throw new Error('Failed to create encrypted PoC DB: ' + e.message);
  }

  const encDb = path.resolve(repoRoot, 'poc_encrypted.sqlite');
  expect(fs.existsSync(encDb)).toBe(true);

  // Configure env so backend/knexfile will pick up the encrypted DB and key
  process.env.ENCRYPTION_ENABLED = 'true';
  process.env.ENCRYPTION_KEY_PATH = keyPath;
  process.env.DB_CONNECTION = './poc_encrypted.sqlite';

  // Require knexfile and open connection
  const knexfile = require(path.resolve(repoRoot, 'backend', 'knexfile.js'));
  const config = knexfile.development;
  const knex = Knex(config);

  try {
    const rows = await knex.raw("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1");
    expect(rows).toBeTruthy();
  } finally {
    await knex.destroy();
  }
});

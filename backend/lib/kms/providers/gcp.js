const { KeyManagementServiceClient } = (() => {
  try { return require('@google-cloud/kms'); } catch (e) { return null; }
})();
const fs = require('fs');
const path = require('path');

// GCP KMS provider expects the following env vars:
// - ENCRYPTION_KMS_KEY_ID: full resource name for the CryptoKeyVersion to use for decrypt, e.g. projects/PROJECT/locations/global/keyRings/kr/cryptoKeys/key/cryptoKeyVersions/1
// - ENCRYPTION_WRAPPED_KEY_B64 (optional): base64-encoded ciphertext to decrypt. If not provided, will read data.key.enc and treat it as raw ciphertext (binary) and attempt to decrypt.
// Note: The wrapped ciphertext must have been created by GCP KMS encrypt to be decryptable. For CI, prefer the 'simulate' provider.

async function fetchKey() {
  if (!KeyManagementServiceClient) {
    throw new Error("@google-cloud/kms not installed. Run 'npm install @google-cloud/kms' in backend to use GCP provider.");
  }
  const client = new KeyManagementServiceClient();
  const keyName = process.env.ENCRYPTION_KMS_KEY_ID;
  if (!keyName) throw new Error('ENCRYPTION_KMS_KEY_ID must be set for GCP KMS provider');

  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const wrappedPath = path.resolve(repoRoot, 'data.key.enc');
  let ciphertext;
  if (process.env.ENCRYPTION_WRAPPED_KEY_B64) {
    ciphertext = Buffer.from(process.env.ENCRYPTION_WRAPPED_KEY_B64, 'base64');
  } else if (fs.existsSync(wrappedPath)) {
    ciphertext = fs.readFileSync(wrappedPath);
  } else {
    throw new Error('No wrapped key provided. Set ENCRYPTION_WRAPPED_KEY_B64 or add data.key.enc to repo root.');
  }

  // Call GCP KMS to decrypt
  const [result] = await client.decrypt({ name: keyName, ciphertext });
  const plaintext = result.plaintext;
  const outPath = path.resolve(repoRoot, 'unwrapped.key');
  fs.writeFileSync(outPath, plaintext);
  return outPath;
}

module.exports = { fetchKey };

#!/usr/bin/env node
// Fetches/unwraps the encryption key from configured KMS provider and writes unwrapped.key to repo root.

const path = require('path');
const fs = require('fs');
(async function main(){
  try{
    const kms = require('../lib/kms');
    console.log('KMS provider:', process.env.ENCRYPTION_KMS_PROVIDER || 'simulate');
    // Allow override via CLI --out or env ENCRYPTION_KEY_PATH
    const argv = process.argv.slice(2);
    let outArg = null;
    for (let i = 0; i < argv.length; i++) {
      if (argv[i] === '--out' && argv[i+1]) { outArg = argv[i+1]; break; }
    }
    const outPath = outArg || process.env.ENCRYPTION_KEY_PATH;
    const keyPath = await kms.fetchKey({ outPath });

    try { require('fs').chmodSync(keyPath, 0o600); } catch (e) { /* ignore */ }
    console.log('Unwrapped key available at:', keyPath);
    // Print export-friendly line for CI (do not include key contents)
    console.log('ENCRYPTION_KEY_PATH=' + keyPath);
    process.exit(0);
  } catch (e) {
    console.error('Failed to fetch KMS key:', e && e.message ? e.message : e);
    process.exit(2);
  }
})();

#!/usr/bin/env node
// Fetches/unwraps the encryption key from configured KMS provider and writes unwrapped.key to repo root.

const path = require('path');
const fs = require('fs');
(async function main(){
  try{
    const kms = require('../lib/kms');
    console.log('KMS provider:', process.env.ENCRYPTION_KMS_PROVIDER || 'simulate');
    const keyPath = await kms.fetchKey();
    console.log('Unwrapped key available at:', keyPath);
    process.exit(0);
  } catch (e) {
    console.error('Failed to fetch KMS key:', e && e.message ? e.message : e);
    process.exit(2);
  }
})();

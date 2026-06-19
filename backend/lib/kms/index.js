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

async function fetchKey(opts = {}) {
  const provider = getProvider();
  // provider.fetchKey returns absolute path to key file (unwrapped)
  return await provider.fetchKey(opts);
}

module.exports = { getProviderName, getProvider, fetchKey };

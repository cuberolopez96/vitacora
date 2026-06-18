const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const outDir = path.resolve(__dirname, '..', 'keys');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'test.key');
const passphrase = crypto.randomBytes(32).toString('base64');
fs.writeFileSync(outPath, passphrase, { mode: 0o600 });
console.log(outPath); // print path for scripting

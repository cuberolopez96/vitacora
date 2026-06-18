const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node node_encrypt.js <passfile> <infile>');
  process.exit(2);
}
const passfile = process.argv[2];
const infile = process.argv[3];
const out = infile + '.enc';

const pass = fs.readFileSync(passfile, 'utf8');
// Derive 32-byte key from passphrase using PBKDF2 with salt
const salt = crypto.randomBytes(16);
const key = crypto.pbkdf2Sync(pass, salt, 100000, 32, 'sha256');
const iv = crypto.randomBytes(16);

const inp = fs.readFileSync(infile);
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const encrypted = Buffer.concat([cipher.update(inp), cipher.final()]);

// Format: salt(16) + iv(16) + encrypted
const outBuf = Buffer.concat([salt, iv, encrypted]);
fs.writeFileSync(out, outBuf);
console.log(out);
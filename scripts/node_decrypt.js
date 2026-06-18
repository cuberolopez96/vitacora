const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node node_decrypt.js <passfile> <infile.enc>');
  process.exit(2);
}
const passfile = process.argv[2];
const infile = process.argv[3];
const out = infile.replace(/\.enc$/, '.dec');

const pass = fs.readFileSync(passfile, 'utf8');
const inp = fs.readFileSync(infile);
const salt = inp.slice(0, 16);
const iv = inp.slice(16, 32);
const encrypted = inp.slice(32);
const key = crypto.pbkdf2Sync(pass, salt, 100000, 32, 'sha256');
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
fs.writeFileSync(out, decrypted);
console.log(out);

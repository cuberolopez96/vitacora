const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const DB_FILE = process.env.DB_CONNECTION || './data/vitacora.sqlite';
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

if (!fs.existsSync(DB_FILE)) {
  console.error('DB file not found:', DB_FILE);
  process.exit(2);
}
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.join(BACKUP_DIR, `vitacora-backup-${ts}.sqlite.gz`);
const inp = fs.readFileSync(DB_FILE);
const gz = zlib.gzipSync(inp);
fs.writeFileSync(out, gz);
const crypto = require('crypto');
const sha = crypto.createHash('sha256').update(gz).digest('hex');
fs.writeFileSync(out + '.sha256', sha);
console.log(out);

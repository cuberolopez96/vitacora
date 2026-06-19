const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DB_CLIENT = process.env.DB_CLIENT || process.env.NODE_ENV === 'production' ? 'mysql' : 'sqlite3';

// Helper to read encryption key (either env var or file)
function resolveEncryptionKey() {
  if ((process.env.ENCRYPTION_ENABLED || 'false') !== 'true') return null;
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length > 0) {
    return process.env.ENCRYPTION_KEY;
  }
  const keyPath = process.env.ENCRYPTION_KEY_PATH;
  if (keyPath && fs.existsSync(path.resolve(__dirname, '..', keyPath))) {
    try {
      const k = fs.readFileSync(path.resolve(__dirname, '..', keyPath), 'utf8').trim();
      return k;
    } catch (e) {
      // ignore and fallthrough to null
      return null;
    }
  }
  return null;
}

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'sqlite3',
    connection: process.env.DB_CLIENT === 'mysql' || process.env.DB_CLIENT === 'mariadb'
      ? {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || '',
          database: process.env.DB_NAME || 'vitacora'
        }
      : (() => {
            // Allow overriding the sqlite filename via DB_FILE or DB_CONNECTION env vars.
            const envFile = process.env.DB_FILE || process.env.DB_CONNECTION;
            if (envFile && envFile.length > 0) {
              // Resolve relative paths against the repository root (one level up from backend)
              return { filename: path.resolve(__dirname, '..', envFile) };
            }
            return { filename: path.resolve(__dirname, '..', 'data', 'vitacora.sqlite') };
          })(),
    useNullAsDefault: true,
    // If encryption is enabled and using sqlite3/SQLCipher, add a pool.afterCreate hook to set the key on new connections
    pool: (function () {
      const key = resolveEncryptionKey();
      if (!key) return undefined;
      return {
        afterCreate: function (conn, done) {
          // conn is a sqlite3 Database object when using sqlite3 driver; run PRAGMA key for SQLCipher if available
          try {
            // If key is raw bytes (hex encoded in PoC), convert to SQLCipher hex notation: prefix with x and pass hex string
            let safeKey = key;
            // If key contains non-printable characters, read as Buffer and convert to hex
            const hasNonPrintable = /[^\x20-\x7E]/.test(safeKey);
            if (hasNonPrintable) {
              const buf = Buffer.from(fs.readFileSync(path.resolve(__dirname, '..', process.env.ENCRYPTION_KEY_PATH || process.env.ENCRYPTION_KEY || '')));
              safeKey = 'x' + buf.toString('hex');
            } else if (/^[0-9a-fA-F]+$/.test(safeKey) && safeKey.length >= 32) {
              // If the key looks like hex already, prefix with x
              safeKey = 'x' + safeKey;
            } else {
              // Escape single quotes in textual key
              safeKey = safeKey.replace(/'/g, "''");
            }

            conn.run(`PRAGMA key = '${safeKey}';`, function (err) {
              if (err) return done(err, conn);
              // Optionally verify by running a no-op pragma (cipher_version) if supported
              conn.get("PRAGMA cipher_version;", function (verErr) {
                // ignore verErr — some sqlite builds won't have cipher_version, it's just a check
                return done(null, conn);
              });
            });
          } catch (e) {
            // Fallback: return connection without setting key (app will likely fail to read encrypted DB)
            return done(null, conn);
          }
        }
      };
    }()),
    migrations: {
      directory: path.resolve(__dirname, 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'seeds')
    }
  },
  production: {
    client: process.env.DB_CLIENT || 'mysql',
    connection: process.env.DB_CONNECTION || process.env.DATABASE_URL,
    migrations: {
      directory: path.resolve(__dirname, 'migrations')
    }
  }
};

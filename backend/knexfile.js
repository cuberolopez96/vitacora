const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DB_CLIENT = process.env.DB_CLIENT || process.env.NODE_ENV === 'production' ? 'mysql' : 'sqlite3';

// Helper to resolve encryption key into a SQLCipher-friendly PRAGMA value (already escaped/prefixed)
function resolveEncryptionKey() {
  if ((process.env.ENCRYPTION_ENABLED || 'false') !== 'true') return null;
  // If a raw key is provided in env, prefer it. If it looks hex, prefix with x.
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length > 0) {
    const envKey = process.env.ENCRYPTION_KEY.trim();
    if (/^[0-9a-fA-F]+$/.test(envKey)) return 'x' + envKey;
    // escape single quotes for PRAGMA string literal
    return envKey.replace(/'/g, "''");
  }
  const keyPath = process.env.ENCRYPTION_KEY_PATH;
  if (keyPath && fs.existsSync(path.resolve(__dirname, '..', keyPath))) {
    try {
      // Read raw bytes and return hex-prefixed form accepted by SQLCipher (xHEX)
      const abs = path.resolve(__dirname, '..', keyPath);
      const buf = fs.readFileSync(abs);
      return 'x' + buf.toString('hex');
    } catch (e) {
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
              // Prefer resolving paths relative to the backend directory inside containers (/app)
              const candidate1 = path.resolve(__dirname, envFile);
              const candidate2 = path.resolve(__dirname, '..', envFile);
              // If candidate1 exists or candidate2 doesn't, prefer candidate1 so runtime writes inside /app
              if (fs.existsSync(candidate1) || !fs.existsSync(candidate2)) {
                // ensure parent directory exists
                const dir = path.dirname(candidate1);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                return { filename: candidate1 };
              }
              // ensure parent directory exists for candidate2
              const dir2 = path.dirname(candidate2);
              if (!fs.existsSync(dir2)) fs.mkdirSync(dir2, { recursive: true });
              return { filename: candidate2 };
            }
            // default to backend/data/vitacora.sqlite (inside backend directory)
            const def = path.resolve(__dirname, 'data', 'vitacora.sqlite');
            const defDir = path.dirname(def);
            if (!fs.existsSync(defDir)) fs.mkdirSync(defDir, { recursive: true });
            return { filename: def };
          })(),
    useNullAsDefault: true,
    // If encryption is enabled and using sqlite3/SQLCipher, add a pool.afterCreate hook to set the key on new connections
    pool: (function () {
      const key = resolveEncryptionKey();
      if (!key) return undefined;
      return {
        afterCreate: function (conn, done) {
          try {
            const safeKey = key; // already SQLCipher-ready (xHEX or escaped text)
            conn.run(`PRAGMA key = '${safeKey}';`, function (err) {
              if (err) return done(err, conn);
              // Optionally check cipher_version (may not exist) then verify by attempting a light query; if it fails with NOTADB we get a clear diagnostic for CI.
              conn.get("PRAGMA cipher_version;", function (verErr) {
                // ignore verErr — some sqlite builds won't have cipher_version, it's just a hint
                conn.get("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1;", function (testErr, row) {
                  if (testErr) {
                    const msg = 'SQLCipher verification failed: ' + testErr.message + ' — verify sqlite3 is built with SQLCipher and ENCRYPTION_KEY_PATH/key are correct.';
                    return done(new Error(msg), conn);
                  }
                  return done(null, conn);
                });
              });
            });
          } catch (e) {
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

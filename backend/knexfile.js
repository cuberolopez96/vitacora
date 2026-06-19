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
          try {
            const safeKey = key; // already SQLCipher-ready (xHEX or escaped text)
            conn.run(`PRAGMA key = '${safeKey}';`, function (err) {
              if (err) return done(err, conn);
<<<<<<< HEAD
              // Optionally verify by running a no-op pragma (cipher_version) if supported
              conn.get("PRAGMA cipher_version;", function (verErr) {
                // If cipher_version exists it's a strong signal SQLCipher is present; regardless, attempt a light query to verify the DB can be read with the provided key.
                conn.get("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1;", function (testErr, row) {
                  if (testErr) {
                    // Provide a clear diagnostic for CI logs
                    const msg = 'SQLCipher verification failed: ' + testErr.message + ' — verify sqlite3 is built with SQLCipher and ENCRYPTION_KEY_PATH/key are correct.';
                    return done(new Error(msg), conn);
                  }
                  return done(null, conn);
                });
=======
              // Verify by attempting a light query; if it fails with NOTADB we get a clear diagnostic for CI.
              conn.get("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1;", function (testErr, row) {
                if (testErr) {
                  const msg = 'SQLCipher verification failed: ' + testErr.message + ' — verify sqlite3 is built with SQLCipher and ENCRYPTION_KEY_PATH/key are correct.';
                  return done(new Error(msg), conn);
                }
                return done(null, conn);
>>>>>>> origin/main
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

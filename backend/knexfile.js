const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DB_CLIENT = process.env.DB_CLIENT || process.env.NODE_ENV === 'production' ? 'mysql' : 'sqlite3';

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

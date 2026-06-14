-- migrations/0001_create_audit_logs.sql
-- Create an audit_logs table compatible with SQLite and MySQL/MariaDB.
-- Columns:
--   id            : TEXT/UUID primary key
--   timestamp     : DATETIME when event occurred
--   actor         : text identifying actor (user id, system, service)
--   action        : text describing action (e.g., 'user.delete', 'backup.restore')
--   resource_type : text (e.g., 'user', 'backup')
--   resource_id   : text identifier for the resource (UUID or string)
--   metadata      : JSON/text blob with additional context
-- Index on timestamp for efficient queries by time range

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  actor TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  metadata TEXT
);

-- Create an index on timestamp for both SQLite and MySQL
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);

-- For MySQL, IF NOT EXISTS on CREATE INDEX is not supported on older versions; keep this statement for portability.
-- Note: If you prefer a native JSON column in MySQL, alter the metadata column to JSON in a MySQL-specific migration:
--   ALTER TABLE audit_logs MODIFY COLUMN metadata JSON;


#!/usr/bin/env bash
# Simple backup script template for Vitacora (mysqldump example)
# Requires: MYSQL_POD or MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, DB_NAME, BACKUP_DIR

set -euo pipefail
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

# If using SQLite as DB_CLIENT, copy and gzip the sqlite file as a backup
if [ "${DB_CLIENT:-sqlite3}" = "sqlite3" ]; then
  echo "Detected sqlite3 DB_CLIENT — copying sqlite file"
  DB_FILE=${DB_CONNECTION:-./data/vitacora.sqlite}
  TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
  FILENAME="$BACKUP_DIR/vitacora-backup-$TIMESTAMP.sqlite.gz"
  gzip -c "$DB_FILE" > "$FILENAME"
  # If encryption is enabled and a key file is provided, encrypt the backup file (OpenSSL AES-256-CBC PBKDF2)
  if [ "${ENCRYPTION_ENABLED:-false}" = "true" ] && [ -n "${ENCRYPTION_KEY_PATH:-}" ] && [ -f "${ENCRYPTION_KEY_PATH}" ]; then
    FILENAME_ENC="$FILENAME.enc"
    echo "Encryption enabled — encrypting backup to $FILENAME_ENC"
    openssl enc -aes-256-cbc -pbkdf2 -salt -in "$FILENAME" -out "$FILENAME_ENC" -pass file:"$ENCRYPTION_KEY_PATH"
    sha256sum "$FILENAME_ENC" > "$FILENAME_ENC.sha256"
    rm -f "$FILENAME" "$FILENAME.sha256"
    echo "Encrypted SQLite backup saved to $FILENAME_ENC"
    exit 0
  fi

  sha256sum "$FILENAME" > "$FILENAME.sha256"
  echo "SQLite backup saved to $FILENAME"
fi

TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
FILENAME="$BACKUP_DIR/vitacora-backup-$TIMESTAMP.sql.gz"

echo "Running mysqldump..."
mysqldump -h "${MYSQL_HOST:-localhost}" -u "${MYSQL_USER:-root}" -p"${MYSQL_PASSWORD:-}" "${DB_NAME:-vitacora}" | gzip > "$FILENAME"
sha256sum "$FILENAME" > "$FILENAME.sha256"

echo "Backup saved to $FILENAME"
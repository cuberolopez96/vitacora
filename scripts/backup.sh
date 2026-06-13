#!/bin/sh
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
  sha256sum "$FILENAME" > "$FILENAME.sha256"
  echo "SQLite backup saved to $FILENAME"
  exit 0
fi

TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
FILENAME="$BACKUP_DIR/vitacora-backup-$TIMESTAMP.sql.gz"

echo "Running mysqldump..."
mysqldump -h "${MYSQL_HOST:-localhost}" -u "${MYSQL_USER:-root}" -p"${MYSQL_PASSWORD:-}" "${DB_NAME:-vitacora}" | gzip > "$FILENAME"
sha256sum "$FILENAME" > "$FILENAME.sha256"

echo "Backup saved to $FILENAME"
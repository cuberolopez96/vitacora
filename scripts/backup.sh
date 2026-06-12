#!/bin/sh
# Simple backup script template for Vitacora (mysqldump example)
# Requires: MYSQL_POD or MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, DB_NAME, BACKUP_DIR

set -euo pipefail
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
FILENAME="$BACKUP_DIR/vitacora-backup-$TIMESTAMP.sql.gz"

echo "Running mysqldump..."
mysqldump -h "${MYSQL_HOST:-localhost}" -u "${MYSQL_USER:-root}" -p"${MYSQL_PASSWORD:-}" "${DB_NAME:-vitacora}" | gzip > "$FILENAME"
sha256sum "$FILENAME" > "$FILENAME.sha256"

echo "Backup saved to $FILENAME"
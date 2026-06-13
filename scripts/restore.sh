#!/bin/sh
# Simple restore script template for Vitacora
# Usage examples:
#  RESTORE_FILE=./backups/vitacora-backup-20260101T000000Z.sql.gz ./scripts/restore.sh

set -euo pipefail
RESTORE_FILE="${RESTORE_FILE:-}" 
if [ -z "$RESTORE_FILE" ]; then
  echo "Usage: RESTORE_FILE=path/to/backup ./scripts/restore.sh"
  exit 2
fi

# If restore file ends with .sqlite.gz -> restore sqlite
case "$RESTORE_FILE" in
  *.sqlite.gz)
    echo "Restoring SQLite backup..."
    TMP=$(mktemp)
    gzip -dc "$RESTORE_FILE" > "$TMP"
    DB_FILE=${DB_CONNECTION:-./data/vitacora.sqlite}
    mkdir -p "$(dirname "$DB_FILE")"
    mv "$TMP" "$DB_FILE"
    echo "Restored SQLite DB to $DB_FILE"
    exit 0
    ;;
  *.sql.gz)
    echo "Restoring MySQL/MariaDB SQL backup (gzip-compressed)..."
    if [ -z "${MYSQL_HOST:-}" ] || [ -z "${MYSQL_USER:-}" ]; then
      echo "Please set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD and DB_NAME environment variables." >&2
      exit 2
    fi
    gzip -dc "$RESTORE_FILE" | mysql -h "${MYSQL_HOST}" -u "${MYSQL_USER}" -p"${MYSQL_PASSWORD:-}" "${DB_NAME:-vitacora}"
    echo "Restore completed to ${MYSQL_HOST}/${DB_NAME:-vitacora}"
    exit 0
    ;;
  *)
    echo "Unknown backup format for $RESTORE_FILE" >&2
    exit 2
    ;;
esac
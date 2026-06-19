#!/usr/bin/env bash
# Generate a sanitized ~50MB SQLite fixture at given path (default: tests/fixtures/50MB.sqlite)
# Usage: scripts/generate_sqlite_50mb_fixture.sh <out_path> [target_bytes]
set -euo pipefail
OUT=${1:-tests/fixtures/50MB.sqlite}
TARGET=${2:-52428800} # 50MB default
DIR=$(dirname "$OUT")
mkdir -p "$DIR"
rm -f "$OUT"

echo "Generating SQLite fixture at $OUT (target ${TARGET} bytes)..."

# Create DB and table
sqlite3 "$OUT" <<SQL
PRAGMA journal_mode = OFF;
CREATE TABLE data(id INTEGER PRIMARY KEY, payload BLOB);
BEGIN TRANSACTION;
SQL

# Insert rows with ~1KB blob chunks until file size >= TARGET
i=0
while true; do
  # generate ~1024 bytes of base64 -> ~1368 bytes raw; use dd to produce binary
  openssl rand -out /tmp/payload.bin 1024 >/dev/null 2>&1 || head -c 1024 /dev/urandom > /tmp/payload.bin
  # Use sqlite3 parameter binding via here-doc for speed
  sqlite3 "$OUT" "INSERT INTO data(payload) VALUES(x'$(xxd -p /tmp/payload.bin | tr -d '\n')');"
  i=$((i+1))
  if (( i % 100 == 0 )); then
    size=$(stat -c %s "$OUT" 2>/dev/null || stat -f%z "$OUT")
    echo "Inserted $i rows; current size: ${size} bytes"
    if [ "$size" -ge "$TARGET" ]; then
      break
    fi
  fi
done

sqlite3 "$OUT" "COMMIT;"
rm -f /tmp/payload.bin
size=$(stat -c %s "$OUT" 2>/dev/null || stat -f%z "$OUT")
echo "Fixture created: $OUT (size ${size} bytes, rows inserted: $i)"
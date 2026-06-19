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

# Create DB and table (initial setup)
sqlite3 "$OUT" <<SQL
PRAGMA journal_mode = OFF;
CREATE TABLE data(id INTEGER PRIMARY KEY, payload BLOB);
SQL

# Insert rows in batches (each batch in its own transaction) until file size >= TARGET
batch_size=100
i=0
batch_file=$(mktemp)
payload_file=/tmp/payload.bin

while true; do
  # accumulate a batch of INSERT statements
  echo "BEGIN TRANSACTION;" > "$batch_file"
  for ((j=1; j<=batch_size; j++)); do
    # generate ~1024 bytes of random binary
    openssl rand -out "$payload_file" 1024 >/dev/null 2>&1 || head -c 1024 /dev/urandom > "$payload_file"
    hex=$(xxd -p "$payload_file" | tr -d '\n')
    echo "INSERT INTO data(payload) VALUES(x'$hex');" >> "$batch_file"
    i=$((i+1))
  done
  echo "COMMIT;" >> "$batch_file"

  # apply the batch
  sqlite3 "$OUT" < "$batch_file"

  # report progress and check size
  size=$(stat -c %s "$OUT" 2>/dev/null || stat -f%z "$OUT")
  echo "Inserted $i rows; current size: ${size} bytes"
  if [ "$size" -ge "$TARGET" ]; then
    break
  fi
done

rm -f "$batch_file" "$payload_file"
size=$(stat -c %s "$OUT" 2>/dev/null || stat -f%z "$OUT")
echo "Fixture created: $OUT (size ${size} bytes, rows inserted: $i)"
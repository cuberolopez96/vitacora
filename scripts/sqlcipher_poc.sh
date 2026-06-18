#!/usr/bin/env bash
set -euo pipefail

# Simple SQLCipher PoC script
# Usage:
#   ./scripts/sqlcipher_poc.sh create --key-file unwrapped.key
#   ./scripts/sqlcipher_poc.sh read --key-file unwrapped.key

cmd=${1:-}
shift || true

KEY_FILE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --key-file) KEY_FILE="$2"; shift 2 ;;
    *) shift ;;
  esac
done

if ! command -v sqlcipher >/dev/null 2>&1; then
  echo "sqlcipher not found in PATH. Install SQLCipher to run this PoC." >&2
  exit 0
fi

if [[ "$cmd" == "create" ]]; then
  PLAINTEXT_DB="poc_plain.sqlite"
  ENCRYPTED_DB="poc_encrypted.sqlite"
  echo "Creating plaintext DB: $PLAINTEXT_DB"
  rm -f "$PLAINTEXT_DB" "$ENCRYPTED_DB"
  sqlcipher "$PLAINTEXT_DB" <<'SQL'
PRAGMA key = '';
CREATE TABLE secrets(id TEXT PRIMARY KEY, secret TEXT);
INSERT INTO secrets(id, secret) VALUES('s1','my secret value');
.exit
SQL
  if [[ -z "$KEY_FILE" ]]; then
    echo "No key-file provided. Generating ephemeral key (ephemeral.key)"
    KEY_FILE="ephemeral.key"
    head -c 32 /dev/urandom > "$KEY_FILE"
  fi
  KEY=$(xxd -p -c 256 "$KEY_FILE")
  echo "Exporting encrypted DB to $ENCRYPTED_DB using key from $KEY_FILE"

  # Use SQLCipher export pattern: open plaintext, attach encrypted, export
  sqlcipher "$PLAINTEXT_DB" <<SQL
PRAGMA key = "";
ATTACH DATABASE '$ENCRYPTED_DB' AS encrypted KEY 'x"$KEY"';
SELECT sqlcipher_export('encrypted');
DETACH DATABASE encrypted;
.exit
SQL
  echo "Encrypted DB created: $ENCRYPTED_DB"
  echo "Note: Keep your key file safe. This PoC writes key files to working dir when requested."
  exit 0
fi

if [[ "$cmd" == "read" ]]; then
  ENCRYPTED_DB="poc_encrypted.sqlite"
  if [[ ! -f "$ENCRYPTED_DB" ]]; then
    echo "$ENCRYPTED_DB not found. Run 'create' first." >&2
    exit 1
  fi
  if [[ -z "$KEY_FILE" ]]; then
    echo "--key-file is required to read the encrypted DB" >&2
    exit 1
  fi
  KEY=$(xxd -p -c 256 "$KEY_FILE")
  echo "Opening encrypted DB with key from $KEY_FILE"
  sqlcipher "$ENCRYPTED_DB" <<SQL
PRAGMA key = 'x"$KEY"';
SELECT * FROM secrets;
.exit
SQL
  exit 0
fi

echo "Usage: $0 (create|read) --key-file <keyfile>"
exit 1

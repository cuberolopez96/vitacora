#!/usr/bin/env bash
set -euo pipefail

# Simple local KMS simulation: generate a data key and wrap/unwrap it with openssl symmetric encryption
# Usage:
#  ./scripts/kms_simulate.sh generate   -> creates data.key and data.key.enc (wrapped with passphrase)
#  ./scripts/kms_simulate.sh unwrap    -> decrypts data.key.enc to unwrapped.key using passphrase from KMS_PASS env
#  ./scripts/kms_simulate.sh cleanup   -> removes key files

cmd=${1:-}

case "$cmd" in
  generate)
    echo "Generating data key (32 bytes) -> data.key"
    head -c 32 /dev/urandom > data.key
    echo "Wrapping data.key -> data.key.enc using a simulated KMS passphrase"
    : ${KMS_PASS:=test-wrap-pass}
    # Use AES-256-CBC with PBKDF2
    openssl enc -aes-256-cbc -pbkdf2 -salt -in data.key -out data.key.enc -pass pass:"$KMS_PASS"
    echo "Wrote data.key and data.key.enc (wrapped). Set KMS_PASS to unwrap."
    ;;
  unwrap)
    : ${KMS_PASS:?"KMS_PASS must be set to unwrap the key (e.g. export KMS_PASS=test-wrap-pass)"}
    echo "Unwrapping data.key.enc -> unwrapped.key"
    openssl enc -d -aes-256-cbc -pbkdf2 -in data.key.enc -out unwrapped.key -pass pass:"$KMS_PASS"
    echo "Unwrapped key available at unwrapped.key (use with sqlcipher_poc.sh --key-file unwrapped.key)"
    ;;
  cleanup)
    rm -f data.key data.key.enc unwrapped.key
    echo "Cleaned up key files"
    ;;
  *)
    echo "Usage: $0 {generate|unwrap|cleanup}"
    exit 1
    ;;
esac

# KMS + SQLCipher PoC

This document describes a small proof-of-concept to demonstrate:

- Using SQLCipher to produce an encrypted SQLite database file.
- Simulating a Key Management Service (KMS) locally by wrapping/unwraping an encryption key with OpenSSL.

Goals
- Provide reproducible commands to create an encrypted DB, open it, and show how an encrypted key file can be used.
- Keep the PoC local and safe (no real KMS keys or cloud calls).

Prerequisites
- sqlcipher CLI installed (https://www.zetetic.net/sqlcipher/). On Debian/Ubuntu: `sudo apt-get install sqlcipher` or build from source.
- openssl available (usually present on Linux/macOS).
- bash shell to run the scripts in `scripts/`.

Files added in this PoC
- scripts/sqlcipher_poc.sh — create a sample plaintext DB, create an encrypted copy using SQLCipher, and demonstrate reading it with a key file.
- scripts/kms_simulate.sh — simulate wrapping (encrypt) and unwrapping (decrypt) a key file with OpenSSL to emulate KMS behavior.

Quick walkthrough
1. Generate a fresh random key and wrap it (simulate KMS):
   ./scripts/kms_simulate.sh generate

2. Create an encrypted SQLCipher DB using the unwrapped key:
   ./scripts/sqlcipher_poc.sh create --key-file unwrapped.key

3. Inspect the encrypted DB (read a value):
   ./scripts/sqlcipher_poc.sh read --key-file unwrapped.key

Security notes
- This is a PoC only. In production use a real KMS (AWS KMS, Google KMS, Azure Key Vault) and never store unencrypted keys in the repo or CI logs.
- Prefer using envelope encryption: store DB encrypted with a data key; encrypt the data key with KMS; persist only the encrypted data key.

Next steps (optional)
- Add CI job that verifies backup encryption and restore using the simulated KMS.
- Integrate SQLCipher into the Node backend (build or use a SQLCipher-enabled sqlite3 binary/module).
- Replace the local KMS-simulation with calls to a real KMS keywrap API.


References
- SQLCipher docs: https://www.zetetic.net/sqlcipher/
- SQLCipher export pattern: ATTACH DATABASE 'encrypted.db' AS encrypted KEY '...'; SELECT sqlcipher_export('encrypted');


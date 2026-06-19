# Cifrado en reposo (opcional) — Vitacora

Propósito
---------
Documentar opciones prácticas y aceptaciones para habilitar cifrado en reposo como una característica opt-in.

Requisitos y alcance
-------------------
- Debe ser opt-in: por defecto desactivado en instalaciones personales (RPi) para facilitar recuperación.
- Soportar dos modos comunes:
  1. Aplicación-level encryption for SQLite using SQLCipher (recommended for single-file DB encryption).
  2. Engine/disk-level encryption for MySQL/MariaDB (filesystem encryption or InnoDB tablespace encryption) for multiuser deployments.
- No claves se deben commitear. Proveer ejemplos para local key files and KMS-backed keys (AWS KMS, GCP KMS, HashiCorp Vault).

SQLite (local installs)
------------------------
- Recommended approach: SQLCipher (https://www.zetetic.net/sqlcipher/). SQLCipher is a fork of SQLite that provides transparent AES-256 page-level encryption.
- Example flow (local opt-in):
  1. Install SQLCipher or use node-sqlcipher binding for Node.js.
  2. On first-time enablement, generate an encryption key and store it in a secure path (e.g., /etc/vitacora/keys/vitacora.key) with filesystem permissions restricted to the service user.
  3. Set env: ENCRYPTION_ENABLED=true and ENCRYPTION_KEY_PATH=/etc/vitacora/keys/vitacora.key
  4. Migration/restore: provide scripts that accept the key and perform `sqlcipher` operations to open and export/import DB.
- Backup: when ENCRYPTION_ENABLED is true, backups should be exported in encrypted form (e.g., use sqlcipher to export an encrypted dump) or the raw DB file is already encrypted. Document restore steps precisely.

MySQL / MariaDB (multiuser)
---------------------------
- Prefer engine or disk-level encryption for MySQL deployments in production: InnoDB tablespace encryption or filesystem-level encrypted volumes (LUKS, dm-crypt).
- Key management: prefer cloud KMS or Vault for production. Document how to configure DB server for TDE or mount encrypted volume and restore.

Key Management & KMS
---------------------
- Offer three options in docs/examples:
  - Local key file (for single-server installs): path configured via ENCRYPTION_KEY_PATH and protected by OS permissions.
  - Environment-reference (less secure): ENCRYPTION_KEY env var — allowed for dev only and explicitly discouraged for production.
  - KMS (recommended for production): ENCRYPTION_KMS_PROVIDER=aws|gcp|vault and ENCRYPTION_KMS_KEY_ID to instruct runtime to fetch key at startup.

KMS providers (runtime)
-----------------------
- This repo implements a pluggable KMS loader at backend/lib/kms. Use ENCRYPTION_KMS_PROVIDER to select a provider.
  - simulate (default for CI/dev): wraps scripts/kms_simulate.sh to generate and unwrap a test key. Useful for CI PoC and local testing.
  - gcp: GCP KMS provider (backend/lib/kms/providers/gcp.js). Requires installing @google-cloud/kms and setting ENCRYPTION_KMS_KEY_ID. The provider reads a wrapped ciphertext (ENCRYPTION_WRAPPED_KEY_B64 or data.key.enc) and writes the unwrapped key to ENCRYPTION_KEY_PATH or a secure temp path (OS temp dir) by default. Do not commit this file.

How to fetch key at runtime (example)
------------------------------------
- Run the helper before starting the backend so knex can use the unwrapped key via ENCRYPTION_KEY_PATH:

  # from repo root
  node backend/bin/fetch-kms-key.js

- The helper exits non-zero on error and writes unwrapped.key on success. CI already invokes this script in the encryption integration workflow.

CI notes
--------
- Do NOT put real keys in CI. Use simulate provider (ENCRYPTION_KMS_PROVIDER=simulate) which generates ephemeral keys at job time.
- Example workflow step (already present in .github/workflows/encryption-integration.yml):

  - name: Fetch/unwrap KMS key
    run: |
      cd backend
      node bin/fetch-kms-key.js

- For GCP usage, configure service account credentials securely and provide wrapped ciphertext via ENCRYPTION_WRAPPED_KEY_B64 or an artifact containing data.key.enc.

Runtime integration
-------------------
- The backend attempts to resolve an encryption key at startup when ENCRYPTION_KMS_PROVIDER is set and no ENCRYPTION_KEY/ENCRYPTION_KEY_PATH is provided. The current PoC uses scripts/kms_simulate.sh to unwrap an ephemeral key and exposes it as ENCRYPTION_KEY_PATH for the knex/SQLCipher integration.

Acceptance tests and CI
-----------------------
- Integration tests to validate:
  1. Enabling encryption, performing a backup, and restoring from that backup using the correct key.
  2. Attempting restore without key must fail (expected).
- CI: do not store real keys in CI. Use ephemeral/test keys generated at job runtime and cleaned up after. A dedicated workflow (.github/workflows/encryption-integration.yml) runs an end-to-end PoC on Ubuntu runners: it installs SQLCipher, builds the sqlite3 Node binding against SQLCipher, generates/unwraps a test key, creates an encrypted DB, and runs an integration test that opens the encrypted DB via Knex.

Local PoC using Node-based encryption (example)
---------------------------------------------

This repository includes useful scripts to test the backup/restore flow locally without requiring OpenSSL:

1. Generate a local passphrase file:

   node scripts/generate_key.js

   This will create keys/test.key (permission 600) with a randomly generated passphrase.

2. Create a compressed backup of the current SQLite DB:

   node scripts/node_backup.js

   The backup will be placed in backups/ as vitacora-backup-<timestamp>.sqlite.gz

3. Encrypt the backup using the passphrase file:

   node scripts/node_encrypt.js keys/test.key backups/<your-backup-file>.sqlite.gz

   This produces backups/<your-backup-file>.sqlite.gz.enc

4. Decrypt and restore:

   node scripts/node_decrypt.js keys/test.key backups/<your-backup-file>.sqlite.gz.enc
   # rename the decrypted file to have .sqlite.gz suffix if needed, then
   RESTORE_FILE=backups/<your-decrypted-backup>.sqlite.gz DB_CONNECTION=./data/vitacora_restore_test.sqlite ./scripts/restore.sh

Notes:
- These scripts are PoC and use PBKDF2 with SHA-256 for key derivation and AES-256-CBC for encryption. They are intended for local verification. For production, integrate with a KMS and secure key handling.
- Do not commit keys/test.key to source control.

Operational notes
-----------------
- Recovery: Provide a documented "key rotation and recovery" section explaining how to rotate keys and re-encrypt DB safely.
- Performance: Document expected overhead for SQLCipher and plan for performance testing when enabling in CI.

Security notes
--------------
- Never commit keys.
- Recommend using OS-level access controls to protect key files.

References
----------
- SQLCipher: https://www.zetetic.net/sqlcipher/
- MySQL InnoDB tablespace encryption: https://dev.mysql.com/doc/refman/en/innodb-tablespace-encryption.html
- Best practices for KMS: follow cloud provider docs or Vault guides.

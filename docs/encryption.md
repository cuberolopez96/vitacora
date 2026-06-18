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
  - KMS (recommended for production): ENCRYPTION_KMS=aws|gcp|vault and ENCRYPTION_KMS_KEY_ID to instruct runtime to fetch key at startup.

Acceptance tests and CI
-----------------------
- Integration tests to validate:
  1. Enabling encryption, performing a backup, and restoring from that backup using the correct key.
  2. Attempting restore without key must fail (expected).
- CI: do not store real keys in CI. Use ephemeral/test keys generated at job runtime and cleaned up after.

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

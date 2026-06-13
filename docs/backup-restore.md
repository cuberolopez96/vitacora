# Backup UI & Restore (scaffold)

This file documents the scaffolded backup UI and restore instructions added by the implementation task.

Files added:
- backend/src/routes/backups.js — API endpoints (GET /api/backups and GET /api/backups/:name/download)
- docs/sample-backup.sql — example backup file available to download from the API
- frontend/src/ops/backups.jsx — small UI scaffold to list and download backups

How to test locally (recommended):
1. Start the backend: cd backend && npm install && npm run dev
2. Visit http://localhost:8080/api/backups — should return a JSON list (may be empty). If docs/sample-backup.sql exists, it should appear.
3. Download via: http://localhost:8080/api/backups/sample-backup.sql/download

Restore guidance (manual):
- The sample backup is an example SQL file. To restore into SQLite:
  - sqlite3 mydb.sqlite < sample-backup.sql
- For MySQL/MariaDB the production backup script should use mysqldump; adapt the command per DB engine.

Restore scripts added (scaffold):
- scripts/restore.sh — POSIX shell helper to restore .sqlite.gz or .sql.gz files
- scripts/restore.ps1 — PowerShell equivalent for Windows

Examples:
- SQLite: RESTORE_FILE=./backups/vitacora-backup-...sqlite.gz ./scripts/restore.sh
- MySQL: RESTORE_FILE=./backups/vitacora-backup-....sql.gz MYSQL_HOST=127.0.0.1 MYSQL_USER=root MYSQL_PASSWORD=pass DB_NAME=vitacora ./scripts/restore.sh

Notes:
- These scripts are minimal, intended for manual operator use. They assume gzip/mysql/sqlite3 are available in PATH and that the restore target is correct. Review and adapt for production (backups verification, transactional restore, downtime windows) as follow-up work.

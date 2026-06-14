#!/usr/bin/env bash
# scripts/test_restore_performance.sh
# POSIX-compatible script to measure backup+restore elapsed time.
# Usage:
#   scripts/test_restore_performance.sh <backup-artifact-path> <restore-command...>
# Example:
#   scripts/test_restore_performance.sh tests/fixtures/fixture-50mb.sqlite sqlite3 restored.db ".restore 'tests/fixtures/fixture-50mb.sqlite'"
# The script runs the provided restore command (all args after the artifact path are treated as the command).
# Exit codes:
#   0 - restore command exited 0 and elapsed time <= threshold (default 600s)
#   1 - restore command failed (non-zero exit)
#   2 - restore succeeded but elapsed time exceeded threshold
#   3 - usage or missing arguments
#
# Notes:
# - Designed to be POSIX-compatible and run under bash/sh, Git Bash, WSL or CI runners.
# - The restore command may be any shell-invokable command. Provide full command and args after the artifact path.
# - Threshold defaults to 600 seconds (10 minutes) but can be overridden with the TEST_RESTORE_THRESHOLD env var.
#
# How to generate a sanitized ~50MB fixture locally (not included in repo):
# - For SQLite: create or export a sanitized DB and trim/pad to ~50MB using SQL or a copy. Example (rough):
#     sqlite3 sanitized.db ".dump" > dump.sql
#     # sanitize personally identifiable data in dump.sql
#     sqlite3 fixture-50mb.sqlite ".read dump.sql"
#     # You can pad the DB with synthetic rows until file size ~50MB for realistic restore times.
# - For MySQL: use mysqldump to create a dump, then sanitize and compress as needed. Ensure your restore command matches the dump format.
# - Place the fixture in tests/fixtures/ and reference it when running this script.

set -eu

# Defaults
THRESHOLD=${TEST_RESTORE_THRESHOLD:-600}

usage() {
  cat <<EOF
Usage: $0 <backup-artifact-path> <restore-command...>

Runs the provided restore command using the given backup artifact and measures elapsed time.
Returns exit code 0 when the restore command succeeds and elapsed time is <= ${THRESHOLD}s.

Example:
  $0 tests/fixtures/fixture-50mb.sqlite sqlite3 restored.db ".restore 'tests/fixtures/fixture-50mb.sqlite'"

You may override threshold by exporting TEST_RESTORE_THRESHOLD (seconds).
EOF
}

if [ "$#" -lt 2 ]; then
  usage
  exit 3
fi

ARTIFACT="$1"
shift

if [ ! -e "$ARTIFACT" ]; then
  echo "ERROR: backup artifact not found: $ARTIFACT" >&2
  exit 3
fi

# Restore command is everything after the artifact path
RESTORE_CMD=("$@")

echo "Starting restore performance test"
echo "Artifact: $ARTIFACT"
echo "Threshold: ${THRESHOLD}s"
echo "Restore command: ${RESTORE_CMD[*]}"

# Start timer (POSIX)
START_TS=$(date +%s)

# Run restore command
"${RESTORE_CMD[@]}"
RC=$?

END_TS=$(date +%s)
ELAPSED=$((END_TS - START_TS))

echo "Restore exited with code: $RC"
echo "Elapsed seconds: $ELAPSED"

if [ $RC -ne 0 ]; then
  echo "Restore command failed (exit $RC)"
  exit 1
fi

if [ $ELAPSED -le $THRESHOLD ]; then
  echo "PASS: restore completed within threshold (${ELAPSED}s <= ${THRESHOLD}s)"
  exit 0
else
  echo "FAIL: restore exceeded threshold (${ELAPSED}s > ${THRESHOLD}s)"
  exit 2
fi

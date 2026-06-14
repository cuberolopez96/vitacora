Tests fixtures

This directory is intended to hold test fixtures used by integration and performance tests.

Do NOT commit real production data or PII to this repository.

Recommended fixture for restore performance test

- Filename: tests/fixtures/fixture-50mb.sqlite  (or fixture-50mb.sql for dump files)
- Purpose: A sanitized SQLite database or SQL dump of approximately 50MB to emulate real-world restore times.
- How to add:
  1. Create or export a sanitized dataset locally.
  2. Remove or obfuscate any personal data (names, emails, tokens).
  3. Ensure the final file is ~50MB (you can pad with synthetic rows if needed for performance testing).
  4. Add the file to the repository *only if* you have explicit permission and it contains no secrets. Prefer hosting the fixture externally (artifact storage) and reference it in CI.

Running the restore performance test locally

Use the provided script to run a restore using the fixture and measure elapsed time:

  scripts/test_restore_performance.sh tests/fixtures/fixture-50mb.sqlite sqlite3 restored.db ".restore 'tests/fixtures/fixture-50mb.sqlite'"

Or for a SQL dump restore to MySQL (example):

  scripts/test_restore_performance.sh tests/fixtures/fixture-50mb.sql sh -c "mysql -u root -p\$MYSQL_PWD mydb < tests/fixtures/fixture-50mb.sql"

CI notes

- Prefer to store large fixtures outside the Git repo (CI artifacts, S3, GH releases). If the CI runner downloads the fixture to tests/fixtures/ before running the performance test, the test script will locate it by path.
- Ensure the fixture is accessible to the CI environment and that restore commands run in an isolated test DB instance.


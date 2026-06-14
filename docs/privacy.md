# Privacy: Data Export and Deletion Endpoints

This document describes the required API endpoints and acceptance criteria for user data export and deletion/anonymization to satisfy the project constitution and privacy-related tasks.

API endpoints

1) Export user data

- Endpoint: GET /api/me/export
- Purpose: Allow a user (or maintainer for a given user ID in multi-user installs) to retrieve all personal data held by the system in a machine-readable format.
- Query parameters: format (optional) — `json` (default) or `zip` (zip containing JSON/CSV exports)
- Response: 200 with Content-Type `application/json` or `application/zip` and a payload containing all user records (user profile, habits, entries, backups metadata, audit logs related to the user if permitted by policy).
- Authentication: user must be authenticated and only receive their own data unless caller has admin/maintainer privileges and requests a specific user ID.

Example (JSON):

curl -H "Authorization: Bearer $TOKEN" "https://example.org/api/me/export?format=json" -o mydata.json

Example (ZIP):

curl -H "Authorization: Bearer $TOKEN" "https://example.org/api/me/export?format=zip" -o mydata.zip

Acceptance criteria for export

- The endpoint returns 200 and the exported payload is a complete representation of the user's personal data.
- Export schema must be documented (at least in human-readable form) and include top-level keys: user, habits, entries, backups, audit_events (optional; may be filtered).
- Exports do not include secrets (password hashes, JWT secrets, or other system-wide secrets). If including password hashes is required for portability, clearly document and restrict access to maintainers.
- Export respects privacy policy: do not include data of other users in the same export unless admin privileges are explicitly used.

Testing notes for export

- Integration tests should authenticate as a test user, create sample data (habits, entries, backups), call the export endpoint and validate the returned structure and sample values.
- E2E tests can download ZIP and inspect contents.
- Provide a small fixture with expected JSON structure to validate against (see tests/fixtures README for adding larger dumps).

2) Delete or Anonymize user data

Two flows are supported depending on deployment:

A) Single‑user or self‑managed install (anonymize)
- Endpoint: POST /api/me/anonymize
- Purpose: Replace personal identifiers with anonymous values while preserving integrity for single-user installs where full deletion may break the installation.
- Behavior: Replace user.name, user.email and any PII fields with placeholder values, remove external identifiers (e.g., OAuth tokens), and log the operation in audit_logs.
- Response: 200 and a JSON body indicating anonymization completion.
- Authentication: Must be authenticated as the user.

Example:

curl -X POST -H "Authorization: Bearer $TOKEN" "https://example.org/api/me/anonymize"

B) Multi‑user or admin‑driven irreversible deletion
- Endpoint: DELETE /api/me  (or DELETE /api/users/{id} for admin targeting a specific user)
- Purpose: Permanently remove the user's personal data from primary tables. Backups and logs may still exist per retention/forensics policy — document retention rules.
- Behavior: Delete rows belonging to the user from user-owned tables (users, habits, entries, backups metadata). Optionally, anonymize audit_logs rather than deleting them to preserve incident tracing (use a policy-driven approach).
- Response: 204 No Content on success. If deletion cannot proceed due to policy or dependencies, return 409 with an explanation.
- Authentication: Must be authenticated as the user (self-delete) or as an admin for other users.

Example (self-delete):

curl -X DELETE -H "Authorization: Bearer $TOKEN" "https://example.org/api/me"

Example (admin delete):

curl -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" "https://example.org/api/users/123e4567-e89b-12d3-a456-426614174000"

Acceptance criteria for deletion/anonymization

- The endpoint enforces authentication and authorization checks.
- After deletion/anonymization, exported data for that user should either be absent (deletion) or show anonymized placeholders (anonymization).
- Operation is recorded in audit_logs with actor, action (delete/anonymize), resource_type=user, resource_id and metadata describing the operation.
- Provide documentation for retention and how to remove data from backups if required by local law or policy.

Testing notes for deletion/anonymization

- Integration tests should:
  - Create a user and data, call anonymize and verify personal fields are replaced and that the user record still exists (anonymize flow).
  - Create a user and data, call delete and verify that primary records are removed and endpoints requiring authentication for that user fail afterward.
  - Verify audit_logs contains a corresponding entry for the operation.

- For CI, run these tests in an isolated DB instance or ephemeral container; ensure no production credentials are used.

Operational notes and recommendations

- Backups: Document in docs/backup.md (or quickstart) how to handle backups containing deleted users. Consider a policy for reprocessing backups to remove PII on user request.
- Audit logs: Use the audit_logs table (see migrations) to record sensitive operations. Consider retention policy and access controls: restrict /api/audit to maintainer/admin roles and protect logs in backups.
- GDPR-style requests: Provide an admin guide with steps to locate and remove data from backups if legal obligations require complete erasure.

References

- Implementations should refer to docs/privacy.md for API semantics and tests/fixtures for sample fixtures.

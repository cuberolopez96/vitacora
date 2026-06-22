Vitacora E2E tests (Playwright)

Quick start:

1. cd e2e
2. npm install
3. npm run install:browsers   # installs Playwright browser binaries
4. E2E_BASE_URL=http://localhost:3000 npm test

Notes:
- The repository-level CI will add a workflow to run these tests against a deployed preview or local services.
- Update selectors in tests/login.spec.js when the app's auth UI is available.

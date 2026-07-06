const { test, expect } = require('@playwright/test');

// Simple connectivity/login smoke test — adapt selectors to your app when ready.
test('home page responds', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:5173';
  const res = await page.goto(base, { waitUntil: 'domcontentloaded' });
  // Ensure the site is reachable
  expect(res && res.ok()).toBeTruthy();
});

// Login flow test: exercise auth API and a protected endpoint. Skips if auth not enabled on server.
const API_BASE = process.env.API_BASE || 'http://localhost:8080/api';

test('login flow via API and access protected route', async ({ request, page }) => {
  // Try to login via API. If auth is not enabled, server returns 400 { error: 'Auth not enabled' }
  const adminPw = process.env.ADMIN_PASSWORD || '';
  const loginRes = await request.post(API_BASE + '/auth/login', { data: { password: adminPw } });

  if (loginRes.status() === 400) {
    const body = await loginRes.json().catch(() => ({}));
    if (body && body.error && body.error.toLowerCase().includes('auth not enabled')) {
      test.skip('Auth not enabled on server; skipping login flow');
    }
  }

  expect(loginRes.ok()).toBeTruthy();

  // Determine token vs session behavior
  const loginBody = await loginRes.json().catch(() => ({}));
  let exportRes;
  if (loginBody && loginBody.token) {
    // JWT strategy — include Authorization header
    exportRes = await request.get(API_BASE + '/me/export', { headers: { authorization: `Bearer ${loginBody.token}` } });
  } else {
    // Cookie/session strategy — request fixture preserves cookies
    exportRes = await request.get(API_BASE + '/me/export');
  }

  expect(exportRes.ok()).toBeTruthy();

  // Optionally, verify response is JSON
  const payload = await exportRes.json().catch(() => null);
  expect(payload).not.toBeNull();
});

const { test, expect } = require('@playwright/test');

// Simple connectivity/login smoke test — adapt selectors to your app when ready.
test('home page responds', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
  const res = await page.goto(base, { waitUntil: 'domcontentloaded' });
  // Ensure the site is reachable
  expect(res && res.ok()).toBeTruthy();
});

// Placeholder for a login flow example (disabled until selectors are known)
test.skip('login flow (placeholder)', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.goto(base);
  // await page.fill('input[name="email"]', 'test@example.com');
  // await page.fill('input[name="password"]', 'password');
  // await page.click('button[type="submit"]');
  // await expect(page).toHaveURL(/dashboard/);
});

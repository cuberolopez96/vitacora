// Playwright config for Vitacora E2E
const { devices } = require('@playwright/test');

module.exports = {
  testDir: './tests',
  timeout: 60 * 1000,
  expect: { timeout: 5000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    headless: true,
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    viewport: { width: 1280, height: 720 }
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
};

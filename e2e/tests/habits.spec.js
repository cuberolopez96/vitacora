const { test, expect } = require('@playwright/test');

const API_BASE = process.env.E2E_API_BASE || 'http://localhost:8080/api';
const UI_BASE = process.env.E2E_BASE_URL || 'http://localhost:5173';

// Create habit via UI, mark today, and verify via API
test('create habit and mark today', async ({ page, request }) => {
  await page.goto(UI_BASE);

  const title = 'E2E Habit ' + Date.now();
  await page.locator('input[placeholder="Nuevo hábito"]').fill(title);
  await page.click('text=Crear');

  // Wait for the habit to appear in the list
  const item = page.locator('li', { hasText: title }).first();
  await expect(item).toBeVisible({ timeout: 5000 });

  // Click Mark Today (button text: 'Marcar hoy')
  await item.locator('text=Marcar hoy').click();

  // Find habit id using API and verify there is at least one entry
  const habitsRes = await request.get(API_BASE + '/habits');
  expect(habitsRes.ok()).toBeTruthy();
  const habits = await habitsRes.json();
  const habit = habits.find(h => h.title === title);
  expect(habit).toBeTruthy();

  const entriesRes = await request.get(`${API_BASE}/habits/${habit.id}/entries`);
  expect(entriesRes.ok()).toBeTruthy();
  const entries = await entriesRes.json();
  expect(Array.isArray(entries)).toBeTruthy();
  expect(entries.length).toBeGreaterThanOrEqual(1);
});

// Backup endpoints skeleton: list and download (404 case)
test('backups endpoints skeleton', async ({ request }) => {
  const res = await request.get(API_BASE + '/backups');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(Array.isArray(body.backups)).toBeTruthy();

  // Request a non-existent backup and expect 404
  const dl = await request.get(API_BASE + '/backups/non-existent-file.tar');
  expect(dl.status()).toBe(404);
});

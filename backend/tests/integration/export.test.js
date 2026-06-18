const { build } = require('../../src/server');
const fs = require('fs');
const path = require('path');

let app;
const tempDb = path.resolve(__dirname, '..', '..', 'data', 'test.sqlite');

beforeAll(async () => {
  process.env.NODE_ENV = 'development';
  process.env.DB_CLIENT = 'sqlite3';
  // ensure data dir exists
  const dataDir = path.resolve(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  // ensure a fresh test DB file
  if (fs.existsSync(tempDb)) fs.unlinkSync(tempDb);
  // point knexfile to use this file via env override
  process.env.DB_FILE = tempDb;

  app = build({ logger: false });
  await app.ready();
  // run migrations
  await app.knex.migrate.latest();
});

afterAll(async () => {
  try {
    await app.knex.migrate.rollback();
  } catch (e) {}
  await app.close();
  if (fs.existsSync(tempDb)) fs.unlinkSync(tempDb);
});

test('GET /api/export returns exported_at and data.entries', async () => {
  // insert a sample entry
  const userId = 'u1';
  await app.knex('users').insert({ id: userId, name: 'test' }).catch(() => {});
  const habitId = 'h1';
  await app.knex('habits').insert({ id: habitId, user_id: userId, title: 'sample', cadence: 'daily' }).catch(() => {});
  await app.knex('entries').insert({ id: 'e1', habit_id: habitId, date: '2026-06-14', status: 'completed' });

  const res = await app.inject({ method: 'GET', url: '/api/export' });
  expect(res.statusCode).toBe(200);
  const payload = JSON.parse(res.payload);
  expect(payload).toHaveProperty('exported_at');
  expect(payload).toHaveProperty('data');
  expect(payload.data).toHaveProperty('entries');
  expect(Array.isArray(payload.data.entries)).toBe(true);
  expect(payload.data.entries.length).toBeGreaterThanOrEqual(1);
});

test('GET /api/export?format=csv returns canonical CSV header', async () => {
  // insert a sample entry (ensure DB has at least one entry)
  const userId = 'u2';
  await app.knex('users').insert({ id: userId, name: 'test2' }).catch(() => {});
  const habitId = 'h2';
  await app.knex('habits').insert({ id: habitId, user_id: userId, title: 'sample2', cadence: 'daily' }).catch(() => {});
  await app.knex('entries').insert({ id: 'e2', habit_id: habitId, date: '2026-06-15', status: 'missed' });

  const res = await app.inject({ method: 'GET', url: '/api/export?format=csv' });
  expect(res.statusCode).toBe(200);
  // CSV payload: first line should be the headers
  const firstLine = res.payload.split('\n')[0].trim();
  expect(firstLine).toBe('userId,habitId,date,status,note');
});

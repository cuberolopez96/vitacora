const { build } = require('../../src/server');
const fs = require('fs');
const path = require('path');

let app;
const tempDb = path.resolve(__dirname, '..', '..', 'data', 'test_auth.sqlite');

beforeAll(async () => {
  process.env.NODE_ENV = 'development';
  process.env.DB_CLIENT = 'sqlite3';
  process.env.AUTH_ENABLED = 'true';
  process.env.AUTH_STRATEGY = 'cookie';
  process.env.SESSION_SECRET = 'test-session-secret';

  // ensure data dir exists
  const dataDir = path.resolve(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  // ensure a fresh test DB file
  if (fs.existsSync(tempDb)) fs.unlinkSync(tempDb);
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

test('POST /api/auth/login sets session cookie and allows access to protected route', async () => {
  // ensure there's a user to be returned as fallback
  const userId = 'u-auth';
  await app.knex('users').insert({ id: userId, name: 'authuser' }).catch(() => {});

  // login
  const loginRes = await app.inject({ method: 'POST', url: '/api/auth/login', payload: {} });
  expect(loginRes.statusCode).toBe(200);
  const setCookie = loginRes.headers['set-cookie'];
  expect(setCookie).toBeDefined();
  // assemble Cookie header
  const cookieHeader = Array.isArray(setCookie) ? setCookie.map(c => c.split(';')[0]).join('; ') : setCookie.split(';')[0];

  // access protected route
  const res = await app.inject({ method: 'GET', url: '/api/me/export', headers: { Cookie: cookieHeader } });
  expect(res.statusCode).toBe(200);
  const payload = JSON.parse(res.payload);
  expect(payload).toHaveProperty('exported_at');
  expect(payload).toHaveProperty('data');
});

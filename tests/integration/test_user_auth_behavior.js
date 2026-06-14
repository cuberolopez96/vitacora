// Test auth behavior for /api/me endpoints

'use strict';

const Fastify = require('fastify');
const userRoutes = require('../../backend/src/routes/user');
const authPlugin = require('../../backend/src/plugins/auth');
const jwt = require('jsonwebtoken');

async function run() {
  const fastify = Fastify();

  // Enable auth for this test
  process.env.AUTH_ENABLED = 'true';
  process.env.JWT_SECRET = 'test-secret';

  // Register auth plugin which will register fastify-jwt when enabled
  await fastify.register(authPlugin);
  await fastify.register(userRoutes);

  // 1) No token -> 401
  const r1 = await fastify.inject({ method: 'GET', url: '/api/me/export' });
  console.log('No token status:', r1.statusCode);

  // 2) Invalid token -> 401
  const r2 = await fastify.inject({ method: 'GET', url: '/api/me/export', headers: { Authorization: 'Bearer badtoken' } });
  console.log('Invalid token status:', r2.statusCode);

  // 3) Valid token -> 200
  const token = jwt.sign({ sub: 'test-user' }, process.env.JWT_SECRET);
  const r3 = await fastify.inject({ method: 'GET', url: '/api/me/export', headers: { Authorization: `Bearer ${token}` } });
  console.log('Valid token status:', r3.statusCode);

  // Also test DELETE
  const d1 = await fastify.inject({ method: 'DELETE', url: '/api/me' });
  console.log('DELETE no token status:', d1.statusCode);
  const d2 = await fastify.inject({ method: 'DELETE', url: '/api/me', headers: { Authorization: 'Bearer badtoken' } });
  console.log('DELETE invalid token status:', d2.statusCode);
  const d3 = await fastify.inject({ method: 'DELETE', url: '/api/me', headers: { Authorization: `Bearer ${token}` } });
  console.log('DELETE valid token status:', d3.statusCode);

  await fastify.close();

  const pass = (r1.statusCode === 401 && r2.statusCode === 401 && r3.statusCode === 200 && d1.statusCode === 401 && d2.statusCode === 401 && (d3.statusCode === 204 || d3.statusCode === 200));
  if (pass) {
    console.log('Auth behavior tests: PASS');
    process.exit(0);
  } else {
    console.error('Auth behavior tests: FAIL');
    process.exit(1);
  }
}

if (require.main === module) run().catch(err => { console.error(err); process.exit(1); });

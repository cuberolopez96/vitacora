// Integration-style test using Fastify inject to validate the /api/me/export and DELETE /api/me endpoints.
// This is a lightweight test that doesn't require the full app; it registers the routes directly.

'use strict';

const Fastify = require('fastify');
const userRoutes = require('../../backend/src/routes/user');

async function run() {
  const fastify = Fastify();
  await fastify.register(userRoutes);

  // Test export
  const exp = await fastify.inject({ method: 'GET', url: '/api/me/export' });
  console.log('GET /api/me/export status:', exp.statusCode);
  console.log('Body sample:', exp.body.substring(0, 200));

  // Test delete
  const del = await fastify.inject({ method: 'DELETE', url: '/api/me' });
  console.log('DELETE /api/me status:', del.statusCode);

  await fastify.close();

  // Exit codes: 0 for success, 1 for failure
  if (exp.statusCode === 200 && (del.statusCode === 204 || del.statusCode === 200)) {
    console.log('Integration stub: PASS');
    process.exit(0);
  }
  console.error('Integration stub: FAIL');
  process.exit(1);
}

if (require.main === module) {
  run().catch(err => {
    console.error('Error running integration stub:', err);
    process.exit(1);
  });
}

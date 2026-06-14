'use strict';

const fp = require('fastify-plugin');
const crypto = require('crypto');

module.exports = fp(async function (fastify, opts) {
  // POST /api/auth/login { password }
  fastify.post('/api/auth/login', async function (request, reply) {
    if (!fastify.authEnabled) return reply.code(400).send({ error: 'Auth not enabled' });

    const { password } = request.body || {};

    // If ADMIN_PASSWORD is set, require it; otherwise allow login (single-user dev).
    const adminPw = process.env.ADMIN_PASSWORD;
    if (adminPw && password !== adminPw) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Resolve a user id: try to read first user from DB, fallback to 'local'
    let userId = 'local';
    try {
      const u = await fastify.knex('users').first('id');
      if (u && u.id) userId = u.id;
    } catch (err) {
      fastify.log.warn('Failed to query users table for login fallback: ' + err.message);
    }

    const strategy = (process.env.AUTH_STRATEGY || 'cookie').toLowerCase();
    if (strategy === 'jwt') {
      // issue JWT
      if (!fastify.jwt) {
        return reply.code(500).send({ error: 'JWT not configured' });
      }
      const token = fastify.jwt.sign({ id: userId });
      return reply.send({ token });
    }

    // default: cookie/session
    if (!request.session) {
      return reply.code(500).send({ error: 'Session not configured' });
    }

    request.session.set('user', { id: userId });
    return reply.send({ ok: true });
  });

  // POST /api/auth/logout
  fastify.post('/api/auth/logout', async function (request, reply) {
    const strategy = (process.env.AUTH_STRATEGY || 'cookie').toLowerCase();
    if (strategy === 'jwt') return reply.send({ ok: true });
    if (request.session) request.session.delete();
    return reply.send({ ok: true });
  });
});

// Fastify route plugin: user endpoints (export and deletion)
// Register this plugin with the main Fastify app: server.register(require('./routes/user'))

'use strict';

const jwt = require('jsonwebtoken');
const { exportUserData, deleteUserData } = require('../controllers/userController');

function getUserIdFromRequest(request) {
  // Prefer request.user (if middleware set it), else try to read Bearer token
  if (request.user && request.user.id) return request.user.id;
  const auth = request.headers && (request.headers.authorization || request.headers.Authorization);
  if (!auth) return null;
  const m = String(auth).match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1];
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret);
    // Common claims: sub, userId, id
    return payload.sub || payload.userId || payload.id || null;
  } catch (err) {
    // token invalid or expired
    return null;
  }
}

module.exports = async function (fastify, opts) {
  // Export user data as JSON (or change to stream/zip in production)
  fastify.get('/api/me/export', async function (request, reply) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    const payload = await exportUserData(userId, { format: 'json' });
    reply.header('Content-Type', 'application/json');
    return payload;
  });

  // Delete or anonymize user data
  fastify.delete('/api/me', async function (request, reply) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    // In production, require confirmation and proper auth
    await deleteUserData(userId, { irreversible: true });
    // Side-effect: controller should emit an audit log entry
    return reply.code(204).send();
  });
};

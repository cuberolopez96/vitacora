// Fastify route plugin: user endpoints (export and deletion)
// Register this plugin with the main Fastify app: server.register(require('./routes/user'))

'use strict';

const { exportUserData, deleteUserData } = require('../controllers/userController');

module.exports = async function (fastify, opts) {
  // Export user data as JSON (or change to stream/zip in production)
  fastify.get('/me/export', async function (request, reply) {
    await fastify.verifyAuth(request);
    const userId = (request.user && request.user.sub) || (request.user && request.user.userId) || (request.user && request.user.id) || 'local';
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    const payload = await exportUserData(userId, { format: 'json' });
    reply.header('Content-Type', 'application/json');
    return payload;
  });

  // Delete or anonymize user data
  fastify.delete('/me', async function (request, reply) {
    await fastify.verifyAuth(request);
    const userId = (request.user && request.user.sub) || (request.user && request.user.userId) || (request.user && request.user.id) || 'local';
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    // In production, require confirmation and proper auth
    await deleteUserData(userId, { irreversible: true });
    // Side-effect: controller should emit an audit log entry
    return reply.code(204).send();
  });
};

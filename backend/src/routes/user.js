// Fastify route plugin: user endpoints (export and deletion)
// Register this plugin with the main Fastify app: server.register(require('./routes/user'))

'use strict';

const { exportUserData, deleteUserData } = require('../controllers/userController');

module.exports = async function (fastify, opts) {
  // Export user data as JSON (or change to stream/zip in production)
  fastify.get('/api/me/export', async function (request, reply) {
    // In a real app, authenticate user and obtain user id from request
    const userId = (request.user && request.user.id) || 'local';
    const payload = await exportUserData(userId, { format: 'json' });
    reply.header('Content-Type', 'application/json');
    return payload;
  });

  // Delete or anonymize user data
  fastify.delete('/api/me', async function (request, reply) {
    const userId = (request.user && request.user.id) || 'local';
    // In production, require confirmation and proper auth
    await deleteUserData(userId, { irreversible: true });
    // Side-effect: controller should emit an audit log entry
    return reply.code(204).send();
  });
};

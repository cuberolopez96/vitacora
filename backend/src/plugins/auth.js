const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  // Simple auth plugin scaffold. Uses environment variable AUTH_ENABLED (true/false)
  const enabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';

  fastify.decorate('authEnabled', enabled);

  // verifyAuth can be used by routes: await fastify.verifyAuth(request)
  fastify.decorate('verifyAuth', async function (request) {
    if (!enabled) return true; // opt-in disabled -> allow

    // Very small scaffold: look for Authorization: Bearer <token>
    const auth = request.headers['authorization'];
    if (!auth) {
      throw fastify.httpErrors.unauthorized('Missing Authorization header');
    }
    // In a real implementation: verify JWT, lookup user, etc.
    // For scaffold, accept a token equal to AUTH_BYPASS_TOKEN for quick testing if provided
    const bypass = process.env.AUTH_BYPASS_TOKEN;
    if (bypass && auth === `Bearer ${bypass}`) return true;

    // otherwise reject
    throw fastify.httpErrors.unauthorized('Invalid token (scaffold)');
  });
});

const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  // Simple auth plugin scaffold. Uses environment variable AUTH_ENABLED (true/false)
  const enabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';

  fastify.decorate('authEnabled', enabled);

  if (enabled) {
    // Register fastify-jwt with JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    fastify.register(require('fastify-jwt'), { secret: jwtSecret });

    // verifyAuth uses request.jwtVerify() provided by fastify-jwt and sets request.user
    fastify.decorate('verifyAuth', async function (request) {
      // allow bypass token for testing if set
      const bypass = process.env.AUTH_BYPASS_TOKEN;
      const authHeader = request.headers && (request.headers.authorization || request.headers.Authorization);
      if (bypass && authHeader === `Bearer ${bypass}`) {
        // set a synthetic user
        request.user = { id: 'bypass-user' };
        return true;
      }

      try {
        await request.jwtVerify(); // sets request.user on success
        return true;
      } catch (err) {
        throw fastify.httpErrors.unauthorized('Invalid or missing token');
      }
    });
  } else {
    // If auth disabled, verifyAuth is a no-op
    fastify.decorate('verifyAuth', async function (request) {
      return true;
    });
  }
});

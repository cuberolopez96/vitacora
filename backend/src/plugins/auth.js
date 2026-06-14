const fp = require('fastify-plugin');
const crypto = require('crypto');

module.exports = fp(async function (fastify, opts) {
  // Simple auth plugin scaffold. Uses environment variable AUTH_ENABLED (true/false)
  const enabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
  const strategy = (process.env.AUTH_STRATEGY || 'cookie').toLowerCase();

  fastify.decorate('authEnabled', enabled);

  if (enabled) {
    if (strategy === 'jwt') {
      // Register fastify-jwt with JWT_SECRET
      const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
            fastify.register(require('@fastify/jwt'), { secret: jwtSecret });

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
      // Cookie/session strategy using @fastify/secure-session
      const secureSession = require('@fastify/secure-session');

      // Key: try SECURE_SESSION_KEY (hex), SESSION_SECRET, or generate ephemeral key (warning)
      let key = process.env.SECURE_SESSION_KEY;
      if (key) {
        try {
          // if provided as hex string, convert
          key = Buffer.from(key, 'hex');
        } catch (err) {
          key = Buffer.from(String(process.env.SECURE_SESSION_KEY));
        }
      } else if (process.env.SESSION_SECRET) {
        // Derive key from SESSION_SECRET
        key = crypto.createHash('sha256').update(String(process.env.SESSION_SECRET)).digest();
      } else {
        fastify.log.warn('No SECURE_SESSION_KEY or SESSION_SECRET set; generating ephemeral session key (not for production)');
        key = crypto.randomBytes(32);
      }

      fastify.register(secureSession, {
        key,
        cookie: {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        }
      });

      // verifyAuth looks for request.session.get('user')
      fastify.decorate('verifyAuth', async function (request) {
        const u = request.session && request.session.get && request.session.get('user');
        if (u && u.id) {
          request.user = u;
          return true;
        }
        // allow bypass token for testing if set
        const bypass = process.env.AUTH_BYPASS_TOKEN;
        const authHeader = request.headers && (request.headers.authorization || request.headers.Authorization);
        if (bypass && authHeader === `Bearer ${bypass}`) {
          request.user = { id: 'bypass-user' };
          return true;
        }
        throw fastify.httpErrors.unauthorized('Missing or invalid session');
      });
    }
  } else {
    // If auth disabled, verifyAuth is a no-op
    fastify.decorate('verifyAuth', async function (request) {
      return true;
    });
  }
});

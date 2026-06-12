// Minimal Fastify server for Vitacora (Sprint 1)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const fastify = require('fastify')({ logger: true });
const fp = require('fastify-plugin');

// DB plugin (Knex) - attaches knex instance as fastify.knex
fastify.register(require('./plugins/db'));

// Register routes
fastify.register(require('./routes/habits'), { prefix: '/api' });
fastify.register(require('./routes/entries'), { prefix: '/api' });

// Health endpoint
fastify.get('/api/healthz', require('./health'));

const PORT = process.env.PORT || 8080;

const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

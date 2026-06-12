const fp = require('fastify-plugin');
const Knex = require('knex');
const path = require('path');

module.exports = fp(async function (fastify, opts) {
  const env = process.env.NODE_ENV || 'development';
  const knexfile = require(path.resolve(__dirname, '..', '..', 'knexfile.js'));
  const config = knexfile[env] || knexfile.development;

  const knex = Knex(config);

  // attach
  fastify.decorate('knex', knex);

  fastify.addHook('onClose', async (fastifyInstance, done) => {
    await knex.destroy();
    done();
  });
});

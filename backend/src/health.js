module.exports = async function (request, reply) {
  const knex = this.knex;
  try {
    // lightweight check
    await knex.raw('select 1 as ok');
    return { status: 'ok', db: 'ok' };
  } catch (err) {
    return reply.status(500).send({ status: 'error', db: 'error', message: err.message });
  }
};

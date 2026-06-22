module.exports = async function (fastify, opts) {
  const knex = fastify.knex;
  const { randomUUID } = require('crypto');

  fastify.post('/habits', async (request, reply) => {
    const { title, cadence, user_id } = request.body || {};
    if (!title) return reply.status(400).send({ error: 'title required' });
    const id = randomUUID();
    const uid = user_id || 'user';
    await knex('habits').insert({ id, user_id: uid, title, cadence: cadence || 'daily', created_at: new Date().toISOString() });
    const habit = await knex('habits').where({ id }).first();
    return reply.status(201).send(habit);
  });

  fastify.get('/habits', async (request, reply) => {
    const rows = await knex('habits').select('*').orderBy('created_at', 'desc');
    return rows;
  });

  fastify.put('/habits/:id', async (request, reply) => {
    const { id } = request.params;
    const payload = request.body || {};
    await knex('habits').where({ id }).update({ ...payload, updated_at: new Date().toISOString() });
    const habit = await knex('habits').where({ id }).first();
    if (!habit) return reply.status(404).send({ error: 'not found' });
    return habit;
  });

  fastify.delete('/habits/:id', async (request, reply) => {
    const { id } = request.params;
    const deleted = await knex('habits').where({ id }).del();
    if (!deleted) return reply.status(404).send({ error: 'not found' });
    return { success: true };
  });

  // habit-specific entries
  fastify.get('/habits/:id/entries', async (request, reply) => {
    const { id } = request.params;
    const rows = await knex('entries').where({ habit_id: id }).orderBy('date', 'desc');
    return rows;
  });
};

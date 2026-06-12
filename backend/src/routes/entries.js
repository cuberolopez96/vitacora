module.exports = async function (fastify, opts) {
  const knex = fastify.knex;
  const { randomUUID } = require('crypto');

  fastify.post('/habits/:id/entries', async (request, reply) => {
    const { id } = request.params;
    const { date, status } = request.body || {};
    const habit = await knex('habits').where({ id }).first();
    if (!habit) return reply.status(404).send({ error: 'habit not found' });
    const entryDate = date || new Date().toISOString().slice(0, 10);
    const entry = { id: randomUUID(), habit_id: id, date: entryDate, status: status || 'completed', created_at: new Date().toISOString() };
    await knex('entries').insert(entry);
    return reply.status(201).send(entry);
  });

  fastify.get('/entries', async (request, reply) => {
    const { date } = request.query;
    const q = knex('entries').select('*').orderBy('date', 'desc');
    if (date) q.where({ date: date });
    const rows = await q;
    return rows;
  });
};

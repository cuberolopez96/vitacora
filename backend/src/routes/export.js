module.exports = async function (fastify, opts) {
  const knex = fastify.knex;

  // GET /api/export?format=csv|json
  fastify.get('/export', async (request, reply) => {
    const { format } = request.query || {};
    // join entries -> habits to include user_id
    const rows = await knex('entries')
      .leftJoin('habits', 'entries.habit_id', 'habits.id')
      .select('habits.user_id as user_id', 'entries.habit_id', 'entries.date', 'entries.status')
      .orderBy('entries.date', 'desc');

    // normalize to canonical export shape: userId, habitId, date, status, note
    const entries = rows.map(r => ({
      userId: r.user_id || null,
      habitId: r.habit_id,
      date: r.date,
      status: r.status,
      note: '' // currently no note column in entries; keep empty for compatibility
    }));

    if (!format || format === 'json') {
      return { exported_at: new Date().toISOString(), data: { entries } };
    }

    if (format === 'csv') {
      // CSV header in canonical camelCase
      const header = ['userId', 'habitId', 'date', 'status', 'note'];
      const csvRows = [header.join(',')];
      for (const r of entries) {
        const vals = header.map(h => {
          const v = r[h] == null ? '' : String(r[h]);
          // escape double quotes
          return '"' + v.replace(/"/g, '""') + '"';
        });
        csvRows.push(vals.join(','));
      }
      const csv = csvRows.join('\n');
      reply.header('content-type', 'text/csv; charset=utf-8');
      reply.header('content-disposition', 'attachment; filename="export.csv"');
      return reply.send(csv);
    }

    return reply.status(400).send({ error: 'unsupported format' });
  });
};
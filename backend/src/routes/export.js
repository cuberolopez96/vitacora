module.exports = async function (fastify, opts) {
  const knex = fastify.knex;

  // GET /api/export?format=csv|json
  fastify.get('/export', async (request, reply) => {
    const { format } = request.query || {};
    const rows = await knex('entries').select('*').orderBy('date', 'desc');

    if (!format || format === 'json') {
      return { exported_at: new Date().toISOString(), data: { entries: rows } };
    }

    if (format === 'csv') {
      // simple CSV serializer (header + rows)
      const header = ['id', 'habit_id', 'date', 'status', 'created_at'];
      const csvRows = [header.join(',')];
      for (const r of rows) {
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
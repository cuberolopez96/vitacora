module.exports = async function (fastify, opts) {
  const fs = require('fs');
  const path = require('path');

  // List available backups (scaffold)
  fastify.get('/backups', async (request, reply) => {
    const backupsDirCandidate = path.resolve(__dirname, '..', '..', 'docs', 'backups');
    const docsDir = path.resolve(__dirname, '..', '..', 'docs');
    const backupsDir = fs.existsSync(backupsDirCandidate) ? backupsDirCandidate : docsDir;

    let files = [];
    try {
      files = fs.readdirSync(backupsDir).filter(f => f !== '.gitkeep');
    } catch (e) {
      // directory may not exist yet; return empty list
      files = [];
    }

    const items = files.map(name => ({
      name,
      created_at: fs.existsSync(path.join(backupsDir, name)) ? fs.statSync(path.join(backupsDir, name)).mtime.toISOString() : null
    }));

    return { backups: items };
  });

  // Download a backup file (scaffold)
  fastify.get('/backups/:name/download', async (request, reply) => {
    const name = request.params.name;
    const filePath = path.resolve(__dirname, '..', '..', 'docs', 'backups', name);

    if (!fs.existsSync(filePath)) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }

    reply.header('content-disposition', `attachment; filename="${name}"`);
    const stream = fs.createReadStream(filePath);
    return reply.send(stream);
  });
};

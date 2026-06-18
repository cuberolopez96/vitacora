const { randomUUID } = require('crypto');

module.exports = function (fastify, opts, done) {
  // Attach a request id and structured request logger
  fastify.addHook('onRequest', (request, reply, doneHook) => {
    try {
      const headerId = request.headers['x-request-id'];
      const requestId = headerId || randomUUID();
      // expose requestId on request
      request.requestId = requestId;
      // set header for downstream
      reply.header('x-request-id', requestId);
      // create a child logger for this request with request_id and component
      request.log = request.log.child({ request_id: requestId, component: 'request' });
    } catch (e) {
      fastify.log.debug({ err: e }, 'failed to attach request id');
    }
    doneHook();
  });

  // Optionally, log responses with minimal fields
  fastify.addHook('onResponse', (request, reply, doneHook) => {
    try {
      const latency = request.metricsStart ? (() => {
        const diff = process.hrtime(request.metricsStart);
        return (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2) + 'ms';
      })() : undefined;

      request.log.info({ route: request.routerPath || request.raw.url, status: reply.statusCode, latency }, 'request completed');
    } catch (err) {
      fastify.log.debug({ err }, 'failed to log response');
    }
    doneHook();
  });

  done();
};

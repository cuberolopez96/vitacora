const client = require('prom-client');

module.exports = function (fastify, opts, done) {
  // Collect default metrics (CPU, memory, etc.)
  client.collectDefaultMetrics({ prefix: 'vitacora_' });

  // App-specific metrics
  const httpRequestsTotal = new client.Counter({
    name: 'vitacora_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  const httpRequestDurationSeconds = new client.Histogram({
    name: 'vitacora_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 1, 2.5, 5, 10],
  });

  fastify.addHook('onRequest', (request, reply, doneHook) => {
    // start timer and attach to request for later observation
    request.metricsStart = process.hrtime();
    doneHook();
  });

  fastify.addHook('onResponse', (request, reply, doneHook) => {
    try {
      const route = request.routerPath || request.raw.url || 'unknown';
      const method = request.method || 'GET';
      const status = reply.statusCode ? String(reply.statusCode) : '0';
      httpRequestsTotal.inc({ method, route, status_code: status }, 1);

      if (request.metricsStart) {
        const diff = process.hrtime(request.metricsStart);
        const seconds = diff[0] + diff[1] / 1e9;
        httpRequestDurationSeconds.observe({ method, route, status_code: status }, seconds);
      }
    } catch (e) {
      // best-effort
      fastify.log.debug({ err: e }, 'metrics observation failed');
    }
    doneHook();
  });

  // Expose /metrics
  fastify.get('/metrics', async (request, reply) => {
    try {
      const metrics = await client.register.metrics();
      reply.header('Content-Type', client.register.contentType);
      return metrics;
    } catch (err) {
      reply.code(500).send(err.message);
    }
  });

  done();
};

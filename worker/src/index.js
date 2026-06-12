// Simple worker that exposes a health endpoint. Designed to be lightweight and run in its own container.
const Fastify = require('fastify')
const fastify = Fastify({ logger: false })

fastify.get('/healthz', async (req, reply) => {
  return { status: 'ok', ts: Date.now() }
})

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 4000, host: '0.0.0.0' })
    console.log('Worker listening')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
start()

import { enqueueRequest } from './utils/offlineQueue'
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export async function api(path, opts = {}) {
  const headers = Object.assign({ 'content-type': 'application/json' }, opts.headers || {})
  try {
    return await fetch(BASE + path, Object.assign({}, opts, { headers }))
  } catch (err) {
    // Network error: enqueue request for later replay
    try { enqueueRequest({ url: path, method: opts.method || 'POST', body: opts.body, headers }) } catch (e) { /* ignore */ }
    // Re-throw so callers can handle offline UX
    throw err
  }
}

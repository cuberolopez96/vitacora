const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export function api(path, opts = {}) {
  const headers = Object.assign({ 'content-type': 'application/json' }, opts.headers || {})
  return fetch(BASE + path, Object.assign({}, opts, { headers }))
}

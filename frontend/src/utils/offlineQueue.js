// Minimal offline queue using localStorage as a simple fallback.
// This is a lightweight placeholder for IndexedDB-based queue (e.g., idb) to be implemented later.
const QUEUE_KEY = 'vitacora_offline_queue'

export function enqueueRequest(req) {
  const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  q.push({ url: req.url, method: req.method || 'POST', body: req.body || null, headers: req.headers || {} , ts: Date.now() })
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
}

export async function replayQueue(api) {
  const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  const remaining = []
  for (const r of q) {
    try {
      await api(r.url, { method: r.method, body: r.body, headers: r.headers })
    } catch (err) {
      // keep failed item
      remaining.push(r)
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining))
}

export function clearQueue() { localStorage.removeItem(QUEUE_KEY) }

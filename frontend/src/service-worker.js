// Simple service worker: cache shell assets and serve stale-while-revalidate
const CACHE_NAME = 'vitacora-shell-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/src/style.css',
  '/src/main.jsx'
]

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  )
})

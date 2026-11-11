// Service worker: deja la app abrir sin internet. Sube el número al cambiar archivos.
const CACHE = 'mi-planner-v1';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Datos (Supabase) e IA (Gemini) siempre por red
  if (/supabase\.co$/.test(u.hostname) || u.hostname.includes('googleapis.com') && !u.hostname.startsWith('fonts')) return;
  const sameOrigin = u.origin === location.origin;
  if (sameOrigin) {
    // Red primero (para recibir actualizaciones), caché si no hay internet
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  } else {
    // Librerías y fuentes: caché primero
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return res; })));
  }
});

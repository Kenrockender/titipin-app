// Service worker for the admin PWA. Scope is registered as /admin from AdminShell,
// so this never touches the customer-facing storefront.
const CACHE = "titipin-admin-v1";
const APP_SHELL = ["/admin", "/admin-manifest.webmanifest", "/icons-pwa/admin-192.png", "/icons-pwa/admin-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first for admin pages (data is live/dynamic), falling back to the
// cached app shell when offline so the PWA still opens to something.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/admin").then((r) => r ?? caches.match(request)))
    );
    return;
  }

  // Static assets: cache-first for instant loads, refresh in the background.
  if (/\/(icons-pwa|_next\/static)\//.test(request.url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((res) => {
          caches.open(CACHE).then((cache) => cache.put(request, res.clone()));
          return res;
        }).catch(() => cached);
        return cached ?? network;
      })
    );
  }
});

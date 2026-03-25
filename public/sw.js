// Meu Gerente PJ — Service Worker
const CACHE_NAME = "mgpj-v1";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Network-first strategy for API/Supabase, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin Supabase/API requests
  if (event.request.method !== "GET") return;
  if (url.hostname.includes("supabase.co")) return;
  if (url.hostname.includes("anthropic.com")) return;
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first for static assets (fonts, images, icons)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Network-first for navigation (pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/dashboard") || caches.match("/");
      })
    );
    return;
  }
});

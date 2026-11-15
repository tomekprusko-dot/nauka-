// Service worker: mały program działający w tle telefonu.
// Dzięki niemu appka otwiera się szybko (pliki z pamięci telefonu)
// i da się ją zainstalować na ekranie głównym.
//
// Strategia:
// - strona (index.html): najpierw sieć, a gdy jej brak, wersja z pamięci,
// - pliki appki z hashem w nazwie (assets/index-abc123.js) i ikony: z pamięci,
//   bo pod tą samą nazwą nigdy nie zmieni się treść,
// - zapytania do Supabase (inna domena): zawsze sieć, nic nie zapisujemy.

const CACHE = "rodzinka-v1";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});

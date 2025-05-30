const CACHE_NAME = "trivify-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/styles.css",  // passe ggf. an
    "/main.js",     // passe ggf. an
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

"use strict";

const CACHE_NAME = "englisity-pwa-v1";
const APP_ROOT = new URL(self.registration.scope);

const CORE_FILES = [
  "./",
  "index.html",
  "css/style.css",
  "css/design.css",
  "css/mobile.css?v=20261103-responsive-pwa-1",
  "js/app.js",
  "js/features.js",
  "js/life-on-mars.js",
  "js/beatrix-potter.js",
  "js/halley-vi.js",
  "manifest.webmanifest",
  "assets/englisity-mark.svg",
  "assets/englisity-app-icon.png",
  "pages/reading.html",
  "pages/listening.html",
  "pages/writing.html",
  "pages/speaking.html",
  "pages/listening-test-01.html",
  "pages/life-on-mars.html",
  "pages/beatrix-potter.html",
  "pages/halley-vi.html"
].map(path => new URL(path, APP_ROOT).href);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("englisity-pwa-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;
          return (await caches.match(APP_ROOT.href)) ||
            (await caches.match(new URL("index.html", APP_ROOT).href));
        })
    );
    return;
  }

  if (/\.(?:css|js|svg|png|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }

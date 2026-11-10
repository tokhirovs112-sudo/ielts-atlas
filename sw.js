"use strict";

const CACHE_NAME = "englisity-pwa-v19";
const APP_ROOT = new URL(self.registration.scope);

const CORE_FILES = [
  "./",
  "index.html",
  "css/style.css",
  "css/design.css",
  "css/mobile.css?v=20261103-responsive-pwa-2",
  "js/app.js",
  "js/features.js?v=20261105-streak-activity-1",
  "js/vocabulary.js?v=20261109-score-fix-2",
  "js/article-learning.js?v=20261110-direct-button-fix-3",
  "pages/vocabulary.html",
  "js/life-on-mars.js",
  "js/beatrix-potter.js",
  "js/halley-vi.js",
  "manifest.webmanifest",
  "assets/englisity-mark.svg",
  "assets/englisity-app-icon.png",
  "pages/reading.html",
  "pages/listening.html",
  "pages/writing.html",
  "images/task1/image_2026-11-09_15-50-02.png",
  "images/task1/image_2026-11-09_15-50-03.png",
  "images/task1/photo_2026-11-09_15-50-18.jpg",
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
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cachedPage = await caches.match(request);
        if (cachedPage) return cachedPage;
        return (await caches.match(APP_ROOT.href)) ||
          (await caches.match(new URL("index.html", APP_ROOT).href));
      }
    })());
    return;
  }

  if (/\.(?:css|js|svg|png|jpe?g|webmanifest)$/i.test(url.pathname)) {
    // Prefer fresh assets while online, but keep a cached copy for offline use.
    // Cache-first here can leave installed users stuck on old JavaScript/CSS.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw error;
      }
    })());
  }
});

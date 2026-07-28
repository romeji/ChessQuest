const CACHE_VERSION = 'chessquest-v5';
const APP_SHELL = [
  './',
  './index.html',
  './learn.html',
  './openings.html',
  './entrainement.html',
  './training-game.html',
  './training-target.html',
  './daily-challenge.html',
  './coach.html',
  './puzzles.html',
  './analysis.html',
  './game-view.html',
  './progress.html',
  './profile.html',
  './settings.html',
  './manifest.webmanifest',
  './assets/icons/chessquest-logo.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png',
  './assets/css/variables.css',
  './assets/css/reset.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/css/animations.css',
  './assets/css/polish.css',
  './assets/css/home.css',
  './assets/css/learn.css',
  './assets/css/entrainement.css',
  './assets/css/training.css',
  './assets/css/puzzle.css',
  './assets/css/analysis.css',
  './assets/css/profile.css',
  './assets/css/coach.css',
  './assets/css/opening-gamification.css',
  './assets/js/progress.js',
  './assets/js/chesscom.js',
  './assets/js/animations.js',
  './assets/js/app.js',
  './assets/js/navigation.js',
  './assets/js/board.js',
  './assets/js/openings.js',
  './assets/js/training.js',
  './assets/js/puzzles.js',
  './assets/js/firebase-sync.js',
  './assets/illustrations/background_mobile.png',
  './assets/illustrations/background_desktop.png',
  './assets/illustrations/opening-kingdom-v2.png',
  './assets/illustrations/opening-map-bg.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') return caches.match('./index.html');
          return undefined;
        });
    })
  );
});

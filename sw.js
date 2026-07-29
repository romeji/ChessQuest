const CACHE_VERSION = 'chessquest-v28';
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
  './assets/icons/chessquest-app-icon.png',
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
  './assets/chesspieces/wK.png',
  './assets/chesspieces/wQ.png',
  './assets/chesspieces/wR.png',
  './assets/chesspieces/wB.png',
  './assets/chesspieces/wN.png',
  './assets/chesspieces/wP.png',
  './assets/chesspieces/bK.png',
  './assets/chesspieces/bQ.png',
  './assets/chesspieces/bR.png',
  './assets/chesspieces/bB.png',
  './assets/chesspieces/bN.png',
  './assets/chesspieces/bP.png',
  './assets/illustrations/background_mobile.png',
  './assets/illustrations/background_desktop.png',
  './assets/illustrations/opening-kingdom-v2.png',
  './assets/illustrations/opening-map-bg.svg',
  './assets/illustrations/mascot-knight-home.png',
  './assets/illustrations/mascot-knight-hint.png',
  './assets/illustrations/opening-islands-spritesheet.png',
  './assets/illustrations/opening-map-night.png',
  './assets/illustrations/analysis-hero-chess.png',
  './assets/illustrations/rewards-spritesheet.png',
  './assets/illustrations/training-menu-hero.png'
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
  const supportedOrigins = [
    self.location.origin,
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  if (!supportedOrigins.includes(url.origin)) return;

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

const CACHE_VERSION = 'chessquest-v71';
const APP_SHELL = [
  './',
  './index.html',
  './learn.html',
  './academy.html',
  './openings.html',
  './training-game.html',
  './training-target.html',
  './daily-challenge.html',
  './coach.html',
  './puzzles.html',
  './problems.html',
  './analysis.html',
  './game-view.html',
  './progress.html',
  './profile.html',
  './settings.html',
  './shop.html',
  './secret-levels.html',
  './course-library.html',
  './course.html',
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
  './assets/css/mockup-pages.css',
  './assets/css/final-views.css',
  './assets/css/responsive-hardening.css',
  './assets/css/gamification.css',
  './assets/css/ux-refinement.css',
  './assets/css/navigation.css',
  './assets/css/problem-journey.css',
  './assets/css/home.css',
  './assets/css/learn.css',
  './assets/css/academy-journey.css',
  './assets/css/entrainement.css',
  './assets/css/training.css',
  './assets/css/puzzle.css',
  './assets/css/analysis.css',
  './assets/css/profile.css',
  './assets/css/coach.css',
  './assets/css/opening-gamification.css',
  './assets/js/progress.js',
  './assets/js/mascot-coach.js',
  './assets/js/chesscom.js',
  './assets/js/animations.js',
  './assets/js/app.js',
  './assets/js/navigation.js',
  './assets/js/board.js',
  './assets/js/openings.js',
  './assets/js/opening-curriculum.js',
  './assets/js/training.js',
  './assets/js/puzzles.js',
  './assets/js/problem-journey.js',
  './assets/js/firebase-sync.js',
  './assets/js/auth.js',
  './assets/js/courses.js',
  './assets/js/academy-journey.js',
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
  './assets/illustrations/mascot-coach-ecstatic.webp',
  './assets/illustrations/mascot-coach-encourage.webp',
  './assets/illustrations/mascot-coach-haughty.webp',
  './assets/illustrations/mascot-coach-sad.webp',
  './assets/illustrations/mascot-coach-rage.webp',
  './assets/illustrations/opening-islands-spritesheet.png',
  './assets/illustrations/opening-map-night.png',
  './assets/illustrations/opening-map-maquette-v2.png',
  './assets/illustrations/opening-world-01-foundations-v1.webp',
  './assets/illustrations/opening-world-02-open-play-v1.webp',
  './assets/illustrations/opening-world-03-sicilian-v1.webp',
  './assets/illustrations/opening-world-04-fortresses-v1.webp',
  './assets/illustrations/opening-world-05-queen-v1.webp',
  './assets/illustrations/opening-world-06-indian-v1.webp',
  './assets/illustrations/opening-world-07-gardens-v1.webp',
  './assets/illustrations/opening-world-08-frontiers-v1.webp',
  './assets/illustrations/opening-world-09-gambits-v1.webp',
  './assets/illustrations/opening-world-10-masters-v1.webp',
  './assets/illustrations/analysis-hero-chess.png',
  './assets/illustrations/rewards-spritesheet.png',
  './assets/illustrations/training-menu-hero.png',
  './assets/images/academy/learning-journey-v1.png',
  './assets/images/puzzles/problem-journey-v1.png'
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

  /* Les pages et le code doivent se mettre à jour immédiatement dès qu'une
     connexion est disponible. Le cache reste le filet de sécurité hors ligne. */
  const freshFirst = url.origin === self.location.origin && (
    event.request.mode === 'navigate' ||
    event.request.destination === 'script' ||
    event.request.destination === 'style'
  );
  if (freshFirst) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true })
          .then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
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

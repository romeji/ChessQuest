const CACHE_VERSION = 'chessquest-v106';
const APP_SHELL = [
  './',
  './index.html',
  './learn.html',
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
  './assets/css/navigation-stability-v101.css',
  './assets/css/problem-journey.css',
  './assets/css/home.css',
  './assets/css/learn.css',
  './assets/css/entrainement.css',
  './assets/css/training.css',
  './assets/css/puzzle.css',
  './assets/css/analysis.css',
  './assets/css/profile.css',
  './assets/css/coach.css',
  './assets/css/opening-swipe.css',
  './assets/js/progress.js',
  './assets/js/mascot-coach.js',
  './assets/js/chesscom.js',
  './assets/js/animations.js',
  './assets/js/app.js',
  './assets/js/pwa-bootstrap-v101.js',
  './assets/js/navigation.js',
  './assets/js/board.js',
  './assets/js/openings.js',
  './assets/js/opening-curriculum.js',
  './assets/js/opening-swipe.js',
  './assets/js/training.js',
  './assets/js/puzzles.js',
  './assets/js/problem-journey.js',
  './assets/js/firebase-sync.js',
  './assets/js/auth.js',
  './assets/js/courses.js',
  './assets/illustrations/reward-chest-transparent-v1.png',
  './assets/images/openings/italian-swipe-card-v1.png',
  './assets/images/openings/queen-gambit-swipe-card-v1.png',
  './assets/images/openings/french-defense-swipe-card-v1.png',
  './assets/images/openings/sicilian-defense-swipe-card-v1.png',
  './assets/images/openings/caro-kann-swipe-card-v1.png',
  './assets/images/openings/rare-openings-swipe-card-v1.png',
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
  './assets/chesspieces/bP.png'
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
  /* Le helper OAuth proxifié doit toujours atteindre Firebase directement :
     une réponse d'authentification ne doit jamais venir du cache PWA. */
  if (url.origin === self.location.origin && url.pathname.startsWith('/__/auth/')) return;
  const supportedOrigins = [
    self.location.origin,
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.gstatic.com'
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

/* Mise à jour PWA globale : ce fichier est aussi chargé par les mondes plein écran. */
const QUEST_NAVIGATION_VERSION = '85';
const QUEST_NAVIGATION_STYLESHEET = new URL(
  `../css/navigation.css?v=${QUEST_NAVIGATION_VERSION}`,
  document.currentScript?.src || document.baseURI
).href;

(function initQuestPwaUpdate(){
  window.__CQ_PWA_UPDATE__ = true;
  if(!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const version = QUEST_NAVIGATION_VERSION;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if(refreshing || sessionStorage.getItem(`cq-sw-reload-${version}`)) return;
    refreshing = true;
    sessionStorage.setItem(`cq-sw-reload-${version}`, '1');
    location.reload();
  });
  const update = () => navigator.serviceWorker
    .register(`./sw.js?v=${version}`, { updateViaCache:'none' })
    .then(registration => registration.update())
    .catch(() => {});
  if(document.readyState === 'complete') update();
  else window.addEventListener('load', update, { once:true });
})();

/* ============================================================
   ChessQuest — navigation.js
   Marque l'onglet actif dans la barre de navigation basse.
   Chaque page HTML doit poser <body data-page="home|learn|puzzles|play|profile">
   La navigation elle-même se fait via de vrais liens <a href="...">.
   ============================================================ */
function ensureQuestNavigationStyles(){
  let stylesheet = document.querySelector('link[data-quest-navigation],link[href*="assets/css/navigation.css"]');
  if(!stylesheet){
    stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    document.head.appendChild(stylesheet);
  }
  stylesheet.dataset.questNavigation = 'true';
  if(stylesheet.href !== QUEST_NAVIGATION_STYLESHEET) stylesheet.href = QUEST_NAVIGATION_STYLESHEET;
}

function renderQuestTabbar(){
  ensureQuestNavigationStyles();
  const aliases = {
    analyze: 'observer',
    analysis: 'observer',
    settings: 'more',
    coach: 'home',
    'training-hub': 'home',
    play: 'home',
    progress: 'more',
    profile: 'more'
  };
  const routeTabs = {
    '': 'home',
    'index.html': 'home',
    'problems.html': 'puzzles',
    'puzzles.html': 'puzzles',
    'daily-challenge.html': 'puzzles',
    'training-target.html': 'puzzles',
    'learn.html': 'learn',
    'openings.html': 'learn',
    'course.html': 'learn',
    'course-library.html': 'learn',
    'analysis.html': 'observer',
    'game-view.html': 'observer',
    'profile.html': 'more',
    'progress.html': 'more',
    'settings.html': 'more',
    'shop.html': 'more'
  };
  const route = location.pathname.split('/').pop().toLowerCase();
  const declaredPage = document.body.dataset.page;
  const current = routeTabs[route] || aliases[declaredPage] || declaredPage || 'home';
  let tabbar = document.querySelector('nav.tabbar');
  if(!tabbar){
    tabbar = document.createElement('nav');
    tabbar.className = 'tabbar';
    document.body.appendChild(tabbar);
  }
  tabbar.setAttribute('aria-label', 'Navigation principale');
  document.body.classList.add('cq-has-tabbar');
  tabbar.innerHTML = `
      <a class="tabbar-item" data-tab="home" href="index.html" aria-label="Accueil">
        <svg viewBox="0 0 24 24" class="tabicon"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg><span>Accueil</span>
      </a>
      <a class="tabbar-item" data-tab="puzzles" href="problems.html" aria-label="Problèmes">
        <svg viewBox="0 0 24 24" class="tabicon"><path d="M9 3h6v4a3 3 0 1 0 3 3h3v11h-6v-3a3 3 0 1 0-3 3H3v-7h4a3 3 0 1 0 0-6H3V3h6Z"/></svg><span>Problèmes</span>
      </a>
      <a class="tabbar-item" data-tab="learn" href="learn.html" aria-label="Apprendre">
        <svg viewBox="0 0 24 24" class="tabicon"><path d="M4 19V6a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2Z"/><path d="M20 19V6a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2Z"/></svg><span>Apprendre</span>
      </a>
      <a class="tabbar-item" data-tab="observer" href="analysis.html" aria-label="Observer et analyser">
        <svg viewBox="0 0 24 24" class="tabicon"><circle cx="7.5" cy="14" r="4"/><circle cx="16.5" cy="14" r="4"/><path d="M11.5 14h1M4 13l1.5-7h4l2 8M20 13l-1.5-7h-4l-2 8"/></svg><span>Observer</span>
      </a>
      <a class="tabbar-item" data-tab="more" href="profile.html" aria-label="Plus">
        <svg viewBox="0 0 24 24" class="tabicon"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span>Plus</span>
      </a>`;
  tabbar.querySelectorAll('.tabbar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === current);
    const target = item.getAttribute('data-href');
    if(target){
      item.addEventListener('click', () => window.location.assign(target));
    }
  });
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', renderQuestTabbar, { once:true });
}else{
  renderQuestTabbar();
}

/* Safari/iOS restaure parfois une page depuis son cache sans rejouer
   DOMContentLoaded. pageshow garantit que la barre est recréée au retour. */
window.addEventListener('pageshow', renderQuestTabbar);

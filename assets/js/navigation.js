const QUEST_NAVIGATION_VERSION = '100';
window.QUEST_NAVIGATION_VERSION = QUEST_NAVIGATION_VERSION;
const QUEST_TABBAR_HEIGHT = '58px';
const QUEST_TABBAR_PADDING = '2px 4px 5px';
const QUEST_NAVIGATION_SCRIPT = document.currentScript;
const QUEST_NAVIGATION_STYLESHEET = new URL(
  `../css/navigation.css?v=${QUEST_NAVIGATION_VERSION}`,
  QUEST_NAVIGATION_SCRIPT?.src || document.baseURI
).href;

const QUEST_TABS = [
  { id:'home', href:'index.html', label:'Accueil', icon:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>' },
  { id:'puzzles', href:'problems.html', label:'Problèmes', icon:'<path d="M9 3h6v4a3 3 0 1 0 3 3h3v11h-6v-3a3 3 0 1 0-3 3H3v-7h4a3 3 0 1 0 0-6H3V3h6Z"/>' },
  { id:'learn', href:'learn.html', label:'Apprendre', icon:'<path d="M4 19V6a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2Z"/><path d="M20 19V6a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2Z"/>' },
  { id:'observer', href:'analysis.html', label:'Observer', icon:'<circle cx="7.5" cy="14" r="4"/><circle cx="16.5" cy="14" r="4"/><path d="M11.5 14h1M4 13l1.5-7h4l2 8M20 13l-1.5-7h-4l-2 8"/>' },
  { id:'more', href:'profile.html', label:'Plus', icon:'<path d="M4 6h16M4 12h16M4 18h16"/>' }
];

const QUEST_ROUTE_TABS = {
  '':'home', 'index.html':'home', 'coach.html':'home', 'entrainement.html':'home',
  'training-game.html':'home', 'secret-levels.html':'home',
  'problems.html':'puzzles', 'puzzles.html':'puzzles', 'daily-challenge.html':'puzzles',
  'training-target.html':'puzzles',
  'learn.html':'learn', 'openings.html':'learn', 'course.html':'learn', 'course-library.html':'learn',
  'analysis.html':'observer', 'game-view.html':'observer',
  'profile.html':'more', 'progress.html':'more', 'settings.html':'more', 'shop.html':'more'
};

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

function currentQuestTab(){
  const route = location.pathname.split('/').pop().toLowerCase();
  return QUEST_ROUTE_TABS[route] || 'home';
}

/* WebKit peut recalculer env(safe-area-inset-bottom) pendant une transition
   entre deux documents plein écran. La barre ne doit jamais dépendre de cette
   valeur fluctuante : sa géométrie est donc verrouillée à chaque affichage.
   Son pseudo-élément CSS continue, lui, à peindre le fond jusqu'au bord. */
function lockQuestTabbarGeometry(tabbar){
  const root = document.documentElement.style;
  root.setProperty('--cq-tabbar-content-height', QUEST_TABBAR_HEIGHT);
  root.setProperty('--cq-tabbar-height', QUEST_TABBAR_HEIGHT);
  root.setProperty('--tabbar-height', QUEST_TABBAR_HEIGHT);
  tabbar.style.setProperty('height', QUEST_TABBAR_HEIGHT, 'important');
  tabbar.style.setProperty('min-height', QUEST_TABBAR_HEIGHT, 'important');
  tabbar.style.setProperty('padding', QUEST_TABBAR_PADDING, 'important');
  tabbar.style.setProperty('bottom', '0px', 'important');
  tabbar.style.setProperty('box-sizing', 'border-box', 'important');
}

/* Les vues plein écran contraignent leur body à la hauteur disponible. Sur
   WebKit en mode PWA, un élément fixed qui reste dans ce body peut alors être
   ancré 58 px trop haut. La navigation est portée directement par la racine du
   document : son bottom:0 dépend ainsi toujours du viewport, jamais du layout
   particulier d'Apprendre, Problèmes ou des échiquiers. */
function mountQuestTabbarAtViewportRoot(tabbar){
  if(tabbar.parentElement !== document.documentElement){
    document.documentElement.appendChild(tabbar);
  }
}

function renderQuestTabbar(){
  ensureQuestNavigationStyles();
  const tabbars = [...document.querySelectorAll('nav.tabbar')];
  const tabbar = tabbars.shift() || document.createElement('nav');
  tabbars.forEach(duplicate => duplicate.remove());
  mountQuestTabbarAtViewportRoot(tabbar);
  tabbar.className = 'tabbar';
  tabbar.setAttribute('aria-label', 'Navigation principale');
  lockQuestTabbarGeometry(tabbar);
  document.body.classList.add('cq-has-tabbar');
  document.documentElement.classList.add('cq-has-tabbar');
  const activeTab = currentQuestTab();
  tabbar.innerHTML = QUEST_TABS.map(tab => `
    <a class="tabbar-item${tab.id === activeTab ? ' active' : ''}" data-tab="${tab.id}" href="${tab.href}"${tab.id === activeTab ? ' aria-current="page"' : ''}>
      <svg viewBox="0 0 24 24" class="tabicon" aria-hidden="true">${tab.icon}</svg>
      <span>${tab.label}</span>
    </a>`).join('');
}

function registerQuestServiceWorker(){
  if(!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register(`./sw.js?v=${QUEST_NAVIGATION_VERSION}`, { updateViaCache:'none' })
    .then(registration => registration.update())
    .catch(() => {});
}

/* Affiche la barre dès que le script est rencontré. Ainsi, un CDN lent ou
   indisponible ne peut plus laisser une navigation vide sur les échiquiers. */
if(document.body) renderQuestTabbar();
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderQuestTabbar, { once:true });
window.addEventListener('pageshow', event => {
  renderQuestTabbar();
});
function syncQuestNavigationLayout(){
  const tabbar = document.querySelector('nav.tabbar');
  if(tabbar) lockQuestTabbarGeometry(tabbar);
}
window.addEventListener('resize', syncQuestNavigationLayout, { passive:true });
/* Ne jamais attendre `load` : les polices et illustrations distantes peuvent
   le retarder, surtout dans une PWA restaurée depuis le cache. */
registerQuestServiceWorker();

/* Migration PWA indépendante du cache applicatif. */
(() => {
  const VERSION = '111';
  const RELOAD_KEY = `chessquest-sw-reloaded-${VERSION}`;
  window.QUEST_PWA_BOOTSTRAP_VERSION = VERSION;

  /* Apparence globale chargée avant le premier rendu. Les pages d'échiquier
     ne dépendent ainsi plus de leur propre feuille CSS pour appliquer un
     achat de la boutique. */
  const APPEARANCE_CSS = 'assets/css/quest-appearance-v109.css';
  if(!document.querySelector(`link[href*="quest-appearance"]`)){
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = APPEARANCE_CSS;
    document.head.appendChild(link);
  }
  function applyQuestAppearance(progress){
    let state = progress;
    if(!state){
      try{ state = JSON.parse(localStorage.getItem('chessQuestProgress') || '{}'); }catch{ state = {}; }
    }
    const economy = state?.economy || {};
    const settings = state?.settings || {};
    const root = document.documentElement;
    root.dataset.boardSkin = String(economy.equippedBoard || 'board-royal').replace('board-','');
    root.dataset.pieceSkin = String(economy.equippedPieces || 'pieces-classic').replace('pieces-','');
    root.dataset.backgroundSkin = String(economy.equippedBackground || 'background-ivory').replace('background-','');
    root.dataset.questTheme = settings.appTheme === 'dark' ? 'dark' : 'light';
    const dark = root.dataset.questTheme === 'dark';
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.content = dark ? '#262522' : (meta.dataset.lightColor || meta.content));
  }
  window.applyQuestAppearance = applyQuestAppearance;
  applyQuestAppearance();

  if(!('serviceWorker' in navigator) || location.protocol === 'file:') return;

  let reloadQueued = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if(reloadQueued) return;
    reloadQueued = true;
    try{
      if(sessionStorage.getItem(RELOAD_KEY) === '1') return;
      sessionStorage.setItem(RELOAD_KEY, '1');
    }catch{}
    location.reload();
  });

  navigator.serviceWorker
    .register(`./sw.js?v=${VERSION}`, { updateViaCache:'none' })
    .then(registration => registration.update())
    .catch(() => {});
})();

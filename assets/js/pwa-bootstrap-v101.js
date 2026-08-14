/* Migration PWA indépendante du cache applicatif. */
(() => {
  const VERSION = '107';
  const RELOAD_KEY = `chessquest-sw-reloaded-${VERSION}`;
  window.QUEST_PWA_BOOTSTRAP_VERSION = VERSION;

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

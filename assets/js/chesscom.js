/* Synchronisation des parties publiques Chess.com : aucun mot de passe ou jeton n'est requis. */
const CHESSCOM_SYNC_MS = 2 * 60 * 1000;
const CHESSCOM_STATS_MS = 30 * 60 * 1000;
function chessComState(){
  PROGRESS.chessCom = Object.assign({username:'', games:[], lastSync:null, stats:null, statsFetchedAt:null}, PROGRESS.chessCom || {});
  return PROGRESS.chessCom;
}
async function chessComJson(url){
  const response = await fetch(url, {headers:{Accept:'application/json'}});
  if(!response.ok) throw new Error(response.status === 404 ? 'Pseudo Chess.com introuvable.' : `Chess.com a répondu ${response.status}.`);
  return response.json();
}
async function syncChessCom(username){
  const name = (username || chessComState().username || '').trim();
  if(!name) throw new Error('Entre un pseudo Chess.com.');
  const state = chessComState(); state.syncing = true;
  try {
    const archives = await chessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(name)}/games/archives`);
    const urls = archives.archives || [];
    if(!urls.length) throw new Error('Aucune archive publique trouvée.');
    // Une partie Chess.com contient déjà son PGN : on ne redemande que le mois actif,
    // puis on fusionne avec le cache local au lieu de re-télécharger l'historique.
    const latestMonth = await chessComJson(urls[urls.length - 1]);
    const known = new Map((state.games || []).map(game => [game.url || `${game.end_time}-${game.pgn?.slice(0,50)}`, game]));
    (latestMonth.games || []).forEach(game => known.set(game.url || `${game.end_time}-${game.pgn?.slice(0,50)}`, game));
    let games = Array.from(known.values()).sort((a,b) => (b.end_time||0)-(a.end_time||0));
    // Premier lancement : ajoute le mois précédent pour proposer immédiatement une liste utile.
    if(!(state.games || []).length && urls.length > 1){
      const previousMonth = await chessComJson(urls[urls.length - 2]);
      previousMonth.games.forEach(game => known.set(game.url || `${game.end_time}-${game.pgn?.slice(0,50)}`, game));
      games = Array.from(known.values()).sort((a,b) => (b.end_time||0)-(a.end_time||0));
    }
    state.username = name; state.games = games.slice(0,80); state.lastSync = new Date().toISOString();
    PROGRESS.settings.chessComUsername = name; saveProgress(); return games;
  } finally { state.syncing = false; }
}
async function fetchChessComStats(username){
  const name = (username || chessComState().username || '').trim();
  if(!name) throw new Error('Entre un pseudo Chess.com.');
  const stats = await chessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(name)}/stats`);
  const state = chessComState();
  state.stats = stats; state.statsFetchedAt = new Date().toISOString();
  saveProgress();
  return stats;
}
function startChessComBackgroundSync(){
  const state = chessComState(); const username = state.username || (PROGRESS.settings || {}).chessComUsername;
  if(!username) return;
  const runSync = () => {
    syncChessCom(username).catch(() => {});
    if(!state.statsFetchedAt || Date.now() - new Date(state.statsFetchedAt).getTime() > CHESSCOM_STATS_MS) fetchChessComStats(username).catch(() => {});
    // Reprend l'inscription dans Firestore si elle n'avait pas abouti la première fois
    // (ex : Firebase pas encore configuré côté app au moment du clic sur "Enregistrer").
    if(typeof registerChessComUsername === 'function') registerChessComUsername(username).catch(() => {});
  };
  if(!state.lastSync || Date.now() - new Date(state.lastSync).getTime() > CHESSCOM_SYNC_MS) runSync();
  window.setInterval(runSync, CHESSCOM_SYNC_MS);
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'visible' && Date.now() - new Date(state.lastSync || 0).getTime() > 30000) runSync();
  });
}
document.addEventListener('DOMContentLoaded', startChessComBackgroundSync);

/* Synchronisation des parties publiques Chess.com : aucun mot de passe ou jeton n'est requis. */
const CHESSCOM_SYNC_MS = 5 * 60 * 1000;
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
    const batches = await Promise.all((archives.archives || []).slice(-2).reverse().map(chessComJson));
    const games = batches.flatMap(batch => batch.games || []).sort((a,b) => (b.end_time||0)-(a.end_time||0)).slice(0,30);
    state.username = name; state.games = games; state.lastSync = new Date().toISOString();
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
  const runSync = () => { syncChessCom(username).catch(() => {}); fetchChessComStats(username).catch(() => {}); };
  if(!state.lastSync || Date.now() - new Date(state.lastSync).getTime() > CHESSCOM_SYNC_MS) runSync();
  window.setInterval(runSync, CHESSCOM_SYNC_MS);
}
document.addEventListener('DOMContentLoaded', startChessComBackgroundSync);

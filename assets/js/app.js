/* ============================================================
   ChessQuest — app.js
   Initialisation commune : voix, sons, écran de bienvenue.
   Charger après progress.js et animations.js.
   ============================================================ */

/* ---- Lecture vocale (français, sélection de la meilleure voix) ---- */
let ttsEnabled = true;
let frenchVoice = null;

function pickFrenchVoice(){
  if(!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if(!voices || voices.length === 0) return null;
  const frVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('fr'));
  if(frVoices.length === 0) return null;
  if(PROGRESS.settings && PROGRESS.settings.voiceName){
    const saved = frVoices.find(v => v.name === PROGRESS.settings.voiceName);
    if(saved) return saved;
  }
  const preferredHints = ['enhanced', 'premium', 'natural', 'neural', 'google', 'amélie', 'amelie', 'audrey', 'aurélie', 'aurelie', 'thomas', 'marie', 'siri'];
  for(const hint of preferredHints){
    const found = frVoices.find(v => v.name.toLowerCase().includes(hint));
    if(found) return found;
  }
  return frVoices.find(v => v.localService) || frVoices[0];
}
function refreshVoiceChoice(){ frenchVoice = pickFrenchVoice(); }
if('speechSynthesis' in window){
  refreshVoiceChoice();
  window.speechSynthesis.onvoiceschanged = refreshVoiceChoice;
}

const SPEECH_PIECE_NAMES = {N:'Cavalier', B:'Fou', R:'Tour', Q:'Dame', K:'Roi'};
function sanTokenToSpeech(token){
  if(token === 'O-O-O' || token === '0-0-0') return 'grand roque';
  if(token === 'O-O' || token === '0-0') return 'petit roque';
  let t = token, suffix = '';
  if(t.endsWith('#')){ suffix = ', échec et mat'; t = t.slice(0, -1); }
  else if(t.endsWith('+')){ suffix = ', échec'; t = t.slice(0, -1); }
  let promotion = '';
  const promoMatch = t.match(/=([NBRQ])$/);
  if(promoMatch){ promotion = ' promotion ' + SPEECH_PIECE_NAMES[promoMatch[1]]; t = t.slice(0, -2); }
  let piece = '';
  if(/^[NBRQK]/.test(t)){ piece = SPEECH_PIECE_NAMES[t[0]] + ' '; t = t.slice(1); }
  t = t.replace('x', ' prend ');
  return (piece + t + promotion + suffix).trim();
}
function frenchifyMoveNotation(text){
  return text.replace(/\b(O-O-O|O-O|[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?)\b/g, (match) => {
    if(match === 'O-O-O' || match === 'O-O') return sanTokenToSpeech(match);
    if(!/[a-h][1-8]/.test(match)) return match;
    return sanTokenToSpeech(match);
  });
}
function speak(text){
  if(!ttsEnabled || !('speechSynthesis' in window)) return;
  try{
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(frenchifyMoveNotation(text));
    u.lang = 'fr-FR';
    if(frenchVoice) u.voice = frenchVoice;
    u.rate = 0.96;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

/* ---- Sons synthétisés (aucun fichier externe requis) ---- */
let soundEnabled = (PROGRESS.settings && PROGRESS.settings.soundEnabled !== false);
let audioCtx = null;
function ensureAudioCtx(){
  if(!audioCtx){ try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} }
  return audioCtx;
}
function playSound(type){
  if(!soundEnabled) return;
  const ctx = ensureAudioCtx();
  if(!ctx) return;
  try{
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    let freq = 520, dur = 0.08;
    if(type === 'move'){ freq = 520; dur = 0.07; }
    else if(type === 'capture'){ freq = 340; dur = 0.09; }
    else if(type === 'check'){ freq = 700; dur = 0.12; }
    else if(type === 'gameover'){ freq = 260; dur = 0.4; }
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.start(now); osc.stop(now + dur + 0.02);
  }catch(e){}
}

/* ---- Écran de bienvenue (première visite uniquement, index.html) ---- */
function initOnboarding(){
  const overlay = document.getElementById('onboarding-overlay');
  if(!overlay) return;
  if(PROGRESS.onboarded){
    overlay.classList.add('hidden');
    return;
  }
  overlay.classList.remove('hidden');
  function dismiss(){
    overlay.classList.add('hidden');
    PROGRESS.onboarded = true;
    saveProgress();
  }
  const closeBtn = document.getElementById('onboarding-close-btn');
  const skipBtn = document.getElementById('onboarding-skip-btn');
  if(closeBtn) closeBtn.onclick = dismiss;
  if(skipBtn) skipBtn.onclick = dismiss;
}
document.addEventListener('DOMContentLoaded', initOnboarding);

/* ---- Centre de notifications : rappels utiles et actions directes ---- */
function questNotificationState(){
  PROGRESS.notificationState = Object.assign({dismissed:{}, lastToastDate:null}, PROGRESS.notificationState || {});
  return PROGRESS.notificationState;
}
function questNotifications(){
  const items = [];
  if(typeof ensureDailyProgressFresh === 'function' && typeof todayChallenge === 'function'){
    ensureDailyProgressFresh();
    const challenge = todayChallenge();
    const current = PROGRESS.dailyProgress[challenge.type] || 0;
    if(!PROGRESS.dailyProgress.rewardClaimed){
      items.push({
        id:`daily-${todayKey()}`, icon:'🎯', title:'Ton défi quotidien t’attend',
        text:`${challenge.text} · ${current}/${challenge.target}`, href:'daily-challenge.html', priority:3
      });
    }
  }
  if(typeof chessComState === 'function'){
    const games = chessComState().games || [];
    const latest = games.slice().sort((a,b) => (b.end_time||0) - (a.end_time||0))[0];
    if(latest && latest.url){
      const syncedName = String(chessComState().username || '').toLowerCase();
      const opponent = latest.white && latest.black ? (String(latest.white.username || '').toLowerCase() === syncedName ? latest.black.username : latest.white.username) : 'ton adversaire';
      items.push({
        id:`game-${latest.url}`, icon:'♟', title:'Ta dernière partie est prête',
        text:`Analyse-la contre ${opponent || 'ton adversaire'} et découvre tes meilleurs coups.`, href:'analysis.html', priority:4
      });
    }
  }
  if(typeof computeCurrentStreak === 'function' && computeCurrentStreak() >= 2 && !(PROGRESS.activityDates || []).includes(todayKey())){
    items.push({id:`streak-${todayKey()}`, icon:'🔥', title:'Garde ta série en vie', text:'Un puzzle ou une leçon suffit pour continuer ta progression.', href:'puzzles.html', priority:2});
  }
  const dismissed = questNotificationState().dismissed || {};
  return items.filter(item => !dismissed[item.id]).sort((a,b) => b.priority - a.priority);
}
function initQuestNotifications(){
  if(document.getElementById('quest-notifications')) return;
  const items = questNotifications();
  const root = document.createElement('aside');
  root.id = 'quest-notifications';
  root.className = 'quest-notifications';
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'quest-notification-toggle';
  toggle.setAttribute('aria-label', `${items.length} notification${items.length > 1 ? 's' : ''}`);
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 6.5-2.7 7.2-2.7 9h17.4c0-1.8-2.7-2.5-2.7-9Z"/><path d="M9.7 20h4.6"/></svg><b></b>';
  const panel = document.createElement('div');
  panel.className = 'quest-notification-panel hidden';
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Notifications');
  const heading = document.createElement('div'); heading.className = 'quest-notification-heading'; heading.textContent = 'Notifications royales'; panel.appendChild(heading);
  function render(){
    const fresh = questNotifications();
    toggle.querySelector('b').textContent = fresh.length > 9 ? '9+' : fresh.length;
    toggle.querySelector('b').classList.toggle('hidden', fresh.length === 0);
    panel.querySelectorAll('.quest-notification-item,.quest-notification-empty').forEach(el => el.remove());
    if(!fresh.length){ const empty=document.createElement('p'); empty.className='quest-notification-empty'; empty.textContent='Tu es à jour. Bien joué !'; panel.appendChild(empty); return; }
    fresh.forEach(item => {
      const row=document.createElement('div'); row.className='quest-notification-item';
      const go=document.createElement('button'); go.type='button'; go.className='quest-notification-go';
      const icon=document.createElement('span'); icon.className='quest-notification-icon'; icon.textContent=item.icon;
      const copy=document.createElement('span'); copy.className='quest-notification-copy';
      const title=document.createElement('strong'); title.textContent=item.title;
      const text=document.createElement('small'); text.textContent=item.text;
      copy.append(title,text); go.append(icon,copy); go.onclick=()=>{ location.href=item.href; };
      const close=document.createElement('button'); close.type='button'; close.className='quest-notification-dismiss'; close.setAttribute('aria-label','Masquer cette notification'); close.textContent='×';
      close.onclick=()=>{ questNotificationState().dismissed[item.id]=Date.now(); saveProgress(); render(); };
      row.append(go,close); panel.appendChild(row);
    });
  }
  toggle.onclick=event=>{
    event.stopPropagation();
    const opening = panel.classList.contains('hidden');
    panel.classList.toggle('hidden',!opening);
    toggle.setAttribute('aria-expanded',String(opening));
  };
  panel.onclick=event=>event.stopPropagation();
  if(!window.__questNotificationGlobalHandlers){
    document.addEventListener('click',()=>{
      const currentPanel=document.querySelector('.quest-notification-panel');
      const currentToggle=document.querySelector('.quest-notification-toggle');
      currentPanel?.classList.add('hidden'); currentToggle?.setAttribute('aria-expanded','false');
    });
    document.addEventListener('keydown',event=>{
      if(event.key !== 'Escape') return;
      document.querySelector('.quest-notification-panel')?.classList.add('hidden');
      document.querySelector('.quest-notification-toggle')?.setAttribute('aria-expanded','false');
    });
    window.__questNotificationGlobalHandlers=true;
  }
  toggle.setAttribute('aria-expanded','false');
  root.append(toggle,panel); document.body.appendChild(root); render();
  const state = questNotificationState();
  if(document.body.dataset.page === 'home' && state.lastToastDate !== todayKey()){
    state.lastToastDate = todayKey(); saveProgress();
    const first = items[0];
    if(first && typeof showToast === 'function') showToast(first.title, first.text);
  }
}
document.addEventListener('DOMContentLoaded', initQuestNotifications);
window.addEventListener('cq:chesscom-sync', () => {
  const existing = document.getElementById('quest-notifications');
  if(existing) existing.remove();
  initQuestNotifications();
});

/* ---- PWA : installation propre et navigation dans le scope de l'app ---- */
function initPwa(){
  if(!('serviceWorker' in navigator)) return;
  const isFile = window.location.protocol === 'file:';
  if(isFile) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
initPwa();

const questThemeMeta = document.querySelector('meta[name="theme-color"]');
if(questThemeMeta) questThemeMeta.setAttribute('content', '#063427');

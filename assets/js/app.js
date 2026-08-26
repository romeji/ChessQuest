/* ============================================================
   ChessQuest — app.js
   Initialisation commune : voix, sons, écran de bienvenue.
   Charger après progress.js et animations.js.
   ============================================================ */

/* L'authentification est commune à toute l'application. Les pages historiques
   ne chargeaient auth.js que depuis l'accueil et les réglages : on le monte ici
   une seule fois afin que chaque route PWA soit réellement protégée. */
function bootMandatoryQuestAuth(){
  if(typeof initQuestAccountFlow==='function'){initQuestAccountFlow();return;}
  if(document.querySelector('script[data-quest-auth-loader]')) return;
  const script=document.createElement('script');
  script.src='assets/js/auth.js?v=104';
  script.dataset.questAuthLoader='true';
  script.onload=()=>{if(typeof initQuestAccountFlow==='function')initQuestAccountFlow();};
  script.onerror=()=>console.warn('[ChessQuest] Module de connexion indisponible.');
  document.head.appendChild(script);
}
bootMandatoryQuestAuth();

/* ---- Lecture vocale (français, sélection de la meilleure voix) ---- */
let ttsEnabled = false;
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
  return;
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
  if(typeof initQuestAccountFlow === 'function') return;
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
  const invites = Array.isArray(PROGRESS.friendInvitations) ? PROGRESS.friendInvitations : [];
  invites.filter(invite=>invite.status==='waiting').forEach(invite=>items.push({
    id:`invite-${invite.id}`, icon:'⚔️', title:`Défi de ${invite.senderName || 'un ami'}`,
    text:`${invite.timeLabel || 'Partie amicale'} · appuie pour accepter.`, href:`friends.html?invite=${encodeURIComponent(invite.id)}`, priority:10
  }));
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
/* Vue complète des notifications : un bouton rectangulaire ("Notifs", au
   style des autres puces comme "Boutique") ouvre une carte plein écran qui
   liste toutes les notifications reçues. Plus d'icône flottante. */
function renderNotifView(){
  const list = document.getElementById('notif-view-list');
  const badge = document.getElementById('home-notif-badge');
  if(!list) return;
  const fresh = questNotifications();
  if(badge){
    badge.textContent = fresh.length > 9 ? '9+' : String(fresh.length);
    badge.classList.toggle('hidden', fresh.length === 0);
  }
  list.innerHTML = '';
  if(!fresh.length){
    const empty=document.createElement('p'); empty.className='quest-notification-empty'; empty.textContent='Tu es à jour. Bien joué !';
    list.appendChild(empty); return;
  }
  fresh.forEach(item => {
    const row=document.createElement('div'); row.className='quest-notification-item';
    const go=document.createElement('button'); go.type='button'; go.className='quest-notification-go';
    const icon=document.createElement('span'); icon.className='quest-notification-icon'; icon.textContent=item.icon;
    const copy=document.createElement('span'); copy.className='quest-notification-copy';
    const title=document.createElement('strong'); title.textContent=item.title;
    const text=document.createElement('small'); text.textContent=item.text;
    copy.append(title,text); go.append(icon,copy); go.onclick=()=>{ location.href=item.href; };
    const close=document.createElement('button'); close.type='button'; close.className='quest-notification-dismiss'; close.setAttribute('aria-label','Masquer cette notification'); close.textContent='×';
    close.onclick=()=>{ questNotificationState().dismissed[item.id]=Date.now(); saveProgress(); renderNotifView(); };
    row.append(go,close); list.appendChild(row);
  });
}
function openNotifView(){ document.getElementById('notif-view-overlay')?.classList.add('open'); renderNotifView(); }
function closeNotifView(){ document.getElementById('notif-view-overlay')?.classList.remove('open'); }
function initQuestNotifications(){
  if(document.body.dataset.page !== 'home') return;
  const chip = document.getElementById('home-notif-chip');
  const overlay = document.getElementById('notif-view-overlay');
  if(!chip || !overlay || chip.dataset.bound) { renderNotifView(); return; }
  chip.dataset.bound = '1';
  chip.addEventListener('click', openNotifView);
  document.getElementById('notif-view-close')?.addEventListener('click', closeNotifView);
  overlay.addEventListener('click', event=>{ if(event.target === overlay) closeNotifView(); });
  document.addEventListener('keydown', event=>{ if(event.key === 'Escape') closeNotifView(); });
  renderNotifView();
  // La puce "Notifs" est volontairement réservée à l'accueil.
  const state = questNotificationState();
  const items = questNotifications();
  if(state.lastToastDate !== todayKey()){
    state.lastToastDate = todayKey(); saveProgress();
    const first = items[0];
    if(first && typeof showToast === 'function') showToast(first.title, first.text);
  }
}
document.addEventListener('DOMContentLoaded', initQuestNotifications);
let questInviteUnsubscribe=null;
async function installQuestInvitationNotifications(){
  if(questInviteUnsubscribe || !window.firebase?.firestore || typeof questCurrentUser!=='function') return;
  const user=await questCurrentUser(); if(!user) return;
  questInviteUnsubscribe=firebase.firestore().collection('invitations').where('recipientUid','==',user.uid).where('status','==','waiting').limit(12).onSnapshot(snapshot=>{
    PROGRESS.friendInvitations=snapshot.docs.map(doc=>Object.assign({id:doc.id},doc.data()));
    saveProgress({localOnly:true});
    renderNotifView();
  },error=>console.warn('[ChessQuest] Invitations indisponibles',error));
}
window.addEventListener('load',()=>setTimeout(installQuestInvitationNotifications,900));
window.addEventListener('cq:chesscom-sync', () => { renderNotifView(); });

/* ---- Fin de parcours : une célébration cohérente sur tous les modules. ---- */
function closeQuestCompletionModal(){
  document.getElementById('quest-completion-modal')?.remove();
  document.body.classList.remove('quest-modal-open');
}
function showQuestCompletionModal(options={}){
  closeQuestCompletionModal();
  const modal=document.createElement('div');
  modal.id='quest-completion-modal'; modal.className=`quest-completion-modal ${options.tone||'success'}`;
  modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-labelledby','quest-completion-title');
  const card=document.createElement('section'); card.className='quest-completion-card';
  const icon=document.createElement('span'); icon.className='quest-completion-icon'; icon.textContent=options.icon||'🏆';
  const eyebrow=document.createElement('small'); eyebrow.className='quest-completion-eyebrow'; eyebrow.textContent=options.eyebrow||'Mission accomplie';
  const title=document.createElement('h2'); title.id='quest-completion-title'; title.textContent=options.title||'Bravo !';
  const message=document.createElement('p'); message.textContent=options.message||'Le royaume est fier de toi.';
  const actions=document.createElement('div'); actions.className='quest-completion-actions';
  let finished=false,timer=null;
  const finish=action=>{
    if(finished) return; finished=true;
    if(timer) clearTimeout(timer);
    closeQuestCompletionModal();
    if(action?.href) location.href=action.href;
    else if(typeof action?.onClick==='function') action.onClick();
  };
  (options.actions||[{label:'Continuer',primary:true}]).forEach(action=>{
    const button=document.createElement('button'); button.type='button'; button.textContent=action.label;
    button.className=action.primary?'primary':'secondary'; button.onclick=()=>finish(action); actions.appendChild(button);
  });
  card.append(icon,eyebrow,title,message,actions); modal.appendChild(card); document.body.appendChild(modal);
  document.body.classList.add('quest-modal-open'); requestAnimationFrame(()=>modal.classList.add('visible'));
  (actions.querySelector('.primary')||actions.querySelector('button'))?.focus();
  if(options.confetti!==false && typeof fireConfetti==='function') fireConfetti('mastery');
  if(options.autoAction && Number(options.autoDelay)>0) timer=setTimeout(()=>finish(options.autoAction),Number(options.autoDelay));
  return {close:closeQuestCompletionModal};
}
window.showQuestCompletionModal=showQuestCompletionModal;
window.closeQuestCompletionModal=closeQuestCompletionModal;

/* ---- PWA : installation propre et navigation dans le scope de l'app ---- */
function initPwa(){
  if(window.__CQ_PWA_UPDATE__) return;
  if(!('serviceWorker' in navigator)) return;
  const isFile = window.location.protocol === 'file:';
  if(isFile) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=107', { updateViaCache:'none' }).then(registration => registration.update()).catch(() => {});
  });
}
initPwa();

const questThemeMeta = document.querySelector('meta[name="theme-color"]');
if(questThemeMeta) questThemeMeta.setAttribute('content', document.documentElement.dataset.questTheme === 'dark' ? '#262522' : '#063427');

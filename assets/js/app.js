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
  if(!PROGRESS.onboarded) overlay.classList.remove('hidden');
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

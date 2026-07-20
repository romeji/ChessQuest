/* ============================================================
   ChessQuest — progress.js
   Modèle de données de progression (localStorage), partagé par
   toutes les pages : XP/niveaux, séries, défi du jour, badges.
   ============================================================ */

const PROGRESS_KEY = 'chessQuestProgress';

function defaultProgress(){
  return {
    mastered:{}, attempts:{}, games:[], settings:{engineSpeed:'normal', voiceName:null, soundEnabled:true},
    mistakes: [], puzzleRating: 1000, puzzleRatingHistory: [], puzzlesSolved: 0, puzzlesFailed: 0,
    puzzleStreak: 0, puzzleBestStreak: 0,
    activityDates: [], viewedNotationGuide: false, viewedGlossary: false,
    xp: 0, lastKnownLevel: 1, unlockedBadges: [],
    dailyProgress: { date:null, puzzlesSolvedToday:0, linesCompletedToday:0, gamesAnalyzedToday:0, gamesPlayedToday:0, rewardClaimed:false },
    onboarded: false
  };
}
function loadProgress(){
  try{
    const raw = localStorage.getItem(PROGRESS_KEY);
    if(!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultProgress(), parsed);
  }catch(e){ return defaultProgress(); }
}
function saveProgress(){ try{ localStorage.setItem(PROGRESS_KEY, JSON.stringify(PROGRESS)); }catch(e){} }
let PROGRESS = loadProgress();

/* ---- Vitesse moteur (partagée avec board.js) ---- */
const ENGINE_SPEEDS = { fast:250, normal:450, deep:900 };
if(typeof SF_MOVETIME_MS !== 'undefined'){
  SF_MOVETIME_MS = ENGINE_SPEEDS[PROGRESS.settings.engineSpeed] || 450;
}

/* ============================================================
   SÉRIE QUOTIDIENNE (streak)
   ============================================================ */
function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dateKeyOffset(daysAgo){
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function recordActivity(){
  PROGRESS.activityDates = PROGRESS.activityDates || [];
  const key = todayKey();
  const isNewDay = !PROGRESS.activityDates.includes(key);
  if(isNewDay){
    PROGRESS.activityDates.push(key);
    PROGRESS.activityDates = PROGRESS.activityDates.slice(-400);
    saveProgress();
    const streak = computeCurrentStreak();
    if(streak > 1 && typeof showToast === 'function'){
      showToast(`Série de ${streak} jour${streak>1?'s':''} !`, 'Reviens demain pour continuer.');
    }
  }
}
function computeCurrentStreak(){
  const dates = new Set(PROGRESS.activityDates || []);
  let streak = 0;
  let offset = dates.has(todayKey()) ? 0 : 1;
  while(dates.has(dateKeyOffset(offset))){ streak++; offset++; }
  return streak;
}
function computeBestStreak(){
  const dates = (PROGRESS.activityDates || []).slice().sort();
  if(dates.length === 0) return 0;
  let best = 1, cur = 1;
  for(let i=1;i<dates.length;i++){
    const diffDays = Math.round((new Date(dates[i]) - new Date(dates[i-1])) / 86400000);
    if(diffDays === 1){ cur++; } else if(diffDays > 1){ cur = 1; }
    best = Math.max(best, cur);
  }
  return best;
}

/* ============================================================
   NIVEAU DE JOUEUR (XP)
   ============================================================ */
const XP_PER_LEVEL = 150;
const LEVEL_TITLES = [
  {min:1, max:2, title:'Novice'},
  {min:3, max:5, title:'Apprenti'},
  {min:6, max:9, title:'Joueur confirmé'},
  {min:10, max:14, title:'Stratège'},
  {min:15, max:20, title:'Maître en devenir'},
  {min:21, max:9999, title:'Grand Maître'}
];
function levelFromXp(xp){ return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1; }
function levelTitle(level){
  const t = LEVEL_TITLES.find(t => level >= t.min && level <= t.max);
  return t ? t.title : 'Joueur';
}
function addXP(amount){
  PROGRESS.xp = (PROGRESS.xp || 0) + amount;
  const newLevel = levelFromXp(PROGRESS.xp);
  if(newLevel > (PROGRESS.lastKnownLevel || 1)){
    PROGRESS.lastKnownLevel = newLevel;
    saveProgress();
    if(typeof fireConfetti === 'function') fireConfetti('mastery');
    if(typeof showToast === 'function') showToast(`Niveau ${newLevel} atteint !`, levelTitle(newLevel));
    checkNewBadges();
  } else {
    saveProgress();
  }
}

/* ============================================================
   DÉFI DU JOUR
   ============================================================ */
const DAILY_CHALLENGES = [
  {id:'puzzles3', text:'Résous 3 puzzles aujourd\u2019hui', target:3, type:'puzzlesSolvedToday', xp:40},
  {id:'train1', text:'Termine une ouverture aujourd\u2019hui', target:1, type:'linesCompletedToday', xp:30},
  {id:'analyze1', text:'Analyse une partie aujourd\u2019hui', target:1, type:'gamesAnalyzedToday', xp:35},
  {id:'play1', text:'Termine une partie contre l\u2019ordinateur', target:1, type:'gamesPlayedToday', xp:30},
  {id:'puzzles5', text:'Résous 5 puzzles aujourd\u2019hui', target:5, type:'puzzlesSolvedToday', xp:60}
];
function dayOfYear(){
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}
function todayChallenge(){ return DAILY_CHALLENGES[dayOfYear() % DAILY_CHALLENGES.length]; }
function ensureDailyProgressFresh(){
  PROGRESS.dailyProgress = PROGRESS.dailyProgress || {};
  if(PROGRESS.dailyProgress.date !== todayKey()){
    PROGRESS.dailyProgress = { date: todayKey(), puzzlesSolvedToday:0, linesCompletedToday:0, gamesAnalyzedToday:0, gamesPlayedToday:0, rewardClaimed:false };
  }
}
function bumpDailyCounter(type){
  ensureDailyProgressFresh();
  PROGRESS.dailyProgress[type] = (PROGRESS.dailyProgress[type] || 0) + 1;
  const challenge = todayChallenge();
  if(challenge.type === type && !PROGRESS.dailyProgress.rewardClaimed && PROGRESS.dailyProgress[type] >= challenge.target){
    PROGRESS.dailyProgress.rewardClaimed = true;
    addXP(challenge.xp);
    if(typeof fireConfetti === 'function') fireConfetti('badge');
    if(typeof showToast === 'function') showToast('Défi du jour terminé !', `+${challenge.xp} XP`);
  }
  saveProgress();
}

/* ============================================================
   BADGES
   ============================================================ */
function computeBadges(){
  const masteredCount = Object.keys(PROGRESS.mastered).length;
  const gamesCount = PROGRESS.games.length;
  const perfectGame = PROGRESS.games.some(g => g.totalBlunders === 0);
  const totalTrainable = (typeof trainableKeys === 'function') ? trainableKeys().length : 24;
  const level = levelFromXp(PROGRESS.xp || 0);
  return [
    {icon:'medal', name:'Premier pas', desc:'Maîtriser 1 ouverture sans erreur', unlocked: masteredCount >= 1},
    {icon:'medal', name:'Étudiant assidu', desc:'Maîtriser 10 ouvertures sans erreur', unlocked: masteredCount >= 10},
    {icon:'trophy', name:'Maître des ouvertures', desc:`Maîtriser les ${totalTrainable} ouvertures`, unlocked: masteredCount >= totalTrainable},
    {icon:'chart', name:'Analyste', desc:'Analyser 5 parties', unlocked: gamesCount >= 5},
    {icon:'target', name:'Sans-faute', desc:'Analyser une partie sans aucune gaffe', unlocked: perfectGame},
    {icon:'puzzle', name:'Tacticien', desc:'Résoudre 10 puzzles', unlocked: PROGRESS.puzzlesSolved >= 10},
    {icon:'flame', name:'En feu', desc:'Une série de 5 puzzles résolus d\u2019affilée', unlocked: PROGRESS.puzzleBestStreak >= 5},
    {icon:'star', name:'Niveau 5', desc:'Atteindre le niveau 5 (Apprenti)', unlocked: level >= 5},
    {icon:'trophy', name:'Niveau 10', desc:'Atteindre le niveau 10 (Stratège)', unlocked: level >= 10}
  ];
}
function checkNewBadges(){
  const badges = computeBadges();
  PROGRESS.unlockedBadges = PROGRESS.unlockedBadges || [];
  let foundNew = false;
  badges.forEach(b => {
    if(b.unlocked && !PROGRESS.unlockedBadges.includes(b.name)){
      PROGRESS.unlockedBadges.push(b.name);
      if(typeof showToast === 'function') showToast(`Nouveau badge : ${b.name}`, b.desc);
      if(typeof fireConfetti === 'function') fireConfetti('badge');
      foundNew = true;
    }
  });
  if(foundNew) saveProgress();
}

/* ============================================================
   ANALYSE DE PARTIES : historique et précision
   ============================================================ */
function computeAccuracy(s){
  const total = s.best + s.good + s.inaccuracy + s.mistake + s.blunder;
  if(total === 0) return 100;
  const penalty = s.inaccuracy*2 + s.mistake*6 + s.blunder*12;
  return Math.max(0, Math.min(100, Math.round(100 - (penalty/total)*3.2)));
}
function recordAnalyzedGame(headers, sums){
  const accW = computeAccuracy(sums.w);
  const accB = computeAccuracy(sums.b);
  PROGRESS.games.unshift({
    date: new Date().toISOString(), white: headers.White || 'Blancs', black: headers.Black || 'Noirs',
    whiteAcc: accW, blackAcc: accB, totalBlunders: sums.w.blunder + sums.b.blunder
  });
  PROGRESS.games = PROGRESS.games.slice(0, 15);
  saveProgress();
  recordActivity();
  addXP(15);
  bumpDailyCounter('gamesAnalyzedToday');
  checkNewBadges();
}
function recordMistakesFromAnalysis(headers, analysisResults){
  const label = `${headers.White || 'Blancs'} vs ${headers.Black || 'Noirs'}`;
  PROGRESS.mistakes = PROGRESS.mistakes || [];
  analysisResults.forEach(r => {
    if(r.info.cls === 'mistake' || r.info.cls === 'blunder'){
      PROGRESS.mistakes.unshift({
        fen: r.fenBefore, solution: r.bestSan, playedSan: r.san,
        theme: r.info.cls === 'blunder' ? 'Gaffe à corriger' : 'Erreur à corriger',
        gameLabel: label, date: new Date().toISOString()
      });
    }
  });
  PROGRESS.mistakes = PROGRESS.mistakes.slice(0, 60);
  saveProgress();
}

/* ============================================================
   ENTRAÎNEMENT D'OUVERTURES
   ============================================================ */
function recordLineCompletion(key, clean){
  if(!key) return;
  PROGRESS.attempts[key] = (PROGRESS.attempts[key] || 0) + 1;
  if(clean){
    const prevCount = PROGRESS.mastered[key] ? PROGRESS.mastered[key].cleanCount : 0;
    PROGRESS.mastered[key] = { cleanCount: prevCount + 1, lastDate: new Date().toISOString() };
    if(prevCount === 0 && typeof OPENINGS !== 'undefined' && OPENINGS[key]){
      if(typeof fireConfetti === 'function') fireConfetti('mastery');
      if(typeof showToast === 'function') showToast('Ouverture maîtrisée !', OPENINGS[key].name);
    }
  }
  saveProgress();
  recordActivity();
  addXP(clean ? 30 : 10);
  bumpDailyCounter('linesCompletedToday');
  checkNewBadges();
}

/* ============================================================
   PUZZLES : classement Elo simplifié
   ============================================================ */
function applyPuzzleRatingChange(puzzleRating, success){
  const userRating = PROGRESS.puzzleRating;
  const expected = 1 / (1 + Math.pow(10, (puzzleRating - userRating) / 400));
  const K = 24;
  const delta = Math.round(K * ((success ? 1 : 0) - expected));
  PROGRESS.puzzleRating = Math.max(100, userRating + delta);
  PROGRESS.puzzleRatingHistory = PROGRESS.puzzleRatingHistory || [];
  PROGRESS.puzzleRatingHistory.push({date: new Date().toISOString(), rating: PROGRESS.puzzleRating});
  PROGRESS.puzzleRatingHistory = PROGRESS.puzzleRatingHistory.slice(-50);
  return delta;
}

/* Utilitaire commun */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

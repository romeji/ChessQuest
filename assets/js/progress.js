/* ============================================================
   ChessQuest — progress.js
   Modèle de données de progression (localStorage), partagé par
   toutes les pages : XP/niveaux, séries, défi du jour, badges.
   ============================================================ */

const PROGRESS_KEY = 'chessQuestProgress';
/* Monnaie unique : une pièce d'argent lisible dans toute l'interface. */
const QUEST_CURRENCY = Object.freeze({ name:'pièce', plural:'pièces', icon:'🪙' });
const QUEST_REWARDS = Object.freeze({
  puzzle:2,
  daily:35,
  openingMastery:12,
  trainingWin:15,
  trainingDraw:6,
  analysis:5
});

function defaultProgress(){
  return {
    mastered:{}, attempts:{}, games:[], settings:{engineSpeed:'normal', voiceName:null, soundEnabled:true, chessComUsername:'', appTheme:'light'},
    chessCom:{ username:'', games:[], lastSync:null, syncing:false },
    mistakes: [], solvedMistakeIds: [], mistakeReviewHistory: [], completedTargets: [], puzzleRating: 300, puzzleRatingVersion: 2, puzzleRatingHistory: [], puzzlesSolved: 0, puzzlesFailed: 0,
    puzzleStreak: 0, puzzleBestStreak: 0, puzzleBattleScores:{30:[],45:[],60:[]},
    activityDates: [], completedCourses: [], viewedNotationGuide: false, viewedGlossary: false,
    learningJourney: { totalDays:0, step:1, chapter:1, visitedDates:[] },
    xp: 0, lastKnownLevel: 1, unlockedBadges: [],
    dailyProgress: { date:null, puzzlesSolvedToday:0, linesCompletedToday:0, gamesAnalyzedToday:0, gamesPlayedToday:0, rewardClaimed:false, bonusClaimed:{} },
    dailyPuzzleRun: { date:null, level:1, solvedIds:[] },
    problemJourney: { level:1, lastAdvancedDate:null },
    economy: {
      crowns: 120,
      owned: ['board-royal','pieces-classic'],
      equippedBoard: 'board-royal',
      equippedPieces: 'pieces-gilded',
      equippedBackground: 'background-ivory',
      treasures: {},
      secrets: []
    },
    account: {uid:null,email:null,displayName:null,photoURL:null}, onboardingVersion:0, onboarded: false,
    updatedAt: null
  };
}
function loadProgress(){
  try{
    const raw = localStorage.getItem(PROGRESS_KEY);
    if(!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return defaultProgress();
    const defaults = defaultProgress();
    const progress = Object.assign(defaults, parsed);
    progress.mastered = progress.mastered && typeof progress.mastered === 'object' && !Array.isArray(progress.mastered) ? progress.mastered : {};
    progress.attempts = progress.attempts && typeof progress.attempts === 'object' && !Array.isArray(progress.attempts) ? progress.attempts : {};
    progress.settings = Object.assign({}, defaults.settings, parsed.settings || {});
    progress.chessCom = Object.assign({}, defaults.chessCom, parsed.chessCom || {});
    progress.dailyProgress = Object.assign({}, defaults.dailyProgress, parsed.dailyProgress || {});
    progress.dailyProgress.bonusClaimed = Object.assign({}, defaults.dailyProgress.bonusClaimed, progress.dailyProgress.bonusClaimed || {});
    progress.dailyPuzzleRun = Object.assign({}, defaults.dailyPuzzleRun, parsed.dailyPuzzleRun || {});
    progress.dailyPuzzleRun.solvedIds = Array.isArray(progress.dailyPuzzleRun.solvedIds) ? progress.dailyPuzzleRun.solvedIds : [];
    progress.problemJourney = Object.assign({}, defaults.problemJourney, parsed.problemJourney || {});
    if(!parsed.problemJourney){
      progress.problemJourney.level = Math.max(1, Math.min(180, Math.floor((Number(parsed.puzzlesSolved) || 0) / 3) + 1));
      if(progress.dailyPuzzleRun.solvedIds.length >= 3) progress.problemJourney.lastAdvancedDate = progress.dailyPuzzleRun.date;
    }
    progress.problemJourney.level = Math.max(1, Math.min(180, Number(progress.problemJourney.level) || 1));
    if(!Number(parsed.dailyPuzzleRun?.level)) progress.dailyPuzzleRun.level = progress.problemJourney.level;
    /* L'ancien classement commençait artificiellement à 1000. La version 2
       repart de 300 au premier palier et conserve une avance proportionnelle
       pour les joueurs ayant déjà progressé sur la carte. */
    if(Number(parsed.puzzleRatingVersion || 0) < 2){
      progress.puzzleRating = Math.min(2800, 300 + (progress.problemJourney.level - 1) * 14);
      progress.puzzleRatingVersion = 2;
      progress.puzzleRatingHistory = [{date:new Date().toISOString(),rating:progress.puzzleRating,reason:'recalibration-v2'}];
    }
    progress.economy = Object.assign({}, defaults.economy, parsed.economy || {});
    progress.economy.owned = Array.isArray(progress.economy.owned) ? progress.economy.owned : defaults.economy.owned.slice();
    progress.economy.treasures = progress.economy.treasures && typeof progress.economy.treasures === 'object' ? progress.economy.treasures : {};
    progress.economy.secrets = Array.isArray(progress.economy.secrets) ? progress.economy.secrets : [];
    progress.account = Object.assign({}, defaults.account, parsed.account || {});
    progress.learningJourney = Object.assign({}, defaults.learningJourney, parsed.learningJourney || {});
    progress.learningJourney.visitedDates = Array.isArray(progress.learningJourney.visitedDates) ? progress.learningJourney.visitedDates : [];
    progress.puzzleBattleScores = Object.assign({}, defaults.puzzleBattleScores, parsed.puzzleBattleScores || {});
    [30,45,60].forEach(duration => { if(!Array.isArray(progress.puzzleBattleScores[duration])) progress.puzzleBattleScores[duration]=[]; });
    ['games','mistakes','solvedMistakeIds','mistakeReviewHistory','completedTargets','completedCourses','activityDates','unlockedBadges','puzzleRatingHistory'].forEach(key => {
      if(!Array.isArray(progress[key])) progress[key] = defaults[key];
    });
    ['xp','puzzleRating','puzzlesSolved','puzzlesFailed','puzzleStreak','puzzleBestStreak'].forEach(key => {
      const value = Number(progress[key]);
      progress[key] = Number.isFinite(value) && value >= 0 ? value : defaults[key];
    });
    return progress;
  }catch(e){ return defaultProgress(); }
}
function saveProgress(options){
  options = options || {};
  if(!options.preserveTimestamp) PROGRESS.updatedAt = new Date().toISOString();
  try{ localStorage.setItem(PROGRESS_KEY, JSON.stringify(PROGRESS)); }catch(e){}
  if(!options.localOnly){
    document.dispatchEvent(new CustomEvent('quest:progress-saved',{detail:{updatedAt:PROGRESS.updatedAt}}));
  }
}

/* Remplace le cache local par une sauvegarde cloud déjà validée. Les pages
   peuvent écouter l'événement pour se rafraîchir sans créer un second modèle
   de progression concurrent. */
function replaceProgressSnapshot(snapshot){
  if(!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return false;
  try{
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(snapshot));
    PROGRESS = loadProgress();
    /* Réécrit immédiatement le modèle normalisé afin que les migrations
       (dont le nouvel Elo tactique) ne soient pas rejouées à chaque page. */
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(PROGRESS));
    applyQuestCosmetics?.();
    document.dispatchEvent(new CustomEvent('quest:progress-hydrated',{detail:{progress:PROGRESS}}));
    return true;
  }catch(error){
    console.warn('[ChessQuest] Sauvegarde cloud illisible',error);
    return false;
  }
}
let PROGRESS = loadProgress();
try{ localStorage.setItem(PROGRESS_KEY, JSON.stringify(PROGRESS)); }catch(error){}

/* ============================================================
   ÉCONOMIE, TRÉSORS ET PERSONNALISATION
   ============================================================ */
const QUEST_STORE = [
  {id:'board-royal', type:'board', name:'Jardin royal', desc:'Le vert crème emblématique de ChessQuest.', price:0, colors:['#f2ecd8','#6f9a63']},
  {id:'board-slate', type:'board', name:'Ardoise', desc:'Un plateau gris moderne, sobre et lisible.', price:75, colors:['#e0ded8','#747a7d']},
  {id:'board-amethyst', type:'board', name:'Améthyste', desc:'Un plateau violet digne de la cour.', price:180, colors:['#eadffc','#7851a9']},
  {id:'board-midnight', type:'board', name:'Minuit', desc:'Bleu nuit et or pour les longues batailles.', price:260, colors:['#d6dbe8','#263651']},
  {id:'board-candy', type:'board', name:'Confiserie', desc:'Rose et vanille, étonnamment redoutable.', price:320, colors:['#fff0dc','#d77f9e']},
  {id:'pieces-classic', type:'pieces', name:'Armée classique', desc:'Les pièces officielles de ton royaume.', price:0, icon:'♞'},
  {id:'pieces-silver', type:'pieces', name:'Garde d’argent', desc:'Un léger éclat argenté pour tes pièces.', price:95, icon:'♘'},
  {id:'pieces-ivory', type:'pieces', name:'Ivoire enchanté', desc:'Un éclat doux et sculpté.', price:220, icon:'♘'},
  {id:'pieces-gilded', type:'pieces', name:'Pièces d’or', desc:'Une finition dorée et lisible sur chaque pièce.', price:0, icon:'♛'},
  {id:'pieces-arcane', type:'pieces', name:'Armée arcanique', desc:'Une lueur violette venue des archives.', price:420, icon:'♝'},
  {id:'background-night', type:'background', name:'Arène nocturne', desc:'Un décor noir immersif inspiré des salles d’entraînement.', price:280, colors:['#211f1d','#080808']},
  {id:'secret-tactics', type:'secret', name:'Le Cabinet des fourchettes', desc:'Une série secrète de tactiques sournoises.', price:300, icon:'🗝️'},
  {id:'secret-endgame', type:'secret', name:'La Crypte des finales', desc:'Des positions où un seul tempo décide de tout.', price:450, icon:'🗝️'},
  {id:'secret-crown', type:'secret', name:'Le Défi de la Couronne', desc:'Le niveau ultime réservé aux collectionneurs.', price:700, icon:'👑'}
];

function ensureEconomy(){
  const defaults = defaultProgress().economy;
  const economy = PROGRESS.economy || (PROGRESS.economy = {});
  for(const [key,value] of Object.entries(defaults)){
    if(economy[key] === undefined) economy[key] = Array.isArray(value) ? value.slice() : (value && typeof value === 'object' ? Object.assign({},value) : value);
  }
  economy.owned = Array.from(new Set([...(defaults.owned || []), ...(economy.owned || [])]));
  if(economy.equippedPieces === 'pieces-classic' || economy.equippedPieces === 'pieces-silver'){
    economy.equippedPieces = 'pieces-gilded';
    economy.owned = Array.from(new Set([...economy.owned, 'pieces-gilded']));
  }
  economy.treasures = economy.treasures || {};
  economy.secrets = economy.secrets || [];
  ['equippedBoard','equippedPieces','equippedBackground'].forEach(key=>{
    if(economy[key] && !economy.owned.includes(economy[key])) economy.owned.push(economy[key]);
  });
  return economy;
}
ensureEconomy();
function crownBalance(){ return Math.max(0, Number(ensureEconomy().crowns) || 0); }
function formatCrowns(amount, withSign){
  const value = Math.max(0, Math.round(Number(amount) || 0));
  return `${QUEST_CURRENCY.icon} ${withSign && value ? '+' : ''}${value} ${value === 1 ? QUEST_CURRENCY.name : QUEST_CURRENCY.plural}`;
}
function addCrowns(amount, reason){
  const value = Math.max(0, Math.round(Number(amount) || 0));
  if(!value) return crownBalance();
  const economy = ensureEconomy();
  economy.crowns = Math.max(0,Number(economy.crowns) || 0) + value;
  saveProgress();
  document.dispatchEvent(new CustomEvent('quest:currency',{detail:{amount:value,balance:crownBalance(),reason:reason || 'Récompense'}}));
  return crownBalance();
}
function ownsStoreItem(id){ return ensureEconomy().owned.includes(id); }
function purchaseStoreItem(id){
  const item = QUEST_STORE.find(entry => entry.id === id);
  if(!item) return {ok:false, reason:'unknown'};
  if(ownsStoreItem(id)) return {ok:true, already:true, item};
  if(crownBalance() < item.price) return {ok:false, reason:'funds', item};
  const economy = ensureEconomy();
  economy.crowns = Math.max(0,Number(economy.crowns) || 0) - item.price;
  economy.owned.push(id);
  if(item.type === 'secret' && !economy.secrets.includes(id)) economy.secrets.push(id);
  saveProgress();
  /* On équipe immédiatement les objets visuels : l'achat est visible dès
     le retour de la boutique, et il est inclus dans la même sauvegarde. */
  if(['board','pieces','background'].includes(item.type)){
    if(item.type === 'board') economy.equippedBoard = item.id;
    if(item.type === 'pieces') economy.equippedPieces = item.id;
    if(item.type === 'background') economy.equippedBackground = item.id;
    saveProgress(); applyQuestCosmetics();
  }
  document.dispatchEvent(new CustomEvent('quest:purchase',{detail:{item,balance:crownBalance()}}));
  return {ok:true, item};
}
function equipStoreItem(id){
  const item = QUEST_STORE.find(entry => entry.id === id);
  if(!item || !ownsStoreItem(id) || !['board','pieces','background'].includes(item.type)) return false;
  if(item.type === 'board') PROGRESS.economy.equippedBoard = id;
  if(item.type === 'pieces') PROGRESS.economy.equippedPieces = id;
  if(item.type === 'background') PROGRESS.economy.equippedBackground = id;
  saveProgress();
  applyQuestCosmetics();
  return true;
}
function applyQuestCosmetics(){
  const economy = ensureEconomy();
  document.documentElement.dataset.boardSkin = (economy.equippedBoard || 'board-royal').replace('board-','');
  document.documentElement.dataset.pieceSkin = (economy.equippedPieces || 'pieces-classic').replace('pieces-','');
  document.documentElement.dataset.backgroundSkin = (economy.equippedBackground || 'background-ivory').replace('background-','');
  document.documentElement.dataset.questTheme = PROGRESS.settings?.appTheme === 'dark' ? 'dark' : 'light';
  if(typeof window.applyQuestAppearance === 'function') window.applyQuestAppearance(PROGRESS);
}
function worldTreasureReward(worldNumber){ return 80 + Math.max(0, Number(worldNumber || 1) - 1) * 20; }
function claimWorldTreasure(worldId, worldNumber){
  const economy = ensureEconomy();
  if(economy.treasures[worldId]) return {ok:false, claimed:true, amount:economy.treasures[worldId]};
  const amount = worldTreasureReward(worldNumber);
  economy.treasures[worldId] = amount;
  addCrowns(amount, `Trésor du monde ${worldNumber || ''}`.trim());
  return {ok:true, amount};
}
function isSecretUnlocked(id){ return ensureEconomy().secrets.includes(id) || ownsStoreItem(id); }
document.addEventListener('DOMContentLoaded', applyQuestCosmetics);

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
   PARCOURS QUOTIDIEN D'APPRENTISSAGE
   Une visite par date fait avancer d'une seule case. Les chapitres de
   vingt jours permettent de conserver une progression lisible à l'écran.
   ============================================================ */
function ensureLearningJourney(){
  const defaults = defaultProgress().learningJourney;
  PROGRESS.learningJourney = Object.assign({}, defaults, PROGRESS.learningJourney || {});
  PROGRESS.learningJourney.visitedDates = Array.isArray(PROGRESS.learningJourney.visitedDates)
    ? PROGRESS.learningJourney.visitedDates.slice(-400)
    : [];
  return PROGRESS.learningJourney;
}
function recordLearningJourneyVisit(){
  const journey = ensureLearningJourney();
  const key = todayKey();
  if(journey.visitedDates.includes(key)) return { journey, advanced:false, reward:0 };
  journey.visitedDates.push(key);
  journey.totalDays = Math.max(Number(journey.totalDays) || 0, journey.visitedDates.length);
  journey.step = ((journey.totalDays - 1) % 20) + 1;
  journey.chapter = Math.floor((journey.totalDays - 1) / 20) + 1;
  saveProgress();
  recordActivity();
  addXP(10);
  addCrowns(5, 'Étape quotidienne d’apprentissage');
  return { journey, advanced:true, reward:5 };
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
  {id:'puzzles3', text:'Résous 3 problèmes aujourd\u2019hui', target:3, type:'puzzlesSolvedToday', xp:40, crowns:QUEST_REWARDS.daily}
];
const DAILY_BONUS_GOALS = Object.freeze({
  gamesPlayedToday:{target:1,crowns:20,label:'Partie du jour'},
  gamesAnalyzedToday:{target:1,crowns:20,label:'Analyse du jour'}
});
function dayOfYear(){
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}
/* Le défi quotidien est volontairement stable : trois puzzles aléatoires.
   Les autres activités restent accessibles depuis l’accueil et les menus de mode, sans remplacer
   le rituel tactique que le joueur retrouve chaque jour. */
function todayChallenge(){ return DAILY_CHALLENGES[0]; }
function ensureDailyProgressFresh(){
  PROGRESS.dailyProgress = PROGRESS.dailyProgress || {};
  if(PROGRESS.dailyProgress.date !== todayKey()){
    PROGRESS.dailyProgress = { date: todayKey(), puzzlesSolvedToday:0, linesCompletedToday:0, gamesAnalyzedToday:0, gamesPlayedToday:0, rewardClaimed:false, bonusClaimed:{} };
  }
  PROGRESS.dailyProgress.bonusClaimed = PROGRESS.dailyProgress.bonusClaimed || {};
}
function bumpDailyCounter(type){
  ensureDailyProgressFresh();
  PROGRESS.dailyProgress[type] = (PROGRESS.dailyProgress[type] || 0) + 1;
  const challenge = todayChallenge();
  if(challenge.type === type && !PROGRESS.dailyProgress.rewardClaimed && PROGRESS.dailyProgress[type] >= challenge.target){
    PROGRESS.dailyProgress.rewardClaimed = true;
    addXP(challenge.xp);
    addCrowns(challenge.crowns || QUEST_REWARDS.daily,'Défi quotidien');
    if(typeof fireConfetti === 'function') fireConfetti('badge');
    if(typeof showToast === 'function') showToast('Défi du jour terminé !', `+${challenge.xp} XP · ${formatCrowns(challenge.crowns || QUEST_REWARDS.daily,true)}`);
  }
  const bonus = DAILY_BONUS_GOALS[type];
  if(bonus && PROGRESS.dailyProgress[type] >= bonus.target && !PROGRESS.dailyProgress.bonusClaimed[type]){
    PROGRESS.dailyProgress.bonusClaimed[type] = true;
    addCrowns(bonus.crowns,bonus.label);
    if(typeof showToast === 'function') showToast(`${bonus.label} terminé !`,formatCrowns(bonus.crowns,true));
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
  const totalTrainable = (typeof allCurriculumLessonKeys === 'function') ? allCurriculumLessonKeys().length : 122;
  const level = levelFromXp(PROGRESS.xp || 0);
  return [
    {icon:'medal', name:'Premier pas', desc:'Maîtriser 1 ouverture sans erreur', unlocked: masteredCount >= 1},
    {icon:'medal', name:'Étudiant assidu', desc:'Maîtriser 10 ouvertures sans erreur', unlocked: masteredCount >= 10},
    {icon:'trophy', name:'Maître des ouvertures', desc:`Maîtriser les ${totalTrainable} ouvertures`, unlocked: masteredCount >= totalTrainable},
    {icon:'chart', name:'Analyste', desc:'Analyser 5 parties', unlocked: gamesCount >= 5},
    {icon:'target', name:'Sans-faute', desc:'Analyser une partie sans aucune gaffe', unlocked: perfectGame},
    {icon:'puzzle', name:'Tacticien', desc:'Résoudre 10 puzzles', unlocked: PROGRESS.puzzlesSolved >= 10},
    {icon:'flame', name:'En feu', desc:'Une série de 5 problèmes résolus d\u2019affilée', unlocked: PROGRESS.puzzleBestStreak >= 5},
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
  const total = s.best + s.good + s.inaccuracy + s.mistake + (s.missed||0) + s.blunder;
  if(total === 0) return 100;
  const penalty = s.inaccuracy*2 + s.mistake*6 + (s.missed||0)*10 + s.blunder*12;
  return Math.max(0, Math.min(100, Math.round(100 - (penalty/total)*3.2)));
}
function recordAnalyzedGame(headers, sums){
  const accW = computeAccuracy(sums.w);
  const accB = computeAccuracy(sums.b);
  const gameId = [headers.Site,headers.Date,headers.White,headers.Black,headers.Result].filter(Boolean).join('|');
  const alreadyRecorded = gameId && PROGRESS.games.some(game => game.id === gameId);
  const record = {
    id:gameId || `analysis-${Date.now()}`,
    date: new Date().toISOString(), white: headers.White || 'Blancs', black: headers.Black || 'Noirs',
    whiteAcc: accW, blackAcc: accB, totalBlunders: sums.w.blunder + sums.b.blunder
  };
  if(alreadyRecorded){
    const index = PROGRESS.games.findIndex(game => game.id === gameId);
    PROGRESS.games[index] = Object.assign({},PROGRESS.games[index],record);
    saveProgress();
    return {newAnalysis:false,record};
  }
  PROGRESS.games.unshift(record);
  PROGRESS.games = PROGRESS.games.slice(0, 15);
  saveProgress();
  recordActivity();
  addXP(15);
  addCrowns(QUEST_REWARDS.analysis,'Première analyse de partie');
  bumpDailyCounter('gamesAnalyzedToday');
  checkNewBadges();
  return {newAnalysis:true,record};
}
function recordMistakesFromAnalysis(headers, analysisResults){
  const label = `${headers.White || 'Blancs'} vs ${headers.Black || 'Noirs'}`;
  PROGRESS.mistakes = PROGRESS.mistakes || [];
  analysisResults.forEach(r => {
    if(r.info.cls === 'mistake' || r.info.cls === 'missed' || r.info.cls === 'blunder'){
      const id = [headers.Site,headers.Date,headers.White,headers.Black,r.ply,r.fenBefore,r.bestSan].filter(value => value !== undefined && value !== null).join('|');
      if(PROGRESS.mistakes.some(item => item.id === id)) return;
      PROGRESS.mistakes.unshift({
        id,
        fen: r.fenBefore, solution: r.bestSan, playedSan: r.san,
        theme: r.info.cls === 'blunder' ? 'Gaffe à corriger' : (r.info.cls === 'missed' ? 'Coup manqué à retrouver' : 'Erreur à corriger'),
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
      addCrowns(QUEST_REWARDS.openingMastery,'Ouverture maîtrisée');
      if(typeof fireConfetti === 'function') fireConfetti('mastery');
      if(typeof showToast === 'function') showToast('Ouverture maîtrisée !', `${OPENINGS[key].name} · ${formatCrowns(QUEST_REWARDS.openingMastery,true)}`);
    }
  }
  saveProgress();
  recordActivity();
  addXP(clean ? 30 : 10);
  bumpDailyCounter('linesCompletedToday');
  checkNewBadges();
}

/* Une ligne terminée débloque la suivante, même si elle n'a pas encore été
   jouée sans faute. `mastered` reste réservé à la maîtrise parfaite. */
function isOpeningLessonCompleted(key){
  if(!key) return false;
  return !!PROGRESS.mastered?.[key] || Number(PROGRESS.attempts?.[key]) > 0;
}

/* ============================================================
   PUZZLES : classement Elo simplifié
   ============================================================ */
function applyPuzzleRatingChange(puzzleRating, success){
  const userRating = Math.max(300, Number(PROGRESS.puzzleRating) || 300);
  const expected = 1 / (1 + Math.pow(10, (puzzleRating - userRating) / 400));
  const K = 24;
  const delta = Math.round(K * ((success ? 1 : 0) - expected));
  PROGRESS.puzzleRating = Math.max(300, userRating + delta);
  PROGRESS.puzzleRatingVersion = 2;
  PROGRESS.puzzleRatingHistory = PROGRESS.puzzleRatingHistory || [];
  PROGRESS.puzzleRatingHistory.push({date: new Date().toISOString(), rating: PROGRESS.puzzleRating, success: Boolean(success)});
  PROGRESS.puzzleRatingHistory = PROGRESS.puzzleRatingHistory.slice(-50);
  return delta;
}

/* Utilitaire commun */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

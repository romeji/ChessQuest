/* ============================================================
   ChessQuest — training.js
   Partie libre contre le bot (Stockfish, niveau réglable) avec
   des messages d'encouragement façon coach après chaque coup.
   ============================================================ */

const DIFFICULTIES = [
  {label:'Facile', skill:2, movetime:300},
  {label:'Intermédiaire', skill:8, movetime:500},
  {label:'Difficile', skill:16, movetime:900}
];
let difficultyIdx = 1;

let tgGame = null;
let tgBoard = null;
let tgOver = false;
let tgBotThinking = false;

/* ---- Messages du coach (choisis selon des indices simples, sans appel moteur) ---- */
const COACH_DEV = ["Très bon coup ! Tu développes bien tes pièces.", "Bien vu, sortir cette pièce tôt est une bonne idée.", "Beau développement, continue comme ça !"];
const COACH_CAPTURE = ["Belle prise ! Tu gagnes du matériel.", "Bon calcul, cette capture est justifiée.", "Joli coup, tu prends l'avantage matériel."];
const COACH_CHECK = ["Échec ! Tu mets la pression sur l'adversaire.", "Bien joué, cet échec complique la vie du bot."];
const COACH_CASTLE = ["Bien joué, ton roi est en sécurité maintenant.", "Excellent réflexe, le roque protège ton roi."];
const COACH_CENTER = ["Bon réflexe, contrôler le centre est essentiel.", "Bien vu, occuper le centre te donne de l'espace."];
const COACH_GENERIC = ["Coup joué, continue à observer le plateau.", "D'accord, voyons ce que fait le bot.", "Bien, garde un œil sur la sécurité de ton roi."];
const coachRefs = {};
function pickCoach(pool, key){
  coachRefs[key] = coachRefs[key] || {v:-1};
  const ref = coachRefs[key];
  if(pool.length === 1) return pool[0];
  let idx; do{ idx = Math.floor(Math.random()*pool.length); } while(idx === ref.v);
  ref.v = idx;
  return pool[idx];
}

function coachCommentFor(moveObj, gameAfter, plyIndex){
  if(gameAfter.in_checkmate()) return {text:'Échec et mat ! Bravo, la partie est gagnée !', icon:'🏆'};
  if(moveObj.flags.includes('k') || moveObj.flags.includes('q')) return {text:pickCoach(COACH_CASTLE,'castle'), icon:'🛡️'};
  if(gameAfter.in_check()) return {text:pickCoach(COACH_CHECK,'check'), icon:'⚡'};
  if(moveObj.captured) return {text:pickCoach(COACH_CAPTURE,'capture'), icon:'🎯'};
  if(plyIndex <= 10 && (moveObj.piece === 'n' || moveObj.piece === 'b') && ['1','8'].includes(moveObj.from[1])) return {text:pickCoach(COACH_DEV,'dev'), icon:'👍'};
  if(plyIndex <= 8 && moveObj.piece === 'p' && ['d4','d5','e4','e5'].includes(moveObj.to)) return {text:pickCoach(COACH_CENTER,'center'), icon:'✨'};
  return {text:pickCoach(COACH_GENERIC,'generic'), icon:'💬'};
}

function showCoach(text, icon){
  const bubble = document.getElementById('coach-bubble');
  document.getElementById('coach-text').textContent = text;
  document.getElementById('coach-icon').textContent = icon || '👍';
  bubble.classList.remove('hidden');
  bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
  speak(text);
}
function hideCoach(){ document.getElementById('coach-bubble').classList.add('hidden'); }

function setBotStatus(text){ document.getElementById('bot-status').textContent = text; }

function ensureTgBoard(){
  if(tgBoard) return;
  tgBoard = Chessboard('tg-board', {
    position:'start', draggable:true, pieceTheme: PIECE_THEME, showNotation:false,
    onDrop: onTgDrop, onSnapEnd: () => { if(tgGame) tgBoard.position(tgGame.fen()); }
  });
  renderCoords('tg-ranks', 'tg-files', 'white');
  document.getElementById('tg-board').addEventListener('touchmove', e => e.preventDefault(), {passive:false});
}

function newTrainingGame(){
  tgGame = new Chess();
  tgOver = false;
  tgBotThinking = false;
  ensureTgBoard();
  tgBoard.orientation('white');
  tgBoard.start();
  renderCoords('tg-ranks', 'tg-files', 'white');
  clearHighlights('#tg-board');
  hideCoach();
  setBotStatus("Ta partie contre l'ordinateur");
  document.getElementById('next-btn').disabled = true;
  document.getElementById('undo-btn').disabled = true;
  fitBoards('tg-board', tgBoard, '.page');
}

function onTgDrop(source, target){
  if(tgOver || tgBotThinking) return 'snapback';
  const moveObj = tgGame.move({from:source, to:target, promotion:'q'});
  if(moveObj === null) return 'snapback';
  playSound(moveObj.captured ? 'capture' : 'move');
  highlightMove('#tg-board', moveObj.from, moveObj.to);
  document.getElementById('undo-btn').disabled = false;
  const ply = tgGame.history().length;
  const comment = coachCommentFor(moveObj, tgGame, ply);
  showCoach(comment.text, comment.icon);

  if(checkTgGameOver()) return;

  tgBotThinking = true;
  setBotStatus('Le bot réfléchit…');
  setTimeout(playBotMove, 550);
}

async function playBotMove(){
  const diff = DIFFICULTIES[difficultyIdx];
  const fen = tgGame.fen();
  let res;
  try{
    await waitForEngineReady();
    if(sfState === 'ready'){
      sfSetSkillLevel(diff.skill);
      res = await sfAnalyzeFEN(fen, diff.movetime);
    } else {
      res = await homemadeAnalyzeFEN(fen);
    }
  }catch(e){ res = await homemadeAnalyzeFEN(fen); }
  tgBotThinking = false;
  if(tgOver) return;
  const san = res && res.bestMoveSan;
  const moveObj = san ? tgGame.move(san) : null;
  if(!moveObj){
    // Repli : coup légal aléatoire si le moteur n'a rien retourné
    const legal = tgGame.moves({verbose:true});
    if(legal.length === 0){ checkTgGameOver(); return; }
    const mv = legal[Math.floor(Math.random()*legal.length)];
    tgGame.move(mv.san);
    tgBoard.position(tgGame.fen());
    highlightMove('#tg-board', mv.from, mv.to);
  } else {
    tgBoard.position(tgGame.fen());
    highlightMove('#tg-board', moveObj.from, moveObj.to);
  }
  playSound('move');
  setBotStatus("À toi de jouer");
  checkTgGameOver();
}

function checkTgGameOver(){
  if(!tgGame.game_over()) return false;
  tgOver = true;
  document.getElementById('next-btn').disabled = false;
  let result, won = false;
  if(tgGame.in_checkmate()){
    won = tgGame.turn() !== 'w';
    result = won ? 'Échec et mat — tu as gagné ! 🏆' : 'Échec et mat — le bot gagne cette fois.';
  } else if(tgGame.in_draw() || tgGame.in_stalemate() || tgGame.in_threefold_repetition()){
    result = 'Partie nulle — bien joué quand même !';
  } else {
    result = 'Partie terminée.';
  }
  setBotStatus(result);
  showCoach(result, won ? '🏆' : '🤝');
  playSound('gameover');
  recordActivity();
  addXP(won ? 40 : 15);
  bumpDailyCounter('gamesPlayedToday');
  checkNewBadges();
  if(won && typeof fireConfetti === 'function') fireConfetti('mastery');
  return true;
}

document.getElementById('resign-btn').onclick = () => {
  if(tgOver) return;
  if(!confirm('Abandonner cette partie ?')) return;
  tgOver = true;
  setBotStatus('Partie abandonnée.');
  showCoach('Partie abandonnée — pas grave, la prochaine sera la bonne !', '🤝');
  document.getElementById('next-btn').disabled = false;
  recordActivity();
  addXP(5);
};

document.getElementById('undo-btn').onclick = () => {
  if(tgBotThinking || tgOver) return;
  const hist = tgGame.history();
  if(hist.length < 2) return;
  tgGame.undo(); tgGame.undo();
  tgBoard.position(tgGame.fen());
  clearHighlights('#tg-board');
  hideCoach();
  setBotStatus('Coup annulé — à toi de rejouer.');
  document.getElementById('undo-btn').disabled = tgGame.history().length === 0;
};

document.getElementById('hint-btn2').onclick = async () => {
  if(tgOver || tgBotThinking) return;
  setBotStatus('Recherche du meilleur coup…');
  try{
    await waitForEngineReady();
    sfSetSkillLevel(20);
    const res = sfState === 'ready' ? await sfAnalyzeFEN(tgGame.fen(), 500) : await homemadeAnalyzeFEN(tgGame.fen());
    const san = res && res.bestMoveSan;
    if(san){
      const g = new Chess(tgGame.fen());
      const match = g.moves({verbose:true}).find(m => m.san === san);
      if(match) flashSquares('#tg-board', [match.from, match.to], 'hint-square', 1100);
    }
  }catch(e){}
  setBotStatus("À toi de jouer");
};

document.getElementById('next-btn').onclick = () => newTrainingGame();

document.getElementById('difficulty-btn').onclick = () => {
  difficultyIdx = (difficultyIdx + 1) % DIFFICULTIES.length;
  document.getElementById('bot-difficulty-label').textContent = DIFFICULTIES[difficultyIdx].label;
  showToast('Difficulté du bot', DIFFICULTIES[difficultyIdx].label);
};

document.getElementById('bot-difficulty-label').textContent = DIFFICULTIES[difficultyIdx].label;
newTrainingGame();
watchBoardResize('tg-board', () => tgBoard, '.page');

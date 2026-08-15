/* ============================================================
   ChessQuest — training.js
   Partie libre contre le bot (Stockfish, niveau réglable) avec
   des messages d'encouragement façon coach après chaque coup.
   ============================================================ */

const BOT_LEVELS = [
  {elo:400, skill:0, movetime:220}, {elo:600, skill:2, movetime:280},
  {elo:800, skill:4, movetime:340}, {elo:1000, skill:6, movetime:420},
  {elo:1200, skill:8, movetime:500}, {elo:1400, skill:10, movetime:580},
  {elo:1600, skill:13, movetime:680}, {elo:1800, skill:16, movetime:820},
  {elo:2000, skill:20, movetime:1000}
];
let botElo = Number((PROGRESS.settings || {}).botElo) || 1200;
function currentBotLevel(){ return BOT_LEVELS.find(level => level.elo === botElo) || BOT_LEVELS[4]; }
function renderBotElo(){
  const select = document.getElementById('bot-elo-select');
  if(select){
    select.innerHTML = BOT_LEVELS.map(level => `<option value="${level.elo}">${level.elo}</option>`).join('');
    select.value = String(botElo);
  }
  document.getElementById('bot-difficulty-label').textContent = `${botElo} ELO`;
}

let tgGame = null;
let tgBoard = null;
let tgOver = false;
let tgBotThinking = false;
let tgSelectedSquare = null;
let tgSession = 0;
let tgHistoryCursor = 0;

function trainingPositionAt(ply){
  const replay=new Chess();
  tgGame.history().slice(0,ply).forEach(move=>replay.move(move));
  return replay.fen();
}
function renderTrainingMoveBrowser(cursor=tgGame?.history().length||0){
  if(!tgGame)return;
  const moves=tgGame.history(),max=moves.length;
  tgHistoryCursor=Math.max(0,Math.min(max,cursor));
  const current=document.getElementById('tg-history-current'),sub=document.getElementById('tg-history-position');
  if(current)current.textContent=tgHistoryCursor?`${Math.ceil(tgHistoryCursor/2)}${tgHistoryCursor%2?'…':'.'} ${moves[tgHistoryCursor-1]}`:'Position initiale';
  if(sub)sub.textContent=tgHistoryCursor===max?'Position actuelle':`Coup ${tgHistoryCursor} sur ${max}`;
  const prev=document.getElementById('tg-history-prev'),next=document.getElementById('tg-history-next');
  if(prev)prev.disabled=tgHistoryCursor===0;
  if(next)next.disabled=tgHistoryCursor===max;
}
function browseTrainingHistory(direction){
  if(!tgGame||tgBotThinking)return;
  const next=Math.max(0,Math.min(tgGame.history().length,tgHistoryCursor+direction));
  tgBoard.position(trainingPositionAt(next),false);
  clearHighlights('#tg-board');
  renderTrainingMoveBrowser(next);
}

function setTrainingRestartButton(isRestart){
  const button=document.getElementById('resign-btn');
  button.innerHTML=isRestart?'Nouvelle partie':'⚑&nbsp; Abandonner';
  button.classList.toggle('new-game',isRestart);
}

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
  const visibleTip = document.getElementById('training-tip-text');
  if(visibleTip) visibleTip.textContent = text;
  document.getElementById('coach-text').textContent = text;
  document.getElementById('coach-icon').textContent = icon || '👍';
  bubble.classList.remove('hidden');
  bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
  if(typeof showMascotReaction === 'function'){
    const positive = ['👍','✨','🎯','⚡','🛡️'].includes(icon);
    const kind = positive ? 'good' : (icon === '🤝' ? 'mistake' : 'inaccuracy');
    showMascotReaction(kind,'',{message:text,imageSelector:'#training-mascot',textSelector:'#training-tip-text'});
  }
}
function hideCoach(){
  document.getElementById('coach-bubble').classList.add('hidden');
  const visibleTip = document.getElementById('training-tip-text');
  if(visibleTip) visibleTip.textContent = 'Solide. Pas tout à fait du génie, mais je valide.';
}

function setBotStatus(text){ document.getElementById('bot-status').textContent = text; }

function ensureTgBoard(){
  if(tgBoard) return;
  tgBoard = Chessboard('tg-board', {
    position:'start', draggable:true, pieceTheme: PIECE_THEME, showNotation:false,
    onDragStart:(source)=>{ if(tgGame && !tgOver && !tgBotThinking && tgGame.turn()==='w') showLegalMoveDots('#tg-board',tgGame,source); },
    onDrop: onTgDrop, onSnapEnd: () => { clearLegalMoveDots('#tg-board'); if(tgGame) tgBoard.position(tgGame.fen()); }
  });
  renderCoords('tg-ranks', 'tg-files', 'white');
  $('#tg-board').on('click', '[data-square]', function(){ tgSquareClick(this.getAttribute('data-square')); });
  document.getElementById('tg-board').addEventListener('touchmove', e => e.preventDefault(), {passive:false});
}

function clearTgSelection(){
  $('#tg-board [data-square]').removeClass('selected-square');
  $('#tg-board .move-dot').remove();
  tgSelectedSquare = null;
}
function tgSquareClick(square){
  if(!tgGame || tgOver || tgBotThinking || tgGame.turn() !== 'w') return;
  if(tgSelectedSquare === square){ clearTgSelection(); return; }
  if(tgSelectedSquare === null){
    const piece = tgGame.get(square);
    if(piece && piece.color === 'w'){
      tgSelectedSquare = square;
      $(`#tg-board [data-square="${square}"]`).addClass('selected-square');
      showLegalMoveDots('#tg-board',tgGame,square);
    }
    return;
  }
  const from = tgSelectedSquare;
  clearTgSelection();
  onTgDrop(from, square);
}

function renderTgMoveLog(){
  const el = document.getElementById('tg-move-log');
  if(!el || !tgGame) return;
  const moves = tgGame.history();
  if(!moves.length){ el.innerHTML = '<span class="move-log-empty">Les coups de la partie apparaîtront ici.</span>'; return; }
  const rows = [];
  for(let i=0; i<moves.length; i += 2){ rows.push(`<span class="move-no">${Math.floor(i/2)+1}.</span><span>${escapeHtml(moves[i])}</span><span>${moves[i+1] ? escapeHtml(moves[i+1]) : ''}</span>`); }
  el.innerHTML = rows.join('');
  el.scrollTop = el.scrollHeight;
}

function newTrainingGame(){
  tgSession++;
  tgGame = new Chess();
  tgOver = false;
  tgBotThinking = false;
  ensureTgBoard();
  tgBoard.orientation('white');
  tgBoard.start();
  renderCoords('tg-ranks', 'tg-files', 'white');
  clearHighlights('#tg-board');
  clearTgSelection();
  hideCoach();
  setBotStatus("Ta partie contre l'ordinateur");
  document.getElementById('next-btn').disabled = true;
  document.getElementById('undo-btn').disabled = true;
  setTrainingRestartButton(false);
  renderTgMoveLog();
  renderTrainingMoveBrowser(0);
  fitBoards('tg-board', tgBoard, '.training-final-board-wrap');
}

function onTgDrop(source, target){
  if(tgOver || tgBotThinking) return 'snapback';
  if(tgGame.turn() !== 'w') return 'snapback';
  const moveObj = tgGame.move({from:source, to:target, promotion:'q'});
  if(moveObj === null) return 'snapback';
  clearTgSelection();
  playSound(moveObj.captured ? 'capture' : 'move');
  highlightMove('#tg-board', moveObj.from, moveObj.to);
  document.getElementById('undo-btn').disabled = false;
  renderTgMoveLog();
  renderTrainingMoveBrowser();
  const ply = tgGame.history().length;
  const comment = coachCommentFor(moveObj, tgGame, ply);
  showCoach(comment.text, comment.icon);

  if(checkTgGameOver()) return;

  tgBotThinking = true;
  setBotStatus('Le bot réfléchit…');
  const session=tgSession;
  setTimeout(()=>{if(session===tgSession)playBotMove();}, 550);
}

async function playBotMove(){
  const diff = currentBotLevel();
  const fen = tgGame.fen();
  let res;
  /* Les premiers niveaux doivent vraiment laisser le temps d'apprendre :
     le moteur reste présent, mais joue très souvent un coup calme sous 800 ELO. */
  const randomRate = botElo <= 400 ? .96 : botElo <= 600 ? .84 : botElo <= 800 ? .64 : botElo <= 1000 ? .40 : botElo <= 1200 ? .20 : .04;
  if(Math.random() < randomRate){
    const legal = tgGame.moves({verbose:true});
    const quiet = legal.filter(move => !move.captured && !move.san.includes('+'));
    const pool = quiet.length ? quiet : legal;
    const casual = pool[Math.floor(Math.random()*pool.length)];
    res = {bestMoveSan:casual && casual.san};
  }
  try{
    if(!res){
      await waitForEngineReady();
      if(sfState === 'ready'){
        sfSetSkillLevel(diff.skill);
        res = await sfAnalyzeFEN(fen, diff.movetime);
      } else {
        res = await homemadeAnalyzeFEN(fen);
      }
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
  renderTgMoveLog();
  renderTrainingMoveBrowser();
  setBotStatus("À toi de jouer");
  checkTgGameOver();
}

function checkTgGameOver(){
  if(!tgGame.game_over()) return false;
  tgOver = true;
  document.getElementById('next-btn').disabled = false;
  setTrainingRestartButton(true);
  let result, won = false, crownReward = 0;
  if(tgGame.in_checkmate()){
    won = tgGame.turn() !== 'w';
    result = won ? 'Échec et mat — tu as gagné ! 🏆' : 'Échec et mat — le bot gagne cette fois.';
    crownReward = won ? QUEST_REWARDS.trainingWin : 0;
  } else if(tgGame.in_draw() || tgGame.in_stalemate() || tgGame.in_threefold_repetition()){
    result = 'Partie nulle — bien joué quand même !';
    crownReward = QUEST_REWARDS.trainingDraw;
  } else {
    result = 'Partie terminée.';
  }
  setBotStatus(result);
  showCoach(result, won ? '🏆' : '🤝');
  playSound('gameover');
  recordActivity();
  addXP(won ? 40 : 15);
  if(crownReward) addCrowns(crownReward,won ? 'Victoire contre le bot' : 'Partie nulle');
  bumpDailyCounter('gamesPlayedToday');
  checkNewBadges();
  if(won && typeof fireConfetti === 'function') fireConfetti('mastery');
  if(typeof showQuestCompletionModal==='function'){
    const draw=tgGame.in_draw() || tgGame.in_stalemate() || tgGame.in_threefold_repetition();
    showQuestCompletionModal({
      icon:won?'🏆':(draw?'🤝':'♞'),tone:won?'success':'info',
      eyebrow:won?'Victoire contre l’entraîneur':(draw?'Partie nulle':'Partie terminée'),
      title:won?'Magnifique victoire !':(draw?'Belle résistance !':'On en rejoue une ?'),
      message:`${result} Tu gagnes ${won?40:15} XP.${crownReward?` Et ${crownReward} couronne${crownReward>1?'s':''}.`:''}`,
      actions:[
        {label:'Rejouer',primary:true,onClick:newTrainingGame},
        {label:'Retour à l’accueil',href:'index.html'}
      ]
    });
  }
  return true;
}

document.getElementById('resign-btn').onclick = () => {
  if(tgOver){newTrainingGame();return;}
  if(!confirm('Abandonner cette partie ?')) return;
  tgOver = true;
  setBotStatus('Partie abandonnée.');
  showCoach('Partie abandonnée — pas grave, la prochaine sera la bonne !', '🤝');
  document.getElementById('next-btn').disabled = false;
  setTrainingRestartButton(true);
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
  renderTgMoveLog();
  renderTrainingMoveBrowser();
};

document.getElementById('tg-history-prev').onclick=()=>browseTrainingHistory(-1);
document.getElementById('tg-history-next').onclick=()=>browseTrainingHistory(1);

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

document.getElementById('bot-elo-select').onchange = event => {
  botElo = Number(event.target.value);
  PROGRESS.settings.botElo = botElo;
  saveProgress();
  renderBotElo();
  showToast('Niveau du bot', `${botElo} ELO sélectionné`);
};

renderBotElo();
function initTrainingSetup(){
  const modal=document.getElementById('training-setup-modal');
  const select=document.getElementById('training-setup-elo');
  if(!modal || !select){ newTrainingGame(); return; }
  select.innerHTML=BOT_LEVELS.map(level=>`<option value="${level.elo}">${level.elo} ELO · ${level.elo<=600?'Novice':level.elo<=1000?'Intermédiaire':level.elo<=1400?'Confirmé':'Expert'}</option>`).join('');
  select.value=String(botElo);
  document.getElementById('training-setup-start').onclick=()=>{
    botElo=Number(select.value);PROGRESS.settings.botElo=botElo;saveProgress();renderBotElo();
    modal.classList.add('hidden');newTrainingGame();
  };
}
initTrainingSetup();
watchBoardResize('tg-board', () => tgBoard, '.training-final-board-wrap');

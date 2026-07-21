/* ============================================================
   ChessQuest — puzzles.js
   19 puzzles vérifiés manuellement (position construite, pas
   copiée d'une partie) + logique de résolution en QCM (A/B/C),
   comme sur la maquette.
   ============================================================ */

const CLASSIC_PUZZLES = [
  { id:'basic-qmate', fen:'k7/8/1K6/8/8/8/8/7Q w - - 0 1', solution:'Qh8#', theme:'Mats de base', rating:350,
    explanation:"Le roi blanc contrôle a7 et b7, la dame arrive sur la 8e rangée et couvre aussi b8." },
  { id:'basic-rmate', fen:'k7/8/1K6/8/8/8/8/7R w - - 0 1', solution:'Rh8#', theme:'Mats de base', rating:400,
    explanation:"Même principe qu'avec la dame : la tour arrive sur la 8e rangée et couvre b8." },
  { id:'fool', setupMoves:['f3','e5','g4'], solution:'Qh4#', theme:'Mat en 1', rating:420,
    explanation:"Le mat le plus rapide aux échecs : le roi blanc, encore entouré de ses pièces, ne peut ni fuir ni bloquer." },
  { id:'scholar', setupMoves:['e4','e5','Bc4','Nc6','Qh5','Nf6'], solution:'Qxf7#', theme:'Mat en 1', rating:480,
    explanation:"Le mat du berger : la dame capture f7, protégée par le fou. Aucune case de fuite pour le roi noir." },
  { id:'fork-queen', fen:'6k1/8/8/r3n3/8/8/8/2Q4K w - - 0 1', solution:'Qc5', theme:'Fourchette', rating:600,
    explanation:"La dame attaque simultanément la tour a5 et le cavalier e5 le long de la 5e rangée." },
  { id:'fork-knight', fen:'2q1k3/8/8/1N6/8/8/8/K7 w - - 0 1', solution:'Nd6+', theme:'Fourchette', rating:550,
    explanation:"Le cavalier met le roi en échec tout en attaquant la dame : une fourchette royale." },
  { id:'backrank', fen:'6k1/5ppp/8/3R4/8/8/8/6K1 w - - 0 1', solution:'Rd8#', theme:'Mat du couloir', rating:620,
    explanation:"Le roi noir est enfermé par ses propres pions f7, g7, h7. La tour arrive sur la 8e rangée." },
  { id:'ladder', fen:'7k/R7/8/8/8/8/8/KR6 w - - 0 1', solution:'Rb8#', theme:'Mat à l\u2019échelle', rating:650,
    explanation:"La tour a7 verrouille toute la 7e rangée pendant que l'autre tour délivre l'échec et mat." },
  { id:'skewer', fen:'4r3/8/8/8/4k3/8/8/R6K w - - 0 1', solution:'Re1+', theme:'Enfilade', rating:680,
    explanation:"L'échec force le roi à quitter la colonne e, ce qui expose la tour noire derrière lui." },
  { id:'smothered', fen:'3N2rk/6pp/8/8/8/8/8/1K6 w - - 0 1', solution:'Nf7#', theme:'Mat étouffé', rating:780,
    explanation:"Le roi noir, coincé par sa propre tour et ses pions, ne peut fuir nulle part." },
  { id:'discovery', fen:'7k/6q1/4n3/8/3N4/8/1B6/K7 w - - 0 1', solution:'Nxe6', theme:'Attaque à la découverte', rating:760,
    explanation:"Le cavalier capture en e6 tout en dévoilant l'attaque du fou b2 sur la dame noire." },
  { id:'pin', fen:'4k3/3n4/8/8/Q7/8/8/3R3K w - - 0 1', solution:'Rxd7', theme:'Clouage', rating:700,
    explanation:"Le cavalier est cloué contre le roi par la dame. La tour le capture gratuitement." },
  { id:'free-piece', fen:'6k1/8/8/q7/8/2B5/8/K7 w - - 0 1', solution:'Bxa5', theme:'Pièce gratuite', rating:380,
    explanation:"La dame noire n'est protégée par rien. Il suffit de la capturer !" },
  { id:'rook-double', fen:'7k/8/8/b3n3/8/8/8/K1R5 w - - 0 1', solution:'Rc5', theme:'Fourchette', rating:580,
    explanation:"La tour attaque simultanément le fou a5 et le cavalier e5 le long de la 5e rangée." },
  { id:'pawn-fork', fen:'6k1/8/8/2n1b3/8/3P4/8/K7 w - - 0 1', solution:'d4', theme:'Fourchette', rating:520,
    explanation:"En avançant d'une case, le pion attaque à la fois le cavalier c5 et le fou e5." },
  { id:'deflection', fen:'3q3k/2Q3pp/8/8/8/8/8/K7 w - - 0 1', solution:'Qxd8#', theme:'Déviation', rating:700,
    explanation:"La dame capture la dame noire non défendue tout en délivrant échec et mat." },
  { id:'discovered-check', fen:'4k3/8/2n5/8/4B3/8/8/4R2K w - - 0 1', solution:'Bxc6+', theme:'Attaque à la découverte', rating:720,
    explanation:"En capturant le cavalier, le fou dévoile l'attaque de la tour tout en donnant lui-même échec : un double échec !" },
  { id:'promotion-mate', fen:'k7/1P6/2K5/8/8/8/8/8 w - - 0 1', solution:'b8=Q#', theme:'Mat par promotion', rating:500,
    explanation:"Le pion devient dame en arrivant sur la 8e rangée. Aucune case libre pour le roi noir." },
  { id:'king-rook-corner', fen:'7k/8/6K1/8/8/8/8/R7 w - - 0 1', solution:'Ra8#', theme:'Mats de base', rating:550,
    explanation:"Le roi blanc contrôle déjà g7 et h7. La tour délivre l'échec sur la 8e rangée." }
];
const PUZZLE_THEMES = [...new Set(CLASSIC_PUZZLES.map(p => p.theme))];

let puzzleBoard = null;
let puzzleGame = null;
let puzzleSource = 'classic';
let puzzleQueue = [];
let puzzleIndex = 0;
let puzzleThemeFilter = 'all';
let puzzleHasFailed = false;
let mcqLocked = false;

function ratingStars(rating){
  const level = Math.min(5, Math.max(1, Math.round((rating - 300) / 130)));
  let s = '';
  for(let i=1;i<=5;i++) s += (i <= level) ? '\u2605' : '<span class="dim">\u2605</span>';
  return s;
}

function buildPuzzleQueue(){
  if(puzzleSource === 'classic'){
    let list = CLASSIC_PUZZLES.slice();
    if(puzzleThemeFilter !== 'all') list = list.filter(p => p.theme === puzzleThemeFilter);
    list.sort((a,b) => a.rating - b.rating);
    puzzleQueue = list;
  } else if(puzzleSource === 'mistakes'){
    puzzleQueue = (PROGRESS.mistakes || []).slice();
  } else if(puzzleSource === 'random'){
    puzzleQueue = generatedPuzzle ? [generatedPuzzle] : [];
  }
}

function ensurePuzzleBoard(){
  if(puzzleBoard) return;
  puzzleBoard = Chessboard('puzzle-board', { position:'start', draggable:false, pieceTheme: PIECE_THEME, showNotation:false });
  renderCoords('puzzle-ranks', 'puzzle-files', 'white');
  renderThemeFilters();
  buildPuzzleQueue();
  loadPuzzle(0);
}

function renderThemeFilters(){
  const el = document.getElementById('theme-filter-row');
  if(!el) return;
  const chips = ['all', ...PUZZLE_THEMES];
  el.innerHTML = chips.map(t => `<button class="theme-chip ${t===puzzleThemeFilter?'active':''}" data-theme="${escapeHtml(t)}">${t==='all'?'Tous les thèmes':escapeHtml(t)}</button>`).join('');
  el.classList.toggle('hidden', puzzleSource !== 'classic');
  el.querySelectorAll('.theme-chip').forEach(chip=>{
    chip.onclick = () => { puzzleThemeFilter = chip.dataset.theme; renderThemeFilters(); buildPuzzleQueue(); loadPuzzle(0); };
  });
}

/* ---- Notation figurine (♛h5+ plutôt que Qh5+), façon apps d'échecs ---- */
const FIGURINE = { w:{K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘'}, b:{K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞'} };
function toFigurine(san, color){
  const letter = san[0];
  if('KQRBN'.includes(letter) && FIGURINE[color]){
    return FIGURINE[color][letter] + san.slice(1);
  }
  return san;
}

/* ---- Génère 3 options QCM (1 bonne + 2 distracteurs pris parmi les coups légaux) ---- */
function buildMcqOptions(game, solutionSan){
  const legal = game.moves({verbose:true}).map(m => m.san).filter(s => s !== solutionSan);
  const shuffled = legal.sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 2);
  const options = [solutionSan, ...distractors].sort(() => Math.random() - 0.5);
  return options;
}

function loadPuzzle(idx){
  if(!puzzleBoard) return;
  const container = document.getElementById('mcq-options');
  if(puzzleQueue.length === 0){
    puzzleGame = new Chess();
    puzzleBoard.position('start');
    setText('puzzle-question', puzzleSource === 'mistakes' ? "Pas encore d'erreur enregistrée" : "Aucun puzzle dans ce thème");
    setText('puzzle-kind', '');
    setHtml('puzzle-dots', '');
    if(container) container.innerHTML = '';
    setPuzzleFeedback(puzzleSource === 'mistakes' ? "Analyse une partie dans Analyse : tes erreurs y apparaîtront ici." : "Choisis un autre thème.", 'prompt');
    return;
  }
  puzzleIndex = ((idx % puzzleQueue.length) + puzzleQueue.length) % puzzleQueue.length;
  const p = puzzleQueue[puzzleIndex];
  puzzleHasFailed = false;
  mcqLocked = false;

  puzzleGame = p.fen ? new Chess(p.fen) : new Chess();
  if(p.setupMoves) p.setupMoves.forEach(m => puzzleGame.move(m));

  const orientation = puzzleGame.turn() === 'b' ? 'black' : 'white';
  puzzleBoard.orientation(orientation);
  puzzleBoard.position(puzzleGame.fen());
  renderCoords('puzzle-ranks', 'puzzle-files', orientation);
  clearHighlights('#puzzle-board');

  const label = puzzleSource === 'mistakes' ? (p.gameLabel || 'Ta partie') : `Puzzle ${puzzleIndex+1}/${puzzleQueue.length}`;
  const solutionClean0 = p.solution.replace(/[!?]+$/, '');
  setText('puzzle-question', solutionClean0.includes('#') ? 'Trouve le mat !' : 'Trouve le meilleur coup !');
  setText('puzzle-kind', `${p.theme} · ${label}`);
  setHtml('puzzle-dots', puzzleQueue.map((_,i)=>`<span class="dot ${i<puzzleIndex?'done':''} ${i===puzzleIndex?'current':''}"></span>`).join(''));

  const solutionClean = p.solution.replace(/[!?]+$/, '');
  const options = buildMcqOptions(puzzleGame, solutionClean);
  if(container){
    const moverColor = puzzleGame.turn();
    container.innerHTML = options.map((opt, i) => `
      <button class="mcq-option" data-san="${escapeHtml(opt)}">
        <span class="mcq-letter">${String.fromCharCode(65+i)}</span>
        <span>${escapeHtml(toFigurine(opt, moverColor))}</span>
      </button>
    `).join('');
    container.querySelectorAll('.mcq-option').forEach(btn=>{
      btn.onclick = () => handleMcqAnswer(btn, btn.dataset.san === solutionClean, solutionClean);
    });
  }
  const sideText = puzzleGame.turn() === 'w' ? 'Blancs' : 'Noirs';
  setPuzzleFeedback(`Aux ${sideText} de jouer — trouve le meilleur coup.`, 'prompt');
  if(typeof fitBoards === 'function') fitBoards('puzzle-board', puzzleBoard);
}

function handleMcqAnswer(btn, isCorrect, solutionClean){
  if(mcqLocked) return;
  mcqLocked = true;
  const p = puzzleQueue[puzzleIndex];
  const container = document.getElementById('mcq-options');
  container.querySelectorAll('.mcq-option').forEach(b=>{
    if(b.dataset.san === solutionClean) b.classList.add('correct');
    else if(b === btn) b.classList.add('wrong');
  });

  const moveObj = puzzleGame.move(solutionClean);
  if(moveObj){
    puzzleBoard.position(puzzleGame.fen());
    highlightMove('#puzzle-board', moveObj.from, moveObj.to);
  }

  const success = isCorrect;
  playSound(success ? 'move' : 'capture');
  if(success){
    PROGRESS.puzzleStreak++;
    PROGRESS.puzzleBestStreak = Math.max(PROGRESS.puzzleBestStreak, PROGRESS.puzzleStreak);
  } else {
    PROGRESS.puzzleStreak = 0;
  }
  PROGRESS.puzzlesSolved++;
  const delta = applyPuzzleRatingChange(p.rating || 1000, success);
  saveProgress();
  recordActivity();
  addXP(success ? 12 : 6);
  bumpDailyCounter('puzzlesSolvedToday');
  refreshPuzzleHeader();
  checkNewBadges();
  if(success) fireConfetti('puzzle');

  showRatingDelta(delta);
  setPuzzleFeedback(`${success ? 'Bravo !' : 'Pas cette fois.'} ${p.explanation || (solutionClean + ' était le coup gagnant.')}`, success ? 'good' : 'bad');

  if(puzzleSource === 'mistakes'){
    PROGRESS.mistakes.splice(puzzleQueue.indexOf(p), 1);
    saveProgress();
    buildPuzzleQueue();
    setTimeout(()=> loadPuzzle(puzzleIndex), 1600);
  } else if(puzzleSource === 'random'){
    setTimeout(()=> generateRandomPuzzle(), 1600);
  } else {
    setTimeout(()=> loadPuzzle(puzzleIndex+1), 1600);
  }
}

function showRatingDelta(delta){
  const el = document.getElementById('puzzle-rating-delta');
  if(!el) return;
  el.textContent = delta >= 0 ? `+${delta}` : `${delta}`;
  el.className = 'pr-delta ' + (delta >= 0 ? 'up' : 'down');
  const valEl = document.getElementById('puzzle-rating-value');
  if(valEl) valEl.textContent = PROGRESS.puzzleRating;
  setTimeout(()=>{ el.textContent = ''; }, 2500);
}

function refreshPuzzleHeader(){
  setText('puzzle-rating-value', PROGRESS.puzzleRating);
  setText('puzzle-streak-value', PROGRESS.puzzleStreak || 0);
  const count = (PROGRESS.mistakes || []).length;
  setText('mistakes-count-badge', count > 0 ? count : '');
  setHtml('puzzle-stats', `
    <div class="stat-card"><div class="big">${PROGRESS.puzzlesSolved}</div><div class="label">Puzzles résolus</div></div>
    <div class="stat-card"><div class="big">${PROGRESS.puzzleStreak}</div><div class="label">Série en cours</div></div>
    <div class="stat-card"><div class="big">${PROGRESS.puzzleBestStreak}</div><div class="label">Meilleure série</div></div>
  `);
}

function setPuzzleFeedback(text, kind){
  const el = document.getElementById('puzzle-feedback');
  if(!el) return;
  el.textContent = text;
  el.className = 'feedback-box ' + (kind || '');
  speak(text);
}
function setText(id, text){ const el = document.getElementById(id); if(el) el.textContent = text; }
function setHtml(id, html){ const el = document.getElementById(id); if(el) el.innerHTML = html; }

/* ---- Générateur de défis aléatoires vérifiés par Stockfish ---- */
let generatedPuzzle = null;
let generatingPuzzle = false;
function randomOpeningPrefix(){
  const keys = Object.keys(OPENINGS);
  const key = keys[Math.floor(Math.random()*keys.length)];
  const line = OPENINGS[key];
  const maxPly = Math.min(line.moves.length, 3 + Math.floor(Math.random()*4));
  const g = new Chess();
  for(let i=0;i<maxPly;i++){ const mv = g.move(line.moves[i].san.replace(/[!?]+$/, '')); if(!mv) break; }
  return g;
}
function playRandomContinuation(g, plies){
  for(let i=0;i<plies;i++){
    if(g.game_over()) break;
    const moves = g.moves();
    if(moves.length === 0) break;
    g.move(moves[Math.floor(Math.random()*moves.length)]);
  }
  return g;
}
async function generateRandomPuzzle(){
  if(generatingPuzzle) return;
  generatingPuzzle = true;
  setText('puzzle-question', "Génération d'un défi…");
  setPuzzleFeedback("Stockfish analyse une nouvelle position…", 'prompt');
  await waitForEngineReady();
  sfSetSkillLevel(20);
  let best = null;
  for(let attempt=0; attempt<5; attempt++){
    const g = randomOpeningPrefix();
    playRandomContinuation(g, 2 + Math.floor(Math.random()*5));
    if(g.game_over()) continue;
    let result;
    try{ result = await engineAnalyzeFEN(g.fen(), 600); } catch(e){ continue; }
    if(!result || !result.bestMoveSan) continue;
    const scoreAbs = Math.min(900, Math.abs(result.scoreForMover));
    const candidate = { fen:g.fen(), solution: result.bestMoveSan, scoreAbs, mate: result.mate };
    if(!best || scoreAbs > best.scoreAbs) best = candidate;
    if(scoreAbs > 220 || result.mate) break;
  }
  generatingPuzzle = false;
  if(!best){ setPuzzleFeedback("Impossible de générer un défi — réessaie.", 'bad'); return; }
  generatedPuzzle = { fen:best.fen, solution:best.solution, theme: best.mate ? 'Mat forcé (généré)' : 'Meilleur coup (généré)', rating: best.mate ? 900 : Math.min(900, 480+Math.round(best.scoreAbs/3)), explanation:`Vérifié par Stockfish : ${best.solution} est le coup le plus fort ici.` };
  buildPuzzleQueue();
  loadPuzzle(0);
}

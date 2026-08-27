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
let puzzleBoard = null;
let puzzleGame = null;
let puzzleSource = 'daily';
let puzzleTheme = '';
let puzzleQueue = [];
let puzzleIndex = 0;
let puzzleHasFailed = false;
let puzzleHintUsed = false;
let mcqLocked = false;
let puzzleBattleTimer = null;
let puzzleBattleEndsAt = 0;
let puzzleBattleScore = 0;
let puzzleBattleDuration = 0;
let puzzleBattleActive = false;
let puzzleBattleCountdown = null;
let puzzleResultAction = null;
let dailyCompletionModalShown = false;
let emptyMistakesModalShown = false;
let questPuzzlePositions = [];
let questPuzzlePositionIndex = 0;
let puzzleLastSuccess = false;

const PUZZLE_CURRICULUM_LEVELS = 180;
const PUZZLES_PER_LEVEL = 3;
const CURRICULUM_DIFFICULTIES = [
  {max:20,label:'Intermédiaire'}, {max:40,label:'Intermédiaire +'},
  {max:60,label:'Difficile'}, {max:80,label:'Très difficile'},
  {max:100,label:'Expert'}, {max:120,label:'Maître'},
  {max:140,label:'Maître +'}, {max:160,label:'Élite'},
  {max:180,label:'Ultra difficile'}
];

function currentProblemLevel(){
  return Math.max(1,Math.min(PUZZLE_CURRICULUM_LEVELS,Number(PROGRESS.problemJourney?.level)||1));
}

function puzzleDifficultyForLevel(level){
  return CURRICULUM_DIFFICULTIES.find(tier=>level<=tier.max) || CURRICULUM_DIFFICULTIES.at(-1);
}

function expandFenRank(rank){
  const cells=[];
  for(const char of rank){
    if(/\d/.test(char)) for(let i=0;i<Number(char);i++) cells.push('1');
    else cells.push(char);
  }
  return cells;
}

function compressFenRank(cells){
  let output='',empty=0;
  cells.forEach(cell=>{
    if(cell==='1'){empty++;return;}
    if(empty){output+=empty;empty=0;}
    output+=cell;
  });
  return output+(empty||'');
}

function seedFen(seed){
  if(seed.fen) return seed.fen;
  const game=new Chess();
  (seed.setupMoves||[]).forEach(move=>game.move(move));
  return game.fen();
}

function transformPuzzleSeed(seed,variant){
  const parts=seedFen(seed).split(' '),mirror=variant%2===1,rotate=variant>=2;
  let ranks=parts[0].split('/').map(expandFenRank);
  if(mirror) ranks=ranks.map(rank=>rank.slice().reverse());
  if(rotate){
    ranks=ranks.slice().reverse().map(rank=>rank.slice().reverse().map(piece=>piece==='1'?piece:(piece===piece.toUpperCase()?piece.toLowerCase():piece.toUpperCase())));
    parts[1]=parts[1]==='w'?'b':'w';
  }
  parts[0]=ranks.map(compressFenRank).join('/');
  if(mirror||rotate) parts[2]='-';
  const fileMap={a:'h',b:'g',c:'f',d:'e',e:'d',f:'c',g:'b',h:'a'};
  const solution=String(seed.solution||'').replace(/[a-h1-8]/g,char=>{
    if(/[a-h]/.test(char)){
      let file=char;
      if(mirror) file=fileMap[file];
      if(rotate) file=fileMap[file];
      return file;
    }
    return rotate?String(9-Number(char)):char;
  });
  const transformed={...seed,fen:parts.join(' '),solution};
  delete transformed.setupMoves;
  const check=new Chess(transformed.fen);
  if(!check.moves().some(move=>move.replace(/[!?]+$/,'')===solution.replace(/[!?]+$/,''))) return {...seed,fen:seedFen(seed)};
  return transformed;
}

function curriculumPuzzleSelection(level){
  const safeLevel=Math.max(1,Math.min(PUZZLE_CURRICULUM_LEVELS,Number(level)||1));
  const ordered=CLASSIC_PUZZLES.slice().sort((a,b)=>(a.rating||0)-(b.rating||0));
  const progress=(safeLevel-1)/(PUZZLE_CURRICULUM_LEVELS-1);
  const seedProgress=progress;
  const centre=Math.round(seedProgress*(ordered.length-1));
  const difficulty=puzzleDifficultyForLevel(safeLevel);
  /* Le palier 1 correspond à un débutant autour de 380 Elo tactique. La
     difficulté monte ensuite plus franchement jusqu'à des positions
     expertes, pour que la progression reste stimulante. */
  const targetRating=Math.round(380+progress*2700);
  return Array.from({length:PUZZLES_PER_LEVEL},(_,slot)=>{
    const seed=ordered[Math.max(0,Math.min(ordered.length-1,centre+slot-1))];
    const globalIndex=(safeLevel-1)*PUZZLES_PER_LEVEL+slot;
    const transformed=transformPuzzleSeed(seed,globalIndex%4);
    return {...transformed,
      id:`palier-${String(safeLevel).padStart(3,'0')}-${slot+1}`,
      rating:targetRating+slot*25,
      curriculumLevel:safeLevel,
      curriculumSlot:slot+1,
      difficulty:difficulty.label,
      theme:`${transformed.theme} · ${difficulty.label}`
    };
  });
}

function ensureDailyPuzzleRun(){
  const date = todayKey();
  if(!PROGRESS.dailyPuzzleRun || PROGRESS.dailyPuzzleRun.date !== date){
    PROGRESS.dailyPuzzleRun = {date,level:currentProblemLevel(),solvedIds:[]};
    saveProgress();
  }
  if(!Number(PROGRESS.dailyPuzzleRun.level)) PROGRESS.dailyPuzzleRun.level=currentProblemLevel();
  if(!Array.isArray(PROGRESS.dailyPuzzleRun.solvedIds)) PROGRESS.dailyPuzzleRun.solvedIds = [];
  return PROGRESS.dailyPuzzleRun;
}

function dailyPuzzleSelection(){
  return curriculumPuzzleSelection(ensureDailyPuzzleRun().level);
}

function dailyPuzzleCompletedCount(){
  const solved = new Set(ensureDailyPuzzleRun().solvedIds);
  return dailyPuzzleSelection().filter(puzzle => solved.has(puzzle.id)).length;
}

function ratingStars(rating){
  const level = Math.min(5, Math.max(1, Math.round((rating - 300) / 130)));
  let s = '';
  for(let i=1;i<=5;i++) s += (i <= level) ? '\u2605' : '<span class="dim">\u2605</span>';
  return s;
}

function buildPuzzleQueue(){
  let migrated=false;
  (PROGRESS.mistakes || []).forEach((item,index)=>{
    if(!item.id){item.id=`legacy|${item.fen||''}|${item.solution||''}|${item.gameLabel||''}|${item.date||index}`;migrated=true;}
  });
  if(migrated) saveProgress();
  if(puzzleSource === 'mistakes'){
    const solved = new Set(PROGRESS.solvedMistakeIds || []);
    puzzleQueue = (PROGRESS.mistakes || []).filter(item => !solved.has(item.id));
  } else if(puzzleSource === 'review'){
    puzzleQueue = (PROGRESS.mistakes || []).filter(item => (PROGRESS.solvedMistakeIds || []).includes(item.id));
  } else if(puzzleSource === 'daily'){
    const solved = new Set(ensureDailyPuzzleRun().solvedIds);
    puzzleQueue = dailyPuzzleSelection().filter(puzzle => !solved.has(puzzle.id));
  } else {
    const candidates = puzzleTheme
      ? CLASSIC_PUZZLES.filter(puzzle => puzzle.theme === puzzleTheme)
      : CLASSIC_PUZZLES;
    puzzleQueue = candidates.slice().sort(() => Math.random() - 0.5);
  }
}

function ensurePuzzleBoard(){
  if(puzzleBoard) return;
  puzzleBoard = Chessboard('puzzle-board', {
    position:'start', draggable:true, pieceTheme: PIECE_THEME, showNotation:false,
    onDragStart:(source)=>{ if(!mcqLocked && puzzleGame) showLegalMoveDots('#puzzle-board',puzzleGame,source); },
    onDrop: onPuzzleBoardDrop,
    onSnapEnd:()=>clearLegalMoveDots('#puzzle-board')
  });
  renderCoords('puzzle-ranks', 'puzzle-files', 'white');
  buildPuzzleQueue();
  loadPuzzle(0);
  refreshPuzzleHeader();
}

function onPuzzleBoardDrop(source, target){
  if(mcqLocked || !puzzleGame) return 'snapback';
  const move = puzzleGame.moves({verbose:true}).find(m => m.from === source && m.to === target);
  if(!move) return 'snapback';
  const solution = (puzzleQueue[puzzleIndex].solution || '').replace(/[!?]+$/, '');
  const option = document.querySelector(`#mcq-options .mcq-option[data-san="${CSS.escape(move.san)}"]`);
  handleMcqAnswer(option || {dataset:{san:move.san}}, move.san === solution, solution);
  return 'snapback';
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

/* ---- Génère un QCM à partir des coups légaux. ---- */
function buildMcqOptions(game, solutionSan, optionCount = 3){
  const legal = game.moves({verbose:true}).map(m => m.san).filter(s => s !== solutionSan);
  const shuffled = legal.sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, Math.max(0, optionCount - 1));
  const options = [solutionSan, ...distractors].sort(() => Math.random() - 0.5);
  return options;
}

function loadPuzzle(idx){
  if(!puzzleBoard) return;
  const container = document.getElementById('mcq-options');
  if(puzzleQueue.length === 0){
    if(puzzleSource === 'daily' && dailyPuzzleCompletedCount() >= 3){
      puzzleGame = new Chess();
      puzzleBoard.position('start');
      setText('puzzle-question', 'Les trois problèmes du jour sont résolus');
      setText('puzzle-kind', 'Mission quotidienne terminée');
      setHtml('puzzle-dots', '');
      if(container) container.innerHTML = '';
      setPuzzleFeedback('Mission accomplie : 3 sur 3. Le coffre et les récompenses sont gagnés. Reviens demain pour une nouvelle série.', 'good');
      setPuzzleResultAction('Retour à la carte', () => { location.href='problems.html'; });
      showDailyPuzzleCompletion();
      return;
    }
    puzzleGame = new Chess();
    puzzleBoard.position('start');
    setText('puzzle-question', puzzleSource === 'mistakes' ? "Toutes tes erreurs sont corrigées" : "Aucun problème disponible");
    setText('puzzle-kind', '');
    setHtml('puzzle-dots', '');
    if(container) container.innerHTML = '';
    setPuzzleFeedback(puzzleSource === 'mistakes' ? "Bien joué. Joue une partie sur Chess.com puis analyse-la pour débloquer de nouvelles erreurs à corriger." : "Reviens dans un instant.", 'prompt');
    if(puzzleSource === 'mistakes') showEmptyMistakesCelebration();
    return;
  }
  puzzleIndex = ((idx % puzzleQueue.length) + puzzleQueue.length) % puzzleQueue.length;
  const p = puzzleQueue[puzzleIndex];
  puzzleHasFailed = false;
  puzzleLastSuccess = false;
  puzzleHintUsed = false;
  mcqLocked = false;

  puzzleGame = p.fen ? new Chess(p.fen) : new Chess();
  if(p.setupMoves) p.setupMoves.forEach(m => puzzleGame.move(m));

  const orientation = puzzleGame.turn() === 'b' ? 'black' : 'white';
  puzzleBoard.orientation(orientation);
  puzzleBoard.position(puzzleGame.fen());
  questPuzzlePositions=[puzzleGame.fen()];questPuzzlePositionIndex=0;
  renderCoords('puzzle-ranks', 'puzzle-files', orientation);
  clearHighlights('#puzzle-board');

  const label = ['mistakes','review'].includes(puzzleSource) ? (p.gameLabel || 'Ta partie') : `Problème ${puzzleIndex+1}/${puzzleQueue.length}`;
  const solutionClean0 = p.solution.replace(/[!?]+$/, '');
  setText('puzzle-question', solutionClean0.includes('#') ? 'Trouve le mat !' : 'Trouve le meilleur coup !');
  setText('puzzle-kind', `${p.theme} · ${label}`);
  const turnSubtitle=document.querySelector('.puzzle-final-turn-copy small');
  if(puzzleSource === 'daily'){
    const progressLabel=`Palier ${p.curriculumLevel} · ${p.difficulty} · Problème ${dailyPuzzleCompletedCount()+1}/3`;
    setText('puzzle-kind', progressLabel);
    if(turnSubtitle)turnSubtitle.textContent=progressLabel;
  }else if(turnSubtitle){
    turnSubtitle.textContent=solutionClean0.includes('#')?'Trouve le mat.':'Trouve le meilleur coup.';
  }
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
  const hintButton = document.getElementById('puzzle-hint-btn');
  if(hintButton){ hintButton.disabled = false; hintButton.textContent = 'Indice'; }
  refreshQuestPuzzleTools();
}

function showPuzzleHint(){
  if(mcqLocked || !puzzleGame || !puzzleQueue.length) return;
  const solution = (puzzleQueue[puzzleIndex].solution || '').replace(/[!?]+$/, '');
  const match = puzzleGame.moves({verbose:true}).find(move => move.san === solution);
  if(!match) return;
  puzzleHintUsed = true;
  flashSquares('#puzzle-board', [match.from, match.to], 'hint-square', 1800);
  setPuzzleFeedback(`Indice : regarde la pièce en ${match.from.toUpperCase()}.`, 'prompt');
  if(typeof showMascotReaction === 'function') showMascotReaction('hint',`La pièce en ${match.from.toUpperCase()} mérite ton attention.`,{imageSelector:'[data-mascot-image]',textSelector:'[data-mascot-text]'});
  const hintButton = document.getElementById('puzzle-hint-btn');
  if(hintButton){ hintButton.disabled = true; hintButton.textContent = 'Indice affiché'; }
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
    questPuzzlePositions=[questPuzzlePositions[0],puzzleGame.fen()];questPuzzlePositionIndex=1;
    highlightMove('#puzzle-board', moveObj.from, moveObj.to);
  }

  const success = isCorrect;
  puzzleLastSuccess = success;
  playSound(success ? 'move' : 'capture');
  if(success){
    PROGRESS.puzzleStreak++;
    PROGRESS.puzzleBestStreak = Math.max(PROGRESS.puzzleBestStreak, PROGRESS.puzzleStreak);
    if(puzzleBattleActive) puzzleBattleScore++;
  } else {
    PROGRESS.puzzleStreak = 0;
  }
  const dailyRun = puzzleSource === 'daily' ? ensureDailyPuzzleRun() : null;
  const alreadySolvedToday = Boolean(dailyRun && dailyRun.solvedIds.includes(p.id));
  const rewardEligible = success && !alreadySolvedToday;
  if(success && dailyRun && !alreadySolvedToday) dailyRun.solvedIds.push(p.id);
  if(rewardEligible) PROGRESS.puzzlesSolved++;
  if(!success) PROGRESS.puzzlesFailed = (PROGRESS.puzzlesFailed || 0) + 1;
  const delta = applyPuzzleRatingChange(p.rating || 1000, success);
  saveProgress();
  recordActivity();
  if(rewardEligible){
    addXP(10);
    addCrowns(QUEST_REWARDS.puzzle,'Puzzle résolu');
    bumpDailyCounter('puzzlesSolvedToday');
    if(puzzleSource === 'mistakes' && p.id){
      PROGRESS.solvedMistakeIds = Array.from(new Set([...(PROGRESS.solvedMistakeIds || []),p.id]));
      PROGRESS.mistakeReviewHistory = [...(PROGRESS.mistakeReviewHistory || []),{id:p.id,solvedAt:new Date().toISOString()}].slice(-100);
      saveProgress();
    }
    if(puzzleTheme){
      PROGRESS.completedTargets = Array.from(new Set([...(PROGRESS.completedTargets || []),`theme:${puzzleTheme}`]));
      saveProgress();
    }
  }
  refreshPuzzleHeader();
  checkNewBadges();
  if(success) fireConfetti('puzzle');

  showRatingDelta(delta);
  const coachExplanation = humanizeChessComment(p.explanation || `${describeSanMove(solutionClean)} était le coup gagnant.`);
  setPuzzleFeedback(`${success ? 'Excellent !' : 'Pas cette fois.'} ${coachExplanation}`, success ? 'good' : 'bad');
  if(typeof showMascotReaction === 'function'){
    showMascotReaction(success ? 'best' : 'mistake',coachExplanation,{
      imageSelector:'[data-mascot-image]',textSelector:'[data-mascot-text]',speak:false
    });
  }

  if(puzzleSource === 'battle' && puzzleBattleActive){
    setTimeout(()=>loadPuzzle(puzzleIndex+1),420);
  } else if(!success){
    setPuzzleResultAction('Réessayer', () => loadPuzzle(puzzleIndex));
  } else if(puzzleSource === 'daily'){
    const completed = dailyPuzzleCompletedCount();
    if(completed >= 3){
      setPuzzleFeedback('Excellent ! Mission accomplie : 3 sur 3. Ton coffre, tes points et ton XP sont gagnés. Reviens demain pour une nouvelle série.', 'good');
      setPuzzleResultAction('Retour à la carte', () => { location.href='problems.html'; });
      showDailyPuzzleCompletion();
    } else {
      setPuzzleResultAction('Problème suivant', () => { buildPuzzleQueue(); loadPuzzle(0); refreshPuzzleHeader(); });
    }
  } else if(puzzleSource === 'mistakes'){
    setPuzzleResultAction('Erreur suivante', () => { buildPuzzleQueue(); loadPuzzle(0); refreshPuzzleHeader(); });
  } else {
    setPuzzleResultAction('Problème suivant', () => loadPuzzle(puzzleIndex+1));
  }
  refreshQuestPuzzleTools();
}

function refreshQuestPuzzleTools(){
  const tools=document.getElementById('quest-puzzle-tools');if(!tools)return;
  tools.classList.remove('hidden');document.body.classList.add('quest-puzzle-mode');
  const daily=puzzleSource==='daily';
  const fill=document.getElementById('quest-xp-fill');if(fill)fill.style.width=daily?`${Math.round(dailyPuzzleCompletedCount()/3*100)}%`:'0%';
  const prev=document.getElementById('quest-prev'),next=document.getElementById('quest-next');
  if(daily){
    if(prev)prev.disabled=questPuzzlePositionIndex===0;if(next)next.disabled=questPuzzlePositionIndex>=questPuzzlePositions.length-1;
  } else {
    if(prev)prev.disabled=puzzleIndex<=0; if(next)next.disabled=false;
  }
  const retry=document.getElementById('puzzle-retry-action');if(retry){retry.classList.toggle('hidden',!puzzleLastSuccess);retry.onclick=()=>loadPuzzle(puzzleIndex);}
  const battleCounter=document.getElementById('battle-solved-counter');
  if(battleCounter){
    battleCounter.classList.toggle('hidden',puzzleSource!=='battle');
    if(puzzleSource==='battle') battleCounter.textContent = puzzleBattleScore;
  }
}
function browseQuestPuzzle(delta){
  if(!questPuzzlePositions.length)return;questPuzzlePositionIndex=Math.max(0,Math.min(questPuzzlePositions.length-1,questPuzzlePositionIndex+delta));puzzleBoard.position(questPuzzlePositions[questPuzzlePositionIndex],false);clearHighlights('#puzzle-board');refreshQuestPuzzleTools();
}

function showDailyPuzzleCompletion(){
  if(dailyCompletionModalShown || typeof showQuestCompletionModal!=='function') return;
  dailyCompletionModalShown=true;
  const back={label:'Voir mon nouveau socle',primary:true,href:'problems.html'};
  setTimeout(()=>showQuestCompletionModal({
    icon:'🎁',eyebrow:'3 problèmes sur 3',title:'Défi du jour terminé !',
    message:'Ton coffre est gagné. Le pion va maintenant avancer sur la carte des problèmes.',
    actions:[back],autoAction:back,autoDelay:2800
  }),350);
}

function showEmptyMistakesCelebration(){
  if(emptyMistakesModalShown || typeof showQuestCompletionModal!=='function') return;
  emptyMistakesModalShown=true;
  setTimeout(()=>showQuestCompletionModal({
    icon:'🧠',tone:'info',eyebrow:'File d’erreurs vide',title:'Toutes tes erreurs sont corrigées !',
    message:'Joue de nouvelles parties sur Chess.com puis analyse-les ici : le coach transformera tes prochains faux pas en nouveaux problèmes.',
    actions:[
      {label:'Jouer sur Chess.com',primary:true,onClick:()=>window.open('https://www.chess.com/play/online','_blank','noopener')},
      {label:'Retour à la carte',href:'problems.html'}
    ]
  }),250);
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
    <div class="stat-card"><div class="big">${PROGRESS.puzzlesSolved}</div><div class="label">Problèmes résolus</div></div>
    <div class="stat-card"><div class="big">${PROGRESS.puzzleStreak}</div><div class="label">Série en cours</div></div>
    <div class="stat-card"><div class="big">${PROGRESS.puzzleBestStreak}</div><div class="label">Meilleure série</div></div>
  `);
}

function setPuzzleFeedback(text, kind){
  const el = document.getElementById('puzzle-feedback');
  if(!el) return;
  puzzleResultAction = null;
  const nextButton = document.getElementById('puzzle-next-action');
  if(nextButton){
    nextButton.classList.add('hidden');
    nextButton.onclick = null;
  }
  if(kind === 'prompt'){
    el.className = 'puzzle-final-feedback prompt';
    el.innerHTML = `<span class="feedback-prompt-copy">${escapeHtml(text)}</span><button class="puzzle-result-next hidden" type="button"></button>`;
  } else {
    const success = kind === 'good';
    const title = success ? 'Excellent !' : 'Pas cette fois.';
    const copy = String(text || '').replace(/^(Excellent !|Bravo !|Pas cette fois\.)\s*/, '');
    el.className = `puzzle-final-feedback ${success ? 'good' : 'bad'}`;
    el.innerHTML = `
      <span class="feedback-medal" aria-hidden="true">${success ? '✓' : '!'}</span>
      <span><strong>${title}</strong><small>${escapeHtml(copy)}</small></span>
      <b>${success ? `+10 XP · ${QUEST_CURRENCY.icon} +${QUEST_REWARDS.puzzle}` : 'Réessaie'}</b>
      <button class="puzzle-result-next hidden" type="button"></button>
    `;
  }
}

function setPuzzleResultAction(label, action){
  const button = document.getElementById('puzzle-next-action');
  puzzleResultAction = action;
  if(!button) return;
  button.textContent = label;
  button.classList.remove('hidden');
  button.onclick = () => {
    const next = puzzleResultAction;
    puzzleResultAction = null;
    if(typeof next === 'function') next();
  };
}

function stopPuzzleBattle(){
  clearInterval(puzzleBattleTimer); clearInterval(puzzleBattleCountdown);
  puzzleBattleTimer = null; puzzleBattleCountdown = null; puzzleBattleEndsAt = 0; puzzleBattleActive = false;
  const timer = document.getElementById('puzzle-battle-timer'); if(timer) timer.classList.add('hidden');
  document.getElementById('puzzle-countdown')?.classList.add('hidden');
  document.body.classList.remove('puzzle-battle-active');
}
function startPuzzleBattle(seconds){
  stopPuzzleBattle();
  puzzleSource = 'battle'; puzzleTheme = ''; puzzleBattleDuration=seconds; puzzleBattleScore=0; buildPuzzleQueue(); loadPuzzle(0); mcqLocked=true;
  const overlay=document.getElementById('puzzle-countdown');
  const value=overlay?.querySelector('strong');
  overlay?.classList.remove('hidden');
  let count=3; if(value)value.textContent=count;
  puzzleBattleCountdown=setInterval(()=>{
    count--;
    if(count>0){if(value)value.textContent=count;return;}
    if(count===0){if(value)value.textContent='GO !';return;}
    clearInterval(puzzleBattleCountdown);puzzleBattleCountdown=null;overlay?.classList.add('hidden');mcqLocked=false;puzzleBattleActive=true;document.body.classList.add('puzzle-battle-active');
    puzzleBattleEndsAt = Date.now() + seconds * 1000;
    const timer = document.getElementById('puzzle-battle-timer');
    if(timer){timer.classList.remove('hidden');timer.textContent=`${seconds}s · 0`;}
    puzzleBattleTimer = setInterval(()=>{
      const left = Math.max(0,Math.ceil((puzzleBattleEndsAt-Date.now())/1000));
      if(timer) timer.textContent = `${left}s`;
      if(!left){
        const score=puzzleBattleScore, duration=puzzleBattleDuration;
        stopPuzzleBattle(); mcqLocked = true;
        PROGRESS.puzzleBattleScores=PROGRESS.puzzleBattleScores||{30:[],45:[],60:[]};
        const scores=PROGRESS.puzzleBattleScores[duration]||(PROGRESS.puzzleBattleScores[duration]=[]);
        const previousBest=scores.length ? Math.max(...scores.map(item=>Number(item.score)||0)) : 0;
        scores.push({score,date:new Date().toISOString()});scores.sort((a,b)=>b.score-a.score);PROGRESS.puzzleBattleScores[duration]=scores.slice(0,10);saveProgress();
        setPuzzleFeedback(`Temps écoulé ! ${score} problème${score>1?'s':''} résolu${score>1?'s':''}. Record : ${scores[0].score}.`,'prompt');
        const comparison=score>previousBest ? (previousBest ? `Nouveau record ! Ton ancien meilleur score était ${previousBest}.` : 'Premier record enregistré !') : score===previousBest ? 'Tu égales ton meilleur score.' : `Ton record reste ${previousBest}. Encore un effort et il tremble.`;
        if(typeof showQuestCompletionModal==='function') showQuestCompletionModal({
          icon:'⚡',tone:'battle',eyebrow:`Bataille de ${duration} secondes`,title:`${score} problème${score>1?'s':''} résolu${score>1?'s':''} !`,
          message:comparison,
          actions:[
            {label:'Rejouer',primary:true,onClick:()=>startPuzzleBattle(duration)},
            {label:'Changer la durée',onClick:choosePuzzleBattleDuration},
            {label:'Retour à la carte',href:'problems.html'}
          ]
        });
      }
    },250);
  },850);
}
function choosePuzzleBattleDuration(){
  stopPuzzleBattle(); mcqLocked=true;
  if(typeof showQuestCompletionModal!=='function'){startPuzzleBattle(30);return;}
  showQuestCompletionModal({
    icon:'⚡',tone:'battle',confetti:false,eyebrow:'Mode chrono',title:'Choisis ta bataille',
    message:'Résous le plus de problèmes possible avant la fin du chronomètre.',
    actions:[30,45,60].map(seconds=>({label:`${seconds} secondes`,primary:seconds===45,onClick:()=>startPuzzleBattle(seconds)}))
  });
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

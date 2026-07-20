/* ============================================================
   ChessQuest — board.js
   Moteur d'analyse (Stockfish + repli maison) et utilitaires
   partagés pour tous les échiquiers de l'application.
   Nécessite : jQuery, chess.js, chessboard.js chargés avant ce fichier.
   ============================================================ */

const PIECE_THEME = 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png';

/* ---- Dimensionnement fiable des échiquiers (mesure réelle du DOM) ---- */
function fitOneBoard(boardId, pageSelector){
  const boardEl = document.getElementById(boardId);
  const frameEl = boardEl ? boardEl.closest('.board-frame') : null;
  const pageEl = pageSelector ? document.querySelector(pageSelector) : document.querySelector('.page');
  if(!boardEl || !frameEl || !pageEl) return;
  const pageStyle = getComputedStyle(pageEl);
  const framePad = getComputedStyle(frameEl);
  const pageInner = pageEl.clientWidth
    - (parseFloat(pageStyle.paddingLeft)||0) - (parseFloat(pageStyle.paddingRight)||0);
  const frameInner = pageInner
    - (parseFloat(framePad.paddingLeft)||0) - (parseFloat(framePad.paddingRight)||0);
  const px = Math.max(200, Math.min(460, frameInner - 6));
  boardEl.style.width = px + 'px';
}
function fitBoards(boardId, boardObjRef, pageSelector){
  fitOneBoard(boardId, pageSelector);
  if(boardObjRef) boardObjRef.resize();
}
let fitTimer = null;
function watchBoardResize(boardId, getBoardObj, pageSelector){
  const handler = () => { clearTimeout(fitTimer); fitTimer = setTimeout(()=>fitBoards(boardId, getBoardObj(), pageSelector), 120); };
  window.addEventListener('resize', handler);
  window.addEventListener('orientationchange', () => { setTimeout(handler, 250); setTimeout(handler, 600); });
}

/* ---- Coordonnées (rangées / colonnes) ---- */
function renderCoords(ranksElId, filesElId, orientation){
  const ranksEl = document.getElementById(ranksElId);
  const filesEl = document.getElementById(filesElId);
  if(!ranksEl || !filesEl) return;
  let files = ['a','b','c','d','e','f','g','h'];
  let ranks = ['8','7','6','5','4','3','2','1'];
  if(orientation === 'black'){ files = files.slice().reverse(); ranks = ranks.slice().reverse(); }
  ranksEl.innerHTML = ranks.map(r=>`<span>${r}</span>`).join('');
  filesEl.innerHTML = files.map(f=>`<span>${f}</span>`).join('');
}

/* ---- Surbrillance des cases ---- */
function clearHighlights(containerSel){
  $(containerSel + ' [data-square]').removeClass('highlight-from highlight-to hint-square selected-square suggest-from suggest-to');
  $(containerSel + ' .move-dot').remove();
}
function highlightMove(containerSel, from, to){
  $(containerSel + ' [data-square]').removeClass('highlight-from highlight-to');
  if(!from || !to) return;
  $(containerSel + ` [data-square="${from}"]`).addClass('highlight-from');
  $(containerSel + ` [data-square="${to}"]`).addClass('highlight-to');
}
function flashSquares(containerSel, squares, cls, duration){
  const $sqs = squares.map(sq => $(containerSel + ` [data-square="${sq}"]`));
  $sqs.forEach($sq => $sq.addClass(cls));
  setTimeout(()=>{ $sqs.forEach($sq => $sq.removeClass(cls)); }, duration || 500);
}
function pieceNameFromSan(san){
  const map = {N:'cavalier', B:'fou', R:'tour', Q:'dame', K:'roi'};
  if(san.startsWith('O-O')) return 'roi (roque)';
  return map[san[0]] || 'pion';
}

/* ============================================================
   MOTEUR : Stockfish (WASM) avec repli maison
   ============================================================ */
const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';
let SF_MOVETIME_MS = 450;
const SF_START_TIMEOUT_MS = 5000;

let sfWorker = null;
let sfState = 'loading';
let sfReadyResolvers = [];

function setEngineBadge(text, cls){
  const el = document.getElementById('engine-badge');
  if(!el) return;
  el.textContent = text;
  el.className = 'engine-badge ' + (cls||'');
}

function initStockfish(){
  setEngineBadge('Chargement du moteur Stockfish…', 'loading');
  try{
    sfWorker = new Worker(STOCKFISH_URL);
  }catch(e){
    sfState = 'unavailable';
    setEngineBadge('Stockfish indisponible — moteur de secours actif', 'fallback');
    return;
  }
  const timeout = setTimeout(()=>{
    if(sfState === 'loading'){
      sfState = 'unavailable';
      setEngineBadge('Stockfish indisponible — moteur de secours actif', 'fallback');
      sfReadyResolvers.forEach(fn=>fn());
      sfReadyResolvers = [];
    }
  }, SF_START_TIMEOUT_MS);

  sfWorker.onerror = () => {
    if(sfState === 'loading'){
      clearTimeout(timeout);
      sfState = 'unavailable';
      setEngineBadge('Stockfish indisponible — moteur de secours actif', 'fallback');
      sfReadyResolvers.forEach(fn=>fn());
      sfReadyResolvers = [];
    }
  };

  sfWorker.onmessage = (e) => {
    const line = e.data;
    if(typeof line !== 'string') return;
    if(line === 'uciok'){
      sfWorker.postMessage('isready');
    } else if(line === 'readyok' && sfState === 'loading'){
      clearTimeout(timeout);
      sfState = 'ready';
      setEngineBadge('Moteur : Stockfish (WASM)', 'ready');
      sfWorker.postMessage('ucinewgame');
      sfReadyResolvers.forEach(fn=>fn());
      sfReadyResolvers = [];
    }
  };
  sfWorker.postMessage('uci');
}
function waitForEngineReady(){
  if(sfState !== 'loading') return Promise.resolve();
  return new Promise(resolve => sfReadyResolvers.push(resolve));
}
function sfSetSkillLevel(level){
  if(sfWorker && sfState === 'ready'){
    sfWorker.postMessage('setoption name Skill Level value ' + Math.max(0, Math.min(20, level)));
  }
}
function parseUciMoveToSan(fen, uciMove){
  if(!uciMove || uciMove.length < 4) return null;
  const g = new Chess(fen);
  const from = uciMove.slice(0,2), to = uciMove.slice(2,4);
  const promo = uciMove.length > 4 ? uciMove[4] : undefined;
  const mv = g.move({from, to, promotion: promo || 'q'});
  return mv ? mv.san : null;
}
function sfAnalyzeFEN(fen, movetimeOverride){
  const movetime = movetimeOverride || SF_MOVETIME_MS;
  return new Promise((resolve)=>{
    let lastInfo = null;
    let stopped = false;
    const safety = setTimeout(()=>{ if(!stopped){ stopped = true; sfWorker.postMessage('stop'); } }, movetime + 4000);
    const handler = (e) => {
      const line = e.data;
      if(typeof line !== 'string') return;
      if(line.startsWith('info') && line.indexOf(' pv ') !== -1){
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        const pvMatch = line.match(/ pv (.+)/);
        if(pvMatch){
          lastInfo = { cp: cpMatch ? parseInt(cpMatch[1],10) : null, mate: mateMatch ? parseInt(mateMatch[1],10) : null, firstMove: pvMatch[1].trim().split(' ')[0] };
        }
      } else if(line.startsWith('bestmove')){
        clearTimeout(safety);
        sfWorker.removeEventListener('message', handler);
        const parts = line.split(' ');
        const bestUci = parts[1] && parts[1] !== '(none)' ? parts[1] : (lastInfo ? lastInfo.firstMove : null);
        let scoreForMover, mate = null;
        if(lastInfo && lastInfo.mate !== null){
          mate = lastInfo.mate;
          scoreForMover = mate > 0 ? (100000 - mate*100) : -(100000 + mate*100);
        } else if(lastInfo && lastInfo.cp !== null){
          scoreForMover = lastInfo.cp;
        } else { scoreForMover = 0; }
        resolve({ scoreForMover, bestMoveSan: bestUci ? parseUciMoveToSan(fen, bestUci) : null, mate });
      }
    };
    sfWorker.addEventListener('message', handler);
    sfWorker.postMessage('position fen ' + fen);
    sfWorker.postMessage('go movetime ' + movetime);
  });
}

/* ---- Repli maison (alpha-bêta + quiescence) ---- */
const VALUES = {p:100, n:320, b:330, r:500, q:900, k:0};
function evalAbsolute(game){
  const board = game.board();
  let score = 0;
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const sq = board[r][c];
      if(!sq) continue;
      let val = VALUES[sq.type];
      val += (3.5-Math.abs(3.5-r)) * (3.5-Math.abs(3.5-c)) * 1.4;
      score += (sq.color === 'w') ? val : -val;
    }
  }
  return score;
}
function evalRelative(game){ const abs = evalAbsolute(game); return game.turn()==='w' ? abs : -abs; }
function quiescence(game, alpha, beta, qdepth){
  const stand = evalRelative(game);
  if(stand >= beta) return beta;
  if(stand > alpha) alpha = stand;
  if(qdepth <= 0) return alpha;
  const moves = game.moves({verbose:true}).filter(m => m.captured);
  moves.sort((a,b)=> (VALUES[b.captured]||0) - (VALUES[a.captured]||0));
  for(const mv of moves){
    game.move(mv.san);
    const score = -quiescence(game, -beta, -alpha, qdepth-1);
    game.undo();
    if(score >= beta) return beta;
    if(score > alpha) alpha = score;
  }
  return alpha;
}
function homemadeSearch(game, depth, alpha, beta){
  if(depth === 0) return {score: quiescence(game, alpha, beta, 4), move:null};
  const moves = game.moves({verbose:true});
  if(moves.length === 0){
    if(game.in_check()) return {score:-99000, move:null};
    return {score:0, move:null};
  }
  moves.sort((a,b)=> (b.captured?1:0) - (a.captured?1:0));
  let bestMove = moves[0];
  for(const mv of moves){
    game.move(mv.san);
    const res = homemadeSearch(game, depth-1, -beta, -alpha);
    const score = -res.score;
    game.undo();
    if(score > alpha){ alpha = score; bestMove = mv; }
    if(alpha >= beta) break;
  }
  return {score: alpha, move: bestMove};
}
function homemadeAnalyzeFEN(fen){
  const g = new Chess(fen);
  const res = homemadeSearch(g, 3, -Infinity, Infinity);
  return Promise.resolve({ scoreForMover: res.score, bestMoveSan: res.move ? res.move.san : null, mate: null });
}

async function engineAnalyzeFEN(fen, movetimeOverride){
  await waitForEngineReady();
  if(sfState === 'ready'){
    sfSetSkillLevel(20);
    return sfAnalyzeFEN(fen, movetimeOverride);
  }
  return homemadeAnalyzeFEN(fen);
}

function classify(drop, isBest){
  if(drop <= 10) return isBest ? {label:'Meilleur coup', cls:'best', glyph:'\u2605'} : {label:'Bon coup', cls:'good', glyph:'\u2713'};
  if(drop <= 50) return {label:'Imprécision', cls:'inaccuracy', glyph:'?!'};
  if(drop <= 150) return {label:'Erreur', cls:'mistake', glyph:'?'};
  return {label:'Gaffe', cls:'blunder', glyph:'??'};
}

/* Démarre automatiquement le moteur dès que ce script est chargé */
initStockfish();

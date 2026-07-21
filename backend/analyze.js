/* ============================================================
   ChessQuest — analyze.js (backend, exécuté par GitHub Actions)

   Ce script tourne tout seul, en arrière-plan, indépendamment de
   l'application ouverte ou non. À chaque exécution (planifiée par
   .github/workflows/analyze.yml) :
     1. lit la liste des pseudos Chess.com à surveiller (Firestore /users)
     2. récupère leurs dernières parties publiques via l'API Chess.com
     3. analyse celles qui n'ont pas encore de résultat en cache,
        coup par coup, avec un vrai Stockfish natif (rapide)
     4. enregistre le résultat dans Firestore /games, prêt à être
        affiché instantanément par l'app (analysis.html).

   La logique de classification/conseil reproduit EXACTEMENT celle
   du moteur client (assets/js/board.js + analysis.html) afin que le
   rendu soit identique, que la partie ait été précalculée ou
   analysée en direct dans le navigateur (repli).
   ============================================================ */
const admin = require('firebase-admin');
const { Chess } = require('chess.js');
const { StockfishEngine } = require('./stockfish-uci');

const MOVETIME_MS = parseInt(process.env.ANALYZE_MOVETIME_MS || '400', 10);
const MAX_NEW_GAMES_PER_RUN = parseInt(process.env.MAX_NEW_GAMES_PER_RUN || '5', 10);
const ARCHIVES_TO_CHECK = 2;   // les 2 derniers mois d'archives Chess.com
const GAMES_PER_ARCHIVE = 20;  // les 20 dernières parties de chaque mois

/* ---- Init Firebase Admin ---- */
const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT;
if(!rawCredentials){
  console.error("Variable d'environnement FIREBASE_SERVICE_ACCOUNT manquante (secret GitHub Actions).");
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(rawCredentials)) });
const db = admin.firestore();

/* ---- Classification identique à assets/js/board.js::classify() ---- */
function classify(drop, isBest){
  if(drop <= 10) return isBest ? {label:'Meilleur coup', cls:'best', glyph:'\u2605'} : {label:'Bon coup', cls:'good', glyph:'\u2713'};
  if(drop <= 50) return {label:'Imprécision', cls:'inaccuracy', glyph:'?!'};
  if(drop <= 150) return {label:'Erreur', cls:'mistake', glyph:'?'};
  return {label:'Gaffe', cls:'blunder', glyph:'??'};
}

/* ---- Conseil identique à analysis.html::adviceFor() ---- */
function adviceFor(r){
  if(r.info.cls==='best') return `${r.san} était bien le meilleur coup ici.`;
  if(r.info.cls==='good') return `${r.san} est un bon coup, proche de l'optimal (${r.bestSan}).`;
  let txt = `${r.bestSan} était plus fort. `;
  if(r.mateMissed) txt += "Ce coup menait à un mat forcé et l'a laissé passer.";
  else if(r.mateAllowed) txt += "Ce coup permet à l'adversaire de forcer le mat.";
  else if(r.info.cls==='blunder') txt += "Ce coup laisse probablement une pièce en prise ou permet une attaque décisive.";
  else if(r.info.cls==='mistake') txt += "Ce coup cède un avantage matériel ou positionnel net à l'adversaire.";
  else txt += "Léger manque de précision, la position reste globalement tenable.";
  return txt;
}

function gameIdFromUrl(url){
  const s = String(url || '');
  const m = s.match(/(\d+)\s*$/);
  if(m) return m[1];
  return Buffer.from(s).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 60) || 'game_' + Date.now();
}

function uciToSan(fen, uciMove){
  const g = new Chess(fen);
  const from = uciMove.slice(0, 2), to = uciMove.slice(2, 4);
  const promotion = uciMove.length > 4 ? uciMove.slice(4, 5) : undefined;
  const mv = g.move({ from, to, promotion });
  return mv ? mv.san : null;
}

/** Reproduit exactement engineAnalyzeFEN() + la boucle de runAnalysis() côté client. */
async function analyzeGame(engine, pgn){
  const master = new Chess();
  if(!master.load_pgn(pgn, { sloppy: true })) return null;
  const history = master.history({ verbose: true });
  if(history.length === 0) return null;

  async function engineEval(fen){
    const res = await engine.analyze(fen, MOVETIME_MS);
    const bestMoveSan = res.bestMoveUci ? uciToSan(fen, res.bestMoveUci) : null;
    let scoreForMover;
    if(res.mate !== null && res.mate !== undefined){
      scoreForMover = res.mate > 0 ? (100000 - Math.abs(res.mate)) : (-100000 + Math.abs(res.mate));
    } else {
      scoreForMover = res.scoreCp || 0;
    }
    return { bestMoveSan, scoreForMover, mate: res.mate !== undefined ? res.mate : null };
  }

  const work = new Chess();
  const results = [];
  let evalBefore = await engineEval(work.fen());

  for(let i = 0; i < history.length; i++){
    const mv = history[i];
    const bestSan = evalBefore.bestMoveSan || mv.san;
    const bestScoreForMover = evalBefore.scoreForMover;
    const fenBeforeMove = work.fen();
    work.move(mv.san);
    const evalAfter = await engineEval(work.fen());
    const actualScoreForMover = -evalAfter.scoreForMover;
    const drop = Math.max(0, bestScoreForMover - actualScoreForMover);
    const isBest = (bestSan === mv.san);
    const info = classify(drop, isBest);
    const r = {
      ply: i, color: mv.color, san: mv.san, fen: work.fen(), fenBefore: fenBeforeMove,
      from: mv.from, to: mv.to, bestSan, drop: Math.round(drop), info,
      mateMissed: !!(evalBefore.mate && evalBefore.mate > 0 && !isBest),
      mateAllowed: !!(evalAfter.mate && evalAfter.mate > 0),
      moveNumber: Math.floor(i / 2) + 1
    };
    r.advice = adviceFor(r);
    results.push(r);
    evalBefore = evalAfter;
  }
  return { results, headers: master.header() };
}

async function fetchJson(url){
  const res = await fetch(url, { headers: { 'User-Agent': 'ChessQuest-analyzer/1.0 (contact via GitHub repo)' } });
  if(!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
  return res.json();
}

async function main(){
  console.log('--- ChessQuest — analyse en arrière-plan ---');
  const usersSnap = await db.collection('users').get();
  const usernames = usersSnap.docs.map(d => d.id);
  if(usernames.length === 0){
    console.log("Aucun pseudo enregistré dans Firestore (collection 'users'). Rien à faire.");
    return;
  }
  console.log(`Pseudos suivis : ${usernames.join(', ')}`);

  const engine = new StockfishEngine();
  await engine.ready(20);
  let analyzedCount = 0;

  for(const username of usernames){
    if(analyzedCount >= MAX_NEW_GAMES_PER_RUN) break;
    try{
      const archives = (await fetchJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`)).archives || [];
      const recentArchives = archives.slice(-ARCHIVES_TO_CHECK);
      for(const archiveUrl of recentArchives.reverse()){
        if(analyzedCount >= MAX_NEW_GAMES_PER_RUN) break;
        const monthGames = ((await fetchJson(archiveUrl)).games || []).slice(-GAMES_PER_ARCHIVE).reverse();
        for(const g of monthGames){
          if(analyzedCount >= MAX_NEW_GAMES_PER_RUN) break;
          if(!g.pgn) continue;
          const gameId = gameIdFromUrl(g.url);
          const ref = db.collection('games').doc(gameId);
          const existing = await ref.get();
          if(existing.exists) continue;

          console.log(`  → Analyse de ${gameId} (${username})…`);
          const analyzed = await analyzeGame(engine, g.pgn);
          if(!analyzed){ console.log('    (PGN illisible, ignoré)'); continue; }

          await ref.set({
            gameId,
            username: username.toLowerCase(),
            url: g.url || null,
            white: g.white ? g.white.username : null,
            black: g.black ? g.black.username : null,
            end_time: g.end_time || null,
            pgn: g.pgn,
            headers: analyzed.headers,
            results: analyzed.results,
            analyzedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          analyzedCount++;
          console.log(`    ✓ enregistré (${analyzed.results.length} coups)`);
        }
      }
    }catch(e){
      console.error(`Erreur pour ${username} :`, e.message);
    }
  }

  engine.quit();
  console.log(`--- Terminé : ${analyzedCount} nouvelle(s) partie(s) analysée(s). ---`);
}

main().catch(e => { console.error('Échec du script :', e); process.exit(1); });

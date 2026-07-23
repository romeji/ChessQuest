/* ============================================================
   ChessQuest — firebase-sync.js
   Connexion en LECTURE au Firestore rempli en arrière-plan par
   .github/workflows/analyze.yml (voir backend/analyze.js).

   ⚠️ À CONFIGURER : remplace FIREBASE_CONFIG ci-dessous par la config
   web de TON propre projet Firebase (Console Firebase → Paramètres du
   projet → Général → "Vos applications" → app Web → objet de config).
   C'est une config PUBLIQUE (pas un secret) — elle est faite pour être
   dans du code client, la sécurité vient des règles Firestore, pas de
   ces clés. Voir SETUP-BACKEND.md pour la marche à suivre complète.
   ============================================================ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAYFoAYo-f9clafg0ArzTNrwZwtGvHhvjc",
  authDomain: "chessquest-251ed.firebaseapp.com",
  projectId: "chessquest-251ed",
  storageBucket: "chessquest-251ed.firebasestorage.app",
  messagingSenderId: "113306734865",
  appId: "1:113306734865:web:307c2d09ba79efd849bcb0",
};

let _fbDb = null;
let _fbInitPromise = null;

function fbConfigured(){
  return FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'REMPLACE_MOI';
}

function fbInit(){
  if(_fbInitPromise) return _fbInitPromise;
  _fbInitPromise = (async () => {
    if(!fbConfigured()){
      console.warn('[ChessQuest] Firebase non configuré (assets/js/firebase-sync.js) — analyse instantanée désactivée, repli sur le calcul local.');
      return null;
    }
    if(typeof firebase === 'undefined'){
      console.warn('[ChessQuest] SDK Firebase non chargé sur cette page.');
      return null;
    }
    try{
      if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      _fbDb = firebase.firestore();
      return _fbDb;
    }catch(e){
      console.warn('[ChessQuest] Échec init Firebase :', e.message);
      return null;
    }
  })();
  return _fbInitPromise;
}

/** Doit rester identique à backend/analyze.js::gameIdFromUrl() pour que
 *  les identifiants correspondent entre le calcul serveur et la lecture client. */
function gameIdFromUrl(url){
  const s = String(url || '');
  const m = s.match(/(\d+)\s*$/);
  if(m) return m[1];
  try{
    return btoa(unescape(encodeURIComponent(s))).replace(/[^a-zA-Z0-9]/g, '').slice(0, 60) || ('game_' + Date.now());
  }catch(e){ return 'game_' + Date.now(); }
}

/** Retourne le document précalculé { headers, results, ... } ou null
 *  s'il n'existe pas encore (partie trop récente, pas encore passée
 *  par le job GitHub Actions, ou Firebase non configuré). */
async function fetchPrecomputedAnalysis(gameUrlOrId){
  const db = await fbInit();
  if(!db) return null;
  const id = gameIdFromUrl(gameUrlOrId);
  try{
    const doc = await db.collection('games').doc(id).get();
    return doc.exists ? doc.data() : null;
  }catch(e){
    console.warn('[ChessQuest] Lecture Firestore impossible :', e.message);
    return null;
  }
}

/** Ajoute (ou met à jour) un pseudo Chess.com à la liste surveillée par
 *  le job d'analyse en arrière-plan. Best-effort : en cas d'échec (pas
 *  configuré, hors-ligne...), on n'interrompt pas le reste de l'app. */
async function registerChessComUsername(username){
  const db = await fbInit();
  if(!db || !username) return false;
  const clean = username.trim().toLowerCase();
  if(!clean) return false;
  try{
    await db.collection('users').doc(clean).set({ username: clean, addedAt: new Date().toISOString() });
    return true;
  }catch(e){
    console.warn('[ChessQuest] Impossible d\u2019enregistrer le pseudo pour l\u2019analyse en arrière-plan :', e.message);
    return false;
  }
}

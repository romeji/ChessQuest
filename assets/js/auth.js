/* Compte ChessQuest : Firebase Auth + premier parcours guidé. */
const QUEST_FIREBASE_CONFIG = {
  apiKey:'AIzaSyAYFoAYo-f9clafg0ArzTNrwZwtGvHhvjc',
  authDomain:'chessquest-251ed.firebaseapp.com',
  projectId:'chessquest-251ed',
  storageBucket:'chessquest-251ed.firebasestorage.app',
  messagingSenderId:'113306734865',
  appId:'1:113306734865:web:307c2d09ba79efd849bcb0'
};
const QUEST_ONBOARDING_VERSION = 2;
const QUEST_TOUR = [
  ['Apprends sans réciter bêtement','Les cours écrits expliquent les idées. Les ouvertures te font ensuite jouer les coups sur l’échiquier.','haughty'],
  ['Résous des problèmes utiles','Chaque jour, un problème. Tu peux aussi travailler tes erreurs, un thème précis ou lancer une bataille chronométrée.','encourage'],
  ['Tes défaites deviennent des leçons','Après une partie Chess.com, l’analyse repère tes erreurs et les transforme en exercices qui disparaissent une fois corrigés.','sad'],
  ['Monte de niveau, sujet prometteur','Gagne de l’XP, des couronnes et des badges. J’essaierai de ne pas être trop impressionné.','ecstatic']
];
function loadQuestScript(src){return new Promise((resolve,reject)=>{const existing=document.querySelector(`script[src="${src}"]`);if(existing){if(existing.dataset.ready==='true')resolve();else{existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});}return;}const script=document.createElement('script');script.src=src;script.onload=()=>{script.dataset.ready='true';resolve();};script.onerror=reject;document.head.appendChild(script);});}
async function ensureQuestFirebaseAuth(){
  if(typeof firebase==='undefined') await loadQuestScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  if(!firebase.auth) await loadQuestScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
  return firebase;
}
let questGoogleAuthPromise=null;
async function signInToQuestWithGoogle(){
  if(questGoogleAuthPromise)return questGoogleAuthPromise;
  questGoogleAuthPromise=(async()=>{
    await ensureQuestFirebaseAuth();
    if(!firebase.apps.length)firebase.initializeApp(QUEST_FIREBASE_CONFIG);
    return firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  })();
  try{return await questGoogleAuthPromise;}finally{questGoogleAuthPromise=null;}
}

function showOnboardingStep(name){
  document.querySelectorAll('[data-onboarding-step]').forEach(step=>step.classList.toggle('hidden',step.dataset.onboardingStep!==name));
}
function storeQuestUser(user){
  PROGRESS.account={uid:user?.uid||'offline',email:user?.email||null,displayName:user?.displayName||'Joueur'};
  saveProgress();
}
function initQuestAccountFlow(){
  const overlay=document.getElementById('onboarding-overlay');
  if(!overlay || Number(PROGRESS.onboardingVersion||0)>=QUEST_ONBOARDING_VERSION){overlay?.classList.add('hidden');return;}
  overlay.classList.remove('hidden'); showOnboardingStep('account');
  const status=document.getElementById('auth-status');
  const continueToChess=()=>showOnboardingStep('chesscom');
  document.getElementById('auth-offline-button').onclick=()=>{storeQuestUser(null);continueToChess();};
  document.getElementById('auth-google-button').onclick=async()=>{
    const button=document.getElementById('auth-google-button');
    if(button.disabled||questGoogleAuthPromise)return;
    button.disabled=true;button.setAttribute('aria-busy','true');
    status.textContent='Ouverture de Google…';
    try{
      const result=await signInToQuestWithGoogle();
      storeQuestUser(result.user); continueToChess();
    }catch(error){
      status.textContent=error.code==='auth/operation-not-allowed'
        ?'Active Google dans Firebase Authentication, puis réessaie.'
        :error.code==='auth/cancelled-popup-request'
          ?'Une connexion Google est déjà en cours. Termine-la dans la fenêtre ouverte.'
          :(error.message||'Connexion impossible.');
    }finally{button.disabled=false;button.removeAttribute('aria-busy');}
  };
  document.getElementById('onboarding-chesscom-next').onclick=async()=>{
    const input=document.getElementById('onboarding-chesscom');
    const chessStatus=document.getElementById('onboarding-chesscom-status');
    const username=input.value.trim();
    try{
      normalizeChessComUsername(username); chessStatus.textContent='Vérification du compte…';
      await chessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`);
      const state=chessComState();state.username=username;PROGRESS.settings.chessComUsername=username;saveProgress();
      let games=[];
      try{
        games=await syncChessCom(username,{force:true});
        chessStatus.textContent=games.length?`Compte trouvé · ${games.length} parties mémorisées.`:'Compte trouvé · joue ta première partie pour débloquer les analyses.';
      }catch(syncError){
        // Le profil est déjà validé : une indisponibilité des archives ne doit pas
        // bloquer le premier lancement. La synchronisation automatique réessaiera.
        console.warn('[ChessQuest] Synchronisation Chess.com différée', syncError);
        chessStatus.textContent='Compte trouvé · tes parties seront synchronisées en arrière-plan.';
      }
      setTimeout(()=>startTour(),450);
    }catch(error){
      if(PROGRESS.account?.uid==='offline' && !navigator.onLine){const state=chessComState();state.username=username;PROGRESS.settings.chessComUsername=username;saveProgress();chessStatus.textContent='Pseudo enregistré hors connexion.';setTimeout(()=>startTour(),350);return;}
      chessStatus.textContent=error.message||'Pseudo introuvable.';input.focus();
    }
  };
  let tourIndex=0;
  function renderTour(){
    const [title,copy,mood]=QUEST_TOUR[tourIndex];
    document.getElementById('tour-counter').textContent=`${tourIndex+1} / ${QUEST_TOUR.length}`;
    document.getElementById('tour-title').textContent=title; document.getElementById('tour-copy').textContent=copy;
    document.getElementById('onboarding-mascot').src=`assets/illustrations/mascot-coach-${mood}.webp`;
    document.getElementById('tour-dots').innerHTML=QUEST_TOUR.map((_,i)=>`<i class="${i===tourIndex?'active':''}"></i>`).join('');
    document.getElementById('tour-next').textContent=tourIndex===QUEST_TOUR.length-1?'Entrer dans ChessQuest':'Suivant';
  }
  function startTour(){showOnboardingStep('tour');renderTour();}
  document.getElementById('tour-next').onclick=()=>{
    if(tourIndex<QUEST_TOUR.length-1){tourIndex++;renderTour();return;}
    PROGRESS.onboardingVersion=QUEST_ONBOARDING_VERSION;PROGRESS.onboarded=true;saveProgress();overlay.classList.add('hidden');
    if(typeof fireConfetti==='function')fireConfetti('badge');
  };
}
document.addEventListener('DOMContentLoaded',initQuestAccountFlow);

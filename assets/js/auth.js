/* Compte ChessQuest : Firebase Auth, sauvegarde cloud et premier parcours guidé. */
const QUEST_PRODUCTION_HOST='chessle.vercel.app';
const QUEST_FIREBASE_CONFIG = {
  apiKey:'AIzaSyAYFoAYo-f9clafg0ArzTNrwZwtGvHhvjc',
  /* /__/auth est proxifié par Vercel en production. Le helper OAuth reste
     ainsi sur le domaine de la PWA, ce que Safari/iOS exige désormais. */
  authDomain:location.hostname===QUEST_PRODUCTION_HOST ? QUEST_PRODUCTION_HOST : 'chessquest-251ed.firebaseapp.com',
  projectId:'chessquest-251ed',
  storageBucket:'chessquest-251ed.firebasestorage.app',
  messagingSenderId:'113306734865',
  appId:'1:113306734865:web:307c2d09ba79efd849bcb0'
};

const QUEST_ONBOARDING_VERSION = 3;
const QUEST_TOUR = [
  ['Résous, gagne de l’XP','Chaque problème réussi te rapporte de l’XP. Trois problèmes quotidiens font avancer ton pion sur la carte et remplissent ton coffre.','encourage'],
  ['Ton ELO tactique évolue','L’ELO affiché au-dessus de la carte mesure ta progression dans les problèmes. Plus les paliers montent, plus les positions deviennent exigeantes.','haughty'],
  ['Débloque les ouvertures','Maîtrise une ligne pour ouvrir la suivante. Les cours expliquent les idées, puis l’échiquier vérifie que tu sais vraiment les jouer.','encourage'],
  ['Les couronnes ont une utilité','Gagne des couronnes dans les défis, analyses et ouvertures. Dépense-les dans la boutique pour les plateaux, pièces et niveaux secrets.','ecstatic'],
  ['Tes parties deviennent des leçons','Ton pseudo Chess.com permet de conserver tes parties récentes, d’analyser tes erreurs et de créer des exercices personnels. Oui, je surveille tout.','haughty']
];

function loadQuestScript(src){
  return new Promise((resolve,reject)=>{
    const existing=document.querySelector(`script[src="${src}"]`);
    if(existing){
      if(existing.dataset.ready==='true' || existing.readyState==='complete') resolve();
      else{existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});}
      return;
    }
    const script=document.createElement('script');
    script.src=src;
    script.onload=()=>{script.dataset.ready='true';resolve();};
    script.onerror=reject;
    document.head.appendChild(script);
  });
}

async function ensureQuestFirebaseAuth(){
  if(typeof firebase==='undefined') await loadQuestScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  if(!firebase.auth) await loadQuestScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
  if(!firebase.firestore) await loadQuestScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
  if(!firebase.apps.length) firebase.initializeApp(QUEST_FIREBASE_CONFIG);
  firebase.auth().languageCode='fr';
  try{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);}
  catch(error){console.warn('[ChessQuest] Persistance Firebase indisponible',error);}
  return firebase;
}

let questGoogleAuthPromise=null;
let questGoogleRedirectPromise=null;
let questCloudUserId=null;
let questCloudRef=null;
let questCloudTimer=null;
let questCloudListenerInstalled=false;

function questRedirectWasPending(){
  let localPending=false,sessionPending=false;
  try{localPending=localStorage.getItem('cq-google-redirect-pending')==='1';}catch(error){}
  try{sessionPending=sessionStorage.getItem('cq-google-redirect-pending')==='1';}catch(error){}
  return localPending || sessionPending;
}
function setQuestRedirectPending(pending){
  const action=pending?'setItem':'removeItem';
  try{localStorage[action]('cq-google-redirect-pending','1');}catch(error){}
  try{sessionStorage[action]('cq-google-redirect-pending','1');}catch(error){}
}
function waitForQuestRedirectUser(timeout=4500){
  return new Promise(resolve=>{
    const auth=firebase.auth();
    if(auth.currentUser){resolve(auth.currentUser);return;}
    let settled=false,timer=null,stop=()=>{};
    const finish=user=>{if(settled)return;settled=true;clearTimeout(timer);stop();resolve(user||null);};
    stop=auth.onAuthStateChanged(user=>{if(user)finish(user);},()=>finish(null));
    timer=setTimeout(()=>finish(auth.currentUser),timeout);
  });
}

function questRunsAsInstalledPwa(){
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function questUsesRedirectAuth(){
  return questRunsAsInstalledPwa() || /iPad|iPhone|iPod/.test(navigator.userAgent);
}
function questCurrentUser(){
  return new Promise(async resolve=>{
    await ensureQuestFirebaseAuth();
    if(firebase.auth().currentUser){resolve(firebase.auth().currentUser);return;}
    const stop=firebase.auth().onAuthStateChanged(user=>{stop();resolve(user||null);},()=>{stop();resolve(null);});
  });
}
async function consumeQuestGoogleRedirect(){
  if(questGoogleRedirectPromise) return questGoogleRedirectPromise;
  questGoogleRedirectPromise=(async()=>{
    await ensureQuestFirebaseAuth();
    const wasPending=questRedirectWasPending();
    try{
      const result=await firebase.auth().getRedirectResult();
      const user=result?.user || firebase.auth().currentUser || (wasPending ? await waitForQuestRedirectUser() : null);
      setQuestRedirectPending(false);
      if(wasPending && !user){
        const error=new Error('Google a renvoyé vers ChessQuest, mais la session n’a pas été conservée. Vérifie l’URI OAuth autorisée puis réessaie.');
        error.code='auth/redirect-session-lost';
        window.__questRedirectError=error;
      }
      return result || (user ? {user} : null);
    }catch(error){
      setQuestRedirectPending(false);
      window.__questRedirectError=error;
      console.warn('[ChessQuest] Retour Google incomplet',error);
      return null;
    }
  })();
  return questGoogleRedirectPromise;
}
async function signInToQuestWithGoogle(){
  if(questGoogleAuthPromise) return questGoogleAuthPromise;
  questGoogleAuthPromise=(async()=>{
    await ensureQuestFirebaseAuth();
    const provider=new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt:'select_account'});
    if(questUsesRedirectAuth()){
      setQuestRedirectPending(true);
      try{await firebase.auth().signInWithRedirect(provider);}
      catch(error){setQuestRedirectPending(false);throw error;}
      return null;
    }
    try{return await firebase.auth().signInWithPopup(provider);}
    catch(error){
      if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(error.code)){
        setQuestRedirectPending(true);
        try{await firebase.auth().signInWithRedirect(provider);}
        catch(redirectError){setQuestRedirectPending(false);throw redirectError;}
        return null;
      }
      throw error;
    }
  })();
  try{return await questGoogleAuthPromise;}finally{questGoogleAuthPromise=null;}
}

function questCloudProgressSnapshot(){
  const snapshot=JSON.parse(JSON.stringify(PROGRESS || {}));
  if(snapshot.chessCom){
    snapshot.chessCom.syncing=false;
    snapshot.chessCom.games=Array.isArray(snapshot.chessCom.games) ? snapshot.chessCom.games.slice(0,30) : [];
  }
  snapshot.games=Array.isArray(snapshot.games) ? snapshot.games.slice(0,30) : [];
  snapshot.mistakes=Array.isArray(snapshot.mistakes) ? snapshot.mistakes.slice(0,80) : [];
  return snapshot;
}
async function uploadQuestProgress(){
  if(!questCloudRef || !questCloudUserId || firebase.auth().currentUser?.uid!==questCloudUserId) return false;
  const snapshot=questCloudProgressSnapshot();
  try{
    await questCloudRef.set({
      uid:questCloudUserId,
      email:firebase.auth().currentUser?.email || null,
      displayName:firebase.auth().currentUser?.displayName || null,
      chessComUsername:snapshot.settings?.chessComUsername || snapshot.chessCom?.username || '',
      progress:snapshot,
      updatedAtIso:snapshot.updatedAt || new Date().toISOString(),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
    return true;
  }catch(error){
    console.warn('[ChessQuest] Sauvegarde cloud différée',error);
    return false;
  }
}
function scheduleQuestCloudUpload(){
  if(!questCloudRef) return;
  clearTimeout(questCloudTimer);
  questCloudTimer=setTimeout(uploadQuestProgress,650);
}
function installQuestCloudListeners(){
  if(questCloudListenerInstalled) return;
  questCloudListenerInstalled=true;
  document.addEventListener('quest:progress-saved',scheduleQuestCloudUpload);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden') uploadQuestProgress();});
  window.addEventListener('pagehide',uploadQuestProgress);
}
async function hydrateQuestProgress(user){
  if(!user) return {applied:false};
  await ensureQuestFirebaseAuth();
  questCloudUserId=user.uid;
  questCloudRef=firebase.firestore().collection('players').doc(user.uid);
  let remote=null;
  let remoteReadSucceeded=false;
  try{
    const doc=await questCloudRef.get();
    remote=doc.exists?doc.data():null;
    remoteReadSucceeded=true;
  }
  catch(error){console.warn('[ChessQuest] Lecture cloud différée',error);}

  const localOwner=PROGRESS.account?.uid;
  /* Une session Google différente ne doit jamais récupérer les achats,
     parties ou niveaux du joueur précédent. On ne vide le cache qu'après
     une lecture Firestore réussie, afin de rester tolérant hors connexion. */
  if(remoteReadSucceeded && !remote?.progress && localOwner && localOwner!==user.uid){
    PROGRESS=defaultProgress();
  }
  const localTime=Date.parse(PROGRESS.updatedAt || 0) || 0;
  const remoteTime=Date.parse(remote?.updatedAtIso || remote?.progress?.updatedAt || 0) || 0;
  const shouldApply=!!remote?.progress && (localOwner!==user.uid || remoteTime>=localTime);
  if(shouldApply && typeof replaceProgressSnapshot==='function') replaceProgressSnapshot(remote.progress);

  PROGRESS.account={uid:user.uid,email:user.email||null,displayName:user.displayName||'Joueur'};
  saveProgress({localOnly:true,preserveTimestamp:shouldApply});
  installQuestCloudListeners();
  if(!remote?.progress || !shouldApply) await uploadQuestProgress();
  return {applied:shouldApply,remoteTime};
}

function showOnboardingStep(name){
  document.querySelectorAll('[data-onboarding-step]').forEach(step=>step.classList.toggle('hidden',step.dataset.onboardingStep!==name));
}
function questChessUsername(){
  return String(PROGRESS.settings?.chessComUsername || PROGRESS.chessCom?.username || '').trim();
}
function rememberQuestReturn(){
  if(location.pathname.endsWith('/index.html') || location.pathname.endsWith('/')) return;
  sessionStorage.setItem('cq-auth-return',`${location.pathname.split('/').pop()}${location.search}${location.hash}`);
}
function finishQuestEntry(){
  const target=sessionStorage.getItem('cq-auth-return');
  sessionStorage.removeItem('cq-auth-return');
  if(target && !/^https?:/i.test(target) && !target.startsWith('//')) location.href=target;
}
function storeQuestUser(user){
  if(!user) return;
  PROGRESS.account={uid:user.uid,email:user.email||null,displayName:user.displayName||'Joueur'};
  saveProgress();
}

async function guardQuestPage(){
  const user=await questCurrentUser();
  if(!user){rememberQuestReturn();location.replace('index.html?auth=required');return;}
  const hydration=await hydrateQuestProgress(user);
  if(!questChessUsername() || Number(PROGRESS.onboardingVersion||0)<QUEST_ONBOARDING_VERSION){
    rememberQuestReturn();location.replace('index.html?setup=required');return;
  }
  if(hydration.applied){
    const marker=`${user.uid}:${hydration.remoteTime}`;
    if(sessionStorage.getItem('cq-cloud-hydrated')!==marker){sessionStorage.setItem('cq-cloud-hydrated',marker);location.reload();}
  }
}

async function initQuestAccountFlow(){
  if(window.__questAccountFlowPromise) return window.__questAccountFlowPromise;
  window.__questAccountFlowPromise=(async()=>{
    const redirectResult=await consumeQuestGoogleRedirect();
    const overlay=document.getElementById('onboarding-overlay');
    if(!overlay){await guardQuestPage();return;}

    let user=redirectResult?.user || await questCurrentUser();
    if(user) await hydrateQuestProgress(user);
    overlay.classList.remove('hidden');
    const status=document.getElementById('auth-status');
    if(window.__questRedirectError) status.textContent=window.__questRedirectError.message || 'La connexion Google n’a pas abouti.';

    let tourIndex=0;
    function renderTour(){
      const [title,copy,mood]=QUEST_TOUR[tourIndex];
      document.getElementById('tour-counter').textContent=`${tourIndex+1} / ${QUEST_TOUR.length}`;
      document.getElementById('tour-title').textContent=title;
      document.getElementById('tour-copy').textContent=copy;
      document.getElementById('onboarding-mascot').src=`assets/illustrations/mascot-coach-${mood}.webp`;
      document.getElementById('tour-dots').innerHTML=QUEST_TOUR.map((_,i)=>`<i class="${i===tourIndex?'active':''}"></i>`).join('');
      document.getElementById('tour-next').textContent=tourIndex===QUEST_TOUR.length-1?'Entrer dans ChessQuest':'Suivant';
    }
    function startTour(){showOnboardingStep('tour');renderTour();}
    function routeAuthenticatedUser(){
      if(!user){showOnboardingStep('account');return;}
      if(!questChessUsername()){showOnboardingStep('chesscom');return;}
      if(Number(PROGRESS.onboardingVersion||0)<QUEST_ONBOARDING_VERSION){startTour();return;}
      overlay.classList.add('hidden');finishQuestEntry();
    }
    routeAuthenticatedUser();

    const googleButton=document.getElementById('auth-google-button');
    googleButton.onclick=async()=>{
      if(googleButton.disabled||questGoogleAuthPromise) return;
      googleButton.disabled=true;googleButton.setAttribute('aria-busy','true');status.textContent='Connexion sécurisée à Google…';
      try{
        const result=await signInToQuestWithGoogle();
        if(result?.user){user=result.user;await hydrateQuestProgress(user);routeAuthenticatedUser();}
      }catch(error){
        status.textContent=error.code==='auth/operation-not-allowed'
          ?'Active Google dans Firebase Authentication, puis réessaie.'
          :error.code==='auth/cancelled-popup-request'
            ?'Une connexion est déjà ouverte. Termine-la avant de réessayer.'
            :(error.message||'Connexion impossible.');
      }finally{googleButton.disabled=false;googleButton.removeAttribute('aria-busy');}
    };

    document.getElementById('onboarding-chesscom-next').onclick=async()=>{
      const input=document.getElementById('onboarding-chesscom');
      const chessStatus=document.getElementById('onboarding-chesscom-status');
      const username=input.value.trim();
      try{
        normalizeChessComUsername(username);chessStatus.textContent='Vérification du compte…';
        await chessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`);
        const state=chessComState();state.username=username;PROGRESS.settings.chessComUsername=username;saveProgress();
        if(typeof registerChessComUsername==='function') registerChessComUsername(username).catch(()=>{});
        let games=[];
        try{
          games=await syncChessCom(username,{force:true});
          chessStatus.textContent=games.length?`Compte trouvé · ${games.length} parties mémorisées.`:'Compte trouvé · joue ta première partie pour débloquer les analyses.';
        }catch(syncError){
          console.warn('[ChessQuest] Synchronisation Chess.com différée',syncError);
          chessStatus.textContent='Compte trouvé · tes parties seront synchronisées en arrière-plan.';
        }
        await uploadQuestProgress();setTimeout(startTour,350);
      }catch(error){chessStatus.textContent=error.message||'Pseudo introuvable.';input.focus();}
    };

    document.getElementById('tour-next').onclick=()=>{
      if(tourIndex<QUEST_TOUR.length-1){tourIndex++;renderTour();return;}
      PROGRESS.onboardingVersion=QUEST_ONBOARDING_VERSION;PROGRESS.onboarded=true;saveProgress();
      overlay.classList.add('hidden');uploadQuestProgress();
      if(typeof fireConfetti==='function') fireConfetti('badge');
      finishQuestEntry();
    };
  })();
  return window.__questAccountFlowPromise;
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initQuestAccountFlow,{once:true});
else initQuestAccountFlow();

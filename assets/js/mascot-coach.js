/* ChessQuest — la voix et les réactions du coach royal. */
const MASCOT_ASSETS = {
  ecstatic:'assets/illustrations/mascot-coach-ecstatic.webp',
  encourage:'assets/illustrations/mascot-coach-encourage.webp',
  haughty:'assets/illustrations/mascot-coach-haughty.webp',
  sad:'assets/illustrations/mascot-coach-sad.webp',
  rage:'assets/illustrations/mascot-coach-rage.webp'
};
const MASCOT_LINES = {
  best:['Évidemment. C’était le coup royal — j’allais précisément te le suggérer.','Magnifique. Pour une fois, nous avons pensé au même niveau.','Impeccable. La cour peut applaudir.'],
  good:['Solide. Pas tout à fait du génie, mais je valide.','Bien joué. Tu commences à mériter cette couronne.','Propre et utile. Une qualité rare.'],
  hint:['Je vais t’accorder un indice. Considère cela comme un privilège royal.','Regarde mieux la pièce active. Oui, celle que j’observe depuis le début.','Un conseil de souverain : cherche d’abord les échecs et les prises.'],
  inaccuracy:['Audacieux. Pas optimal, mais audacieux.','J’avais mieux, naturellement. La position reste cependant fréquentable.','Un léger manque de précision. Rien que ma cour ne puisse réparer.'],
  mistake:['J’avais vu le piège trois coups plus tôt… mais continuons.','Ce coup froisse quelque peu ma cape. Cherche la menace adverse.','Nous venons d’offrir un avantage. Généreux, mais peu royal.'],
  blunder:['Majestueux désastre. Respire, puis regarde la pièce laissée en prise.','Ma couronne vient de perdre un degré d’inclinaison.','C’était une gaffe. Même les sujets prometteurs trébuchent.'],
  rage:['PAR LES TOURS DU ROYAUME ! Cette pièce était en prise !','Je refuse officiellement d’avoir conseillé ce coup.','Catastrophique ! Reprenons avant que les chroniqueurs ne l’apprennent.'],
  treasure:['Enfin, un trésor à la hauteur de notre talent.','Le coffre est ouvert. Tu peux remercier ton souverain préféré.','Des couronnes ! Voilà une récompense convenable.'],
  purchase:['Excellent choix. Ton échiquier gagne enfin un peu de distinction.','Achat approuvé par la cour. Il t’allait de toute évidence.','Voilà qui améliore sensiblement le standing du royaume.'],
  locked:['Ce passage reste scellé. Quelques exploits supplémentaires devraient suffire.','Niveau secret. Même moi, je respecte parfois les cadenas.','La couronne ouvre beaucoup de portes… celle-ci exige encore des couronnes.']
};
function mascotPick(lines, seed){
  const list = Array.isArray(lines) ? lines : MASCOT_LINES[lines] || MASCOT_LINES.good;
  return list[Math.abs(Number(seed) || Date.now()) % list.length];
}
function mascotMoodFor(kind, severity){
  if(['best','treasure','purchase'].includes(kind)) return 'ecstatic';
  if(['good','hint'].includes(kind)) return 'encourage';
  if(['inaccuracy','locked'].includes(kind)) return 'haughty';
  if(kind === 'mistake') return 'sad';
  if(kind === 'rage' || (kind === 'blunder' && Number(severity) >= 400)) return 'rage';
  if(kind === 'blunder') return 'sad';
  return 'encourage';
}
function mascotLine(kind, detail, seed){
  const intro = mascotPick(kind,seed);
  return detail ? `${intro} ${detail}` : intro;
}
function updateMascotElements(mood,message,options){
  const image = document.querySelector(options.imageSelector || '[data-mascot-image]');
  const text = document.querySelector(options.textSelector || '[data-mascot-text]');
  if(image){
    image.src = MASCOT_ASSETS[mood] || MASCOT_ASSETS.encourage;
    image.dataset.mood = mood;
    image.classList.remove('mascot-react'); void image.offsetWidth; image.classList.add('mascot-react');
  }
  if(text){
    text.textContent = message;
    text.dataset.mood = mood;
    text.classList.remove('mascot-bubble-pop'); void text.offsetWidth; text.classList.add('mascot-bubble-pop');
  }
  return Boolean(image || text);
}
function ensureMascotToast(){
  let root = document.getElementById('mascot-reaction-toast');
  if(root) return root;
  root = document.createElement('aside');
  root.id = 'mascot-reaction-toast';
  root.className = 'mascot-reaction-toast';
  root.setAttribute('aria-live','polite');
  root.innerHTML = '<img alt="Réaction du coach ChessQuest"><p></p>';
  document.body.appendChild(root);
  return root;
}
function showMascotReaction(kind,detail,options){
  options = options || {};
  const mood = options.mood || mascotMoodFor(kind,options.severity);
  const message = options.message || mascotLine(kind,detail,options.seed);
  const embedded = updateMascotElements(mood,message,options);
  if(!embedded || options.toast){
    const toast = ensureMascotToast();
    toast.querySelector('img').src = MASCOT_ASSETS[mood];
    toast.querySelector('p').textContent = message;
    toast.dataset.mood = mood;
    toast.classList.remove('show'); void toast.offsetWidth; toast.classList.add('show');
    clearTimeout(window.__mascotToastTimer);
    window.__mascotToastTimer = setTimeout(()=>toast.classList.remove('show'),options.duration || 4200);
  }
  if(options.speak !== false && typeof speak === 'function') speak(message);
  if(['best','treasure','purchase'].includes(kind) && typeof fireConfetti === 'function') fireConfetti(kind === 'treasure' ? 'badge' : 'puzzle');
  return {mood,message};
}
document.addEventListener('quest:currency',event => {
  const amount = event.detail?.amount || 0;
  if(amount > 0){
    const floater = document.createElement('div');
    floater.className = 'currency-float';
    floater.textContent = `♛ +${amount}`;
    document.body.appendChild(floater);
    setTimeout(() => floater.remove(), 1350);
  }
  if(amount >= 30) showMascotReaction('treasure',`+${amount} couronnes.`,{toast:true,speak:false});
});
document.addEventListener('quest:purchase',event => {
  showMascotReaction('purchase',`${event.detail.item.name} rejoint ta collection.`,{toast:true});
});

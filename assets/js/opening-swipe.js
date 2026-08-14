/* ChessQuest — sélecteur d'ouvertures illustré et tactile. */
(function initOpeningSwipe(){
  const PIECES = ['wP','bP','wN','bN','wB','wR'];
  const STYLE_WORLDS = {
    attack:['jeu_ouvert','siciliennes','indiennes','gambits'],
    solid:['fondations','semi_ouvertes','gambit_dame'],
    positional:['gambit_dame','positionnels','indiennes','maitres'],
    creative:['frontieres','gambits','siciliennes','jeu_ouvert']
  };
  const STYLE_LABELS = {attack:'Attaque',solid:'Solide',positional:'Positionnel',creative:'Créatif'};
  const COACH_LINES = {
    attack:'Tu veux attaquer ? Excellent. Les rois adverses dormaient beaucoup trop bien.',
    solid:'Une bonne structure avant le spectacle. Étonnamment raisonnable de ta part.',
    positional:'Tu préfères gagner lentement et proprement. Cruel, mais élégant.',
    creative:'Tu aimes surprendre. Essaie tout de même de te surprendre dans le bon sens.'
  };
  const BASE_NAMES = {
    italienne:'Italienne — Giuoco Piano',quatre_cavaliers:'Quatre Cavaliers',qgd:'Gambit Dame refusé',qga:'Gambit Dame accepté',slav:'Défense Slave',
    francaise:'Défense Française',najdorf:'Sicilienne — Najdorf',dragon:'Sicilienne — Dragon',sveshnikov:'Sicilienne — Sveshnikov',carokann:'Caro-Kann',
    gambit_roi:'Gambit du Roi',vienne:'Partie viennoise'
  };
  const deck = document.getElementById('opening-deck');
  if(!deck || !window.OPENING_WORLDS) return;

  const mastered = (window.PROGRESS && PROGRESS.mastered) || {};
  const cards = OPENING_WORLDS.flatMap((world,worldIndex) => world.islands.map((island,islandIndex) => ({world,worldIndex,island,islandIndex})));
  let matchStyle = localStorage.getItem('cq-opening-match-style') || '';
  let activeIndex = initialCardIndex();
  let pointerStart = null;

  function escapeText(value){return String(value == null ? '' : value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
  function lessonName(key){return BASE_NAMES[key] || (window.OPENING_EXTRA_ROWS && OPENING_EXTRA_ROWS[key]?.[0]) || key.replaceAll('_',' ');}
  function lessonCompleted(key){
    return typeof isOpeningLessonCompleted === 'function'
      ? isOpeningLessonCompleted(key)
      : !!mastered[key];
  }
  function worldComplete(world){return world.islands.every(island=>island.lessons.every(lessonCompleted));}
  function worldUnlocked(index){return index===0 || worldComplete(OPENING_WORLDS[index-1]);}
  function islandComplete(card){return card.island.lessons.every(lessonCompleted);}
  function islandUnlocked(card){return worldUnlocked(card.worldIndex) && (card.islandIndex===0 || card.world.islands[card.islandIndex-1].lessons.every(lessonCompleted));}
  function completedLessons(card){return card.island.lessons.filter(lessonCompleted).length;}
  function firstAvailableLesson(card){return card.island.lessons.find(key=>!lessonCompleted(key)) || card.island.lessons[0];}
  function cardHref(card){const key=firstAvailableLesson(card);return `openings.html?opening=${encodeURIComponent(key)}&world=${encodeURIComponent(card.world.id)}&island=${encodeURIComponent(card.island.id)}`;}
  function difficulty(worldIndex){return worldIndex<2?'Débutant':worldIndex<5?'Intermédiaire':worldIndex<8?'Avancé':'Expert';}
  function scoreFor(card){
    if(!matchStyle) return 82;
    const preferred=STYLE_WORLDS[matchStyle]||[];
    const rank=preferred.indexOf(card.world.id);
    if(rank===0) return 98;
    if(rank>0) return Math.max(78,94-rank*5);
    return 58+((card.worldIndex*7+card.islandIndex*3)%16);
  }
  function illustrationFor(card){
    const bespoke={
      italienne:'assets/images/openings/italian-swipe-card-v1.png',
      gambit_dame:'assets/images/openings/queen-gambit-swipe-card-v1.png',
      francaise:'assets/images/openings/french-defense-swipe-card-v1.png',
      sicilienne:'assets/images/openings/sicilian-defense-swipe-card-v1.png',
      carokann:'assets/images/openings/caro-kann-swipe-card-v1.png',
      aventures:'assets/images/openings/rare-openings-swipe-card-v1.png'
    };
    if(card.worldIndex===0 && bespoke[card.island.id]) return bespoke[card.island.id];
    return card.world.background;
  }
  function initialCardIndex(){
    const query=new URLSearchParams(location.search);
    const requestedWorld=query.get('world');
    const requestedIsland=query.get('island');
    const requested=cards.findIndex(card=>(!requestedWorld||card.world.id===requestedWorld)&&(!requestedIsland||card.island.id===requestedIsland));
    if(requested>=0&&(requestedWorld||requestedIsland)) return requested;
    const saved=Number(localStorage.getItem('cq-opening-card-index'));
    if(Number.isFinite(saved)&&saved>=0&&saved<cards.length) return saved;
    const next=cards.findIndex(card=>islandUnlocked(card)&&!islandComplete(card));
    return next<0?0:next;
  }
  function routeMarkup(card){
    const keys=card.island.lessons.slice(0,4);
    const firstIncomplete=keys.findIndex(key=>!lessonCompleted(key));
    return keys.map((key,index)=>{
      const complete=lessonCompleted(key);
      const current=!complete&&islandUnlocked(card)&&(firstIncomplete===index);
      const locked=!complete&&!current;
      return `<span class="opening-route-node ${complete?'complete':current?'current':locked?'locked':''}"><img src="assets/chesspieces/${PIECES[index%PIECES.length]}.png" alt=""><small>${escapeText(lessonName(key).split('—').pop().trim())}</small></span>`;
    }).join('');
  }
  function renderCards(){
    deck.innerHTML=cards.map((card,index)=>{
      const unlocked=islandUnlocked(card);
      const done=islandComplete(card);
      const complete=completedLessons(card);
      const description=card.world.subtitle;
      return `<article class="opening-card ${unlocked?'':'locked'}" data-index="${index}" aria-label="${escapeText(card.island.title)}" style="background-image:url('${illustrationFor(card)}')">
        <div class="opening-card-badge"><span>MONDE ${card.world.number} · ${escapeText(card.world.shortTitle)}</span><b>${difficulty(card.worldIndex)}</b></div>
        <span class="opening-card-match">${scoreFor(card)}% match</span>
        <div class="opening-card-title"><small>${done?'MAÎTRISÉE':unlocked?'À DÉCOUVRIR':'VERROUILLÉE'}</small><h3>${escapeText(card.island.title)}</h3><p>${escapeText(description)}</p></div>
        <div class="opening-card-route">${routeMarkup(card)}</div>
      </article>`;
    }).join('');
    updateDeck(false);
  }
  function updateDeck(animate=true){
    const card=cards[activeIndex];
    deck.querySelectorAll('.opening-card').forEach((element,index)=>{
      const offset=index-activeIndex;
      const distance=Math.abs(offset);
      element.style.setProperty('--card-offset',String(Math.max(-2,Math.min(2,offset))));
      element.style.setProperty('--card-scale',distance===0?'1':distance===1?'.92':'.86');
      element.style.setProperty('--card-opacity',distance===0?'1':distance===1?'.58':'0');
      element.classList.toggle('active',distance===0);
      element.classList.toggle('near',distance===1);
      element.classList.toggle('far',distance>1);
      if(!animate) element.style.transition='none'; else element.style.removeProperty('transition');
    });
    requestAnimationFrame(()=>deck.querySelectorAll('.opening-card').forEach(element=>element.style.removeProperty('transition')));
    localStorage.setItem('cq-opening-card-index',String(activeIndex));
    document.getElementById('opening-card-prev').disabled=activeIndex===0;
    document.getElementById('opening-card-next').disabled=activeIndex===cards.length-1;
    document.getElementById('opening-deck-dots').innerHTML=`<span>${activeIndex+1} / ${cards.length}</span>`;
    const complete=completedLessons(card);
    const total=card.island.lessons.length;
    const unlocked=islandUnlocked(card);
    const done=islandComplete(card);
    document.getElementById('opening-selection-kicker').textContent=`MONDE ${card.world.number} · ${card.world.shortTitle.toUpperCase()}`;
    document.getElementById('opening-selection-title').textContent=card.island.title;
    document.getElementById('opening-selection-description').textContent=card.world.subtitle;
    document.getElementById('opening-selection-progress-label').textContent=`${complete} / ${total} terminée${total>1?'s':''}`;
    document.getElementById('opening-selection-progress-fill').style.width=`${total?complete/total*100:0}%`;
    document.getElementById('opening-selection-match').textContent=matchStyle?`${scoreFor(card)}% · ${STYLE_LABELS[matchStyle]}`:'Découverte conseillée';
    const primary=document.getElementById('opening-swipe-primary');
    primary.disabled=!unlocked;
    document.getElementById('opening-primary-label').textContent=!unlocked?'Ouverture verrouillée':done?'Revoir l’ouverture':complete?'Continuer l’ouverture':'Commencer l’ouverture';
    document.getElementById('opening-primary-subtitle').textContent=!unlocked?'Termine la famille précédente':lessonName(firstAvailableLesson(card));
    document.getElementById('opening-coach-copy').textContent=!unlocked
      ? `Celle-ci est verrouillée. Oui, même mon charme royal a ses limites.`
      : done
        ? `${card.island.title} est terminée. Tu peux la revoir pour viser une maîtrise parfaite.`
        : matchStyle&&scoreFor(card)>=90
          ? `${scoreFor(card)}% de compatibilité. Cette ouverture partage visiblement tes mauvaises intentions.`
          : `Découvre ${card.island.title}. ${complete}/${total} leçons terminées.`;
  }
  function move(delta){
    const next=Math.max(0,Math.min(cards.length-1,activeIndex+delta));
    if(next===activeIndex) return;
    activeIndex=next; updateDeck();
  }
  function openMatch(){
    document.getElementById('opening-match-backdrop').classList.remove('hidden');
    document.getElementById('opening-match-modal').classList.remove('hidden');
    document.querySelectorAll('[data-style]').forEach(button=>button.classList.toggle('selected',button.dataset.style===matchStyle));
  }
  function closeMatch(){document.getElementById('opening-match-backdrop').classList.add('hidden');document.getElementById('opening-match-modal').classList.add('hidden');}
  function selectStyle(style){
    matchStyle=style; localStorage.setItem('cq-opening-match-style',style);
    document.getElementById('opening-match-score').textContent=STYLE_LABELS[style];
    document.getElementById('opening-coach-copy').textContent=COACH_LINES[style];
    renderCards();
    const candidates=cards.map((card,index)=>({card,index,score:scoreFor(card)}));
    candidates.sort((a,b)=>b.score-a.score);
    if(candidates[0]) activeIndex=candidates[0].index;
    updateDeck(); closeMatch();
    if(typeof showToast==='function') showToast('Match trouvé',`${cards[activeIndex].island.title} correspond à ton style ${STYLE_LABELS[style].toLowerCase()}${islandUnlocked(cards[activeIndex])?'':' — poursuis le parcours pour la débloquer'}.`);
  }

  document.getElementById('opening-card-prev').onclick=()=>move(-1);
  document.getElementById('opening-card-next').onclick=()=>move(1);
  document.getElementById('opening-swipe-primary').onclick=()=>{const card=cards[activeIndex];if(islandUnlocked(card)) location.href=cardHref(card);};
  document.getElementById('opening-match-button').onclick=openMatch;
  document.getElementById('opening-match-sheet-button').onclick=openMatch;
  document.getElementById('opening-match-close').onclick=closeMatch;
  document.getElementById('opening-match-backdrop').onclick=closeMatch;
  document.querySelectorAll('[data-style]').forEach(button=>button.onclick=()=>selectStyle(button.dataset.style));
  const menu=document.getElementById('opening-swipe-menu');
  const sheet=document.getElementById('opening-swipe-sheet');
  menu.onclick=()=>{const open=sheet.classList.toggle('hidden')===false;menu.setAttribute('aria-expanded',String(open));};
  deck.addEventListener('pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId};deck.setPointerCapture?.(event.pointerId);deck.classList.add('dragging');});
  deck.addEventListener('pointerup',event=>{if(!pointerStart)return;const dx=event.clientX-pointerStart.x;const dy=event.clientY-pointerStart.y;pointerStart=null;deck.classList.remove('dragging');if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){move(dx<0?1:-1);}});
  deck.addEventListener('pointercancel',()=>{pointerStart=null;deck.classList.remove('dragging');});
  document.addEventListener('keydown',event=>{if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1);if(event.key==='Escape'){closeMatch();sheet.classList.add('hidden');}});

  document.getElementById('opening-match-score').textContent=matchStyle?STYLE_LABELS[matchStyle]:'Match';
  renderCards();

  /* Safari restaure souvent la carte depuis son back/forward cache. Recharge
     alors la progression écrite par la leçon, sinon la carte peut continuer à
     croire que l'Italienne n'est pas terminée et relancer la même ligne. */
  function refreshOpeningProgress(){
    if(typeof loadProgress === 'function') PROGRESS = loadProgress();
    renderCards();
  }
  window.addEventListener('pageshow', refreshOpeningProgress);
  window.addEventListener('storage', event=>{if(event.key==='chessQuestProgress') refreshOpeningProgress();});
})();

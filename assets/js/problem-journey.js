(() => {
  const TOTAL_LEVELS = 40;
  const LEVELS_PER_WORLD = 20;
  const CELL = 88;
  const GRID_SIZE = 46;
  const BOARD_HEIGHT = 3540;
  const WORLD_TWO_ROW = 19;
  const PATH_WORLD_1 = [
    [1,31,29],[2,30,29],[3,29,29],[4,28,29],[5,27,29],[6,27,28],[7,27,27],[8,27,26],[9,27,25],[10,26,25],
    [11,25,25],[12,24,25],[13,23,25],[14,23,24],[15,23,23],[16,23,22],[17,23,21],[18,22,21],[19,21,21],[20,20,21]
  ];
  const PATH_WORLD_2 = [
    [21,20,18],[22,19,18],[23,18,18],[24,17,18],[25,16,18],[26,16,17],[27,16,16],[28,16,15],[29,16,14],[30,15,14],
    [31,14,14],[32,13,14],[33,12,14],[34,12,13],[35,12,12],[36,12,11],[37,12,10],[38,11,10],[39,10,10],[40,9,10]
  ];
  const PATH = [...PATH_WORLD_1, ...PATH_WORLD_2];
  const pathByLevel = new Map(PATH.map(entry => [entry[0], entry]));
  const occupied = new Set(PATH.map(([,col,row]) => `${col},${row}`));
  const world = document.getElementById('problem-world');
  const board = document.getElementById('problem-board');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentLevel = 1;
  let coordinateFor = () => ({x:0,y:0});

  const PAWN = `<svg viewBox="0 0 48 64" aria-hidden="true"><ellipse cx="24" cy="60" rx="16" ry="3.5" fill="#153f22" opacity=".42"/><path d="M10 50c0-2 2-4 6-5.5V42c-5 1-8 3.5-8 7.5 0 2 1.5 3.5 4 4h24c2.5-.5 4-2 4-4 0-4-3-6.5-8-7.5v2.5c4 1.5 6 3.5 6 5.5" fill="#267b39"/><path d="M16 44.5v-6c0-1.5.5-2.5 2-3h12c1.5.5 2 1.5 2 3v6" fill="#3daf50"/><path d="M18 38c-3-2-4-5-4-8 0-5.5 4.5-10 10-10s10 4.5 10 10c0 3-1 6-4 8" fill="#3daf50"/><circle cx="24" cy="22" r="9" fill="#4caf56"/><circle cx="24" cy="20.5" r="7" fill="#6bc96f"/><ellipse cx="24" cy="18" rx="3.5" ry="2" fill="rgba(255,255,255,.3)"/><path d="M20 38h8v3h-8z" fill="#267b39"/></svg>`;

  function dailySolvedCount(){
    return PROGRESS.dailyPuzzleRun?.date === todayKey() ? Math.min(3,(PROGRESS.dailyPuzzleRun.solvedIds || []).length) : 0;
  }

  function synchronizeJourney(){
    const journey = PROGRESS.problemJourney || (PROGRESS.problemJourney = {level:1,lastAdvancedDate:null});
    journey.level = Math.max(1,Math.min(TOTAL_LEVELS,Number(journey.level)||1));
    const from = journey.level;
    let animateFrom = null;
    if(dailySolvedCount() >= 3 && journey.lastAdvancedDate !== todayKey()){
      journey.lastAdvancedDate = todayKey();
      if(journey.level < TOTAL_LEVELS){
        animateFrom = journey.level;
        journey.level += 1;
      }
      saveProgress();
    }
    currentLevel = journey.level;
    return animateFrom === null ? null : {from,to:currentLevel};
  }

  function makeFloor(width){
    const cx = width/2, cy = BOARD_HEIGHT/2;
    const startX = cx - GRID_SIZE*CELL/2;
    const startY = cy - GRID_SIZE*CELL/2;
    const cos = Math.SQRT1_2;
    coordinateFor = (col,row) => {
      const ux=startX+col*CELL+CELL/2, uy=startY+row*CELL+CELL/2;
      const dx=ux-cx,dy=uy-cy;
      return {x:cx+dx*cos-dy*cos,y:cy+dx*cos+dy*cos-5};
    };
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('problem-floor');svg.setAttribute('width',width);svg.setAttribute('height',BOARD_HEIGHT);svg.setAttribute('viewBox',`0 0 ${width} ${BOARD_HEIGHT}`);
    const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('transform',`rotate(45 ${cx} ${cy})`);
    for(let row=5;row<=34;row++) for(let col=3;col<=38;col++){
      const dark=(col+row)%2===0,isWorldTwo=row<=WORLD_TWO_ROW;
      const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x',startX+col*CELL);rect.setAttribute('y',startY+row*CELL);rect.setAttribute('width',CELL);rect.setAttribute('height',CELL);
      rect.setAttribute('fill',isWorldTwo?(dark?'#394554':'#526273'):(dark?'#2d6b4a':'#3e8b5d'));
      rect.setAttribute('stroke',isWorldTwo?'rgba(183,210,225,.09)':'rgba(198,238,190,.08)');rect.setAttribute('stroke-width','1');group.appendChild(rect);
    }
    svg.appendChild(group);board.appendChild(svg);
  }

  function addBanner(col,row,title,subtitle){
    const p=coordinateFor(col,row),el=document.createElement('div');el.className='problem-world-banner';el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;el.innerHTML=`<strong>${title}</strong><small>${subtitle}</small>`;board.appendChild(el);
  }

  function addDecor(col,row,markup,scale=1,className=''){
    if(occupied.has(`${col},${row}`)) return;
    const p=coordinateFor(col,row),el=document.createElement('div');el.className=`problem-decor ${className}`.trim();el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;el.style.setProperty('--decor-scale',scale);el.style.transform=`translate(-50%,-78%) scale(${scale})`;el.innerHTML=markup;board.appendChild(el);
  }

  function treeSVG(color='#3a8a48',light='#55aa5f'){
    return `<svg width="88" height="112" viewBox="0 0 88 112"><ellipse cx="44" cy="102" rx="25" ry="7" fill="rgba(0,0,0,.18)"/><path d="M38 58h13l5 40H32z" fill="#71451f"/><path d="M42 61l-8 31M47 61l7 31" stroke="#573316" stroke-width="2"/><circle cx="43" cy="33" r="27" fill="${color}"/><circle cx="24" cy="48" r="19" fill="${light}"/><circle cx="62" cy="47" r="18" fill="#2d773c"/><circle cx="44" cy="19" r="17" fill="#63b96a"/><circle cx="33" cy="27" r="7" fill="rgba(255,255,255,.12)"/></svg>`;
  }
  function houseSVG(){return `<svg width="144" height="150" viewBox="0 0 144 150"><ellipse cx="72" cy="140" rx="52" ry="10" fill="rgba(0,0,0,.2)"/><rect x="27" y="76" width="91" height="61" rx="5" fill="#d2a260"/><path d="M16 80 72 22l58 58z" fill="#884426" stroke="#63301c" stroke-width="4"/><path d="m25 74 47-44 48 44" fill="none" stroke="#ad6334" stroke-width="7"/><rect x="99" y="31" width="16" height="31" rx="2" fill="#8c8b85"/><g class="problem-smoke"><circle cx="108" cy="24" r="7" fill="#fff" opacity=".5"/></g><g class="problem-smoke"><circle cx="113" cy="15" r="8" fill="#fff" opacity=".35"/></g><rect x="56" y="98" width="27" height="39" rx="3" fill="#59371e"/><circle cx="76" cy="118" r="2.5" fill="#efca68"/><rect x="94" y="98" width="18" height="18" rx="3" fill="#ffe084" stroke="#67401d" stroke-width="3"/><path d="M103 99v16M95 107h16" stroke="#8b5728" stroke-width="2"/><circle cx="30" cy="130" r="13" fill="#3a8a48"/></svg>`}
  function pondSVG(){return `<svg width="126" height="76" viewBox="0 0 126 76"><ellipse cx="63" cy="43" rx="59" ry="29" fill="#246f8d"/><ellipse cx="63" cy="39" rx="51" ry="23" fill="#45b4d0"/><ellipse cx="42" cy="31" rx="17" ry="7" fill="#a3e5ee" opacity=".3"/><ellipse cx="42" cy="50" rx="12" ry="6" fill="#58a950"/><ellipse cx="78" cy="52" rx="10" ry="5" fill="#58a950"/><circle cx="40" cy="47" r="4" fill="#ef8398"/><path d="M106 29q8-12 15 0-8 7-15 0" fill="#68bc58"/></svg>`}
  function benchSVG(){return `<svg width="120" height="70" viewBox="0 0 120 70"><ellipse cx="60" cy="62" rx="47" ry="6" fill="rgba(0,0,0,.16)"/><rect x="14" y="27" width="92" height="12" rx="3" fill="#ce8d42"/><rect x="17" y="18" width="86" height="8" rx="3" fill="#e0a453"/><path d="M25 38v20M94 38v20M23 15v26M97 15v26" stroke="#784719" stroke-width="7"/><rect x="48" y="25" width="24" height="15" fill="#eee1b9"/><path d="M48 30h24M48 35h24M54 25v15M60 25v15M66 25v15" stroke="#467147" stroke-width="1"/></svg>`}
  function bushSVG(color='#3b8d48'){return `<svg width="68" height="44" viewBox="0 0 68 44"><ellipse cx="34" cy="34" rx="31" ry="9" fill="rgba(0,0,0,.14)"/><circle cx="20" cy="25" r="16" fill="${color}"/><circle cx="45" cy="23" r="18" fill="#4da358"/><circle cx="34" cy="14" r="14" fill="#5bb565"/></svg>`}
  function flowersSVG(){return `<svg width="62" height="34" viewBox="0 0 62 34"><path d="M14 31V16M34 31V12M50 31V19" stroke="#397c42" stroke-width="2"/><g fill="#ffd564"><circle cx="14" cy="13" r="6"/><circle cx="34" cy="9" r="6"/></g><circle cx="50" cy="16" r="6" fill="#e98aa4"/><g fill="#fff8d8"><circle cx="14" cy="13" r="2"/><circle cx="34" cy="9" r="2"/><circle cx="50" cy="16" r="2"/></g></svg>`}
  function pineSVG(){return `<svg width="84" height="122" viewBox="0 0 84 122"><ellipse cx="42" cy="113" rx="25" ry="7" fill="rgba(0,0,0,.22)"/><rect x="37" y="75" width="11" height="34" fill="#614329"/><path d="m42 5-27 43h15L10 76h24L17 99h51L49 76h24L54 48h15z" fill="#315d58" stroke="#89a89c" stroke-width="2"/><path d="m42 12-19 33h12L20 70h20" fill="#466f65"/></svg>`}
  function towerSVG(){return `<svg width="126" height="154" viewBox="0 0 126 154"><ellipse cx="63" cy="144" rx="50" ry="9" fill="rgba(0,0,0,.25)"/><path d="M31 57h64v82H31z" fill="#6e7480" stroke="#303641" stroke-width="4"/><path d="M22 58V38h14v11h18V36h18v13h18V38h14v20z" fill="#59616e" stroke="#303641" stroke-width="4"/><path d="m43 139 5-33h30l5 33" fill="#313945"/><rect x="53" y="75" width="20" height="26" rx="10" fill="#8cd7ea" class="problem-decor-glow"/><path d="M31 78h64M31 104h64" stroke="#858b95" stroke-width="3"/></svg>`}
  function crystalSVG(){return `<svg class="problem-decor-glow" width="74" height="84" viewBox="0 0 74 84"><ellipse cx="37" cy="76" rx="28" ry="7" fill="rgba(0,0,0,.25)"/><path d="m37 4 18 25-7 42H26l-8-42z" fill="#7fd8e8" stroke="#d6fbff" stroke-width="3"/><path d="m37 4-3 67M18 29l16 12 21-12M26 71l8-30 14 30" fill="none" stroke="#4a92b4" stroke-width="2"/></svg>`}
  function campSVG(){return `<svg width="92" height="74" viewBox="0 0 92 74"><ellipse cx="46" cy="65" rx="34" ry="7" fill="rgba(0,0,0,.22)"/><circle cx="46" cy="55" r="24" fill="#707985"/><circle cx="46" cy="55" r="17" fill="#26303a"/><path d="M35 60 59 43M34 44l25 16" stroke="#885128" stroke-width="6"/><path d="M46 52c-15-11 3-18 1-31 18 14 15 29-1 35-5 0-7-2-7-6 1-5 6-8 7-13 5 6 4 11 0 15z" fill="#ffb52f"/><path d="M47 51c-6-6 1-10 1-17 7 7 7 14-1 18" fill="#fff083"/></svg>`}

  function addDecorations(){
    addDecor(28,28,houseSVG(),1.05,'landmark');addDecor(28,31,benchSVG(),.92);addDecor(21,23,pondSVG(),.92,'flat');
    [[31,27,1],[33,30,.82],[19,22,.78],[25,27,.72]].forEach(([c,r,s])=>addDecor(c,r,treeSVG(),s));
    [[29,26,.8],[24,26,.74],[26,24,.7],[30,30,.68]].forEach(([c,r,s])=>addDecor(c,r,bushSVG(),s));
    [[30,28,.75],[26,26,.7],[22,22,.64],[24,24,.62]].forEach(([c,r,s])=>addDecor(c,r,flowersSVG(),s));
    addDecor(17,15,towerSVG(),.86,'landmark world-two');addDecor(11,12,towerSVG(),.7,'landmark world-two');addDecor(17,17,campSVG(),.76,'world-two');
    [[18,17,.74],[14,12,.65],[13,11,.68],[13,15,.66],[10,11,.6]].forEach(([c,r,s])=>addDecor(c,r,pineSVG(),s,'world-two'));
    [[18,16,.68],[14,13,.6],[11,13,.64],[11,9,.54]].forEach(([c,r,s])=>addDecor(c,r,crystalSVG(),s,'world-two'));
    [[17,18,.61],[14,15,.56],[10,12,.53]].forEach(([c,r,s])=>addDecor(c,r,bushSVG('#405f5d'),s,'world-two'));
  }

  function createPad(level,col,row){
    const p=coordinateFor(col,row),button=document.createElement('button');button.type='button';button.className='problem-pad';button.dataset.level=level;button.style.left=`${p.x}px`;button.style.top=`${p.y}px`;
    if(level<currentLevel){button.classList.add('done');button.innerHTML='<svg viewBox="0 0 24 24"><path d="m4 12 6 6L20 6"/></svg>';button.setAttribute('aria-label',`Socle ${level} terminé`)}
    else{button.classList.add(level===currentLevel?'current':'locked');button.innerHTML=`<span>${level}</span>`;button.setAttribute('aria-label',level===currentLevel?`Socle actuel ${level}`:`Socle ${level} verrouillé`)}
    button.disabled=level>currentLevel;
    button.addEventListener('click',()=>{
      if(level===currentLevel){
        if(dailySolvedCount()>=3) showCoach('Tu as déjà gagné ton socle aujourd’hui. Reviens demain, champion impatient.');
        else location.href='puzzles.html?source=daily';
      }else if(level<currentLevel) location.href='puzzles.html?source=random';
    });
    board.appendChild(button);
  }

  function placePawn(level){
    const [,col,row]=pathByLevel.get(level),p=coordinateFor(col,row),pawn=document.createElement('div');pawn.id='problem-pawn';pawn.className='problem-pawn';pawn.style.left=`${p.x}px`;pawn.style.top=`${p.y}px`;pawn.innerHTML=PAWN;board.appendChild(pawn);
    const avatar=document.createElement('div');avatar.className='problem-avatar';avatar.style.left=`${p.x+50}px`;avatar.style.top=`${p.y+7}px`;avatar.innerHTML='<img src="assets/icons/chessquest-app-icon.png" alt="">';board.appendChild(avatar);
    return pawn;
  }

  function updateHud(){
    const worldNumber=Math.ceil(currentLevel/LEVELS_PER_WORLD),within=((currentLevel-1)%LEVELS_PER_WORLD)+1,solved=dailySolvedCount();
    document.getElementById('problem-level').textContent=currentLevel;
    document.getElementById('problem-subtitle').textContent=`${worldNumber===1?'Jardin des tactiques':'Citadelle du calcul'} · Monde ${worldNumber}`;
    document.getElementById('problem-rating').textContent=PROGRESS.puzzleRating||1000;
    document.getElementById('problem-score').textContent=`Socle ${currentLevel}`;
    document.getElementById('problem-step-label').textContent=`Monde ${worldNumber} · ${within} / 20`;
    document.getElementById('problem-progress-fill').style.width=`${Math.round((within-1)/19*100)}%`;
    const dailyLink=document.getElementById('problem-daily-link'),state=document.getElementById('problem-daily-state');
    state.textContent=solved>=3?'3 / 3 · nouveau socle gagné':`${solved} / 3 · ${solved?'continue l’aventure':'récompense disponible'}`;
    dailyLink.classList.toggle('complete',solved>=3);
    dailyLink.addEventListener('click',event=>{if(solved>=3){event.preventDefault();showCoach('C’est fini pour aujourd’hui. Même les génies ont besoin de dormir.')}});
  }

  function scrollToLevel(level,behavior='smooth'){
    const entry=pathByLevel.get(level);if(!entry)return;const p=coordinateFor(entry[1],entry[2]);world.scrollTo({top:Math.max(0,p.y-world.clientHeight*.62),behavior});
  }
  function showCoach(text){const coach=document.getElementById('problem-journey-coach');document.getElementById('problem-journey-copy').textContent=text;coach.classList.remove('hidden')}
  function animatePawn({from,to}){
    const pawn=document.getElementById('problem-pawn'),fromEntry=pathByLevel.get(from),toEntry=pathByLevel.get(to);if(!pawn||!fromEntry||!toEntry)return;
    const start=coordinateFor(fromEntry[1],fromEntry[2]),end=coordinateFor(toEntry[1],toEntry[2]);pawn.style.left=`${start.x}px`;pawn.style.top=`${start.y}px`;scrollToLevel(from,'auto');
    setTimeout(()=>{
      if(reduceMotion){pawn.style.left=`${end.x}px`;pawn.style.top=`${end.y}px`}else pawn.animate([
        {left:`${start.x}px`,top:`${start.y}px`,transform:'translate(-50%,-82%) scale(1)'},
        {left:`${(start.x+end.x)/2}px`,top:`${(start.y+end.y)/2-58}px`,transform:'translate(-50%,-82%) scale(1.14) rotate(-5deg)',offset:.52},
        {left:`${end.x}px`,top:`${end.y}px`,transform:'translate(-50%,-82%) scale(1)'}
      ],{duration:1050,easing:'cubic-bezier(.2,.72,.28,1)',fill:'forwards'}).onfinish=()=>{pawn.style.left=`${end.x}px`;pawn.style.top=`${end.y}px`};
      const toast=document.getElementById('problem-level-toast');toast.textContent=to===21?'Monde 2 débloqué !':'Socle suivant débloqué !';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200);setTimeout(()=>scrollToLevel(to),650);
    },350);
  }

  function build(animation){
    const width=world.clientWidth||innerWidth||390;board.style.height=`${BOARD_HEIGHT}px`;board.innerHTML='';makeFloor(width);
    addBanner(31,31,'Monde 1 · Jardin des tactiques','Socles 1 à 20');addBanner(19,19,'Monde 2 · Citadelle du calcul','Socles 21 à 40');
    addDecorations();PATH.forEach(entry=>createPad(...entry));placePawn(currentLevel);updateHud();
    requestAnimationFrame(()=>animation?animatePawn(animation):scrollToLevel(currentLevel,'auto'));
  }

  const advancement=synchronizeJourney();
  document.getElementById('problem-menu-button').addEventListener('click',()=>{const menu=document.getElementById('problem-journey-menu'),open=menu.classList.toggle('hidden')===false;document.getElementById('problem-menu-button').setAttribute('aria-expanded',String(open))});
  document.querySelector('.problem-journey-coach button').addEventListener('click',()=>document.getElementById('problem-journey-coach').classList.add('hidden'));
  document.getElementById('problem-scroll-current').addEventListener('click',()=>scrollToLevel(currentLevel));
  let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>build(null),140)});
  build(advancement);
})();

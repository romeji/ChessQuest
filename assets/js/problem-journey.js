(() => {
  const LEVELS_PER_WORLD = 20;
  const TOTAL_WORLDS = 9;
  const TOTAL_LEVELS = LEVELS_PER_WORLD * TOTAL_WORLDS;
  const TILE = 62;
  const WORLD_ROWS = 23;
  const WORLD_HEIGHT = WORLD_ROWS * TILE;
  const BOARD_TOP_SPACE = 420;
  const BOARD_HEIGHT = WORLD_HEIGHT * TOTAL_WORLDS + BOARD_TOP_SPACE;
  const PATH_X = [2,1,0,-1,-2,-1,0,1,2,1,0,-1,-2,-1,0,1,2,1,0,-1];
  const WORLD_THEMES = [
    {name:'Jardin des tactiques', dark:'#2d6b4a', light:'#3e8b5d', line:'#8bc78d'},
    {name:'Citadelle du calcul', dark:'#394554', light:'#526273', line:'#9cb9c7'},
    {name:'Forêt enchantée', dark:'#805633', light:'#bd8550', line:'#e1bd7e'},
    {name:'Archipel azur', dark:'#4387aa', light:'#78bfd7', line:'#c1ebf5'},
    {name:'Royaume arcanique', dark:'#553778', light:'#8060a4', line:'#c6a8e2'},
    {name:'Volcans de braise', dark:'#87332f', light:'#c65349', line:'#ef9d83'},
    {name:'Désert royal', dark:'#d08323', light:'#efb943', line:'#ffe096'},
    {name:'Royaume des glaces', dark:'#3585aa', light:'#72c3df', line:'#c8f1fa'},
    {name:'Cité d’or ultime', dark:'#a67b15', light:'#dfbf3e', line:'#fff0a0'}
  ];
  const PATH = Array.from({length:TOTAL_LEVELS}, (_,index) => {
    const worldNumber = Math.floor(index / LEVELS_PER_WORLD) + 1;
    const within = index % LEVELS_PER_WORLD;
    return [index + 1, worldNumber, PATH_X[within], within + 3];
  });
  const pathByLevel = new Map(PATH.map(entry => [entry[0], entry]));
  const occupied = new Set(PATH.map(([,worldNumber,x,row]) => `${worldNumber},${x},${row}`));
  const world = document.getElementById('problem-world');
  const board = document.getElementById('problem-board');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentLevel = 1;
  let boardWidth = 390;

  const PAWN = '<img src="assets/images/problem-worlds/player-pawn-3d.png" alt="Pion actuel">';
  const PORTRAIT_SPRITE_SHEETS = new Set([1,2,3,4,6]);

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
      if(journey.level < TOTAL_LEVELS){ animateFrom = journey.level; journey.level += 1; }
      saveProgress();
    }
    currentLevel = journey.level;
    return animateFrom === null ? null : {from,to:currentLevel};
  }

  function worldBottom(worldNumber){ return BOARD_HEIGHT - (worldNumber - 1) * WORLD_HEIGHT; }
  function coordinateFor(worldNumber,xSlot,rowFromBottom){
    /* Le tracé horizontal est identique dans chaque monde. Une rangée est
       récupérée à chaque transition afin de reproduire sans dérive le raccord
       exact entre les mondes 1 et 2 fourni dans la maquette d'origine. */
    const continuationRow = worldNumber - 1;
    return {
      x:boardWidth / 2 + xSlot * TILE,
      y:worldBottom(worldNumber) - (rowFromBottom - continuationRow) * TILE
    };
  }

  function makeFloor(width){
    boardWidth = width;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('problem-floor');
    svg.setAttribute('width',width); svg.setAttribute('height',BOARD_HEIGHT); svg.setAttribute('viewBox',`0 0 ${width} ${BOARD_HEIGHT}`);
    const backdrop=document.createElementNS('http://www.w3.org/2000/svg','rect');
    backdrop.setAttribute('width',width); backdrop.setAttribute('height',BOARD_HEIGHT); backdrop.setAttribute('fill',WORLD_THEMES[TOTAL_WORLDS-1].dark); svg.appendChild(backdrop);
    const totalRows=TOTAL_WORLDS*WORLD_ROWS+Math.ceil(BOARD_TOP_SPACE/TILE)+2;
    for(let row=0;row<=totalRows;row++){
      const worldIndex=Math.min(TOTAL_WORLDS-1,Math.floor(row/WORLD_ROWS));
      const theme=WORLD_THEMES[worldIndex];
      for(let col=-3;col<=3;col++){
        const xSlot=col*2+((row+1)%2),cx=width/2+xSlot*TILE,cy=BOARD_HEIGHT-row*TILE;
        const tile=document.createElementNS('http://www.w3.org/2000/svg','polygon');
        tile.setAttribute('points',`${cx},${cy-TILE} ${cx+TILE},${cy} ${cx},${cy+TILE} ${cx-TILE},${cy}`);
        tile.setAttribute('fill',row%2===0?theme.dark:theme.light);
        tile.setAttribute('stroke',theme.line); tile.setAttribute('stroke-opacity','.1'); tile.setAttribute('stroke-width','1');
        svg.appendChild(tile);
      }
    }
    board.appendChild(svg);
  }

  function addBanner(worldNumber){
    const theme=WORLD_THEMES[worldNumber-1],el=document.createElement('div');
    el.className=`problem-world-banner world-${worldNumber}`; el.style.left=`${boardWidth/2}px`; el.style.top=`${worldBottom(worldNumber)-WORLD_HEIGHT-55}px`;
    const first=(worldNumber-1)*LEVELS_PER_WORLD+1,last=worldNumber*LEVELS_PER_WORLD;
    el.innerHTML=`<strong>Monde ${worldNumber} · ${theme.name}</strong><small>Socles ${first} à ${last}</small>`; board.appendChild(el);
  }

  function addDecor(worldNumber,x,row,markup,scale=1,className=''){
    if(occupied.has(`${worldNumber},${x},${row}`)) return;
    const p=coordinateFor(worldNumber,x,row),el=document.createElement('div');
    el.className=`problem-decor world-${worldNumber} ${className}`.trim(); el.style.left=`${p.x}px`; el.style.top=`${p.y}px`;
    el.style.setProperty('--decor-scale',scale); el.style.transform=`translate(-50%,-78%) scale(${scale})`; el.innerHTML=markup; board.appendChild(el);
  }


  function sprite(worldNumber,index,label){
    const shapeClass=PORTRAIT_SPRITE_SHEETS.has(worldNumber)?'portrait-sheet':'square-sheet';
    return `<span class="problem-sprite sprite-${index} ${shapeClass}" style="--sprite-image:url('../images/problem-worlds/world-${worldNumber}-sprites-3d.png')" role="img" aria-label="${label}"></span>`;
  }

  function addDecorations(){
    const labels=[
      ['Maison du pion','Arbre-tour aux pommes','Étang royal','Banc d’échecs','Topiaire pion','Tour de jardin'],
      ['Tour bleue','Sapin de la citadelle','Cavalier de cristal','Feu de camp royal','Porte verrouillée','Statue du cavalier'],
      ['Arbre enchanté','Échiquier champignon','Maison de la forêt','Cristaux magiques','Fou de pierre','Lanterne royale'],
      ['Voilier royal','Phare-tour','Étang marin','Cavalier des mers','Fontaine pion','Coffre de l’archipel'],
      ['Tour arcanique','Statue de la reine','Portail mystique','Cristaux violets','Bibliothèque royale','Coffre arcanique'],
      ['Volcan-tour','Forteresse d’obsidienne','Lac de lave','Roi d’obsidienne','Cavalier de feu','Pont des brasiers'],
      ['Pyramide-tour','Cactus cavalier','Sphinx cavalier','Oasis échiquéenne','Tour du désert','Coffre des sables'],
      ['Monts de glace','Château de glace','Cavalier gelé','Sapins-pions','Lac échiquier','Coffre glacé'],
      ['Palais doré','Reine d’or','Trône royal','Trésor ultime','Portail couronne','Citadelle finale']
    ];
    const placements=[
      [2.2,7,'landmark'],[-2.2,10,'decor-sway'],[2.2,13,'decor-float'],[-2.2,16,''],[-2.2,19,'decor-sway'],[2.2,22,'landmark']
    ];
    for(let worldNumber=1;worldNumber<=TOTAL_WORLDS;worldNumber++){
      placements.forEach(([x,row,className],index)=>{
        const isFinalPortal=worldNumber===9&&index===4;
        const isElemental=worldNumber===6&&(index===0||index===2)||worldNumber===8&&index===2;
        const effects=`${className}${isFinalPortal?' finale decor-glow':''}${isElemental?' decor-glow':''}`.trim();
        const scale=index===0||index===5?1.02:index===2?.92:.96;
        addDecor(worldNumber,x,row,sprite(worldNumber,index+1,labels[worldNumber-1][index]),scale,effects);
      });
    }
  }

  function createPad(level,worldNumber,x,row){
    const p=coordinateFor(worldNumber,x,row),button=document.createElement('button'); button.type='button'; button.className='problem-pad'; button.dataset.level=level; button.style.left=`${p.x}px`; button.style.top=`${p.y}px`;
    if(level<currentLevel){ button.classList.add('done'); button.innerHTML='<svg viewBox="0 0 24 24"><path d="m4 12 6 6L20 6"/></svg>'; button.setAttribute('aria-label',`Socle ${level} terminé`); }
    else { button.classList.add(level===currentLevel?'current':'locked'); button.innerHTML=`<span>${level}</span>`; button.setAttribute('aria-label',level===currentLevel?`Socle actuel ${level}`:`Socle ${level} verrouillé`); }
    button.disabled=level>currentLevel;
    button.addEventListener('click',()=>{
      if(level===currentLevel){
        if(dailySolvedCount()>=3) showCoach('Tu as déjà gagné ton socle aujourd’hui. Reviens demain, champion impatient.');
        else location.href='puzzles.html?source=daily';
      } else if(level<currentLevel) location.href='puzzles.html?source=random';
    });
    board.appendChild(button);
  }

  function placePawn(level){
    const [,worldNumber,x,row]=pathByLevel.get(level),p=coordinateFor(worldNumber,x,row),pawn=document.createElement('div'); pawn.id='problem-pawn'; pawn.className='problem-pawn'; pawn.style.left=`${p.x}px`; pawn.style.top=`${p.y}px`; pawn.innerHTML=PAWN; board.appendChild(pawn);
    const avatar=document.createElement('div'); avatar.className='problem-avatar'; avatar.style.left=`${p.x+50}px`; avatar.style.top=`${p.y+7}px`; avatar.innerHTML='<img src="assets/icons/chessquest-app-icon.png" alt="">'; board.appendChild(avatar); return pawn;
  }

  function updateHud(){
    const worldNumber=Math.ceil(currentLevel/LEVELS_PER_WORLD),within=((currentLevel-1)%LEVELS_PER_WORLD)+1,solved=dailySolvedCount(),theme=WORLD_THEMES[worldNumber-1];
    document.getElementById('problem-level').textContent=currentLevel;
    document.getElementById('problem-subtitle').textContent=`${theme.name} · Monde ${worldNumber}`;
    document.getElementById('problem-rating').textContent=PROGRESS.puzzleRating||1000;
    document.getElementById('problem-score').textContent=`Socle ${currentLevel}`;
    document.getElementById('problem-step-label').textContent=`Monde ${worldNumber} · ${within} / 20`;
    document.getElementById('problem-progress-fill').style.width=`${Math.round((within-1)/19*100)}%`;
    const dailyLink=document.getElementById('problem-daily-link'),state=document.getElementById('problem-daily-state');
    state.textContent=solved>=3?'3 / 3 · nouveau socle gagné':`${solved} / 3 · ${solved?'continue l’aventure':'récompense disponible'}`;
    dailyLink.classList.toggle('complete',solved>=3);
    dailyLink.addEventListener('click',event=>{if(solved>=3){event.preventDefault();showCoach('C’est fini pour aujourd’hui. Même les génies ont besoin de dormir.');}});
  }

  function scrollToLevel(level,behavior='smooth'){
    const entry=pathByLevel.get(level); if(!entry)return; const p=coordinateFor(entry[1],entry[2],entry[3]); world.scrollTo({top:Math.max(0,p.y-world.clientHeight*.62),behavior});
  }
  function showCoach(text){const coach=document.getElementById('problem-journey-coach');document.getElementById('problem-journey-copy').textContent=text;coach.classList.remove('hidden')}
  function animatePawn({from,to}){
    const pawn=document.getElementById('problem-pawn'),fromEntry=pathByLevel.get(from),toEntry=pathByLevel.get(to); if(!pawn||!fromEntry||!toEntry)return;
    const start=coordinateFor(fromEntry[1],fromEntry[2],fromEntry[3]),end=coordinateFor(toEntry[1],toEntry[2],toEntry[3]); pawn.style.left=`${start.x}px`; pawn.style.top=`${start.y}px`; scrollToLevel(from,'auto');
    setTimeout(()=>{
      if(reduceMotion){pawn.style.left=`${end.x}px`;pawn.style.top=`${end.y}px`;}else pawn.animate([
        {left:`${start.x}px`,top:`${start.y}px`,transform:'translate(-50%,-76%) scale(1)'},
        {left:`${(start.x+end.x)/2}px`,top:`${(start.y+end.y)/2-58}px`,transform:'translate(-50%,-76%) scale(1.14) rotate(-5deg)',offset:.52},
        {left:`${end.x}px`,top:`${end.y}px`,transform:'translate(-50%,-76%) scale(1)'}
      ],{duration:1050,easing:'cubic-bezier(.2,.72,.28,1)',fill:'forwards'}).onfinish=()=>{pawn.style.left=`${end.x}px`;pawn.style.top=`${end.y}px`;};
      const toast=document.getElementById('problem-level-toast'),newWorld=(to-1)%LEVELS_PER_WORLD===0;
      toast.textContent=newWorld?`Monde ${Math.ceil(to/LEVELS_PER_WORLD)} débloqué !`:'Socle suivant débloqué !'; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2200); setTimeout(()=>scrollToLevel(to),650);
    },350);
  }

  function build(animation){
    const width=world.clientWidth||innerWidth||390; board.style.height=`${BOARD_HEIGHT}px`; board.innerHTML=''; makeFloor(width);
    for(let worldNumber=1;worldNumber<=TOTAL_WORLDS;worldNumber++) addBanner(worldNumber);
    addDecorations(); PATH.forEach(entry=>createPad(...entry)); placePawn(currentLevel); updateHud();
    requestAnimationFrame(()=>animation?animatePawn(animation):scrollToLevel(currentLevel,'auto'));
  }

  const advancement=synchronizeJourney();
  document.getElementById('problem-menu-button').addEventListener('click',()=>{const menu=document.getElementById('problem-journey-menu'),open=menu.classList.toggle('hidden')===false;document.getElementById('problem-menu-button').setAttribute('aria-expanded',String(open))});
  document.querySelector('.problem-journey-coach button').addEventListener('click',()=>document.getElementById('problem-journey-coach').classList.add('hidden'));
  document.getElementById('problem-scroll-current').addEventListener('click',()=>scrollToLevel(currentLevel));
  let resizeTimer; addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>build(null),140)});
  build(advancement);
})();

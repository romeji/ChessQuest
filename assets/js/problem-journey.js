(() => {
  const LEVELS_PER_WORLD = 20;
  const TOTAL_WORLDS = 9;
  const TOTAL_LEVELS = LEVELS_PER_WORLD * TOTAL_WORLDS;
  const TILE = 62;
  const WORLD_HEIGHT = 1440;
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
    return {x:boardWidth/2 + xSlot*TILE, y:worldBottom(worldNumber) - rowFromBottom*TILE};
  }

  function makeFloor(width){
    boardWidth = width;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('problem-floor');
    svg.setAttribute('width',width); svg.setAttribute('height',BOARD_HEIGHT); svg.setAttribute('viewBox',`0 0 ${width} ${BOARD_HEIGHT}`);
    for(let worldNumber=1;worldNumber<=TOTAL_WORLDS;worldNumber++){
      const theme=WORLD_THEMES[worldNumber-1],bottom=worldBottom(worldNumber),top=worldNumber===TOTAL_WORLDS?0:bottom-WORLD_HEIGHT;
      const zone=document.createElementNS('http://www.w3.org/2000/svg','rect');
      zone.setAttribute('x','0'); zone.setAttribute('y',top); zone.setAttribute('width',width); zone.setAttribute('height',worldNumber===TOTAL_WORLDS?WORLD_HEIGHT+BOARD_TOP_SPACE:WORLD_HEIGHT);
      zone.setAttribute('fill',theme.dark); zone.setAttribute('class','problem-world-zone'); svg.appendChild(zone);
      const floorRows=worldNumber===TOTAL_WORLDS?31:24;
      for(let row=0;row<=floorRows;row++) for(let col=-3;col<=3;col++){
        const xSlot=col*2+((row+1)%2),cx=width/2+xSlot*TILE,cy=bottom-row*TILE;
        const tile=document.createElementNS('http://www.w3.org/2000/svg','polygon');
        tile.setAttribute('points',`${cx},${cy-TILE} ${cx+TILE},${cy} ${cx},${cy+TILE} ${cx-TILE},${cy}`);
        tile.setAttribute('fill',(row+col)%2===0?theme.dark:theme.light);
        tile.setAttribute('stroke',theme.line); tile.setAttribute('stroke-opacity','.1'); tile.setAttribute('stroke-width','1');
        svg.appendChild(tile);
      }
      if(worldNumber>1){
        const separator=document.createElementNS('http://www.w3.org/2000/svg','path');
        separator.setAttribute('d',`M0 ${bottom} Q${width*.25} ${bottom-16} ${width*.5} ${bottom} T${width} ${bottom}`);
        separator.setAttribute('fill','none'); separator.setAttribute('stroke','rgba(255,255,255,.2)'); separator.setAttribute('stroke-width','5');
        svg.appendChild(separator);
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

  function treeSVG(color='#3a8a48',light='#55aa5f',dark='#2d773c'){
    return `<svg width="88" height="112" viewBox="0 0 88 112"><ellipse cx="44" cy="102" rx="25" ry="7" fill="rgba(0,0,0,.18)"/><path d="M38 58h13l5 40H32z" fill="#71451f"/><path d="M42 61l-8 31M47 61l7 31" stroke="#573316" stroke-width="2"/><circle cx="43" cy="33" r="27" fill="${color}"/><circle cx="24" cy="48" r="19" fill="${light}"/><circle cx="62" cy="47" r="18" fill="${dark}"/><circle cx="44" cy="19" r="17" fill="${light}"/><circle cx="33" cy="27" r="7" fill="rgba(255,255,255,.12)"/></svg>`;
  }
  function houseSVG(wall='#d2a260',roof='#884426',plant='#3a8a48'){return `<svg width="144" height="150" viewBox="0 0 144 150"><ellipse cx="72" cy="140" rx="52" ry="10" fill="rgba(0,0,0,.2)"/><rect x="27" y="76" width="91" height="61" rx="5" fill="${wall}"/><path d="M16 80 72 22l58 58z" fill="${roof}" stroke="#63301c" stroke-width="4"/><path d="m25 74 47-44 48 44" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="7"/><rect x="99" y="31" width="16" height="31" rx="2" fill="#8c8b85"/><g class="problem-smoke"><circle cx="108" cy="24" r="7" fill="#fff" opacity=".5"/></g><g class="problem-smoke"><circle cx="113" cy="15" r="8" fill="#fff" opacity=".35"/></g><rect x="56" y="98" width="27" height="39" rx="3" fill="#59371e"/><circle cx="76" cy="118" r="2.5" fill="#efca68"/><rect x="94" y="98" width="18" height="18" rx="3" fill="#ffe084" stroke="#67401d" stroke-width="3"/><circle cx="30" cy="130" r="13" fill="${plant}"/></svg>`}
  function pondSVG(color='#45b4d0'){return `<svg width="126" height="76" viewBox="0 0 126 76"><ellipse cx="63" cy="43" rx="59" ry="29" fill="#246f8d"/><ellipse cx="63" cy="39" rx="51" ry="23" fill="${color}"/><ellipse cx="42" cy="31" rx="17" ry="7" fill="#fff" opacity=".24"/><ellipse cx="42" cy="50" rx="12" ry="6" fill="#58a950"/><ellipse cx="78" cy="52" rx="10" ry="5" fill="#58a950"/><circle cx="40" cy="47" r="4" fill="#ef8398"/></svg>`}
  function benchSVG(){return `<svg width="120" height="70" viewBox="0 0 120 70"><ellipse cx="60" cy="62" rx="47" ry="6" fill="rgba(0,0,0,.16)"/><rect x="14" y="27" width="92" height="12" rx="3" fill="#ce8d42"/><rect x="17" y="18" width="86" height="8" rx="3" fill="#e0a453"/><path d="M25 38v20M94 38v20M23 15v26M97 15v26" stroke="#784719" stroke-width="7"/><rect x="48" y="25" width="24" height="15" fill="#eee1b9"/></svg>`}
  function bushSVG(color='#3b8d48',light='#5bb565'){return `<svg width="68" height="44" viewBox="0 0 68 44"><ellipse cx="34" cy="34" rx="31" ry="9" fill="rgba(0,0,0,.14)"/><circle cx="20" cy="25" r="16" fill="${color}"/><circle cx="45" cy="23" r="18" fill="${light}"/><circle cx="34" cy="14" r="14" fill="${light}"/></svg>`}
  function flowersSVG(color='#ffd564'){return `<svg width="62" height="34" viewBox="0 0 62 34"><path d="M14 31V16M34 31V12M50 31V19" stroke="#397c42" stroke-width="2"/><g fill="${color}"><circle cx="14" cy="13" r="6"/><circle cx="34" cy="9" r="6"/></g><circle cx="50" cy="16" r="6" fill="#f7e8b3"/><g fill="#fff8d8"><circle cx="14" cy="13" r="2"/><circle cx="34" cy="9" r="2"/><circle cx="50" cy="16" r="2"/></g></svg>`}
  function pineSVG(color='#315d58',light='#466f65'){return `<svg width="84" height="122" viewBox="0 0 84 122"><ellipse cx="42" cy="113" rx="25" ry="7" fill="rgba(0,0,0,.22)"/><rect x="37" y="75" width="11" height="34" fill="#614329"/><path d="m42 5-27 43h15L10 76h24L17 99h51L49 76h24L54 48h15z" fill="${color}" stroke="${light}" stroke-width="2"/><path d="m42 12-19 33h12L20 70h20" fill="${light}"/></svg>`}
  function towerSVG(wall='#6e7480',dark='#303641',glow='#8cd7ea'){return `<svg width="126" height="154" viewBox="0 0 126 154"><ellipse cx="63" cy="144" rx="50" ry="9" fill="rgba(0,0,0,.25)"/><path d="M31 57h64v82H31z" fill="${wall}" stroke="${dark}" stroke-width="4"/><path d="M22 58V38h14v11h18V36h18v13h18V38h14v20z" fill="${dark}" stroke="rgba(20,20,25,.65)" stroke-width="4"/><path d="m43 139 5-33h30l5 33" fill="${dark}"/><rect x="53" y="75" width="20" height="26" rx="10" fill="${glow}" class="problem-decor-glow"/></svg>`}
  function crystalSVG(main='#7fd8e8',edge='#d6fbff',line='#4a92b4'){return `<svg class="problem-decor-glow" width="74" height="84" viewBox="0 0 74 84"><ellipse cx="37" cy="76" rx="28" ry="7" fill="rgba(0,0,0,.25)"/><path d="m37 4 18 25-7 42H26l-8-42z" fill="${main}" stroke="${edge}" stroke-width="3"/><path d="m37 4-3 67M18 29l16 12 21-12M26 71l8-30 14 30" fill="none" stroke="${line}" stroke-width="2"/></svg>`}
  function campSVG(flame='#ffb52f'){return `<svg width="92" height="74" viewBox="0 0 92 74"><ellipse cx="46" cy="65" rx="34" ry="7" fill="rgba(0,0,0,.22)"/><circle cx="46" cy="55" r="24" fill="#707985"/><circle cx="46" cy="55" r="17" fill="#26303a"/><path d="M35 60 59 43M34 44l25 16" stroke="#885128" stroke-width="6"/><path d="M46 52c-15-11 3-18 1-31 18 14 15 29-1 35-5 0-7-2-7-6 1-5 6-8 7-13 5 6 4 11 0 15z" fill="${flame}"/><path d="M47 51c-6-6 1-10 1-17 7 7 7 14-1 18" fill="#fff083"/></svg>`}
  function rockSVG(color='#747b7d'){return `<svg width="82" height="58" viewBox="0 0 82 58"><ellipse cx="41" cy="51" rx="34" ry="6" fill="rgba(0,0,0,.2)"/><path d="m9 46 10-27L38 8l22 7 14 31z" fill="${color}" stroke="rgba(255,255,255,.18)" stroke-width="3"/><path d="m19 19 20 12 21-16M39 31l-4 15" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/></svg>`}
  function pawnMonumentSVG(stone='#d8d0b9',accent='#7c5aac'){return `<svg width="94" height="126" viewBox="0 0 94 126"><ellipse cx="47" cy="117" rx="39" ry="8" fill="rgba(0,0,0,.24)"/><path d="M18 105h58l8 10H10z" fill="${accent}"/><path d="M24 91h46l6 15H18z" fill="${stone}"/><path d="M34 78c8-8 8-19 6-26h14c-2 7-2 18 6 26l8 13H26z" fill="${stone}"/><circle cx="47" cy="38" r="17" fill="${stone}" stroke="rgba(255,255,255,.35)" stroke-width="3"/><path d="M28 91h38" stroke="${accent}" stroke-width="5"/></svg>`}
  function enchantedTreeSVG(){return `<svg class="problem-decor-glow" width="112" height="138" viewBox="0 0 112 138"><ellipse cx="56" cy="127" rx="36" ry="8" fill="rgba(0,0,0,.23)"/><path d="M50 72h14l7 49H39z" fill="#684027"/><path d="M55 82 30 58M61 79l26-28" stroke="#81532f" stroke-width="8" stroke-linecap="round"/><circle cx="31" cy="48" r="23" fill="#4d8b57"/><circle cx="79" cy="40" r="27" fill="#6b9e5d"/><circle cx="55" cy="25" r="24" fill="#7bad68"/><g fill="#b58cff"><circle cx="24" cy="42" r="4"/><circle cx="62" cy="17" r="5"/><circle cx="88" cy="35" r="4"/><circle cx="57" cy="51" r="3"/></g><path d="m54 67 4-13 5 13" fill="#b58cff"/></svg>`}
  function chessBoatSVG(){return `<svg width="126" height="90" viewBox="0 0 126 90"><ellipse cx="63" cy="74" rx="56" ry="12" fill="rgba(12,67,96,.35)"/><path d="m16 57 94-1-17 23H35z" fill="#8b542c" stroke="#56331c" stroke-width="3"/><path d="M61 9v50" stroke="#5b3c26" stroke-width="5"/><path d="M65 13v36h39z" fill="#f4e8bd"/><path d="m65 13 39 36H65z" fill="none" stroke="#d3b56b" stroke-width="2"/><path d="M65 29h19v20H65M84 29l20 20" stroke="#5688a2" stroke-width="2"/><path d="M47 48h27" stroke="#f0c85c" stroke-width="4"/><circle cx="47" cy="43" r="8" fill="#f0c85c"/></svg>`}
  function volcanoSVG(){return `<svg width="150" height="120" viewBox="0 0 150 120"><ellipse cx="75" cy="108" rx="63" ry="10" fill="rgba(0,0,0,.3)"/><path d="m17 104 39-72 21 18 17-29 40 83z" fill="#4c2928" stroke="#2b2023" stroke-width="4"/><path d="m56 32 21 18 17-29 12 26-16 9-12-5-15 8z" fill="#f05a32"/><path d="M78 51 66 99M91 54l16 47M63 59l-8 37" stroke="#ff7b35" stroke-width="7"/><path d="M68 23c-5-16 16-17 12-31M88 16c8-11 3-20 0-27" fill="none" stroke="#d8c9bf" stroke-width="9" opacity=".48"/></svg>`}
  function lavaPoolSVG(){return `<svg class="problem-decor-glow" width="126" height="68" viewBox="0 0 126 68"><ellipse cx="63" cy="40" rx="58" ry="25" fill="#4c2826"/><ellipse cx="63" cy="38" rx="49" ry="18" fill="#ef542f"/><path d="M20 40c18-18 27 14 45-2s26 12 44-4" fill="none" stroke="#ffc43e" stroke-width="7"/><circle cx="47" cy="27" r="5" fill="#ffe97c"/></svg>`}
  function cactusSVG(){return `<svg width="82" height="112" viewBox="0 0 82 112"><ellipse cx="41" cy="103" rx="30" ry="7" fill="rgba(0,0,0,.2)"/><path d="M35 97V36c0-14 18-14 18 0v17h7V40c0-9 13-9 13 0v21c0 7-5 12-12 12h-8v24zM35 64h-8c-10 0-16-6-16-15V37c0-9 13-9 13 0v11h11" fill="#428b4a" stroke="#296b36" stroke-width="3"/><path d="M44 27v67M17 34v17M67 35v27" stroke="#70b663" stroke-width="2"/></svg>`}
  function pyramidSVG(){return `<svg width="142" height="114" viewBox="0 0 142 114"><ellipse cx="71" cy="105" rx="62" ry="8" fill="rgba(0,0,0,.2)"/><path d="m12 101 56-86 62 86z" fill="#d4a247" stroke="#9c641f" stroke-width="4"/><path d="m68 15 3 86M31 72h82M22 87h101M45 51h48" stroke="#efca6c" stroke-width="3"/><path d="M57 101V78h27v23" fill="#5a351d"/><path d="M60 13V3h7v5h8V2h8v6h8V3h7v18H60z" fill="#f0c752" stroke="#8c5e16" stroke-width="2"/></svg>`}
  function icebergSVG(){return `<svg class="problem-decor-glow" width="130" height="96" viewBox="0 0 130 96"><ellipse cx="65" cy="84" rx="58" ry="10" fill="rgba(8,70,104,.32)"/><path d="m11 79 25-48 16 13L68 9l18 30 11-9 23 49z" fill="#bdebf4" stroke="#ecffff" stroke-width="4"/><path d="m36 31 21 48M68 9l-3 70M86 39 76 79" stroke="#71bdd5" stroke-width="4"/></svg>`}
  function crownGateSVG(){return `<svg class="problem-decor-glow" width="164" height="170" viewBox="0 0 164 170"><ellipse cx="82" cy="158" rx="69" ry="10" fill="rgba(0,0,0,.25)"/><path d="M27 72h110v80H27z" fill="#d3a72d" stroke="#6f4c08" stroke-width="5"/><path d="M17 75V43h22v17h28V39h30v21h28V43h22v32z" fill="#f0ca42" stroke="#6f4c08" stroke-width="5"/><path d="M59 152v-39c0-30 46-30 46 0v39" fill="#4d3210"/><path d="m47 31 9-22 17 16L82 2l11 23 17-16 8 22z" fill="#ffd94f" stroke="#80540a" stroke-width="4"/><circle cx="82" cy="20" r="5" fill="#9d4ee0"/><g fill="#fff0a0"><circle cx="48" cy="88" r="6"/><circle cx="116" cy="88" r="6"/></g></svg>`}
  function chessTotemSVG(symbol='&#9822;',stone='#d8d0b9',accent='#6e4c1f'){return `<svg width="82" height="102" viewBox="0 0 82 102"><ellipse cx="41" cy="94" rx="34" ry="7" fill="rgba(0,0,0,.22)"/><path d="M14 83h54l7 10H7z" fill="${accent}"/><path d="M20 72h42l7 12H13z" fill="${stone}"/><text x="41" y="68" text-anchor="middle" font-family="Georgia,serif" font-size="55" font-weight="700" fill="${stone}" stroke="${accent}" stroke-width="1.7">${symbol}</text></svg>`}
  function goldenFinaleSVG(){return `<svg class="problem-finale-glow" width="194" height="216" viewBox="0 0 194 216"><g fill="none" stroke="#fff1a0" stroke-width="3" opacity=".8"><path d="M97 1v25M25 34l18 18M169 34l-18 18M7 102h26M187 102h-26"/></g><ellipse cx="97" cy="204" rx="80" ry="11" fill="rgba(0,0,0,.25)"/><path d="M34 116h126v80H34z" fill="#c69520" stroke="#614206" stroke-width="6"/><path d="M22 120V78h25v22h32V72h36v28h32V78h25v42z" fill="#f4cb3c" stroke="#614206" stroke-width="6"/><path d="M70 196v-39c0-36 54-36 54 0v39" fill="#3f2b0a"/><path d="m48 62 12-34 26 24L97 9l13 43 26-24 11 34z" fill="#ffe052" stroke="#6f4705" stroke-width="5"/><g fill="#9b51d1"><circle cx="60" cy="31" r="7"/><circle cx="97" cy="14" r="8"/><circle cx="135" cy="31" r="7"/></g><path d="M84 117h26v-13H84z" fill="#fff0a0"/><path d="M86 104V89h7v8h8V87h8v10h8v-8h7v15z" fill="#251b08"/></svg>`}

  function addLegacyDecorations(){
    // Monde 1 : chaque grand élément repose désormais sur une case libre, de l'autre côté du chemin.
    addDecor(1,2,8,houseSVG(),.92,'landmark'); addDecor(1,-2,11,benchSVG(),.76); addDecor(1,2,14,pondSVG(),.76,'flat');
    [[1,-2,4,.62],[1,2,6,.55],[1,-2,9,.58],[1,2,17,.58],[1,-2,20,.52]].forEach(([w,x,r,s])=>addDecor(w,x,r,treeSVG(),s));
    [[1,-2,13,.62],[1,2,16,.58],[1,-2,18,.55]].forEach(([w,x,r,s])=>addDecor(w,x,r,bushSVG(),s));
    [[1,2,10,.64],[1,-2,16,.58],[1,2,20,.56]].forEach(([w,x,r,s])=>addDecor(w,x,r,flowersSVG(),s));
    addDecor(1,-2,22,chessTotemSVG('&#9820;','#d8d0b9','#4f703c'),.58,'chess-reference');

    addDecor(2,2,7,towerSVG(),.72,'landmark'); addDecor(2,2,15,towerSVG(),.62,'landmark'); addDecor(2,2,5,campSVG(),.7);
    [[2,-2,4,.57],[2,2,9,.55],[2,-2,12,.53],[2,2,19,.5]].forEach(([w,x,r,s])=>addDecor(w,x,r,pineSVG(),s));
    [[2,2,12,.6],[2,-2,16,.56],[2,2,21,.5]].forEach(([w,x,r,s])=>addDecor(w,x,r,crystalSVG(),s));
    addDecor(2,-2,20,chessTotemSVG('&#9822;','#aeb7c3','#263340'),.62,'chess-reference');

    addDecor(3,2,7,houseSVG('#c79661','#693a25','#8c6b2f'),.8,'landmark'); addDecor(3,-2,14,benchSVG(),.72); addDecor(3,2,15,pawnMonumentSVG('#d7c9a5','#9168bd'),.7,'landmark'); addDecor(3,-2,19,rockSVG('#c59a69'),.72);
    [[3,-2,4,.58],[3,2,10,.62],[3,-2,17,.64],[3,2,21,.55]].forEach(([w,x,r,s])=>addDecor(w,x,r,enchantedTreeSVG(),s));
    [[3,2,13,.58],[3,-2,20,.52]].forEach(([w,x,r,s])=>addDecor(w,x,r,bushSVG('#81522f','#ad7841'),s));
    addDecor(3,2,22,chessTotemSVG('&#9821;','#d6c19d','#71452c'),.64,'chess-reference');

    addDecor(4,2,7,towerSVG('#8ab5c6','#315b77','#d8fbff'),.7,'landmark'); addDecor(4,2,14,pondSVG('#71d0e8'),.76,'flat'); addDecor(4,-2,18,chessBoatSVG(),.76,'flat');
    [[4,2,5,.58],[4,-2,11,.55],[4,2,18,.53]].forEach(([w,x,r,s])=>addDecor(w,x,r,crystalSVG('#68c4e5','#d5f8ff','#327da4'),s));
    [[4,-2,16,.5],[4,2,21,.48]].forEach(([w,x,r,s])=>addDecor(w,x,r,pineSVG('#246d86','#67bdd1'),s));
    addDecor(4,-2,21,chessTotemSVG('&#9820;','#d8f3f8','#2c7590'),.63,'chess-reference');

    addDecor(5,2,8,towerSVG('#8c72a9','#422d62','#d7a9ff'),.7,'landmark'); addDecor(5,2,15,houseSVG('#ad8cc5','#4d2c72','#76529b'),.72,'landmark'); addDecor(5,-2,20,pawnMonumentSVG('#b88ae0','#efc74c'),.72,'landmark');
    [[5,-2,5,.6],[5,2,12,.58],[5,-2,19,.56]].forEach(([w,x,r,s])=>addDecor(w,x,r,crystalSVG('#a66ce0','#f0d9ff','#623b91'),s));
    [[5,2,17,.52],[5,-2,21,.48]].forEach(([w,x,r,s])=>addDecor(w,x,r,bushSVG('#60407f','#8862a5'),s));
    addDecor(5,2,22,chessTotemSVG('&#9819;','#d9b4f1','#4b296d'),.7,'chess-reference');

    addDecor(6,-2,8,towerSVG('#9d5149','#562523','#ff9e67'),.69,'landmark'); addDecor(6,2,9,volcanoSVG(),.75,'landmark'); addDecor(6,2,15,campSVG('#ff6138'),.86); addDecor(6,-2,19,lavaPoolSVG(),.76,'flat');
    [[6,2,5,.58],[6,-2,12,.55],[6,2,20,.52]].forEach(([w,x,r,s])=>addDecor(w,x,r,rockSVG('#6d3a34'),s));
    [[6,-2,17,.5],[6,2,22,.47]].forEach(([w,x,r,s])=>addDecor(w,x,r,treeSVG('#7b2929','#b84634','#541f25'),s));
    addDecor(6,-2,22,chessTotemSVG('&#9818;','#403233','#f16a3b'),.72,'chess-reference');

    addDecor(7,2,8,pyramidSVG(),.82,'landmark'); addDecor(7,2,15,towerSVG('#d4a34b','#754213','#ffe989'),.67,'landmark'); addDecor(7,-2,18,cactusSVG(),.7);
    [[7,-2,5,.58],[7,2,12,.54],[7,-2,20,.52]].forEach(([w,x,r,s])=>addDecor(w,x,r,rockSVG('#c98a3a'),s));
    [[7,2,17,.55],[7,-2,22,.48]].forEach(([w,x,r,s])=>addDecor(w,x,r,flowersSVG('#ffdf58'),s));
    addDecor(7,2,21,chessTotemSVG('&#9821;','#eed28d','#91601c'),.67,'chess-reference');

    addDecor(8,-2,8,icebergSVG(),.78,'landmark'); addDecor(8,2,15,towerSVG('#c5e9f2','#377590','#efffff'),.72,'landmark'); addDecor(8,-2,19,pawnMonumentSVG('#dff8ff','#4a9fc1'),.7,'landmark');
    [[8,2,5,.58],[8,-2,12,.55],[8,2,20,.52]].forEach(([w,x,r,s])=>addDecor(w,x,r,crystalSVG('#8ae4f4','#e8fdff','#398aa6'),s));
    [[8,-2,17,.52],[8,2,22,.47]].forEach(([w,x,r,s])=>addDecor(w,x,r,pineSVG('#28728b','#63bfd7'),s));
    addDecor(8,2,21,chessTotemSVG('&#9822;','#efffff','#438aa7'),.7,'chess-reference');

    addDecor(9,2,8,towerSVG('#d5b44b','#72550c','#fff0a0'),.76,'landmark'); addDecor(9,2,15,crownGateSVG(),.82,'landmark'); addDecor(9,2,20,pawnMonumentSVG('#ffe687','#9b5bd1'),.7,'landmark');
    [[9,-2,5,.57],[9,2,12,.55],[9,-2,20,.52]].forEach(([w,x,r,s])=>addDecor(w,x,r,crystalSVG('#f6d85a','#fff7c4','#a87b13'),s));
    [[9,2,17,.54],[9,-2,22,.48]].forEach(([w,x,r,s])=>addDecor(w,x,r,flowersSVG('#fff08a'),s));
    addDecor(9,-2,19,goldenFinaleSVG(),.82,'landmark finale');
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

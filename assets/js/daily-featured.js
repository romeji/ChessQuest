/* Problème vedette : une combinaison longue, différente chaque jour et
   indépendante de la quête de trois problèmes de la carte. */
const FEATURED_PROBLEMS=[
  {name:'Le sacrifice de Légal',setup:['e4','e5','Nf3','Nc6','Bc4','d6','Nc3','Bg4','Nxe5','Bxd1'],line:['Bxf7+','Ke7','Nd5#'],hint:'Le roi noir paraît protégé, mais son cavalier bloque sa fuite.'},
  {name:'Le venin du Stafford',setup:['e4','e5','Nf3','Nf6','Nxe5','Nc6','Nxc6','dxc6','d3','Bc5','Bg5'],line:['Nxe4','Bxd8','Bxf2+','Ke2','Bg4#'],hint:'Oublie ta dame : cherche une attaque directe contre le roi.'},
  {name:'Le piège de Blackburne',setup:['e4','e5','Nf3','Nc6','Bc4','Nd4','Nxe5','Qg5','Nxf7'],line:['Qxg2','Rf1','Qxe4+','Be2','Nf3#'],hint:'La tour h1 et le roi blanc sont alignés avec ta dame.'}
];
let featuredBoard=null,featuredGame=null,featuredProblem=null,featuredOffset=0,featuredLineIndex=0,featuredHintStage=0,featuredSolved=false,featuredSnapshots=[],featuredCursor=0,featuredOrientation='white';

function featuredDate(offset=0){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return d;}
function featuredKey(offset=0){const d=featuredDate(offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function featuredDefinition(offset=0){const date=featuredDate(offset),seed=Math.floor(date.getTime()/86400000);return FEATURED_PROBLEMS[((seed%FEATURED_PROBLEMS.length)+FEATURED_PROBLEMS.length)%FEATURED_PROBLEMS.length];}
function featuredMoveObject(san){return featuredGame.moves({verbose:true}).find(move=>move.san.replace(/[!?]+$/,'')===String(san).replace(/[!?]+$/,''));}
function ensureFeaturedBoard(){
  if(featuredBoard)return;
  featuredBoard=Chessboard('daily-board',{position:'start',draggable:true,pieceTheme:PIECE_THEME,showNotation:false,
    onDragStart:source=>{if(!featuredSolved&&featuredCursor===featuredSnapshots.length-1)showLegalMoveDots('#daily-board',featuredGame,source);},
    onDrop:onFeaturedDrop,onSnapEnd:()=>clearLegalMoveDots('#daily-board')});
  watchBoardResize('daily-board',()=>featuredBoard,'.daily-board-wrap');
}
function startFeaturedProblem(offset=0){
  featuredOffset=Math.min(0,offset);featuredProblem=featuredDefinition(featuredOffset);featuredGame=new Chess();
  for(const san of featuredProblem.setup){if(!featuredGame.move(san,{sloppy:true})){console.error('Ligne quotidienne invalide',featuredProblem.name,san);break;}}
  featuredLineIndex=0;featuredHintStage=0;featuredSolved=false;featuredSnapshots=[featuredGame.fen()];featuredCursor=0;
  featuredOrientation=featuredGame.turn()==='b'?'black':'white';ensureFeaturedBoard();featuredBoard.orientation(featuredOrientation);featuredBoard.position(featuredGame.fen(),false);renderCoords('daily-ranks','daily-files',featuredOrientation);clearFeaturedArrow();clearHighlights('#daily-board');
  const date=featuredDate(featuredOffset);document.getElementById('featured-title').textContent=featuredProblem.name;document.getElementById('featured-date').textContent=featuredOffset===0?'Aujourd’hui':date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  document.getElementById('featured-next').disabled=featuredOffset===0;document.getElementById('daily-gem-count').textContent=crownBalance();document.getElementById('daily-puzzle-mode').classList.remove('hidden');document.getElementById('daily-done-banner').classList.add('hidden');document.getElementById('featured-result-actions').classList.add('hidden');
  document.getElementById('daily-coach-text').textContent=featuredProblem.hint;document.getElementById('daily-question').textContent='Trouve toute la combinaison, pas seulement le premier coup.';resetFeaturedHint();renderFeaturedStatus();requestAnimationFrame(()=>fitBoards('daily-board',featuredBoard,'.daily-board-wrap'));
}
function onFeaturedDrop(from,to){
  if(featuredSolved||featuredCursor!==featuredSnapshots.length-1)return 'snapback';
  const expected=featuredMoveObject(featuredProblem.line[featuredLineIndex]);
  const played=featuredGame.moves({verbose:true}).find(move=>move.from===from&&move.to===to);
  if(!played||!expected||played.san!==expected.san){
    document.getElementById('daily-coach-text').textContent='Ce coup laisse filer la combinaison. Cherche un coup forcé.';if(typeof playSound==='function')playSound('wrong');flashSquares('#daily-board',[from,to],'wrong-square',700);return 'snapback';
  }
  featuredGame.move(played.san);featuredLineIndex++;featuredSnapshots.push(featuredGame.fen());featuredCursor=featuredSnapshots.length-1;highlightMove('#daily-board',played.from,played.to);resetFeaturedHint();renderFeaturedStatus();
  if(featuredLineIndex>=featuredProblem.line.length){finishFeaturedProblem();return 'snapback';}
  setTimeout(playFeaturedReply,480);return 'snapback';
}
function playFeaturedReply(){
  const reply=featuredMoveObject(featuredProblem.line[featuredLineIndex]);if(!reply){finishFeaturedProblem();return;}
  featuredGame.move(reply.san);featuredLineIndex++;featuredSnapshots.push(featuredGame.fen());featuredCursor=featuredSnapshots.length-1;featuredBoard.position(featuredGame.fen(),true);highlightMove('#daily-board',reply.from,reply.to);renderFeaturedStatus();
  if(featuredLineIndex>=featuredProblem.line.length)finishFeaturedProblem();
}
function renderFeaturedStatus(){
  const userMoves=Math.ceil(featuredProblem.line.length/2),done=Math.ceil(featuredLineIndex/2);document.getElementById('featured-step').textContent=`Coup ${Math.min(userMoves,done+1)} / ${userMoves}`;
  document.getElementById('featured-history-prev').disabled=featuredCursor===0;document.getElementById('featured-history-next').disabled=featuredCursor>=featuredSnapshots.length-1;
}
function browseFeatured(delta){featuredCursor=Math.max(0,Math.min(featuredSnapshots.length-1,featuredCursor+delta));featuredBoard.position(featuredSnapshots[featuredCursor],false);clearFeaturedArrow();clearHighlights('#daily-board');renderFeaturedStatus();}
function resetFeaturedHint(){featuredHintStage=0;const button=document.getElementById('daily-hint-button');button.querySelector('b').textContent='?';button.querySelector('span').textContent='Indication';clearFeaturedArrow();}
function showFeaturedHint(){
  if(featuredSolved||featuredCursor!==featuredSnapshots.length-1)return;const move=featuredMoveObject(featuredProblem.line[featuredLineIndex]);if(!move)return;
  if(featuredHintStage===0){flashSquares('#daily-board',[move.from],'hint-square',1800);document.getElementById('daily-coach-text').textContent=`Regarde attentivement la pièce en ${move.from.toUpperCase()}.`;featuredHintStage=1;document.querySelector('#daily-hint-button b').textContent='→';document.querySelector('#daily-hint-button span').textContent='Coup';}
  else{drawFeaturedArrow(move.from,move.to);flashSquares('#daily-board',[move.from,move.to],'hint-square',2200);document.getElementById('daily-coach-text').textContent=`Joue de ${move.from.toUpperCase()} vers ${move.to.toUpperCase()}.`;}
}
function drawFeaturedArrow(from,to){
  clearFeaturedArrow();const frame=document.querySelector('.daily-board-wrap .board-frame'),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('featured-move-arrow');svg.setAttribute('viewBox','0 0 100 100');
  const point=s=>{let f=s.charCodeAt(0)-97,r=Number(s[1])-1;if(featuredOrientation==='black'){f=7-f;}else r=7-r;if(featuredOrientation==='black')r=Number(s[1])-1;return{x:(f+.5)*12.5,y:(r+.5)*12.5};},a=point(from),b=point(to);
  svg.innerHTML='<defs><marker id="featured-head" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z"/></marker></defs><line marker-end="url(#featured-head)"/>';const line=svg.querySelector('line');line.setAttribute('x1',a.x);line.setAttribute('y1',a.y);line.setAttribute('x2',b.x);line.setAttribute('y2',b.y);frame.appendChild(svg);
}
function clearFeaturedArrow(){document.querySelector('.featured-move-arrow')?.remove();}
function finishFeaturedProblem(){
  featuredSolved=true;featuredBoard.position(featuredGame.fen(),false);document.getElementById('daily-question').textContent='Combinaison résolue !';document.getElementById('daily-coach-text').textContent='Tu as calculé toute la ligne. Voilà qui devient sérieux.';document.getElementById('featured-result-actions').classList.remove('hidden');
  const solved=PROGRESS.featuredProblemsSolved||(PROGRESS.featuredProblemsSolved=[]),key=featuredKey(featuredOffset);if(featuredOffset===0&&!solved.includes(key)){solved.push(key);addXP(25);addCrowns(10,'Problème du jour');saveProgress();}
  if(typeof fireConfetti==='function')fireConfetti('puzzle');
}
document.getElementById('featured-prev').onclick=()=>startFeaturedProblem(featuredOffset-1);document.getElementById('featured-next').onclick=()=>startFeaturedProblem(featuredOffset+1);document.getElementById('featured-history-prev').onclick=()=>browseFeatured(-1);document.getElementById('featured-history-next').onclick=()=>browseFeatured(1);document.getElementById('daily-hint-button').onclick=showFeaturedHint;document.getElementById('featured-retry').onclick=()=>startFeaturedProblem(featuredOffset);document.getElementById('featured-today').onclick=()=>startFeaturedProblem(0);document.getElementById('featured-done-back').onclick=()=>startFeaturedProblem(featuredOffset);
startFeaturedProblem(0);

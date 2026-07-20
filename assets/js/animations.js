/* ============================================================
   ChessQuest — animations.js
   Confettis (canvas-confetti) et notifications toast.
   ============================================================ */

function fireConfetti(kind){
  if(typeof confetti !== 'function') return;
  try{
    if(kind === 'puzzle'){
      confetti({particleCount:55, spread:55, startVelocity:32, origin:{y:0.65}, colors:['#6C5CE0','#3FAE7A','#F8F7FB']});
    } else if(kind === 'mastery'){
      confetti({particleCount:90, spread:75, startVelocity:38, origin:{y:0.6}, colors:['#6C5CE0','#4C86C9','#3FAE7A']});
      setTimeout(()=> confetti({particleCount:50, spread:100, startVelocity:30, origin:{y:0.45}}), 200);
    } else if(kind === 'badge'){
      confetti({particleCount:140, spread:110, startVelocity:45, origin:{y:0.5}, colors:['#6C5CE0','#F8F7FB','#3FAE7A','#4C86C9']});
    }
  }catch(e){}
}

function showToast(title, desc){
  let container = document.getElementById('toast-container');
  if(!container){
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  const titleEl = document.createElement('span');
  titleEl.className = 'toast-title';
  titleEl.textContent = title;
  el.appendChild(titleEl);
  if(desc){
    const descEl = document.createElement('span');
    descEl.className = 'toast-desc';
    descEl.textContent = desc;
    el.appendChild(descEl);
  }
  container.appendChild(el);
  setTimeout(()=>{
    el.classList.add('leaving');
    setTimeout(()=> el.remove(), 320);
  }, 4200);
}

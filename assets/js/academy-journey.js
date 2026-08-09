(() => {
  const positions = [
    [55,84],[43,79.5],[61,74.5],[52,69],[36,64],[61,59],[51,54],[37,49],
    [61,44],[51,39],[64,34.5],[52,30],[63,26],[50,22.8],[62,19.8],[49,17],
    [59,14.4],[47,12],[56,9.8],[48,7.5]
  ];
  const chapterNames = ['Fondations','Premiers plans','Tactiques','Ouvertures','Stratégie','Finales'];
  const visit = recordLearningJourneyVisit();
  const journey = visit.journey;
  const currentStep = Math.max(1, Math.min(20, Number(journey.step) || 1));

  const path = document.getElementById('academy-path');
  path.innerHTML = positions.map(([x,y], index) => {
    const step = index + 1;
    const state = step < currentStep ? 'complete' : step === currentStep ? 'current' : 'locked';
    const label = state === 'complete' ? '✓' : String(step);
    return `<button class="academy-step ${state}" style="--x:${x}%;--y:${y}%" data-step="${step}" type="button" aria-label="Étape ${step}${state==='complete'?', terminée':state==='current'?', en cours':', verrouillée'}"><span>${label}</span></button>`;
  }).join('');

  const chapter = Math.max(1, Number(journey.chapter) || 1);
  document.getElementById('academy-level-medal').textContent = chapter;
  document.getElementById('academy-chapter').textContent = `Chapitre ${chapter} · ${chapterNames[(chapter - 1) % chapterNames.length]}`;
  document.getElementById('academy-xp').textContent = Math.round(Number(PROGRESS.xp) || 0);
  document.getElementById('academy-crowns').textContent = crownBalance();
  document.getElementById('academy-day-label').textContent = `Jour ${Math.max(1, Number(journey.totalDays) || 1)}`;
  document.getElementById('academy-progress-step').textContent = `${currentStep} / 20`;
  document.getElementById('academy-progress-fill').style.width = `${Math.round(currentStep / 20 * 100)}%`;

  const completed = new Set(PROGRESS.completedCourses || []);
  const nextCourse = typeof WRITTEN_COURSES !== 'undefined' ? WRITTEN_COURSES.find(course => !completed.has(course.id)) : null;
  if(nextCourse){
    document.getElementById('academy-continue').href = `course.html?id=${encodeURIComponent(nextCourse.id)}`;
    document.getElementById('academy-next-course').textContent = nextCourse.title;
  }

  const coachCopy = document.getElementById('academy-coach-copy');
  if(visit.advanced){
    coachCopy.textContent = `Étape ${currentStep} conquise. +10 XP et +5 couronnes. Pas mal pour quelqu'un qui vient juste d'arriver.`;
    setTimeout(() => {
      if(typeof fireConfetti === 'function') fireConfetti('daily');
    }, 450);
  }else{
    coachCopy.textContent = currentStep === 20
      ? 'Le château est à portée de sabot. Demain, on change de chapitre.'
      : `Étape ${currentStep} sécurisée. Reviens demain : je refuse de te laisser apprendre tout ça en une nuit.`;
  }

  document.querySelectorAll('.academy-step').forEach(button => button.addEventListener('click', () => {
    const step = Number(button.dataset.step);
    if(step > currentStep){
      coachCopy.textContent = 'Doucement, champion. Cette case se débloquera lors d’une prochaine journée d’apprentissage.';
      document.getElementById('academy-coach').classList.add('talking');
      setTimeout(() => document.getElementById('academy-coach').classList.remove('talking'), 500);
      return;
    }
    if(step < currentStep) coachCopy.textContent = `Étape ${step} validée. Tu peux la revoir dans la bibliothèque quand tu veux.`;
  }));

  const menuButton = document.getElementById('academy-menu-button');
  const menu = document.getElementById('academy-menu');
  menuButton.addEventListener('click', () => {
    const opens = menu.classList.toggle('hidden') === false;
    menuButton.setAttribute('aria-expanded', String(opens));
  });
  document.getElementById('academy-coach-close').addEventListener('click', () => document.getElementById('academy-coach').classList.add('hidden'));
})();

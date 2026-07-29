/* ============================================================
   ChessQuest — navigation.js
   Marque l'onglet actif dans la barre de navigation basse.
   Chaque page HTML doit poser <body data-page="home|learn|puzzles|play|profile">
   La navigation elle-même se fait via de vrais liens <a href="...">.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const aliases = {
    analyze: 'home',
    analysis: 'home',
    settings: 'profile',
    'training-hub': 'training',
    play: 'training',
    progress: 'profile'
  };
  const current = aliases[document.body.dataset.page] || document.body.dataset.page;
  const tabbar = document.querySelector('.tabbar');
  if(tabbar){
    tabbar.innerHTML = `
      <a class="tabbar-item" data-tab="home" href="index.html" aria-label="Accueil">
        <svg viewBox="0 0 24 24" class="tabicon"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg><span>Accueil</span>
      </a>
      <a class="tabbar-item" data-tab="puzzles" href="puzzles.html" aria-label="Puzzles">
        <svg viewBox="0 0 24 24" class="tabicon"><path d="M9 3h6v4a3 3 0 1 0 3 3h3v11h-6v-3a3 3 0 1 0-3 3H3v-7h4a3 3 0 1 0 0-6H3V3h6Z"/></svg><span>Puzzles</span>
      </a>
      <a class="tabbar-item" data-tab="learn" href="learn.html" aria-label="Ouvertures">
        <svg viewBox="0 0 24 24" class="tabicon"><path d="M4 19V6a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2Z"/><path d="M20 19V6a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2Z"/></svg><span>Ouvertures</span>
      </a>
      <a class="tabbar-item" data-tab="training" href="entrainement.html" aria-label="S'entraîner">
        <svg viewBox="0 0 24 24" class="tabicon"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M22 12h-3"/></svg><span>S'entraîner</span>
      </a>
      <a class="tabbar-item" data-tab="profile" href="profile.html" aria-label="Profil">
        <svg viewBox="0 0 24 24" class="tabicon"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>Profil</span>
      </a>`;
  }
  document.querySelectorAll('.tabbar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === current);
    const target = item.getAttribute('data-href');
    if(target){
      item.addEventListener('click', () => window.location.assign(target));
    }
  });
});

/* ============================================================
   ChessQuest — navigation.js
   Marque l'onglet actif dans la barre de navigation basse.
   Chaque page HTML doit poser <body data-page="home|learn|puzzles|play|profile">
   La navigation elle-même se fait via de vrais liens <a href="...">.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const current = document.body.dataset.page;
  document.querySelectorAll('.tabbar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === current);
  });
});

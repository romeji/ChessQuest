# ChessQuest

Une application web d'apprentissage des échecs : analyse de partie (Stockfish),
entraînement d'ouvertures façon parcours, puzzles tactiques, et suivi de
progression (XP, séries, badges).

## Structure du projet

```
chessquest/
├── index.html       Accueil (tableau de bord + écran de bienvenue)
├── learn.html        Apprendre (parcours en chemin + bibliothèque complète)
├── openings.html      S'entraîner (échiquier de pratique d'une ouverture)
├── puzzles.html       Puzzles tactiques (format QCM)
├── analysis.html       Analyse de partie (Stockfish)
├── profile.html       Profil (avatar, niveau, badges, objectifs)
├── settings.html       Réglages (moteur, sons, voix)
│
└── assets/
    ├── css/         variables, reset, layout, components, animations
    │                + un fichier par page (home/learn/puzzle/profile/analysis)
    ├── js/          app.js, navigation.js, board.js, animations.js,
    │                progress.js, openings.js, puzzles.js
    ├── icons/       (vide — à compléter)
    ├── illustrations/ (vide — à compléter)
    ├── chess/       (vide — jeux de pièces personnalisés, à compléter)
    └── sounds/      (vide — sons personnalisés, à compléter)
```

## Lancer le projet

Ouvre simplement `index.html` dans un navigateur. Pour un résultat plus
fiable (notamment la récupération de parties chess.com), utilise un petit
serveur local plutôt que le double-clic direct sur le fichier :

```bash
cd chessquest
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

## Dépendances externes (chargées depuis un CDN, aucune installation requise)

- jQuery, chess.js, chessboard.js — logique et affichage de l'échiquier
- Stockfish.js (WASM) — moteur d'analyse, avec repli automatique sur un
  moteur maison si le navigateur ne peut pas le charger
- canvas-confetti — animations de célébration
- Google Fonts (Lora, Inter, IBM Plex Mono)

## Dossiers d'assets vides

`icons/`, `illustrations/`, `chess/` et `sounds/` sont prêts à recevoir tes
propres fichiers. Pour l'instant, toutes les icônes de l'interface sont du
SVG codé directement dans les pages (pas d'emoji), et les sons sont
synthétisés en JavaScript (Web Audio API) — donc l'application fonctionne
déjà sans rien dans ces dossiers.

## Progression

Toute la progression (XP, série, ouvertures maîtrisées, puzzles résolus,
badges) est stockée dans le `localStorage` du navigateur, sous la clé
`chessQuestProgress`. Elle est donc partagée entre toutes les pages du site,
mais reste locale à cet appareil/navigateur (pas de compte, pas de serveur).

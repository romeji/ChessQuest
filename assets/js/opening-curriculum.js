/* ============================================================
   ChessQuest — opening-curriculum.js
   10 mondes, 60 îles et 122 parcours d'ouverture.

   Chaque île représente une famille. Les leçons contenues dans
   une île sont apprises dans l'ordre et débloquent la suivante.
   ============================================================ */

var OPENING_WORLD_POSITIONS = [
  { x: 43, y: 16 },
  { x: 28, y: 38 },
  { x: 73, y: 45 },
  { x: 29, y: 62 },
  { x: 73, y: 73 },
  { x: 73, y: 92 }
];

var OPENING_WORLDS = [
  {
    id: 'fondations',
    number: 1,
    title: 'Le Royaume des fondations',
    shortTitle: 'Fondations',
    subtitle: 'Les ouvertures indispensables pour commencer ton aventure.',
    theme: 'emerald',
    background: 'assets/illustrations/opening-world-01-foundations-v1.webp',
    islands: [
      { id: 'italienne', title: 'Italienne', lessons: ['italienne', 'quatre_cavaliers'] },
      { id: 'gambit_dame', title: 'Gambit Dame', lessons: ['qgd', 'qga', 'slav'] },
      { id: 'francaise', title: 'Défense Française', lessons: ['francaise', 'francaise_avancee'] },
      { id: 'sicilienne', title: 'Sicilienne', lessons: ['najdorf', 'dragon', 'sveshnikov'] },
      { id: 'carokann', title: 'Caro-Kann', lessons: ['carokann', 'carokann_avancee'] },
      { id: 'aventures', title: 'Ouvertures rares', lessons: ['gambit_roi', 'vienne'] }
    ]
  },
  {
    id: 'jeu_ouvert',
    number: 2,
    title: 'Les Cités du jeu ouvert',
    shortTitle: 'Jeu ouvert',
    subtitle: 'Développe vite, ouvre le centre et apprends à viser le roi.',
    theme: 'sunrise',
    background: 'assets/illustrations/opening-world-02-open-play-v1.webp',
    islands: [
      { id: 'italiennes', title: 'Aventures italiennes', lessons: ['italian_evans', 'italian_two_knights'] },
      { id: 'espagnoles', title: 'Forteresse espagnole', lessons: ['espagnole', 'spanish_berlin'] },
      { id: 'ecossaises', title: 'Vallée écossaise', lessons: ['ecossaise', 'scotch_gambit'] },
      { id: 'petroff', title: 'Citadelle Petroff', lessons: ['petroff', 'petroff_classical'] },
      { id: 'centre', title: 'Gambits du centre', lessons: ['danish_gambit', 'center_game'] },
      { id: 'fous', title: 'Tour des fous', lessons: ['bishops_opening', 'ponziani'] }
    ]
  },
  {
    id: 'siciliennes',
    number: 3,
    title: 'L’Archipel sicilien',
    shortTitle: 'Siciliennes',
    subtitle: 'Contre-attaque 1.e4 et maîtrise les positions asymétriques.',
    theme: 'lagoon',
    background: 'assets/illustrations/opening-world-03-sicilian-v1.webp',
    islands: [
      { id: 'classique', title: 'Île classique', lessons: ['sicilian_classical', 'sicilian_accelerated_dragon'] },
      { id: 'anti', title: 'Refuges anti-Sicilienne', lessons: ['sicilian_alapin', 'sicilian_closed'] },
      { id: 'attaque', title: 'Baie des attaques', lessons: ['sicilian_grand_prix', 'sicilian_smith_morra'] },
      { id: 'flexible', title: 'Ports flexibles', lessons: ['sicilian_scheveningen', 'sicilian_kan'] },
      { id: 'dynamique', title: 'Caps dynamiques', lessons: ['sicilian_taimanov', 'sicilian_kalashnikov'] },
      { id: 'fous', title: 'Falaises du fou', lessons: ['sicilian_rossolimo', 'sicilian_moscow'] }
    ]
  },
  {
    id: 'semi_ouvertes',
    number: 4,
    title: 'Les Forteresses semi-ouvertes',
    shortTitle: 'Forteresses',
    subtitle: 'Construis une défense solide avant de lancer ta contre-attaque.',
    theme: 'cliff',
    background: 'assets/illustrations/opening-world-04-fortresses-v1.webp',
    islands: [
      { id: 'francaise_a', title: 'Château Winawer', lessons: ['french_winawer', 'french_tarrasch'] },
      { id: 'francaise_b', title: 'Bastion français', lessons: ['french_classical', 'french_rubinstein'] },
      { id: 'caro_a', title: 'Mur Caro-Kann', lessons: ['carokann_classical', 'carokann_tartakower'] },
      { id: 'caro_b', title: 'Passage Panov', lessons: ['carokann_two_knights', 'carokann_panov'] },
      { id: 'nordique', title: 'Côtes nordiques', lessons: ['scandinavian_icelandic', 'scandinavian_portuguese'] },
      { id: 'hypermoderne', title: 'Tours hypermodernes', lessons: ['alekhine', 'pirc'] }
    ]
  },
  {
    id: 'gambit_dame',
    number: 5,
    title: 'Les Terres de la Dame',
    shortTitle: 'Jeu de la Dame',
    subtitle: 'Comprends les tensions de pions et les grandes batailles de 1.d4.',
    theme: 'royal',
    background: 'assets/illustrations/opening-world-05-queen-v1.webp',
    islands: [
      { id: 'qgd', title: 'Palais du refusé', lessons: ['qgd_exchange', 'qgd_tartakower'] },
      { id: 'qga', title: 'Port de l’accepté', lessons: ['qga_classical', 'qga_central'] },
      { id: 'slave', title: 'Province slave', lessons: ['slav_main', 'slav_chebanenko'] },
      { id: 'semi_slave', title: 'Monts semi-slaves', lessons: ['semi_slav_meran', 'semi_slav_botvinnik'] },
      { id: 'contre_gambits', title: 'Volcans du centre', lessons: ['albin', 'chigorin'] },
      { id: 'catalane', title: 'Jardins catalans', lessons: ['catalan_open', 'catalan_closed'] }
    ]
  },
  {
    id: 'indiennes',
    number: 6,
    title: 'Les Royaumes indiens',
    shortTitle: 'Indiennes',
    subtitle: 'Laisse le centre avancer, puis attaque-le de loin.',
    theme: 'twilight',
    background: 'assets/illustrations/opening-world-06-indian-v1.webp',
    islands: [
      { id: 'kid_a', title: 'Temple Sämisch', lessons: ['indienne_roi', 'kid_samisch'] },
      { id: 'kid_b', title: 'Cité du Roi', lessons: ['kid_classical', 'kid_four_pawns'] },
      { id: 'nimzo', title: 'Tour Nimzo', lessons: ['nimzo_indienne', 'nimzo_rubinstein'] },
      { id: 'qid', title: 'Palais de la Dame', lessons: ['qid', 'qid_petrosian'] },
      { id: 'grunfeld', title: 'Citadelle Grünfeld', lessons: ['grunfeld', 'grunfeld_exchange'] },
      { id: 'benoni', title: 'Désert Benoni', lessons: ['benoni_modern', 'benko'] }
    ]
  },
  {
    id: 'positionnels',
    number: 7,
    title: 'Les Jardins positionnels',
    shortTitle: 'Systèmes',
    subtitle: 'Place tes pièces harmonieusement et joue avec un plan durable.',
    theme: 'garden',
    background: 'assets/illustrations/opening-world-07-gardens-v1.webp',
    islands: [
      { id: 'londres', title: 'Domaine de Londres', lessons: ['londres', 'london_jobava'] },
      { id: 'colle', title: 'Jardin Colle', lessons: ['colle', 'colle_zukertort'] },
      { id: 'fous', title: 'Observatoire des fous', lessons: ['torre', 'trompowsky'] },
      { id: 'pions', title: 'Moulin des pions', lessons: ['stonewall', 'bird'] },
      { id: 'anglaise', title: 'Manoir anglais', lessons: ['anglaise', 'english_four_knights'] },
      { id: 'reti', title: 'Bosquet Réti', lessons: ['reti', 'reti_kings_indian_attack'] }
    ]
  },
  {
    id: 'frontieres',
    number: 8,
    title: 'Les Frontières hypermodernes',
    shortTitle: 'Frontières',
    subtitle: 'Provoque le centre adverse et frappe-le au moment juste.',
    theme: 'aurora',
    background: 'assets/illustrations/opening-world-08-frontiers-v1.webp',
    islands: [
      { id: 'moderne', title: 'Avant-poste moderne', lessons: ['modern', 'modern_gurgenidze'] },
      { id: 'scandinave', title: 'Fjords scandinaves', lessons: ['scandinave', 'scandinavian_modern'] },
      { id: 'alekhine', title: 'Pics Alekhine', lessons: ['alekhine_exchange', 'alekhine_four_pawns'] },
      { id: 'provocations', title: 'Terres de provocation', lessons: ['owen', 'nimzowitsch_defense'] },
      { id: 'insolites', title: 'Îles insolites', lessons: ['polish', 'grob'] },
      { id: 'hollandaise', title: 'Digues hollandaises', lessons: ['dutch_leningrad', 'dutch_classical'] }
    ]
  },
  {
    id: 'gambits',
    number: 9,
    title: 'Les Îles des gambits',
    shortTitle: 'Gambits',
    subtitle: 'Sacrifie du matériel pour gagner du temps, des lignes et l’initiative.',
    theme: 'ember',
    background: 'assets/illustrations/opening-world-09-gambits-v1.webp',
    islands: [
      { id: 'evans', title: 'Baie Evans', lessons: ['evans_accepted', 'evans_declined'] },
      { id: 'roi', title: 'Couronne du Roi', lessons: ['kings_gambit_accepted', 'falkbeer'] },
      { id: 'dame', title: 'Forges de la Dame', lessons: ['blackmar', 'englund'] },
      { id: 'est', title: 'Passes de l’Est', lessons: ['budapest', 'benko_accepted'] },
      { id: 'ailes', title: 'Tempêtes de l’aile', lessons: ['wing_gambit', 'halasz_gambit'] },
      { id: 'romantiques', title: 'Ruines romantiques', lessons: ['urusov', 'boden_kieseritzky'] }
    ]
  },
  {
    id: 'maitres',
    number: 10,
    title: 'Le Sommet des maîtres',
    shortTitle: 'Maîtres',
    subtitle: 'Les variantes de championnat du monde pour achever ta quête.',
    theme: 'mythic',
    background: 'assets/illustrations/opening-world-10-masters-v1.webp',
    islands: [
      { id: 'espagnole', title: 'Trône espagnol', lessons: ['spanish_marshall', 'spanish_breyer'] },
      { id: 'najdorf', title: 'Cour Najdorf', lessons: ['najdorf_english', 'najdorf_poisoned'] },
      { id: 'sicilienne', title: 'Sanctuaire sicilien', lessons: ['sveshnikov_novosibirsk', 'scheveningen_keres'] },
      { id: 'indienne', title: 'Temple indien', lessons: ['kid_mar_del_plata', 'grunfeld_russian'] },
      { id: 'classiques', title: 'Archives classiques', lessons: ['nimzo_saemisch', 'qgd_cambridge_springs'] },
      { id: 'finale', title: 'Citadelle finale', lessons: ['semi_slav_moscow', 'catalan_main'] }
    ]
  }
];

function allCurriculumLessonKeys() {
  return OPENING_WORLDS.flatMap(function (world) {
    return world.islands.flatMap(function (island) { return island.lessons; });
  });
}

function findCurriculumWorld(worldId) {
  return OPENING_WORLDS.find(function (world) { return world.id === worldId; }) || OPENING_WORLDS[0];
}

function findCurriculumIsland(worldId, islandId) {
  var world = findCurriculumWorld(worldId);
  return world.islands.find(function (island) { return island.id === islandId; }) || null;
}

function findCurriculumLesson(key) {
  for (var worldIndex = 0; worldIndex < OPENING_WORLDS.length; worldIndex += 1) {
    var world = OPENING_WORLDS[worldIndex];
    for (var islandIndex = 0; islandIndex < world.islands.length; islandIndex += 1) {
      var island = world.islands[islandIndex];
      var lessonIndex = island.lessons.indexOf(key);
      if (lessonIndex !== -1) {
        return { world: world, island: island, worldIndex: worldIndex, islandIndex: islandIndex, lessonIndex: lessonIndex };
      }
    }
  }
  return null;
}

function curriculumIslandProgress(island, mastered) {
  var completed = island.lessons.filter(function (key) { return !!mastered[key]; }).length;
  return { completed: completed, total: island.lessons.length, complete: completed === island.lessons.length };
}

function curriculumWorldProgress(world, mastered) {
  var keys = world.islands.flatMap(function (island) { return island.lessons; });
  var completed = keys.filter(function (key) { return !!mastered[key]; }).length;
  return { completed: completed, total: keys.length, complete: completed === keys.length };
}

/* Les lignes ci-dessous complètent les 26 lignes historiques.
   Format : nom, ECO, camp entraîné, suite SAN, idée directrice. */
var OPENING_EXTRA_ROWS = {
  francaise_avancee: ['Française — Variante d’avance', 'C02', 'b', 'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3', 'Attaque la chaîne de pions blancs par sa base avec ...c5.'],
  carokann_avancee: ['Caro-Kann — Variante d’avance', 'B12', 'b', 'e4 c6 d4 d5 e5 Bf5 Nf3 e6', 'Développe le fou avant de fermer la structure avec ...e6.'],

  italian_evans: ['Italienne — Gambit Evans', 'C51', 'w', 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4', 'Gagne des temps de développement en offrant le pion b.'],
  italian_two_knights: ['Italienne — Deux Cavaliers', 'C57', 'w', 'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6', 'Mets immédiatement f7 sous pression et accepte un jeu tactique.'],
  spanish_berlin: ['Espagnole — Défense berlinoise', 'C67', 'b', 'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5', 'Échange tôt au centre pour atteindre une structure extrêmement solide.'],
  scotch_gambit: ['Écossaise — Gambit écossais', 'C44', 'w', 'e4 e5 Nf3 Nc6 d4 exd4 Bc4 Nf6 O-O', 'Privilégie le développement et l’initiative à la récupération immédiate du pion.'],
  petroff: ['Défense Petroff', 'C42', 'b', 'e4 e5 Nf3 Nf6', 'Contre-attaque e4 au lieu de défendre passivement e5.'],
  petroff_classical: ['Petroff — Variante classique', 'C42', 'b', 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3', 'Égalise par la symétrie et un contrôle précis du centre.'],
  danish_gambit: ['Gambit danois', 'C21', 'w', 'e4 e5 d4 exd4 c3 dxc3 Bc4 cxb2 Bxb2', 'Sacrifie deux pions pour activer les deux fous sur le roi.'],
  center_game: ['Partie du centre', 'C22', 'w', 'e4 e5 d4 exd4 Qxd4 Nc6 Qe3 Nf6', 'Ouvre tout de suite le centre et garde une pression directe sur e5.'],
  bishops_opening: ['Ouverture du fou', 'C23', 'w', 'e4 e5 Bc4 Nf6 d3', 'Développe le fou vers f7 tout en gardant le cavalier g1 flexible.'],
  ponziani: ['Ouverture Ponziani', 'C44', 'w', 'e4 e5 Nf3 Nc6 c3 Nf6 d4', 'Prépare d4 avec un fort centre, au prix d’un développement plus lent.'],

  sicilian_classical: ['Sicilienne classique', 'B56', 'b', 'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 d6', 'Développe les deux cavaliers avant de choisir la structure centrale.'],
  sicilian_accelerated_dragon: ['Dragon accéléré', 'B34', 'b', 'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 g6', 'Joue ...g6 sans ...d6 pour garder la poussée libératrice ...d5.'],
  sicilian_alapin: ['Sicilienne — Alapine', 'B22', 'w', 'e4 c5 c3 d5 exd5 Qxd5 d4', 'Construis un grand centre avec c3 et d4.'],
  sicilian_closed: ['Sicilienne fermée', 'B23', 'w', 'e4 c5 Nc3 Nc6 g3 g6 Bg2 Bg7 d3', 'Évite les échanges centraux et prépare une attaque à l’aile roi.'],
  sicilian_grand_prix: ['Sicilienne — Attaque Grand Prix', 'B23', 'w', 'e4 c5 Nc3 Nc6 f4', 'Gagne de l’espace et prépare une attaque rapide avec f5.'],
  sicilian_smith_morra: ['Gambit Smith-Morra', 'B21', 'w', 'e4 c5 d4 cxd4 c3 dxc3 Nxc3', 'Offre un pion pour accélérer le développement et ouvrir les colonnes.'],
  sicilian_scheveningen: ['Sicilienne — Scheveningue', 'B80', 'b', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6', 'Bâtis le petit centre e6-d6 avant de contre-attaquer.'],
  sicilian_kan: ['Sicilienne — Kan', 'B41', 'b', 'e4 c5 Nf3 e6 d4 cxd4 Nxd4 a6', 'Garde une structure souple et contrôle b5 avec ...a6.'],
  sicilian_taimanov: ['Sicilienne — Taïmanov', 'B46', 'b', 'e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6', 'Développe rapidement le cavalier et conserve plusieurs placements de dame.'],
  sicilian_kalashnikov: ['Sicilienne — Kalachnikov', 'B32', 'b', 'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 e5 Nb5 d6', 'Gagne de l’espace avec ...e5 et accepte la faiblesse de d5.'],
  sicilian_rossolimo: ['Sicilienne — Rossolimo', 'B31', 'w', 'e4 c5 Nf3 Nc6 Bb5', 'Échange le fou contre le cavalier pour détériorer la structure noire.'],
  sicilian_moscow: ['Sicilienne — Variante de Moscou', 'B51', 'w', 'e4 c5 Nf3 d6 Bb5+', 'Force une décision immédiate avec l’échec du fou.'],

  french_winawer: ['Française — Winawer', 'C15', 'b', 'e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+ bxc3', 'Mets la pression sur c3 et attaque le centre blanc avec ...c5.'],
  french_tarrasch: ['Française — Tarrasch', 'C05', 'w', 'e4 e6 d4 d5 Nd2', 'Évite le clouage Winawer et garde une structure centrale saine.'],
  french_classical: ['Française — Classique', 'C11', 'b', 'e4 e6 d4 d5 Nc3 Nf6', 'Attaque e4 par un développement naturel du cavalier.'],
  french_rubinstein: ['Française — Rubinstein', 'C10', 'b', 'e4 e6 d4 d5 Nc3 dxe4 Nxe4', 'Réduis la tension et vise une position compacte, facile à développer.'],
  carokann_classical: ['Caro-Kann — Classique', 'B18', 'b', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5', 'Sors le fou avant ...e6 pour obtenir une version améliorée de la Française.'],
  carokann_tartakower: ['Caro-Kann — Tartakower', 'B15', 'b', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Nxf6+ exf6', 'Accepte les pions doublés pour ouvrir les lignes et garder une structure robuste.'],
  carokann_two_knights: ['Caro-Kann — Deux Cavaliers', 'B11', 'w', 'e4 c6 Nc3 d5 Nf3', 'Développe vite sans définir immédiatement la structure centrale.'],
  carokann_panov: ['Caro-Kann — Attaque Panov', 'B13', 'w', 'e4 c6 d4 d5 exd5 cxd5 c4', 'Crée un pion dame isolé en échange de lignes actives.'],
  scandinavian_icelandic: ['Scandinave — Gambit islandais', 'B01', 'b', 'e4 d5 exd5 Nf6 c4 e6', 'Offre un pion pour accélérer le développement et ouvrir le fou f8.'],
  scandinavian_portuguese: ['Scandinave — Gambit portugais', 'B01', 'b', 'e4 d5 exd5 Nf6 d4 Bg4', 'Cloue le cavalier et développe avec tempo au lieu de reprendre tout de suite.'],

  qgd_exchange: ['Gambit Dame refusé — Échange', 'D35', 'w', 'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5', 'Fixe la structure Carlsbad et prépare l’attaque de minorité.'],
  qgd_tartakower: ['Gambit Dame refusé — Tartakower', 'D58', 'b', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6', 'Libère le fou c8 par ...b6 et ...Bb7 tout en gardant un centre solide.'],
  qga_classical: ['Gambit Dame accepté — Classique', 'D27', 'w', 'd4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4', 'Récupère le pion en développant le fou avec un temps utile.'],
  qga_central: ['Gambit Dame accepté — Variante centrale', 'D20', 'w', 'd4 d5 c4 dxc4 e4', 'Occupe tout le centre pendant que Noir conserve temporairement c4.'],
  slav_main: ['Défense slave — Ligne principale', 'D17', 'w', 'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5', 'Empêche ...b5 avec a4 et récupère le pion sans perdre l’initiative.'],
  slav_chebanenko: ['Slave — Chebanenko', 'D15', 'b', 'd4 d5 c4 c6 Nf3 Nf6 Nc3 a6', 'Prépare ...b5 et garde un dispositif extrêmement flexible.'],
  semi_slav_meran: ['Semi-Slave — Méran', 'D47', 'b', 'd4 d5 c4 c6 Nf3 Nf6 e3 e6 Bd3 dxc4 Bxc4 b5', 'Gagne de l’espace à l’aile dame et prépare ...Bb7.'],
  semi_slav_botvinnik: ['Semi-Slave — Botvinnik', 'D44', 'w', 'd4 d5 c4 e6 Nc3 Nf6 Nf3 c6 Bg5 dxc4 e4 b5 e5 h6 Bh4 g5 Nxg5', 'Accepte une bataille tactique où le centre blanc compense le matériel.'],
  albin: ['Contre-gambit Albin', 'D08', 'b', 'd4 d5 c4 e5 dxe5 d4 Nf3 Nc6', 'Sacrifie un pion pour installer un dangereux pion avancé en d4.'],
  chigorin: ['Défense Chigorin', 'D07', 'b', 'd4 d5 c4 Nc6', 'Développe une pièce et met immédiatement d4 sous pression.'],
  catalan_open: ['Catalane ouverte', 'E05', 'w', 'd4 Nf6 c4 e6 g3 d5 Bg2 dxc4', 'Utilise le fianchetto pour récupérer c4 et dominer la grande diagonale.'],
  catalan_closed: ['Catalane fermée', 'E06', 'w', 'd4 Nf6 c4 e6 g3 d5 Bg2 Be7 Nf3 O-O O-O', 'Conserve une pression positionnelle durable sans ouvrir tout de suite le centre.'],

  kid_samisch: ['Est-Indienne — Sämisch', 'E80', 'w', 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f3', 'Soutiens e4 et prépare une grande expansion à l’aile roi.'],
  kid_classical: ['Est-Indienne — Classique', 'E90', 'b', 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5', 'Ferme le centre avec ...e5 avant d’attaquer le roi.'],
  kid_four_pawns: ['Est-Indienne — Quatre Pions', 'E76', 'w', 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f4', 'Occupe un maximum d’espace et soutiens la poussée e5.'],
  nimzo_rubinstein: ['Nimzo-Indienne — Rubinstein', 'E41', 'w', 'd4 Nf6 c4 e6 Nc3 Bb4 e3', 'Consolide le centre et prépare un développement harmonieux.'],
  qid: ['Défense Ouest-Indienne', 'E12', 'b', 'd4 Nf6 c4 e6 Nf3 b6', 'Contrôle e4 à distance grâce au fianchetto du fou dame.'],
  qid_petrosian: ['Ouest-Indienne — Petrossian', 'E12', 'w', 'd4 Nf6 c4 e6 Nf3 b6 a3', 'Empêche ...Bb4 et prépare Nc3 sans clouage.'],
  grunfeld_exchange: ['Grünfeld — Variante d’échange', 'D85', 'w', 'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3', 'Construis un grand centre de pions, puis défends-le activement.'],
  benoni_modern: ['Benoni moderne', 'A60', 'b', 'd4 Nf6 c4 e6 Nf3 c5 d5 exd5 cxd5 d6', 'Accepte moins d’espace pour obtenir des cases et des colonnes actives.'],
  benko: ['Gambit Benko', 'A57', 'b', 'd4 Nf6 c4 c5 d5 b5', 'Sacrifie un pion pour une pression durable sur les colonnes a et b.'],

  london_jobava: ['Londres Jobava', 'D00', 'w', 'd4 d5 Nc3 Nf6 Bf4', 'Associe Bf4 et Nc3 pour créer des menaces rapides sur c7.'],
  colle_zukertort: ['Colle-Zukertort', 'A06', 'w', 'd4 Nf6 Nf3 e6 e3 b6 Bd3 Bb7 O-O Be7 b3', 'Fianchette le fou dame et prépare une attaque construite sur le roi.'],
  torre: ['Attaque Torre', 'A46', 'w', 'd4 Nf6 Nf3 e6 Bg5', 'Cloue le cavalier avant de choisir la structure de pions.'],
  trompowsky: ['Attaque Trompowsky', 'A45', 'w', 'd4 Nf6 Bg5', 'Pose immédiatement une question au cavalier et évite les grandes Indiennes.'],
  stonewall: ['Attaque Stonewall', 'D00', 'w', 'd4 d5 e3 Nf6 Bd3 e6 f4', 'Bâtis une chaîne de pions qui soutient une attaque sur le roi.'],
  bird: ['Ouverture Bird', 'A02', 'w', 'f4 d5 Nf3 Nf6 e3', 'Contrôle e5 dès le premier coup et prépare une structure hollandaise inversée.'],
  english_four_knights: ['Anglaise — Quatre Cavaliers', 'A28', 'w', 'c4 e5 Nc3 Nf6 Nf3 Nc6', 'Développe sans dévoiler trop tôt la structure centrale.'],
  reti_kings_indian_attack: ['Attaque Est-Indienne', 'A07', 'w', 'Nf3 d5 g3 Nf6 Bg2 g6 O-O Bg7 d3 O-O Nbd2', 'Installe un dispositif universel avant de préparer e4.'],

  modern: ['Défense moderne', 'B06', 'b', 'e4 g6 d4 Bg7 Nc3 d6', 'Laisse Blanc occuper le centre pour le viser avec les pièces.'],
  modern_gurgenidze: ['Moderne — Gurgenidze', 'B06', 'b', 'e4 g6 d4 Bg7 Nc3 c6 f4 d5', 'Frappe le centre blanc avec ...d5 après avoir préparé ...c6.'],
  scandinavian_modern: ['Scandinave moderne', 'B01', 'b', 'e4 d5 exd5 Qxd5 Nc3 Qd6', 'Place la dame en d6 pour soutenir ...e5 et le développement du fou.'],
  alekhine_exchange: ['Alekhine — Variante d’échange', 'B03', 'w', 'e4 Nf6 e5 Nd5 d4 d6 c4 Nb6 exd6', 'Clarifie le centre avant que Noir ne multiplie les attaques.'],
  alekhine_four_pawns: ['Alekhine — Quatre Pions', 'B03', 'w', 'e4 Nf6 e5 Nd5 d4 d6 c4 Nb6 f4', 'Construis un centre impressionnant, puis développe pour le soutenir.'],
  owen: ['Défense Owen', 'B00', 'b', 'e4 b6 d4 Bb7 Bd3', 'Attaque e4 depuis la grande diagonale avec un développement discret.'],
  nimzowitsch_defense: ['Défense Nimzowitsch', 'B00', 'b', 'e4 Nc6', 'Développe une pièce tout en gardant le choix entre ...e5 et ...d5.'],
  polish: ['Ouverture polonaise', 'A00', 'w', 'b4 e5 Bb2', 'Gagne de l’espace à l’aile dame et active immédiatement le fou.'],
  grob: ['Attaque Grob', 'A00', 'w', 'g4 d5 Bg2', 'Dévie l’adversaire de la théorie et vise b7 sur la grande diagonale.'],
  dutch_leningrad: ['Hollandaise — Leningrad', 'A87', 'b', 'd4 f5 g3 Nf6 Bg2 g6', 'Associe ...f5 au fianchetto pour attaquer le roi.'],
  dutch_classical: ['Hollandaise — Classique', 'A90', 'b', 'd4 f5 g3 Nf6 Bg2 e6', 'Contrôle e4 et prépare un dispositif central solide.'],

  evans_accepted: ['Gambit Evans accepté', 'C52', 'w', 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4', 'Transforme le pion b en temps de développement et en centre puissant.'],
  evans_declined: ['Gambit Evans refusé', 'C51', 'w', 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bb6', 'Gagne de l’espace à l’aile dame même lorsque le gambit est refusé.'],
  kings_gambit_accepted: ['Gambit Roi accepté', 'C33', 'w', 'e4 e5 f4 exf4 Nf3 g5', 'Ouvre la colonne f et cherche l’initiative avant de reprendre le pion.'],
  falkbeer: ['Contre-gambit Falkbeer', 'C31', 'b', 'e4 e5 f4 d5 exd5 e4', 'Réponds au gambit par une contre-attaque centrale immédiate.'],
  blackmar: ['Gambit Blackmar-Diemer', 'D00', 'w', 'd4 d5 e4 dxe4 Nc3 Nf6 f3', 'Sacrifie le pion e pour développer vite et ouvrir la colonne f.'],
  englund: ['Gambit Englund', 'A40', 'b', 'd4 e5', 'Provoque une partie tactique dès le premier coup de 1.d4.'],
  budapest: ['Gambit de Budapest', 'A52', 'b', 'd4 Nf6 c4 e5 dxe5 Ng4', 'Récupère le pion e5 en développant les pièces avec tempo.'],
  benko_accepted: ['Gambit Benko accepté', 'A58', 'b', 'd4 Nf6 c4 c5 d5 b5 cxb5 a6 bxa6', 'Ouvre les colonnes de l’aile dame pour une compensation à long terme.'],
  wing_gambit: ['Gambit de l’aile', 'B20', 'w', 'e4 c5 b4 cxb4 a3', 'Détourne le pion c pour installer d4 en un seul mouvement.'],
  halasz_gambit: ['Gambit Halász', 'C20', 'w', 'e4 e5 d4 exd4 f4', 'Offre un second pion pour ouvrir les lignes contre le roi.'],
  urusov: ['Gambit Urusov', 'C24', 'w', 'e4 e5 Nf3 Nf6 Bc4 Nxe4 O-O d5 Re1', 'Sacrifie e4 pour placer la tour au centre avec tempo.'],
  boden_kieseritzky: ['Gambit Boden-Kieseritzky', 'C24', 'w', 'e4 e5 Nf3 Nf6 Bc4 Nxe4 Nc3 Nxc3 dxc3', 'Ouvre les diagonales des fous pour une attaque rapide.'],

  spanish_marshall: ['Espagnole — Attaque Marshall', 'C89', 'b', 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3 d5', 'Sacrifie le pion e pour une initiative durable contre le roi blanc.'],
  spanish_breyer: ['Espagnole — Breyer', 'C95', 'b', 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8', 'Replie le cavalier pour le redéployer vers d7 sans affaiblir la position.'],
  najdorf_english: ['Najdorf — Attaque anglaise', 'B90', 'w', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e6 f3', 'Prépare Qd2, le grand roque et une attaque de pions sur le roi.'],
  najdorf_poisoned: ['Najdorf — Pion empoisonné', 'B97', 'b', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5 e6 f4 Qb6 Qd2 Qxb2', 'Accepte un risque calculé pour capturer b2 et tester la préparation blanche.'],
  sveshnikov_novosibirsk: ['Sveshnikov — Novossibirsk', 'B33', 'b', 'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6 Bg5 a6 Na3 b5', 'Gagne de l’espace à l’aile dame et prépare ...Bb7.'],
  scheveningen_keres: ['Scheveningue — Attaque Keres', 'B81', 'w', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6 g4', 'Lance g4 avant que Noir ne puisse roquer confortablement.'],
  kid_mar_del_plata: ['Est-Indienne — Mar del Plata', 'E97', 'b', 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7', 'Ferme le centre puis prépare l’assaut ...f5 contre le roi.'],
  grunfeld_russian: ['Grünfeld — Variante russe', 'D97', 'w', 'd4 Nf6 c4 g6 Nc3 d5 Nf3 Bg7 Qb3', 'Mets d5 sous pression avec la dame sans céder immédiatement le centre.'],
  nimzo_saemisch: ['Nimzo-Indienne — Sämisch', 'E24', 'w', 'd4 Nf6 c4 e6 Nc3 Bb4 a3 Bxc3+ bxc3', 'Accepte les pions doublés pour obtenir la paire de fous et le centre.'],
  qgd_cambridge_springs: ['Gambit Dame — Cambridge Springs', 'D52', 'b', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 c6 Nf3 Qa5', 'Crée des menaces sur c3 et exploite le clouage du cavalier.'],
  semi_slav_moscow: ['Semi-Slave — Variante de Moscou', 'D43', 'w', 'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 Bg5 h6 Bh4', 'Garde le clouage et accepte une bataille stratégique complexe.'],
  catalan_main: ['Catalane — Ligne principale', 'E05', 'w', 'd4 Nf6 c4 e6 g3 d5 Bg2 Be7 Nf3 O-O O-O dxc4 Qc2', 'Récupère c4 en maintenant la pression sur la grande diagonale.']
};

var OPENING_COMMENT_CYCLE = [
  'Occupe ou contrôle une case centrale importante.',
  'Développe une pièce tout en servant le plan de l’ouverture.',
  'Répond à la menace adverse sans perdre le fil stratégique.',
  'Améliore la coordination avant l’action au centre.',
  'Prépare la prochaine rupture de pions.',
  'Place la pièce sur sa case théorique.'
];

function buildCurriculumOpening(row) {
  var name = row[0];
  var eco = row[1];
  var side = row[2];
  var sequence = row[3].trim().split(/\s+/);
  var idea = row[4];
  return {
    name: name,
    eco: eco,
    forColor: side,
    intro: idea,
    about: 'Cette leçon ' + eco + ' t’apprend la position de référence, l’ordre des coups et surtout le plan qui relie chaque développement. Mémorise la logique avant la suite exacte.',
    moves: sequence.map(function (san, index) {
      return {
        san: san,
        c: index === sequence.length - 1 ? idea : OPENING_COMMENT_CYCLE[index % OPENING_COMMENT_CYCLE.length]
      };
    })
  };
}

if (typeof OPENINGS !== 'undefined') {
  Object.keys(OPENING_EXTRA_ROWS).forEach(function (key) {
    if (!OPENINGS[key]) OPENINGS[key] = buildCurriculumOpening(OPENING_EXTRA_ROWS[key]);
  });
  if (typeof Chess !== 'undefined' && typeof document !== 'undefined') {
    var curriculumSanErrors = [];
    Object.keys(OPENINGS).forEach(function (key) {
      var game = new Chess();
      OPENINGS[key].moves.some(function (step, index) {
        var move = game.move(step.san.replace(/[!?]+$/, ''));
        if (move) return false;
        curriculumSanErrors.push({ key: key, index: index, san: step.san });
        return true;
      });
    });
    document.documentElement.dataset.openingCatalogCount = String(Object.keys(OPENINGS).length);
    document.documentElement.dataset.openingCatalogErrors = JSON.stringify(curriculumSanErrors);
    if (curriculumSanErrors.length) console.error('Lignes d’ouverture invalides', curriculumSanErrors);
  }
}

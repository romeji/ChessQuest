/* ============================================================
   ChessQuest — openings.js
   Bibliothèque complète des 26 ouvertures + logique d'entraînement.
   ============================================================ */

const OPENINGS = {
  najdorf:{ name:'Sicilienne — Najdorf', forColor:'b',
    intro:"La Najdorf est l'une des ouvertures les plus jouées au monde : très flexible, elle laisse à Noir plusieurs plans possibles (...e5 ou ...e6).",
    about:"La Najdorf porte le nom du grand maître Miguel Najdorf et reste depuis 70 ans l'arme préférée de nombreux champions du monde, dont Bobby Fischer, Garry Kasparov et Magnus Carlsen. Sa force vient de sa flexibilité totale : Noir peut choisir une expansion au centre (...e5) ou un jeu plus fermé (...e6) selon le style de l'adversaire.",
    moves:[
      {san:'e4', c:"Le coup le plus populaire au 1er coup : Blanc ouvre le centre et libère fou et dame."},
      {san:'c5', c:"La Sicilienne : plutôt que de disputer le centre symétriquement, Noir contre-attaque sur l'aile dame."},
      {san:'Nf3', c:"Développement naturel qui prépare d4."},
      {san:'d6', c:"Coup flexible : soutient un futur ...e5 et retarde l'engagement du cavalier g8."},
      {san:'d4', c:"Blanc ouvre le centre en force."},
      {san:'cxd4', c:"Noir capture, ce qui lui donnera une majorité de pions à l'aile dame en finale."},
      {san:'Nxd4', c:"Blanc récupère le pion avec un cavalier bien centralisé."},
      {san:'Nf6', c:"Attaque immédiatement le pion e4."},
      {san:'Nc3', c:"Défend e4 tout en développant."},
      {san:'a6', c:"Le coup signature du Najdorf : empêche Nb5 et Bb5+, prépare ...e5 ou ...b5 selon les besoins."},
      {san:'Be2', c:"Ligne classique : développement solide avant de roquer."},
      {san:'e5', c:"Noir prend de l'espace au centre et chasse le cavalier de d4."},
      {san:'Nb3', c:"Le cavalier recule en sécurité ; e5 est bien défendu par le pion."},
      {san:'Be7', c:"Développement, prépare le petit roque."}
    ] },
  dragon:{ name:'Sicilienne — Dragon', forColor:'b',
    intro:"Le Dragon fianchette le fou en g7 sur la grande diagonale. Les parties sont souvent tranchantes, avec des roques opposés.",
    about:"Le Dragon doit son nom à la forme du pion noir en g6-f7-e5-d6, qui rappelle les écailles d'un dragon selon le maître Fedor Bogoljubov. C'est l'une des ouvertures les plus tranchantes du jeu d'échecs : les deux rois roquent généralement du côté opposé et la partie devient une course à l'attaque.",
    moves:[
      {san:'e4', c:"Ouverture centrale classique."},
      {san:'c5', c:"La Sicilienne : contre-attaque sur l'aile dame."},
      {san:'Nf3', c:"Développement, prépare d4."},
      {san:'d6', c:"Coup flexible typique des Siciliennes."},
      {san:'d4', c:"Blanc ouvre le centre."},
      {san:'cxd4', c:"Capture standard."},
      {san:'Nxd4', c:"Récupération du pion, cavalier centralisé."},
      {san:'Nf6', c:"Attaque e4."},
      {san:'Nc3', c:"Défend e4 et développe."},
      {san:'g6', c:"Le Dragon : le fou ira en g7 contrôler toute la grande diagonale a1-h8."},
      {san:'Be3', c:"Blanc prépare Qd2 et souvent le grand roque, pour lancer une attaque à l'aile roi (Attaque Yougoslave)."},
      {san:'Bg7', c:"Le fou dragon prend position, redoutable une fois la diagonale ouverte."},
      {san:'f3', c:"Soutient e4 et prépare g4-h4 dans l'Attaque Yougoslave."},
      {san:'O-O', c:"Noir roque ; la partie devient souvent une course entre les deux ailes."}
    ] },
  sveshnikov:{ name:'Sicilienne — Sveshnikov', forColor:'b',
    intro:"Le Sveshnikov est une ligne très dynamique où Noir accepte une case faible en d5 pour gagner de l'espace et du temps.",
    about:"Popularisée par le grand maître soviétique Evgeny Sveshnikov dans les années 1970-80, cette variante était jugée douteuse avant de devenir un pilier du répertoire de nombreux champions du monde, dont Magnus Carlsen.",
    moves:[
      {san:'e4', c:"Ouverture centrale classique."},
      {san:'c5', c:"La Sicilienne."},
      {san:'Nf3', c:"Développement, prépare d4."},
      {san:'Nc6', c:"Développement naturel, garde plusieurs transpositions possibles."},
      {san:'d4', c:"Blanc ouvre le centre."},
      {san:'cxd4', c:"Capture standard."},
      {san:'Nxd4', c:"Récupération du pion."},
      {san:'Nf6', c:"Attaque e4."},
      {san:'Nc3', c:"Défend e4."},
      {san:'e5', c:"Le coup thématique du Sveshnikov : Noir gagne temps et espace, au prix d'une case faible en d5."},
      {san:'Ndb5', c:"Le cavalier vise la case d6, profitant temporairement de l'affaiblissement du centre noir."},
      {san:'d6', c:"Noir consolide et prépare de chasser le cavalier."},
      {san:'Bg5', c:"Blanc maintient la pression sur f6."},
      {san:'a6', c:"Chasse le cavalier de b5."},
      {san:'Na3', c:"Recul vers une case toujours utile (surveille b5 et c4)."},
      {san:'b5', c:"Noir gagne de l'espace à l'aile dame et prépare ...Bb7, un plan typique et moderne du Sveshnikov."}
    ] },
  qgd:{ name:'Gambit Dame — Refusé (Orthodoxe)', forColor:'w',
    intro:"La ligne la plus classique du Gambit Dame : Noir garde fermement le pion d5 en jouant ...e6, quitte à enfermer un peu son fou c8.",
    about:"Le Gambit Dame Refusé est l'une des ouvertures les plus jouées de l'histoire, utilisée dans d'innombrables matchs de championnat du monde depuis plus d'un siècle.",
    moves:[
      {san:'d4', c:"Contrôle le centre et ouvre la diagonale du fou c1."},
      {san:'d5', c:"Noir répond symétriquement au centre."},
      {san:'c4', c:"Le Gambit Dame : Blanc propose un pion pour attirer le pion d5 loin du centre."},
      {san:'e6', c:"La Défense refusée : Noir garde fermement d5."},
      {san:'Nc3', c:"Développement, ajoute la pression sur d5."},
      {san:'Nf6', c:"Développement symétrique, défend d5 une fois de plus."},
      {san:'Bg5', c:"Épingle le cavalier f6 contre la dame, pression thématique de l'Orthodoxe."},
      {san:'Be7', c:"Casse l'épingle en préparant le roque."},
      {san:'e3', c:"Libère le fou f1 et soutient un futur Bd3 ou Bxc4."},
      {san:'O-O', c:"Noir met son roi en sécurité."},
      {san:'Nf3', c:"Blanc termine son développement mineur avant de choisir entre Rc1, Qc2 ou cxd5."}
    ] },
  qga:{ name:'Gambit Dame — Accepté', forColor:'w',
    intro:"Noir prend le pion c4 mais ne peut pas le garder : Blanc le récupère avec un temps d'avance en développement.",
    about:"Le Gambit Dame Accepté peut sembler risqué pour Noir (il cède le centre), mais il est en réalité parfaitement sain : Noir échange un peu d'espace contre un développement rapide et facile de ses pièces.",
    moves:[
      {san:'d4', c:"Contrôle le centre."},
      {san:'d5', c:"Réponse symétrique."},
      {san:'c4', c:"Le Gambit Dame."},
      {san:'dxc4', c:"La Défense Acceptée : Noir prend le pion, mais devra le rendre."},
      {san:'Nf3', c:"Empêche ...b5 (qui protégerait durablement c4) et développe."},
      {san:'Nf6', c:"Développement symétrique."},
      {san:'e3', c:"Libère le fou f1 pour aller reprendre le pion en c4."},
      {san:'e6', c:"Développement solide, prépare ...c5."},
      {san:'Bxc4', c:"Blanc récupère le pion avec un développement rapide et un fou actif."}
    ] },
  slav:{ name:'Gambit Dame — Défense Slave (côté Blanc)', forColor:'w',
    intro:"Face à la Slave, Noir soutient d5 avec ...c6, gardant son fou c8 libre. Voici la ligne principale de l'Acceptée.",
    about:"La Défense Slave est considérée par beaucoup de théoriciens comme la réponse la plus solide et la plus fiable contre 1.d4 au plus haut niveau.",
    moves:[
      {san:'d4', c:"Contrôle le centre."},
      {san:'d5', c:"Réponse symétrique."},
      {san:'c4', c:"Le Gambit Dame."},
      {san:'c6', c:"La Défense Slave : Noir soutient d5 avec le pion c, en gardant la voie libre pour le fou c8."},
      {san:'Nf3', c:"Développement."},
      {san:'Nf6', c:"Développement symétrique."},
      {san:'Nc3', c:"Développement, ajoute la pression sur d5."},
      {san:'dxc4', c:"La Slave acceptée : Noir prend le pion, gardé un temps grâce au soutien de ...c6."},
      {san:'a4', c:"Empêche ...b5, qui aurait protégé durablement le pion c4 — ligne principale."},
      {san:'Bf5', c:"Noir développe son fou avant ...e6, profitant d'avoir gardé cette case libre."}
    ] },
  italienne:{ name:'Italienne (Giuoco Piano)', forColor:'w',
    intro:"Une des plus anciennes ouvertures encore jouées au top niveau : développement rapide, pression immédiate sur f7.",
    about:"L'Italienne est connue depuis le 16e siècle et a connu un immense regain de popularité au 21e siècle grâce à des joueurs comme Magnus Carlsen.",
    moves:[
      {san:'e4', c:"Ouvre le centre et libère deux pièces."},
      {san:'e5', c:"Noir répond symétriquement."},
      {san:'Nf3', c:"Attaque e5 et développe."},
      {san:'Nc6', c:"Défend e5."},
      {san:'Bc4', c:"Vise f7, la case la plus fragile du camp noir."},
      {san:'Bc5', c:"Développement symétrique : l'Italienne classique."},
      {san:'c3', c:"Prépare d4 pour construire un grand centre de pions."},
      {san:'Nf6', c:"Contre-attaque à son tour le pion e4."},
      {san:'d3', c:"Coup solide et prudent (Giuoco Pianissimo), soutient e4 sans s'engager encore."}
    ] },
  espagnole:{ name:'Espagnole (Ruy Lopez)', forColor:'w',
    intro:"Considérée comme l'ouverture la plus solide et la plus étudiée du jeu ouvert : pression durable et positions riches.",
    about:"Jouée depuis le 16e siècle et nommée d'après le prêtre espagnol Ruy López, c'est l'ouverture la plus étudiée du jeu ouvert.",
    moves:[
      {san:'e4', c:"Ouverture centrale classique."},
      {san:'e5', c:"Symétrie."},
      {san:'Nf3', c:"Attaque e5."},
      {san:'Nc6', c:"Défend e5."},
      {san:'Bb5', c:"L'Espagnole : le fou attaque le cavalier qui défend e5, pression indirecte sur le centre noir."},
      {san:'a6', c:"Le coup de Morphy : chasse le fou et pose la question de son intention."},
      {san:'Ba4', c:"Maintient la pression, c'est la ligne principale."},
      {san:'Nf6', c:"Contre-attaque e4 à son tour."},
      {san:'O-O', c:"Blanc roque avant de résoudre la tension au centre."}
    ] },
  ecossaise:{ name:'Écossaise (Scotch)', forColor:'w',
    intro:"Blanc ouvre le centre dès le 3e coup plutôt que de développer un fou : jeu ouvert et dynamique.",
    about:"Longtemps considérée comme moins ambitieuse que l'Espagnole, l'Écossaise a été relancée au plus haut niveau par Garry Kasparov dans les années 1990.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'e5', c:"Symétrie."},
      {san:'Nf3', c:"Attaque e5."},
      {san:'Nc6', c:"Défend e5."},
      {san:'d4', c:"L'Écossaise : Blanc ouvre le centre immédiatement plutôt que de jouer Bc4 ou Bb5."},
      {san:'exd4', c:"Noir accepte l'échange central."},
      {san:'Nxd4', c:"Cavalier centralisé, position ouverte et dynamique pour les deux camps."}
    ] },
  gambit_roi:{ name:'Gambit Roi', forColor:'w',
    intro:"Une ouverture romantique et agressive : Blanc sacrifie un pion pour ouvrir des lignes d'attaque rapides.",
    about:"Le Gambit Roi fut l'ouverture romantique par excellence du 19e siècle, jouée par des légendes comme Paul Morphy et Adolf Anderssen.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'e5', c:"Symétrie."},
      {san:'f4', c:"Le Gambit Roi : Blanc sacrifie un pion pour ouvrir la colonne f et attaquer rapidement."},
      {san:'exf4', c:"Noir accepte le gambit."},
      {san:'Nf3', c:"Empêche ...Qh4+ et prépare de récupérer le pion tout en développant."}
    ] },
  vienne:{ name:'Partie Vienne', forColor:'w',
    intro:"Développement flexible qui garde l'option d'un Gambit Roi différé (f4) ou d'un jeu plus positionnel.",
    about:"La Vienne offre à Blanc une alternative flexible à l'Espagnole ou l'Italienne, gardant l'adversaire dans l'incertitude sur le plan à venir.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'e5', c:"Symétrie."},
      {san:'Nc3', c:"La Vienne : développement flexible avant de décider du plan (f4 ou jeu calme)."},
      {san:'Nf6', c:"Développement, attaque e4."},
      {san:'f4', c:"Blanc opte pour une version différée du Gambit Roi."},
      {san:'d5', c:"Noir contre-attaque immédiatement le centre, la réponse la plus testée."}
    ] },
  quatre_cavaliers:{ name:'Partie des Quatre Cavaliers', forColor:'w',
    intro:"Développement symétrique et solide des deux côtés — une ouverture calme et saine, idéale pour apprendre les bases du jeu ouvert.",
    about:"Une des ouvertures les plus anciennes et les plus saines du jeu ouvert, souvent recommandée aux débutants.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'e5', c:"Symétrie."},
      {san:'Nf3', c:"Attaque e5."},
      {san:'Nc6', c:"Défend e5."},
      {san:'Nc3', c:"Les Quatre Cavaliers : développement naturel plutôt qu'un coup de fou immédiat."},
      {san:'Nf6', c:"Symétrie complète — position équilibrée et instructive."}
    ] },
  francaise:{ name:'Défense Française', forColor:'b',
    intro:"Noir accepte un fou c8 temporairement passif contre une structure de pions très solide.",
    about:"La Française a la réputation d'une ouverture 'de combattant', arme de prédilection de champions comme Mikhail Botvinnik.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'e6', c:"La Française : Noir prépare ...d5 en soutenant d'abord la case."},
      {san:'d4', c:"Blanc prend un grand centre."},
      {san:'d5', c:"Noir frappe immédiatement le centre."},
      {san:'Nc3', c:"Blanc maintient la tension centrale."},
      {san:'Nf6', c:"Attaque e4, forçant Blanc à décider (avancer, échanger ou défendre)."}
    ] },
  carokann:{ name:'Défense Caro-Kann', forColor:'b',
    intro:"Comme la Française mais Noir garde son fou c8 actif, car il n'a pas encore joué ...e6.",
    about:"Le Caro-Kann a la réputation d'être l'une des défenses les plus fiables contre 1.e4, choix privilégié d'Anatoly Karpov.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'c6', c:"Le Caro-Kann : prépare ...d5 sans enfermer le fou c8."},
      {san:'d4', c:"Blanc prend le centre."},
      {san:'d5', c:"Noir frappe le centre."},
      {san:'Nc3', c:"Développement, maintient la tension."},
      {san:'dxe4', c:"Noir échange au bon moment."},
      {san:'Nxe4', c:"Position saine et solide pour Noir, souvent recherchée par les joueurs positionnels."}
    ] },
  scandinave:{ name:'Défense Scandinave', forColor:'b',
    intro:"Noir défie immédiatement le pion e4, au prix de sortir sa dame tôt.",
    about:"Longtemps sous-estimée, la Scandinave a gagné en respectabilité grâce à des joueurs comme Magnus Carlsen.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'d5', c:"La Scandinave : Noir défie immédiatement le pion e4."},
      {san:'exd5', c:"Blanc accepte l'échange."},
      {san:'Qxd5', c:"Noir récupère le pion mais sort sa dame tôt."},
      {san:'Nc3', c:"Blanc gagne un temps en attaquant la dame."},
      {san:'Qa5', c:"Retraite active la plus jouée."}
    ] },
  pirc:{ name:'Défense Pirc / Moderne', forColor:'b',
    intro:"Noir laisse Blanc occuper le centre pour le contre-attaquer ensuite avec les pièces.",
    about:"Le Pirc incarne la philosophie hypermoderne, une ouverture flexible et peu théorique.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'d6', c:"Le Pirc : Noir retarde l'occupation du centre."},
      {san:'d4', c:"Blanc prend un grand centre."},
      {san:'Nf6', c:"Développement, attaque e4."},
      {san:'Nc3', c:"Défend e4 et développe."},
      {san:'g6', c:"Fianchetto typique, prépare Bg7."}
    ] },
  alekhine:{ name:'Défense Alekhine', forColor:'b',
    intro:"Provocation directe : Noir laisse Blanc avancer ses pions pour les attaquer ensuite.",
    about:"Nommée d'après le champion du monde Alexandre Alekhine, cette défense provoque délibérément un grand centre blanc.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'Nf6', c:"La défense Alekhine : provoque l'avance des pions blancs."},
      {san:'e5', c:"Blanc chasse le cavalier en gagnant de l'espace."},
      {san:'Nd5', c:"Le cavalier recule en gardant son activité."},
      {san:'d4', c:"Blanc construit un grand centre de pions."},
      {san:'d6', c:"Noir commence déjà à le remettre en question."}
    ] },
  londres:{ name:'Système Londres', forColor:'w',
    intro:"Un système facile à apprendre, jouable contre presque toutes les réponses noires.",
    about:"Le Système Londres doit sa popularité récente à sa simplicité, popularisé par Magnus Carlsen et Wesley So.",
    moves:[
      {san:'d4', c:"Contrôle le centre."},
      {san:'d5', c:"Réponse symétrique."},
      {san:'Nf3', c:"Développement."},
      {san:'Nf6', c:"Symétrie."},
      {san:'Bf4', c:"Le Système Londres : le fou sort avant e3."},
      {san:'e6', c:"Noir adopte une structure solide."},
      {san:'e3', c:"Complète la structure en pyramide."}
    ] },
  colle:{ name:'Système Colle', forColor:'w',
    intro:"Une structure extrêmement solide, préparant souvent une attaque avec e3-e4 plus tard.",
    about:"Le Système Colle, nommé d'après le maître belge Edgar Colle, demande peu de mémorisation théorique.",
    moves:[
      {san:'d4', c:"Contrôle le centre."},
      {san:'d5', c:"Réponse symétrique."},
      {san:'Nf3', c:"Développement."},
      {san:'Nf6', c:"Symétrie."},
      {san:'e3', c:"Le Système Colle : structure très solide, prépare Bd3."},
      {san:'e6', c:"Noir adopte une structure prudente."},
      {san:'c3', c:"Soutient le centre avant Bd3 et un futur e4."}
    ] },
  indienne_roi:{ name:'Défense Est-Indienne (Indienne du Roi)', forColor:'b',
    intro:"Noir laisse Blanc prendre un grand centre pour le contre-attaquer ensuite avec ...e5 ou ...c5.",
    about:"L'Indienne du Roi fut l'arme de prédilection de Garry Kasparov et Bobby Fischer, réputés pour leur style offensif.",
    moves:[
      {san:'d4', c:"Contrôle le centre."},
      {san:'Nf6', c:"Réponse flexible, retarde ...d5."},
      {san:'c4', c:"Blanc étend son emprise sur le centre."},
      {san:'g6', c:"Noir prépare le fianchetto caractéristique."},
      {san:'Nc3', c:"Développement."},
      {san:'Bg7', c:"Le fou contrôle la grande diagonale."},
      {san:'e4', c:"Blanc prend un centre de pions maximal."},
      {san:'d6', c:"Noir prépare ...O-O puis ...e5."}
    ] },
  nimzo_indienne:{ name:'Défense Nimzo-Indienne', forColor:'b',
    intro:"Le fou épingle le cavalier c3 et empêche Blanc de jouer e4 facilement.",
    about:"Développée par le théoricien Aron Nimzowitsch, considérée comme la défense la plus solide contre 1.d4.",
    moves:[
      {san:'d4', c:"Contrôle le centre."},
      {san:'Nf6', c:"Réponse flexible."},
      {san:'c4', c:"Blanc étend son emprise."},
      {san:'e6', c:"Prépare ...Bb4, empêche un grand centre blanc immédiat."},
      {san:'Nc3', c:"Développement, cible potentielle de l'épingle noire."},
      {san:'Bb4', c:"La Nimzo-Indienne : le fou épingle le cavalier."}
    ] },
  grunfeld:{ name:'Défense Grünfeld', forColor:'b',
    intro:"Dans l'esprit hypermoderne : Noir laisse Blanc prendre un centre de pions pour le frapper immédiatement.",
    about:"L'ouverture de prédilection de champions comme Garry Kasparov et Boris Spassky, reconnue pour son dynamisme.",
    moves:[
      {san:'d4', c:"Contrôle le centre."},
      {san:'Nf6', c:"Réponse flexible."},
      {san:'c4', c:"Blanc étend son emprise."},
      {san:'g6', c:"Prépare le fianchetto."},
      {san:'Nc3', c:"Développement."},
      {san:'d5', c:"La Grünfeld : Noir frappe immédiatement le centre."}
    ] },
  anglaise:{ name:'Ouverture Anglaise', forColor:'w',
    intro:"Blanc contrôle d5 depuis le flanc : une ouverture flexible qui peut transposer vers de nombreuses structures.",
    about:"Appréciée pour sa flexibilité, elle fut l'une des ouvertures de prédilection de Magnus Carlsen.",
    moves:[
      {san:'c4', c:"L'Anglaise : contrôle d5 depuis le flanc."},
      {san:'e5', c:"Réponse symétrique la plus jouée (Anglaise inversée)."},
      {san:'Nc3', c:"Développement naturel."},
      {san:'Nf6', c:"Symétrie, développement."}
    ] },
  reti:{ name:'Ouverture Réti', forColor:'w',
    intro:"Ouverture hypermoderne et flexible : Blanc garde toutes les options de structure de pions ouvertes.",
    about:"Nommée d'après le maître tchèque Richard Réti, l'une des ouvertures fondatrices du mouvement hypermoderne.",
    moves:[
      {san:'Nf3', c:"Le Réti : développement flexible avant tout engagement de pions."},
      {san:'d5', c:"Noir occupe le centre classiquement."},
      {san:'c4', c:"Attaque immédiatement d5 depuis le flanc."},
      {san:'e6', c:"Noir défend solidement ; transposition possible vers un Gambit Dame Refusé."}
    ] },
  mat_berger:{ name:'Le Mat du Berger (piège à connaître)', forColor:null,
    intro:"Un piège classique — pour le réussir contre un adversaire imprudent, et surtout pour l'éviter en jouant ...Nf6 tôt.",
    about:"Ce piège fonctionne surtout contre des joueurs débutants. Le connaître dans les deux sens est une étape essentielle.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'e5', c:"Symétrie."},
      {san:'Bc4', c:"Le fou vise déjà la case f7, la plus fragile du camp noir."},
      {san:'Nc6', c:"Développement naturel, mais Noir ignore encore le danger."},
      {san:'Qh5', c:"La dame rejoint la diagonale et menace Qxf7#, tout en attaquant e5."},
      {san:'Nf6??', c:"Erreur classique : ce coup défend e5 mais ignore complètement la menace de mat sur f7 !"},
      {san:'Qxf7#', c:"Mat du berger : la dame, protégée par le fou, mate directement."}
    ] },
  danse_cavaliers:{ name:'La Danse des Cavaliers (manœuvre)', forColor:null,
    intro:"Le cavalier est la seule pièce qui doit parfois reculer pour mieux avancer.",
    about:"Cette manœuvre Nb1-d2-f1-g3 illustre une vérité fondamentale : le cavalier a souvent besoin de plusieurs temps pour se repositionner.",
    moves:[
      {san:'e4', c:"Ouverture centrale."},
      {san:'e5', c:"Symétrie."},
      {san:'Nf3', c:"Attaque e5."},
      {san:'Nc6', c:"Défend e5."},
      {san:'Bc4', c:"Vise f7."},
      {san:'Bc5', c:"Développement symétrique (Giuoco Piano)."},
      {san:'c3', c:"Prépare d4, structure typique du jeu tranquille."},
      {san:'Nf6', c:"Développement, attaque e4."},
      {san:'d3', c:"Coup calme, soutient e4."},
      {san:'d6', c:"Symétrie."},
      {san:'Nbd2', c:"Premier temps de la manœuvre."},
      {san:'O-O', c:"Noir roque."},
      {san:'O-O', c:"Blanc roque à son tour."},
      {san:'Re8', c:"Noir centralise sa tour."},
      {san:'Nf1', c:"Deuxième temps : le cavalier continue sa route vers l'aile roi."},
      {san:'h6', c:"Noir prend une case de retraite pour son fou."},
      {san:'Ng3', c:"Troisième temps : le cavalier termine son voyage de b1 à g3 en trois coups."}
    ] }
};

const CATEGORIES = [
  {key:'favorites', title:'Tes ouvertures — Sicilienne & Gambit Dame', lines:['najdorf','dragon','sveshnikov','qgd','qga','slav']},
  {key:'ouvertes', title:'Ouvertures ouvertes — après 1.e4 e5', lines:['italienne','espagnole','ecossaise','gambit_roi','vienne','quatre_cavaliers']},
  {key:'semiouvertes', title:'Défenses semi-ouvertes — face à 1.e4', lines:['francaise','carokann','scandinave','pirc','alekhine']},
  {key:'fermees', title:'Ouvertures fermées — après 1.d4', lines:['londres','colle','indienne_roi','nimzo_indienne','grunfeld']},
  {key:'flanc', title:'Ouvertures de flanc', lines:['anglaise','reti']},
  {key:'techniques', title:'Pièges & techniques classiques', lines:['mat_berger','danse_cavaliers']}
];
function trainableKeys(){
  return CATEGORIES.filter(c => c.key !== 'techniques').flatMap(c => c.lines);
}

/* ============================================================
   LOGIQUE D'ENTRAÎNEMENT (utilisée par learn.html / openings.html)
   Chaque page qui inclut ce fichier doit fournir un conteneur
   d'échiquier nommé #train-board et appeler initOpeningTrainer().
   ============================================================ */
let trainBoard = null;
let trainGame = null;
let currentLine = null;
let currentLineKey = null;
let trainPly = 0;
let lineMistakes = 0;
let autoHintEnabled = true;

const WRONG_MOVE_PHRASES = [
  "Pas tout à fait ! Indice : le coup attendu déplace un {piece}. Réessaie.",
  "Presque ! Ce n'est pas ce coup-là — pense à un {piece}.",
  "Hmm, pas cette fois. Le bon coup implique un {piece}.",
  "Ce n'est pas le coup théorique ici. Le {piece} a un meilleur coup à jouer.",
  "Pas encore ! Un {piece} doit bouger.",
  "Attention, ce coup s'écarte de la théorie. Essaie encore avec un {piece}."
];
const CORRECT_MOVE_PREFIXES = ["Bien joué !", "Exactement !", "Parfait, c'est le coup théorique !", "Très bien !", "Impeccable !", "Beau coup !"];
let lastWrongIdx = -1, lastGoodIdx = -1;
function pickPhrase(arr, lastIdxRef){
  if(arr.length === 1) return arr[0];
  let idx;
  do { idx = Math.floor(Math.random()*arr.length); } while(idx === lastIdxRef.v);
  lastIdxRef.v = idx;
  return arr[idx];
}
const wrongRef = {v:-1}, goodRef = {v:-1};

function ensureTrainBoard(){
  if(trainBoard) return;
  trainBoard = Chessboard('train-board', {
    position:'start', draggable:true, pieceTheme: PIECE_THEME, showNotation:false,
    onDrop: onDropTrain, onSnapEnd: () => { if(trainGame) trainBoard.position(trainGame.fen()); }
  });
  renderCoords('train-ranks', 'train-files', 'white');
  $('#train-board').on('click', '[data-square]', function(){ trainSquareClick(this.getAttribute('data-square')); });
  document.getElementById('train-board').addEventListener('touchmove', e => e.preventDefault(), {passive:false});
}

let trainSelectedSquare = null;
function clearTrainSelection(){
  $('#train-board [data-square]').removeClass('selected-square');
  $('#train-board .move-dot').remove();
  trainSelectedSquare = null;
}
function showTrainLegalDots(square){
  trainGame.moves({square:square, verbose:true}).forEach(m => $(`#train-board [data-square="${m.to}"]`).append('<div class="move-dot"></div>'));
}
function trainSquareClick(square){
  if(!currentLine) return;
  const expectedColor = (trainPly % 2 === 0) ? 'w' : 'b';
  if(expectedColor !== currentLine.forColor) return;
  if(trainSelectedSquare === square){ clearTrainSelection(); return; }
  if(trainSelectedSquare === null){
    const piece = trainGame.get(square);
    if(piece && piece.color === expectedColor){
      trainSelectedSquare = square;
      $(`#train-board [data-square="${square}"]`).addClass('selected-square');
      showTrainLegalDots(square);
    }
    return;
  }
  const from = trainSelectedSquare;
  clearTrainSelection();
  attemptTrainMove(from, square);
}
function onDropTrain(source, target){
  const ok = attemptTrainMove(source, target);
  return ok ? undefined : 'snapback';
}

function showExpectedMove(){
  if(!currentLine) return;
  const expectedColor = (trainPly % 2 === 0) ? 'w' : 'b';
  if(expectedColor !== currentLine.forColor) return;
  const expected = currentLine.moves[trainPly];
  if(!expected) return;
  const g = new Chess(trainGame.fen());
  const match = g.moves({verbose:true}).find(m => m.san === expected.san.replace(/[!?]+$/, ''));
  if(match){
    $('#train-board [data-square]').removeClass('suggest-from suggest-to');
    $(`#train-board [data-square="${match.from}"]`).addClass('suggest-from');
    $(`#train-board [data-square="${match.to}"]`).addClass('suggest-to');
  }
}

function loadLine(line, key){
  ensureTrainBoard();
  currentLine = line;
  currentLineKey = key || currentLineKey;
  trainGame = new Chess();
  trainPly = 0; lineMistakes = 0;
  clearTrainSelection();
  trainBoard.orientation(line.forColor==='b' ? 'black' : 'white');
  trainBoard.start();
  renderCoords('train-ranks', 'train-files', line.forColor==='b' ? 'black' : 'white');
  clearHighlights('#train-board');
  const nameEl = document.getElementById('line-name'); if(nameEl) nameEl.textContent = line.name;
  const introEl = document.getElementById('line-intro'); if(introEl) introEl.textContent = line.intro;
  const aboutEl = document.getElementById('line-about'); if(aboutEl) aboutEl.textContent = line.about || '';
  if(typeof renderDots === 'function') renderDots();
  if(typeof renderTrainMoveList === 'function') renderTrainMoveList();
  setTrainFeedback(line.forColor === null ? "Démonstration : regarde la séquence se jouer automatiquement." : "C'est parti ! Les coups de l'adversaire sont joués automatiquement.", 'info');
  if(typeof fitBoards === 'function') fitBoards('train-board', trainBoard);
  continueTrainLine();
}

function continueTrainLine(){
  if(!currentLine) return;
  if(typeof renderDots === 'function') renderDots();
  $('#train-board [data-square]').removeClass('suggest-from suggest-to');
  if(trainPly >= currentLine.moves.length){
    setTrainFeedback('Ligne terminée — bravo ! Recommence pour la mémoriser, ou choisis-en une autre.', 'done');
    if(currentLine.forColor !== null) recordLineCompletion(currentLineKey, lineMistakes === 0);
    return;
  }
  const nextColor = (trainPly % 2 === 0) ? 'w' : 'b';
  const next = currentLine.moves[trainPly];
  if(nextColor !== currentLine.forColor){
    setTimeout(()=>{
      const mv = trainGame.move(next.san.replace(/[!?]+$/, ''));
      trainBoard.position(trainGame.fen());
      if(mv) highlightMove('#train-board', mv.from, mv.to);
      const who = currentLine.forColor === null ? (nextColor === 'w' ? 'Blancs' : 'Noirs') : 'Adversaire';
      setTrainFeedback(`${who} : ${next.san} — ${next.c}`, 'info');
      trainPly++;
      if(typeof renderTrainMoveList === 'function') renderTrainMoveList();
      continueTrainLine();
    }, 700);
  } else {
    setTrainFeedback(`À toi de jouer. Objectif : "${currentLine.name}".`, 'prompt');
    if(autoHintEnabled) showExpectedMove();
  }
}

function attemptTrainMove(source, target){
  if(!currentLine) return false;
  const expected = currentLine.moves[trainPly];
  if(!expected) return false;
  const expectedColor = (trainPly % 2 === 0) ? 'w' : 'b';
  if(expectedColor !== currentLine.forColor) return false;
  const moveObj = trainGame.move({from:source, to:target, promotion:'q'});
  if(moveObj === null) return false;
  if(moveObj.san !== expected.san.replace(/[!?]+$/, '')){
    trainGame.undo();
    lineMistakes++;
    flashSquares('#train-board', [target], 'flash-bad', 450);
    playSound('capture');
    setTrainFeedback(pickPhrase(WRONG_MOVE_PHRASES, wrongRef).replace('{piece}', pieceNameFromSan(expected.san)), 'bad');
    return false;
  }
  $('#train-board [data-square]').removeClass('suggest-from suggest-to');
  highlightMove('#train-board', moveObj.from, moveObj.to);
  flashSquares('#train-board', [moveObj.to], 'flash-good', 450);
  playSound('move');
  setTrainFeedback(`${pickPhrase(CORRECT_MOVE_PREFIXES, goodRef)} ${expected.san} — ${expected.c}`, 'good');
  trainPly++;
  if(typeof renderTrainMoveList === 'function') renderTrainMoveList();
  trainBoard.position(trainGame.fen());
  setTimeout(()=> continueTrainLine(), 500);
  return true;
}

function setTrainFeedback(text, kind){
  const el = document.getElementById('train-feedback');
  if(!el) return;
  el.textContent = text;
  el.className = 'feedback-box ' + (kind || '');
  speak(text);
}

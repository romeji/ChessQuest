# Analyse en arrière-plan — mise en route (gratuit)

Ce backend fait tourner Stockfish tout seul, toutes les 30 minutes, même
quand personne n'a l'app ouverte. Il te faut deux comptes gratuits
(GitHub + Firebase) et 15-20 minutes la première fois. Ensuite c'est
100% automatique.

## Vue d'ensemble

```
GitHub Actions (cron, gratuit)  →  Stockfish natif  →  Firestore (gratuit)
                                                              ↓
                                      analysis.html lit Firestore → instantané
```

## Étape 1 — Créer le projet Firebase

1. Va sur https://console.firebase.google.com → **Ajouter un projet** (gratuit,
   pas de carte bancaire nécessaire pour le plan Spark).
2. Dans le projet, menu de gauche → **Firestore Database** → **Créer une
   base de données** → démarre en **mode test** (on corrige les règles à
   l'étape 4).
3. Toujours dans Firestore, tu peux laisser les collections vides — elles
   se créeront toutes seules à l'usage.

## Étape 2 — Récupérer la config web (clé publique, sans risque)

1. ⚙️ **Paramètres du projet** → onglet **Général** → section
   "Vos applications" → clique l'icône **`</>`** (Web) → donne-lui un nom
   → **Enregistrer l'application**.
2. Firebase affiche un objet `firebaseConfig = { apiKey: "...", ... }`.
   Copie-le.
3. Ouvre `assets/js/firebase-sync.js` dans le projet et remplace le bloc
   `FIREBASE_CONFIG` par tes vraies valeurs.

## Étape 3 — Créer la clé de service (pour GitHub Actions)

1. ⚙️ **Paramètres du projet** → onglet **Comptes de service**.
2. **Générer une nouvelle clé privée** → un fichier `.json` se télécharge.
   ⚠️ Ce fichier est un secret, ne le mets JAMAIS dans le dépôt Git.

## Étape 4 — Sécuriser Firestore

1. Firestore Database → onglet **Règles**.
2. Remplace tout le contenu par celui de `backend/firestore.rules`
   (déjà dans le projet) → **Publier**.

## Étape 5 — Mettre le projet sur GitHub

1. Crée un dépôt sur https://github.com/new (privé ou public — voir la
   note sur les minutes gratuites plus bas).
2. Pousse-y tout le contenu de ce dossier, **backend/** et
   **.github/workflows/analyze.yml** inclus.

## Étape 6 — Ajouter le secret GitHub

1. Dans le dépôt GitHub → **Settings** → **Secrets and variables** →
   **Actions** → **New repository secret**.
2. Nom : `FIREBASE_SERVICE_ACCOUNT`
   Valeur : colle **tout le contenu** du fichier `.json` de l'étape 3.
3. Enregistre.

## Étape 7 — C'est parti

- Le workflow se déclenche automatiquement toutes les 30 minutes.
- Tu peux aussi le lancer à la main : onglet **Actions** du dépôt →
  "Analyse des parties en arrière-plan" → **Run workflow**.
- Dans l'app, va dans **Réglages** et renseigne ton pseudo Chess.com
  (comme avant) — ça l'ajoute maintenant aussi à la liste surveillée
  par le job GitHub.
- Ouvre **Analyse de partie** : tant que le job n'est pas encore passé,
  le bouton "Analyser" fait l'analyse en direct (comme avant, plus
  lent). Une fois le job passé, le même bouton devient instantané.

## Budget gratuit

- **GitHub Actions** : 2000 min/mois gratuites sur un dépôt privé,
  **illimité** sur un dépôt public. Un run dure ~30-60 secondes quand il
  n'y a rien de nouveau à faire. En dépôt privé, toutes les 30 min ≈
  1500 min/mois — reste sous la limite. Si tu veux voir large, passe le
  dépôt en public (les données manipulées — pseudos et parties Chess.com —
  sont déjà publiques par nature) ou espace le cron à toutes les 45-60 min.
- **Firestore (plan Spark)** : 50 000 lectures / 20 000 écritures par
  jour, 1 Go de stockage. Très largement suffisant à cette échelle.

## Limites à connaître

- Pas d'authentification utilisateur dans ce montage : les règles
  Firestore permettent à n'importe qui d'ajouter un pseudo à la liste
  surveillée, et de lire les parties déjà analysées. Comme il s'agit de
  pseudos et parties Chess.com **déjà publics**, le risque est surtout
  qu'un inconnu fasse consommer un peu de quota gratuit — pas une fuite
  de données sensibles. Si l'app grandit, ajouter une vraie
  authentification (Firebase Auth) sera l'étape suivante logique.
- GitHub peut retarder légèrement les crons sur les dépôts peu actifs
  (quelques minutes) — sans conséquence ici.
- Le job traite au maximum 5 nouvelles parties par exécution
  (`MAX_NEW_GAMES_PER_RUN` dans `backend/analyze.js`) pour rester rapide ;
  s'il y a un gros historique à rattraper au premier lancement, ça se
  fera sur plusieurs runs successifs (quelques heures max).

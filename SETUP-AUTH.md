# Activer la connexion Google de ChessQuest

1. Ouvre la console Firebase du projet `chessquest-251ed`.
2. Va dans **Authentication → Sign-in method**.
3. Active le fournisseur **Google**, choisis l’adresse e-mail de support puis enregistre.
4. Dans **Authentication → Settings → Authorized domains**, ajoute le domaine qui héberge ChessQuest : `chessle.vercel.app`.
5. Conserve aussi `localhost`, `chessquest-251ed.firebaseapp.com` et `chessquest-251ed.web.app`.

La configuration Web publique se trouve dans `assets/js/auth.js`. Elle n’est pas un secret. Les comptes sont gérés par Firebase Authentication ; aucun mot de passe n’est stocké dans l’application.

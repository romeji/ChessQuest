# Activer la connexion Google et la sauvegarde ChessQuest

1. Ouvre la console Firebase du projet `chessquest-251ed`.
2. Va dans **Authentication → Sign-in method**.
3. Active le fournisseur **Google**, choisis l’adresse e-mail de support puis enregistre.
4. Dans **Authentication → Settings → Authorized domains**, ajoute le domaine qui héberge ChessQuest : `chessle.vercel.app`.
5. Conserve aussi `localhost`, `chessquest-251ed.firebaseapp.com` et `chessquest-251ed.web.app`.
6. Publie les règles privées de sauvegarde depuis la racine du projet :

```bash
firebase deploy --only firestore:rules
```

La configuration Web publique se trouve dans `assets/js/auth.js`. Elle n’est pas un secret. Les comptes sont gérés par Firebase Authentication ; aucun mot de passe n’est stocké dans l’application.

Chaque joueur dispose d’un document Firestore privé `players/{uid}`. Il contient sa progression, ses couronnes, ses achats, ses ouvertures, ses problèmes, son pseudo et le cache de ses dernières parties Chess.com. Les règles interdisent à un compte de lire ou modifier la sauvegarde d’un autre compte.

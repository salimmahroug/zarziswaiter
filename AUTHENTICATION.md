# Système d'authentification - Zarzis Waiter

## Identifiants de connexion

- **Nom d'utilisateur** : `zarziswaiter`
- **Mot de passe** : `zarziswaiter2024`

## Fonctionnalités

### Page de connexion

- Interface moderne et responsive
- Validation des identifiants
- Messages d'erreur en cas d'échec
- Redirection automatique vers le dashboard

### Protection des routes

- Toutes les pages d'administration sont protégées
- Redirection automatique vers `/login` si non authentifié
- Persistance de la session avec localStorage

### Interface utilisateur

- Affichage du nom d'utilisateur dans le header
- Menu dropdown avec option de déconnexion
- Toast de confirmation lors de la déconnexion

## Structure des fichiers

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexte d'authentification
├── hooks/
│   └── useAuth.ts               # Hook personnalisé pour l'auth
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx   # Composant de protection des routes
└── pages/
    └── Login.tsx                # Page de connexion
```

## Sécurité

⚠️ **Note importante** : Cette implémentation est basique et adaptée pour un environnement de démonstration. Pour un environnement de production, il faudrait :

- Utiliser un système d'authentification côté serveur (JWT, sessions)
- Chiffrer les mots de passe
- Implémenter une expiration de session
- Ajouter une protection CSRF
- Utiliser HTTPS obligatoirement

## Utilisation

1. Accédez à l'application
2. Vous serez automatiquement redirigé vers `/login`
3. Entrez les identifiants :
   - Utilisateur : `zarziswaiter`
   - Mot de passe : `zarziswaiter2024`
4. Cliquez sur "Se connecter"
5. Vous serez redirigé vers le dashboard

## Déconnexion

- Cliquez sur l'icône utilisateur en haut à droite
- Sélectionnez "Se déconnecter" dans le menu
- Vous serez redirigé vers la page de connexion

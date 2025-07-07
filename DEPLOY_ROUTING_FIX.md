# 🚀 Guide de Déploiement - Waiter of Zarzis

## Problème résolu : "Not Found" lors du refresh

### ✅ Solutions implémentées :

### 1. **Configuration Vite** (`vite.config.ts`)
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['react-router-dom'],
      },
    },
  },
},
```

### 2. **Redirections pour différentes plateformes :**

#### **Netlify/Vercel** (`public/_redirects`)
```
/*    /index.html   200
```

#### **Apache** (`public/.htaccess`)
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

#### **Render.com** (`render.yaml`)
```yaml
services:
  - type: web
    name: waiter-zarzis-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### 3. **Nginx** (si hébergement sur serveur privé)
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 📊 Nouveau : Argent en attente

### Fonctionnalité ajoutée :
- **Carte "En attente"** dans le dashboard serveur
- Affiche le montant des événements non encore payés
- Calcul automatique basé sur les événements assignés
- Icône Clock avec couleur jaune pour la distinction

### Code ajouté :
```typescript
// Calculer l'argent en attente (événements non payés)
const pendingAmount = serverEvents.reduce((total, event) => {
  const serverAssignment = event.assignedServers?.find(
    (assignment) => assignment.serverId === server.id
  );
  if (serverAssignment && !serverAssignment.isPaid) {
    return total + (serverAssignment.payment || 0);
  }
  return total;
}, 0);
```

## 🎯 Déploiement recommandé :

### **Pour Render.com :**
1. Push le code sur GitHub
2. Connecter le repo à Render
3. Le fichier `render.yaml` configure automatiquement
4. Backend sur : `waiter-zarzis-backend.onrender.com`
5. Frontend sur : `waiter-zarzis-frontend.onrender.com`

### **Pour Netlify :**
1. Build : `cd frontend && npm run build`
2. Deploy folder : `frontend/dist`
3. Le fichier `_redirects` gère automatiquement les routes

### **Pour Vercel :**
1. Import depuis GitHub
2. Framework : Vite
3. Build command : `cd frontend && npm run build`
4. Output directory : `frontend/dist`

## 🔧 Commandes utiles :

```bash
# Build production
cd frontend && npm run build

# Preview du build
cd frontend && npm run preview

# Test local du routing
cd frontend/dist && python -m http.server 8000
```

**✅ Plus de "Not Found" lors du refresh !**
**✅ Argent en attente maintenant visible !**

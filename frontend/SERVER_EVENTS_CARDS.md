# Cartes d'Événements par Serveur

## 📋 Vue d'Ensemble

Une nouvelle fonctionnalité complète a été ajoutée pour afficher l'historique des événements et les gains de chaque serveur sous forme de cartes individuelles.

## 🎯 Objectifs

- **Visualisation des performances** : Voir l'historique complet de chaque serveur
- **Suivi des gains** : Afficher les revenus de chaque serveur par événement
- **Analyse détaillée** : Consulter les détails de chaque mission effectuée
- **Interface intuitive** : Navigation facile entre les serveurs et leurs données

## 🏗️ Architecture

### 1. **Composant Principal : `ServerEventsCard`**

**Emplacement :** `src/components/servers/ServerEventsCard.tsx`

#### Fonctionnalités :

- **En-tête serveur** : Nom, statut de disponibilité, avatar
- **Statistiques résumées** : Total événements et gains cumulés
- **Liste scrollable** : Historique détaillé des événements
- **Informations par événement** :
  - Type d'événement avec icône
  - Client et lieu
  - Date formatée
  - Traiteur (si applicable)
  - Montant gagné
  - Nombre de serveurs total
- **Métriques calculées** : Gain moyen, dernière mission

#### Structure de données :

```typescript
interface ServerEventsCardProps {
  server: Server;
}

// Affiche pour chaque événement :
- event.clientName
- event.eventType (avec icône spécifique)
- event.date (formatée en français)
- event.location
- event.caterer (si différent de "prive-sans-traiteur")
- event.serverPayAmount (montant gagné)
- event.numberOfServers
```

### 2. **Page de Navigation : `ServerEvents`**

**Emplacement :** `src/pages/ServerEvents.tsx`

#### Fonctionnalités :

- **En-tête avec statistiques globales** : Total serveurs, serveurs disponibles
- **Barre de recherche** : Filtrage par nom de serveur
- **Grille responsive** : Cartes organisées en grid adaptatif
- **Résumé global** : Statistiques agrégées de tous les serveurs

#### Layout responsive :

- **Mobile** : 1 colonne
- **Tablette** : 2 colonnes
- **Desktop** : 3 colonnes

### 3. **Service Backend**

**Endpoint :** `GET /api/events/server/:serverId`

#### Fonctionnalité :

```javascript
router.get("/server/:serverId", async (req, res) => {
  try {
    const events = await Event.find({
      assignedServers: serverId,
    })
      .populate("assignedServers")
      .sort({ date: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

#### Logique :

- Recherche tous les événements où le serveur est assigné
- Population des données des serveurs assignés
- Tri par date décroissante (plus récent en premier)
- Gestion d'erreurs robuste

## 🎨 Design et Interface

### **Palette de Couleurs par Type d'Événement**

- **Mariage** : Rose (Heart icon) `text-pink-600`
- **Fiançailles** : Violet (Gift icon) `text-purple-600`
- **Anniversaire** : Orange (Cake icon) `text-orange-600`
- **Autre** : Bleu (PartyPopper icon) `text-blue-600`

### **Indicateurs Visuels**

- **Gains** : Vert avec icône TrendingUp `text-green-600`
- **Événements** : Bleu avec icône Calendar `text-blue-600`
- **Statut disponible** : Badge vert "Disponible"
- **Statut indisponible** : Badge rouge "Indisponible"

### **Layout des Cartes**

```
┌─────────────────────────────────────┐
│ 👤 Nom Serveur          [Disponible]│
├─────────────────────────────────────┤
│ 📅 5 événements    💰 2,500 DT     │
├─────────────────────────────────────┤
│ 🕒 Historique des événements        │
│ ┌─── Événement 1 ─────────────────┐ │
│ │ ❤️ Mariage - Ahmed            │ │
│ │ 📅 4 Jul 2025  📍 Zarzis     │ │
│ │                    💰 500 DT  │ │
│ └─────────────────────────────────┘ │
│ ┌─── Événement 2 ─────────────────┐ │
│ │ 🎁 Fiançailles - Fatma        │ │
│ │ 📅 1 Jul 2025  📍 Tunis      │ │
│ │ 👨‍🍳 Chef Souma     💰 400 DT  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Gain moyen: 450 DT | Dernière: 4 Jul│
└─────────────────────────────────────┘
```

## 🔄 Navigation et Routage

### **Route ajoutée :**

- **URL :** `/server-events`
- **Titre :** "Historique Serveurs"
- **Icône :** History (Lucide)

### **Navigation mise à jour :**

```typescript
// MainSidebar.tsx
{
  title: "Historique Serveurs",
  url: "/server-events",
  icon: History,
}
```

### **Route définie :**

```typescript
// App.tsx
<Route
  path="/server-events"
  element={
    <MainLayout>
      <ServerEvents />
    </MainLayout>
  }
/>
```

## 📊 Métriques et Calculs

### **Métriques par Serveur :**

- **Total événements** : `events.length`
- **Total gagné** : `events.reduce((sum, event) => sum + event.serverPayAmount, 0)`
- **Gain moyen** : `totalEarnings / events.length`
- **Dernière mission** : `Math.max(...events.map(e => new Date(e.date).getTime()))`

### **Statistiques Globales :**

- **Serveurs actifs** : `servers.filter(s => s.available).length`
- **Total événements** : `servers.reduce((sum, s) => sum + s.totalEvents, 0)`
- **Gains totaux** : `servers.reduce((sum, s) => sum + s.totalEarnings, 0)`
- **Gain moyen par serveur** : `totalEarnings / servers.length`

## 🔄 Gestion des États

### **États de Chargement :**

- **Loading** : Skeleton avec message "Chargement..."
- **Error** : Carte rouge avec message d'erreur
- **Empty** : Message "Aucun événement trouvé" avec icône

### **Gestion React Query :**

```typescript
const {
  data: events = [],
  isLoading,
  isError,
} = useQuery({
  queryKey: ["serverEvents", server.id],
  queryFn: () => eventService.getServerEvents(server.id),
  enabled: !!server.id,
});
```

## 📱 Responsive Design

### **Mobile (< 768px) :**

- 1 colonne de cartes
- Cartes empilées verticalement
- Recherche en pleine largeur

### **Tablette (768px - 1024px) :**

- 2 colonnes de cartes
- Espacement adapté

### **Desktop (> 1024px) :**

- 3 colonnes de cartes
- Layout optimal pour grand écran

## 🚀 Performance

### **Optimisations :**

- **React Query** : Cache automatique des données
- **Lazy loading** : Cartes chargées à la demande
- **Scroll virtuel** : Liste d'événements optimisée
- **Debounced search** : Recherche optimisée

### **Gestion mémoire :**

- Composants fonctionnels avec hooks
- Pas de re-renders inutiles
- Cleanup automatique des queries

## 🎯 Utilisation

### **Pour consulter un serveur :**

1. Aller sur "Historique Serveurs" dans le menu
2. Chercher le serveur par nom (optionnel)
3. Voir la carte avec toutes ses informations
4. Scroller dans l'historique des événements

### **Informations disponibles :**

- **Profil serveur** : Nom, disponibilité, statistiques
- **Historique complet** : Tous les événements passés
- **Détails par événement** : Client, type, lieu, date, gains
- **Métriques calculées** : Moyennes et tendances

Cette fonctionnalité transforme la gestion des serveurs en offrant une vue complète et détaillée de leurs performances et historiques, facilitant la prise de décision et le suivi des équipes.

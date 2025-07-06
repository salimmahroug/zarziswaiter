# 🔄 Guide de Réinitialisation des Revenus et Commissions

## Vue d'ensemble

La fonctionnalité de réinitialisation permet de remettre à zéro tous les revenus totaux et toutes les commissions de l'entreprise. Cette fonctionnalité est accessible depuis le tableau de bord principal.

## ⚠️ **Attention : Action Irréversible**

Cette action supprime **définitivement** :
- ✅ Tous les revenus totaux des événements
- ✅ Toutes les commissions de l'entreprise  
- ✅ Tous les montants nets
- ✅ Tous les gains des serveurs
- ✅ Tous les historiques de paiements des serveurs

## 🎯 **Localisation**

Le bouton de réinitialisation se trouve dans le **Dashboard** :
- Position : En haut à droite, à côté du titre "Tableau de bord"
- Apparence : Bouton rouge avec icône de rotation
- Texte : "Réinitialiser"

## 🔧 **Comment Utiliser**

### **Étape 1 : Accéder au Dashboard**
- Connectez-vous à l'application
- Naviguez vers la page "Tableau de bord"

### **Étape 2 : Cliquer sur Réinitialiser**
- Cliquez sur le bouton rouge "Réinitialiser" en haut à droite
- Une boîte de dialogue de confirmation s'ouvre

### **Étape 3 : Confirmation**
- Lisez attentivement l'avertissement
- Cliquez sur "Confirmer la réinitialisation" pour continuer
- Ou "Annuler" pour abandonner

### **Étape 4 : Traitement**
- Le bouton affiche "Réinitialisation..." pendant le processus
- Une notification de succès ou d'erreur s'affiche
- Les données du tableau de bord se mettent à jour automatiquement

## 🎯 **Ce qui est Réinitialisé**

### **Dans la Base de Données :**

#### **Events (Événements) :**
```javascript
{
  totalAmount: 0,          // Montant total → 0
  companyCommission: 0,    // Commission → 0  
  netAmount: 0,            // Montant net → 0
  serverPayAmount: 0       // Paiement serveur → 0
}
```

#### **Servers (Serveurs) :**
```javascript
{
  totalEarnings: 0,        // Gains totaux → 0
  totalEvents: 0,          // Nombre d'événements → 0
  payments: []             // Historique des paiements → vide
}
```

### **Dans l'Interface :**
- ✅ **Revenu total** → 0 DT
- ✅ **Commission entreprise** → 0 DT
- ✅ **Graphique des revenus** → Données mises à jour
- ✅ **Statistiques des serveurs** → Remises à zéro

## 🛡️ **Sécurité**

### **Double Confirmation :**
1. **Premier niveau** : Bouton visible seulement aux administrateurs
2. **Second niveau** : Dialog de confirmation avec avertissement explicite

### **Sauvegarde Recommandée :**
Avant d'utiliser cette fonctionnalité :
- Exportez vos données importantes
- Sauvegardez votre base de données
- Assurez-vous d'avoir des copies des fiches de paie

## 📊 **Cas d'Usage**

### **Début de Nouvelle Période :**
- Nouveau mois comptable
- Nouvelle saison d'événements
- Restructuration des tarifs

### **Correction d'Erreurs :**
- Données corrompues
- Erreurs de calcul importantes
- Migration de système

### **Tests et Développement :**
- Nettoyage des données de test
- Reset pour démonstrations
- Préparation d'environnements propres

## 🔧 **Aspects Techniques**

### **Route Backend :**
```javascript
POST /api/events/reset-revenue
```

### **Fonction Frontend :**
```javascript
eventService.resetRevenueAndCommissions()
```

### **Notifications :**
- ✅ **Succès** : Toast vert avec message de confirmation
- ❌ **Erreur** : Toast rouge avec message d'erreur

## 🎨 **Interface Utilisateur**

### **Bouton Normal :**
```
[🔄 Réinitialiser]  <- Bouton rouge outline
```

### **Pendant Traitement :**
```
[⟳ Réinitialisation...]  <- Bouton disabled avec spinner
```

### **Dialog de Confirmation :**
```
┌─────────────────────────────────────┐
│ Réinitialiser les revenus et        │
│ commissions                         │
├─────────────────────────────────────┤
│ Cette action va remettre à zéro     │
│ tous les revenus totaux et toutes   │
│ les commissions. Cette action est   │
│ irréversible.                       │
│                                     │
│ [Annuler]  [Confirmer]             │
└─────────────────────────────────────┘
```

## ⚡ **Performance**

- **Vitesse** : Traitement en quelques secondes
- **Feedback** : Spinner pendant l'opération
- **Auto-refresh** : Données mises à jour automatiquement
- **Notification** : Toast de confirmation

## 🚨 **Important à Retenir**

1. **Action irréversible** - Aucun moyen d'annuler après confirmation
2. **Affecte tout le système** - Tous les événements et serveurs
3. **Sauvegarde recommandée** - Exportez avant de réinitialiser
4. **Double confirmation** - Deux étapes de validation
5. **Mise à jour automatique** - L'interface se rafraîchit immédiatement

Cette fonctionnalité est un outil puissant pour la gestion financière qui doit être utilisé avec précaution ! 🎯

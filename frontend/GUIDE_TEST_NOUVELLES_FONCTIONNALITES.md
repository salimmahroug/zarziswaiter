# 🧪 Guide de Test - Nouvelles Fonctionnalités

## 🎯 Fonctionnalités à Tester

### 1. 📊 **Page Serveurs Améliorée**

**URL**: `http://localhost:8080/servers`

#### ✅ **Nouvelles colonnes à vérifier :**

- **Gains totaux** (colonne bleue) : Montant total accumulé
- **Argent reçu** (colonne verte) : Total des paiements effectués
- **Reste à payer** (colonne orange) : Montant encore dû

#### ✅ **Nouveau bouton "Voir plus" :**

- Cliquer sur le bouton "Voir plus" de chaque serveur
- Doit rediriger vers `/servers/{id}`

### 2. 🔍 **Page Détail Serveur**

**URL**: `http://localhost:8080/servers/1`

#### ✅ **Sections à vérifier :**

**🏷️ En-tête :**

- Nom du serveur + badge de disponibilité
- Bouton retour vers la liste des serveurs

**👤 Informations personnelles :**

- Téléphone
- Nombre d'événements
- Prix par événement
- Statut (Actif/Inactif)

**💰 Finances :**

- **Gains totaux accumulés** (bleu)
- **Argent reçu** (vert)
- **Reste à payer** (orange)

**📊 Résumé des paiements :**

- Total des paiements
- Dernier paiement effectué
- Bouton "Voir l'historique complet"

**📝 Historique récent :**

- 3 derniers paiements affichés
- Bouton "Voir tout" si plus de 3 paiements

### 3. 📚 **Page Historique Complet**

**URL**: `http://localhost:8080/servers/1/payments`

#### ✅ **Fonctionnalités à tester :**

**📈 Statistiques en résumé :**

- 4 cartes avec gains totaux, argent reçu, reste à payer, nombre de paiements

**🔍 Filtres et recherche :**

- **Recherche** : Taper un montant ou des notes
- **Filtre méthode** : Sélectionner espèces, virement, etc.
- **Tri par date** : Plus récent/ancien en premier
- **Export CSV** : Télécharger l'historique

**📋 Liste complète :**

- Tous les paiements avec détails complets
- Date et heure précises
- Méthode de paiement avec badges colorés
- Notes si disponibles
- Montant restant après chaque paiement

### 4. 💳 **Page Paiements Serveurs**

**URL**: `http://localhost:8080/server-payments`

#### ✅ **Test du workflow complet :**

1. Sélectionner un serveur
2. Voir les gains actuels s'afficher
3. Saisir un montant (validation automatique)
4. Choisir une méthode de paiement
5. Ajouter des notes
6. Effectuer le paiement
7. Vérifier la déduction automatique

## 🗂️ **Données de Test Disponibles**

### 👤 **Ahmed Ben Ali (ID: 1)**

- **Gains totaux** : 750 DT (450 + 300 payés)
- **Argent reçu** : 300 DT (2 paiements)
- **Reste à payer** : 450 DT
- **Paiements** :
  - 200 DT en espèces (15/06/2025)
  - 100 DT par virement (20/06/2025)

### 👤 **Fatma Trabelsi (ID: 2)**

- **Gains totaux** : 450 DT (350 + 100 payé)
- **Argent reçu** : 100 DT (1 paiement)
- **Reste à payer** : 350 DT
- **Paiements** :
  - 100 DT en espèces (10/06/2025)

### 👤 **Mohamed Sassi (ID: 3)**

- **Gains totaux** : 800 DT
- **Argent reçu** : 0 DT
- **Reste à payer** : 800 DT
- **Paiements** : Aucun

## 🧭 **Navigation à Tester**

### 🔗 **Chemins de navigation :**

```
/servers
  ↓ "Voir plus"
/servers/1
  ↓ "Voir l'historique complet"
/servers/1/payments
  ↓ Bouton retour
/servers/1
  ↓ Bouton retour
/servers
```

### 📱 **Boutons à tester :**

- ✅ **"Voir plus"** dans la table → Page détail
- ✅ **"Voir l'historique complet"** → Page historique
- ✅ **"Effectuer un paiement"** → Page paiements
- ✅ **Boutons retour** → Navigation inverse
- ✅ **Export CSV** → Téléchargement

## 🎨 **Interface à Vérifier**

### 🎨 **Codes couleur :**

- **🔵 Bleu** : Gains totaux/informations générales
- **🟢 Vert** : Argent reçu/paiements positifs
- **🟠 Orange** : Reste à payer/montants dus
- **🟣 Violet** : Statistiques de paiements

### 📱 **Responsive design :**

- Tester sur desktop
- Vérifier la lisibilité mobile
- S'assurer que les colonnes s'adaptent

## 🔧 **Tests Techniques**

### 🌐 **APIs à tester :**

```bash
# Liste des serveurs
GET http://localhost:5001/api/servers

# Détails d'un serveur
GET http://localhost:5001/api/servers/1/details

# Ajouter un paiement
POST http://localhost:5001/api/servers/1/payment
{
  "amount": 50,
  "paymentMethod": "cash",
  "notes": "Test"
}
```

### 📊 **Calculs à vérifier :**

```javascript
// Pour Ahmed Ben Ali :
gains_totaux = reste_a_payer + argent_recu
750 = 450 + 300 ✅

// Après un paiement de 50 DT :
nouveau_reste = 450 - 50 = 400 DT ✅
```

## 🚀 **Scénarios de Test Complets**

### 📋 **Scénario 1 : Consultation d'historique**

1. Aller sur `/servers`
2. Cliquer "Voir plus" sur Ahmed Ben Ali
3. Vérifier les 3 sections d'informations
4. Cliquer "Voir l'historique complet"
5. Tester les filtres de recherche
6. Exporter en CSV

### 💰 **Scénario 2 : Effectuer un paiement**

1. Aller sur `/server-payments`
2. Sélectionner Mohamed Sassi (800 DT à payer)
3. Saisir 200 DT
4. Choisir "Virement bancaire"
5. Ajouter note "Premier paiement"
6. Confirmer → Vérifier qu'il reste 600 DT

### 🔄 **Scénario 3 : Navigation complète**

1. `/servers` → Voir colonnes de paiement
2. Clic "Voir plus" → Page détail
3. Clic "Historique complet" → Page historique
4. Retour → Page détail
5. Retour → Liste serveurs

---

## ✅ **Checklist de Validation**

### 📊 **Données :**

- [ ] Colonnes de paiement visibles
- [ ] Calculs corrects (total = reçu + restant)
- [ ] Historique complet affiché

### 🧭 **Navigation :**

- [ ] Bouton "Voir plus" fonctionne
- [ ] Liens vers historique fonctionnent
- [ ] Boutons retour fonctionnent

### 🎨 **Interface :**

- [ ] Codes couleur respectés
- [ ] Design responsive
- [ ] Badges et icônes appropriés

### ⚡ **Fonctionnalités :**

- [ ] Filtres de recherche
- [ ] Export CSV
- [ ] Paiements avec déduction
- [ ] Toasts de confirmation

**🎉 Si tous les tests passent, les nouvelles fonctionnalités sont opérationnelles !**

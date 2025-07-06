# 📋 Guide d'utilisation - Paiements Serveurs

## 🎯 Vue d'ensemble

Le système de paiement des serveurs permet de :

- Visualiser les gains totaux de chaque serveur
- Effectuer des paiements avec déduction automatique
- Consulter l'historique complet des paiements
- Suivre les montants restants à payer

## 📊 Interface Serveurs - Nouvelles colonnes

Dans la page **Serveurs**, vous trouverez maintenant :

| Colonne           | Description                            | Exemple |
| ----------------- | -------------------------------------- | ------- |
| **Gains totaux**  | Montant total accumulé depuis le début | 750 DT  |
| **Argent reçu**   | Somme de tous les paiements effectués  | 300 DT  |
| **Reste à payer** | Montant encore dû au serveur           | 450 DT  |

### 🎨 Code couleur :

- **🔵 Bleu** : Gains totaux accumulés
- **🟢 Vert** : Argent déjà reçu
- **🟠 Orange** : Montant restant à payer

## 💰 Page Paiement Serveurs

### Étapes pour effectuer un paiement :

1. **📋 Sélectionner un serveur** dans la liste déroulante
   - Les gains actuels s'affichent automatiquement
2. **💵 Saisir le montant** à payer
   - Validation automatique (max = gains restants)
3. **🏦 Choisir la méthode** de paiement :
   - 💵 Espèces
   - 🏦 Virement bancaire
   - 📝 Chèque
   - 🔗 Autre
4. **📝 Ajouter des notes** (optionnel)
   - Commentaires sur le paiement
5. **✅ Confirmer le paiement**
   - Déduction automatique des gains
   - Ajout à l'historique

## 📋 Détails du serveur

En cliquant sur le nom d'un serveur, vous accédez aux détails complets :

### 📈 Informations financières :

- **💼 Gains totaux accumulés** : Montant total depuis le début
- **💳 Argent reçu** : Total des paiements effectués
- **⏳ Reste à payer** : Montant encore dû
- **📊 Paiements effectués** : Nombre de transactions

## 🔧 Fonctionnalités techniques

### ⚡ Déduction automatique

- Quand vous payez 100 DT à un serveur qui a 500 DT de gains
- Ses gains passent automatiquement à 400 DT
- L'historique conserve toutes les informations

### 📚 Historique des paiements

Chaque paiement contient :

- **💰 Montant** payé
- **📅 Date** et heure exactes
- **🏦 Méthode** de paiement
- **💰 Montant restant** après ce paiement
- **📝 Notes** ajoutées

### 🛡️ Validations

- Impossible de payer plus que les gains
- Montants positifs uniquement
- Vérification de l'existence du serveur

## 📱 Interface responsive

L'interface s'adapte automatiquement :

- **💻 Desktop** : Toutes les colonnes visibles
- **📱 Mobile** : Colonnes essentielles prioritaires
- **📊 Tableaux** : Scroll horizontal si nécessaire

## 🎯 Exemple d'utilisation

### Scénario : Ahmed Ben Ali

1. **Initial** : 750 DT de gains accumulés
2. **1er paiement** : 200 DT en espèces → Reste 550 DT
3. **2e paiement** : 100 DT par virement → Reste 450 DT
4. **Historique** : 2 paiements, 300 DT reçus, 450 DT restants

## ⚙️ Configuration technique

### 🔌 API Endpoints

- `GET /api/servers` - Liste avec infos de paiement
- `GET /api/servers/:id/details` - Détails d'un serveur
- `POST /api/servers/:id/payment` - Ajouter un paiement

### 📦 Structure de paiement

```json
{
  "amount": 100,
  "date": "2025-07-04T02:27:14.742Z",
  "remaining": 400,
  "paymentMethod": "cash",
  "notes": "Description optionnelle"
}
```

## 🚀 Avantages

1. **⏱️ Gain de temps** : Plus besoin de calculer manuellement
2. **📊 Traçabilité** : Historique complet de tous les paiements
3. **🎯 Précision** : Déduction automatique sans erreur
4. **📱 Simplicité** : Interface intuitive et moderne
5. **🔍 Transparence** : Toutes les informations visibles

---

**🎉 Votre système de paiement serveurs est maintenant opérationnel !**

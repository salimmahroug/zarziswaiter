# 📄 Guide de Génération des Fiches de Paie

## Vue d'ensemble

Le système de génération de fiches de paie permet de créer automatiquement des documents PDF professionnels contenant l'historique complet des événements d'un serveur et ses paiements.

## Fonctionnalités

### ✨ **Génération Automatique de PDF**
- Création automatique de fiches de paie en format PDF
- Design professionnel avec logo et en-tête
- Téléchargement direct du fichier
- Prévisualisation avant téléchargement

### 📊 **Contenu Détaillé**
- **Informations du serveur** : Nom, téléphone, email
- **Période de paie** : Début et fin de période
- **Résumé des gains** : Total événements, gains, paiements
- **Détail des événements** : Tableau complet avec dates, clients, lieux, montants
- **Information de paiement** : Date, méthode, référence du paiement

### 🎯 **Points d'Intégration**

## 1. **Dans le Générateur de Fiche de Paie** (`PayrollGenerator`)
```tsx
import { PayrollGenerator } from "@/components/servers";

// Le composant inclut maintenant un bouton "Fiche de Paie PDF"
// qui génère automatiquement une fiche professionnelle
```

## 2. **Bouton Simple** (`PayslipButton`)
```tsx
import { PayslipButton } from "@/components/servers";

<PayslipButton 
  server={server}
  paymentAmount={montant}
  paymentDate={date}
  paymentMethod="Espèces"
  paymentReference="REF123"
  variant="outline"
  size="sm"
/>
```

## 3. **Après un Paiement** (`PaymentSuccessWithPayslip`)
```tsx
import { PaymentSuccessWithPayslip } from "@/components/servers";

// Dialog qui s'affiche après un paiement réussi
// Permet de générer immédiatement la fiche de paie
```

## 4. **Dans les Détails du Serveur**
Le bouton de génération de fiche de paie est maintenant intégré dans la page de détail du serveur, permettant un accès rapide à cette fonctionnalité.

## Utilisation

### **Étape 1 : Sélectionner le Serveur**
- Choisir le serveur dans la liste déroulante
- Ou utiliser le bouton depuis la page de détail du serveur

### **Étape 2 : Choisir la Période**
- Sélectionner le mois/année souhaité
- Le système filtre automatiquement les événements de cette période

### **Étape 3 : Générer la Fiche**
- **Prévisualiser** : Voir un aperçu avant téléchargement
- **Télécharger PDF** : Génération et téléchargement automatique
- **Imprimer** : Impression directe depuis le navigateur

## Structure du PDF Généré

```
┌─────────────────────────────────────────┐
│           FICHE DE PAIE                 │
│        Waiter of Zarzis                 │
├─────────────────────────────────────────┤
│ Informations Serveur | Période de Paie │
│ - Nom, ID, Téléphone | - Du: XX/XX/XXXX│
│ - Email, Adresse     | - Au: XX/XX/XXXX│
├─────────────────────────────────────────┤
│           Résumé des Gains              │
│ Events: X | Gagné: XXX DT | Payé: XXX DT│
├─────────────────────────────────────────┤
│        Détail des Événements           │
│ Date | Client | Type | Lieu | Montant  │
│ .... | ...... | .... | .... | .......  │
├─────────────────────────────────────────┤
│ Document généré le XX/XX/XXXX          │
└─────────────────────────────────────────┘
```

## Personnalisation

### **Données du Serveur**
Pour inclure plus d'informations sur le serveur (email, adresse), assurez-vous que ces champs sont remplis dans le profil du serveur.

### **Période Personnalisée**
Le système permet de sélectionner n'importe quel mois sur les 12 derniers mois pour la génération de la fiche.

### **Design**
Le design peut être personnalisé en modifiant le fichier `src/lib/payslip-generator.ts`, section `generatePayslipHTML`.

## Avantages

### **Pour l'Employeur**
- ✅ Documentation officielle des paiements
- ✅ Historique complet et détaillé
- ✅ Format professionnel et légal
- ✅ Génération automatique et rapide

### **Pour le Serveur**
- ✅ Reçu officiel de paiement
- ✅ Détail de tous les événements travaillés
- ✅ Preuve de revenus
- ✅ Document imprimable et archivable

## Support Technique

### **Dépendances Requises**
- `jspdf` : Génération de PDF
- `html2canvas` : Conversion HTML vers image
- `date-fns` : Formatage des dates

### **Compatibilité**
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile (avec téléchargement)
- ✅ Impression directe

### **Résolution de Problèmes**

**Problème** : PDF ne se télécharge pas
**Solution** : Vérifier que les popups ne sont pas bloqués

**Problème** : Design cassé dans le PDF
**Solution** : S'assurer que tous les styles CSS sont en ligne

**Problème** : Données manquantes
**Solution** : Vérifier que le serveur a des événements pour la période sélectionnée

## Exemple d'Utilisation Complète

```tsx
import React from 'react';
import { PayslipButton } from '@/components/servers';

function ServerPaymentComplete({ server, payment }) {
  return (
    <div className="space-y-4">
      <h2>Paiement Effectué ✅</h2>
      
      <div>
        <p>Serveur: {server.name}</p>
        <p>Montant: {payment.amount} DT</p>
        <p>Date: {payment.date}</p>
      </div>

      <PayslipButton
        server={server}
        paymentAmount={payment.amount}
        paymentDate={payment.date}
        paymentMethod={payment.method}
        paymentReference={payment.reference}
        className="w-full"
      />
    </div>
  );
}
```

Cette fonctionnalité transforme votre système de gestion en solution complète avec documentation automatique des paiements ! 🚀

# Guide sur le système de paiements des serveurs

## Comprendre le système de paiements

### Termes et définitions

- **Gains totaux accumulés** : Le montant total gagné par un serveur depuis le début (avant tout paiement)
- **Déjà payé** : Le montant total déjà versé au serveur
- **Reste à payer** : Le montant restant à payer au serveur

### Calculs utilisés

1. **Gains totaux accumulés** = Somme des gains de tous les événements auxquels le serveur a participé
2. **Déjà payé** = Somme de tous les paiements effectués
3. **Reste à payer** = Gains totaux accumulés - Déjà payé

## Comment fonctionne le système de paiements

Lorsqu'un serveur participe à un événement, il accumule des gains. Ces gains sont stockés dans le système et peuvent être payés progressivement. Voici comment le système fonctionne :

1. **Accumulation des gains** : Le serveur accumule des gains à chaque événement auquel il participe.
2. **Paiements partiels** : Les paiements peuvent être effectués partiellement ou en totalité.
3. **Suivi des paiements** : Chaque paiement est enregistré avec :
   - Montant
   - Date et heure
   - Méthode de paiement
   - Notes (optionnel)
   - Montant restant après paiement

## Fonctionnalités disponibles

### 1. Page de détail du serveur

Sur la page de détail d'un serveur, vous pouvez voir :

- Le total des gains accumulés
- Le montant déjà payé
- Le montant restant à payer
- L'historique des paiements récents (3 derniers)

### 2. Page de paiement

Sur la page de paiement, vous pouvez :

- Sélectionner un serveur
- Voir ses statistiques financières
- Effectuer un nouveau paiement
- Spécifier le montant, la méthode et des notes
- Voir l'historique des paiements

### 3. Historique complet des paiements

Sur la page d'historique des paiements d'un serveur, vous pouvez :

- Voir tous les paiements effectués
- Filtrer par méthode de paiement
- Rechercher des paiements
- Trier par date (plus récent/plus ancien)
- Exporter les données au format CSV

## Conseils d'utilisation

1. **Vérifiez toujours le montant restant** avant d'effectuer un paiement pour éviter les erreurs.
2. **Utilisez les notes** pour indiquer des informations importantes sur le paiement.
3. **Consultez l'historique** pour suivre tous les paiements effectués.
4. **Exportez les données** régulièrement pour garder une trace externe des paiements.

## Résolution des problèmes courants

### Le montant affiché est incorrect

Cela peut arriver si :

- Un paiement n'a pas été correctement enregistré
- Une erreur s'est produite lors du calcul des gains

Solution : Vérifiez l'historique des paiements et les événements auxquels le serveur a participé.

### Le paiement ne s'ajoute pas à la base de données

Vérifiez que :

1. Le serveur est correctement sélectionné
2. Le montant est inférieur ou égal au montant restant à payer
3. Le formulaire est correctement rempli
4. Il n'y a pas de problème de connexion au serveur

Si le problème persiste, essayez de rafraîchir la page et réessayez.

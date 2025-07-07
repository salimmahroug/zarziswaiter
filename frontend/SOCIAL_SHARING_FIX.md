# Configuration des métadonnées et partage social

## Problème résolu ✅

Lorsque vous partagiez le lien de votre site, l'image de Lovable s'affichait au lieu de votre logo/branding. Ce problème est maintenant corrigé !

## Modifications apportées

### 1. **Métadonnées Open Graph & Twitter Cards**
- ✅ **Titre** : "Waiter of Zarzis - Gestion d'événements professionnelle"
- ✅ **Description** : Description attractive et professionnelle
- ✅ **Image** : Image personnalisée avec votre logo (`/og-image.svg`)
- ✅ **URL** : Structure URLs propres
- ✅ **Couleur thème** : #4a99cd (votre couleur principale)

### 2. **Fichiers créés/modifiés**
- 📄 `index.html` - Métadonnées complètes
- 🖼️ `public/og-image.svg` - Image pour réseaux sociaux (1200x630px)
- 🤖 `public/robots.txt` - Instructions pour robots d'indexation
- 🗺️ `public/sitemap.xml` - Plan du site pour SEO
- 📱 `public/manifest.json` - Support PWA

### 3. **Image de partage social**
Nouvelle image créée spécialement pour les réseaux sociaux :
- **Dimensions** : 1200x630px (format optimal)
- **Design** : Votre logo + titre + couleur #4a99cd
- **Qualité** : Vectoriel SVG pour une netteté parfaite

## Instructions de déploiement

### 🔧 **Avant de déployer**
1. **Remplacez** `https://your-domain.com/` par votre vraie URL dans :
   - `index.html` (métadonnées og:url et twitter:url)
   - `robots.txt` (ligne Sitemap)
   - `sitemap.xml` (toutes les URLs)

### 📤 **Après déploiement**
1. **Testez** vos métadonnées avec :
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [WhatsApp Link Preview](https://web.whatsapp.com/)

2. **Forcez** la mise à jour du cache :
   - Facebook : Cliquez "Scrape Again"
   - Twitter : Validez l'URL
   - WhatsApp : Attendez 24h ou utilisez un paramètre ?v=1

### 🔄 **Mise à jour du cache**
Si l'ancienne image apparaît encore :
```bash
# Ajoutez un paramètre à votre URL
https://votre-site.com/?v=2025
```

## Structure des métadonnées

```html
<!-- Open Graph (Facebook, WhatsApp, LinkedIn) -->
<meta property="og:title" content="Waiter of Zarzis - Gestion d'événements professionnelle" />
<meta property="og:description" content="Plateforme de gestion pour serveurs professionnels à Zarzis..." />
<meta property="og:image" content="/og-image.svg" />
<meta property="og:type" content="website" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Waiter of Zarzis - Gestion d'événements professionnelle" />
<meta name="twitter:image" content="/og-image.svg" />
```

## Résultat attendu

Quand vous partagerez le lien maintenant, vous verrez :
- 🎨 **Image** : Votre logo avec le design bleu #4a99cd
- 📝 **Titre** : "Waiter of Zarzis - Gestion d'événements professionnelle"
- 📄 **Description** : Description professionnelle de votre service
- 🔗 **URL** : Votre nom de domaine

## Support SEO ajouté

- ✅ **Robots.txt** configuré
- ✅ **Sitemap.xml** pour l'indexation
- ✅ **Métadonnées complètes** (title, description, keywords)
- ✅ **PWA ready** avec manifest.json
- ✅ **Optimisation mobile** (viewport, theme-color)

---

**Note** : Remplacez `https://your-domain.com/` par votre vraie URL avant le déploiement final !

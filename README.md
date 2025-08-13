# 🔌 CERTIF2PLUG - Bot Telegram & Boutique

> **La marketplace exclusive des vendeurs certifiés** 

Bot Telegram complet avec boutique web intégrée, panel d'administration et système de parrainage avancé.

## 🚨 IMPORTANT - SÉCURITÉ 🚨

**Si vous voulez dupliquer ce projet :**
1. 📛 **LISEZ D'ABORD** → [**GUIDE DE SÉCURITÉ CRITIQUE**](IMPORTANT_SECURITY.md)
2. ✅ **PUIS SUIVEZ** → [**GUIDE DE DUPLICATION**](DUPLICATION_GUIDE.md)

> ⚠️ **NE JAMAIS réutiliser les tokens/credentials de la boutique principale !**

---

## 🚀 Démarrage Rapide

**Vous voulez votre propre bot en 10 minutes ?**
👉 Consultez le [**GUIDE DE DÉMARRAGE RAPIDE**](QUICK_START.md)

---

## 📚 Documentation Complète

### 🔒 Sécurité (À LIRE EN PREMIER)
- 🚨 [**GUIDE DE SÉCURITÉ CRITIQUE**](IMPORTANT_SECURITY.md) - **OBLIGATOIRE avant duplication**

### 📖 Guides de duplication
- 🤖 [**GUIDE CURSOR AI & CLAUDE**](CURSOR_AI_DUPLICATION_GUIDE.md) - **NOUVEAU** Guide spécial pour Cursor
- 📖 [**GUIDE DE DUPLICATION COMPLET**](DUPLICATION_GUIDE.md) - Guide étape par étape détaillé
- ⚡ [**DÉMARRAGE RAPIDE**](QUICK_START.md) - Version condensée en 10 minutes
- 🔧 [**VARIABLES D'ENVIRONNEMENT**](.env.example) - Fichier exemple avec toutes les variables

### 🌟 Fonctionnalités et configuration
- 🌟 [**TOUTES LES FONCTIONNALITÉS**](FEATURES.md) - Liste complète des fonctionnalités
- 📱 [**Configuration Render**](RENDER_ENV_VARIABLES.md) - Pour le bot
- 🌐 [**Configuration Vercel**](VERCEL_ENV_VARS.md) - Pour la boutique
- 📸 [**Configuration Cloudinary**](CLOUDINARY_SETUP.md) - Pour les images

---

## 🏗️ Structure du Projet

```
CERTIF2PLUG/
├── bot/                    # 🤖 Bot Telegram (Node.js)
│   ├── handlers/          # Gestionnaires de commandes
│   ├── models/            # Modèles MongoDB
│   ├── middleware/        # Middleware (maintenance, canal)
│   └── index.js          # Point d'entrée du bot
│
├── web-app/               # 🛍️ Boutique Web (Next.js)
│   ├── app/              # Pages et routes
│   │   ├── config/       # Panel admin
│   │   ├── plugs/        # Catalogue vendeurs
│   │   └── maintenance/  # Page maintenance
│   ├── components/       # Composants React
│   └── styles/          # CSS et Tailwind
│
└── docs/                  # 📚 Documentation
    ├── IMPORTANT_SECURITY.md    # ⚠️ CRITIQUE - Sécurité
    ├── DUPLICATION_GUIDE.md     # Guide complet
    ├── QUICK_START.md          # Démarrage rapide
    └── FEATURES.md             # Liste des fonctionnalités
```

---

## ✨ Fonctionnalités Principales

### Bot Telegram
- ✅ **Menu interactif** avec Mini App intégrée
- ✅ **Système de plugs** (vendeurs) avec filtres avancés
- ✅ **Parrainage unique** avec liens personnalisés et notifications
- ✅ **Panel admin** sécurisé avec mot de passe
- ✅ **Mode maintenance** programmable
- ✅ **Broadcast** vers tous les utilisateurs

### Boutique Web
- ✅ **Design moderne** 100% responsive
- ✅ **Panel admin complet** avec dashboard
- ✅ **Gestion CRUD** plugs, candidatures et produits
- ✅ **Upload d'images** via Cloudinary
- ✅ **Mode maintenance** personnalisable
- ✅ **Textes 100% blancs** pour visibilité optimale

### Système de Parrainage
- ✅ **Liens uniques** par admin et par plug
- ✅ **Comptage automatique** des filleuls
- ✅ **Notifications temps réel** à l'admin
- ✅ **Auto-suppression** des messages (anti-spam)
- ✅ **Statistiques détaillées** par plug

---

## 🛠️ Technologies Utilisées

| Catégorie | Technologies |
|-----------|-------------|
| **Backend** | Node.js, Express, MongoDB, Mongoose |
| **Frontend** | Next.js 14, TypeScript, React, Tailwind CSS |
| **Bot** | node-telegram-bot-api, Webhooks |
| **Services** | Cloudinary (images), MongoDB Atlas (DB) |
| **Déploiement** | Render (bot), Vercel (web) |

---

## 📦 Installation Locale (Optionnel)

```bash
# 1. Cloner le repository
git clone https://github.com/juniorrrrr345/PLGSCRTF.git
cd CERTIF2PLUG

# 2. Installer les dépendances du bot
cd bot && npm install

# 3. Installer les dépendances de la boutique
cd ../web-app && npm install

# 4. Configuration
cp ../.env.example ../.env
# Éditer .env avec VOS PROPRES valeurs (voir IMPORTANT_SECURITY.md)

# 5. Démarrer le bot (dans /bot)
npm start

# 6. Démarrer la boutique (dans /web-app)
npm run dev
```

---

## 🚀 Déploiement Production

Le projet est configuré pour un déploiement **100% GRATUIT** :

| Service | Utilisation | Plan Gratuit |
|---------|------------|--------------|
| **Render** | Bot Telegram | ✅ Free tier |
| **Vercel** | Boutique Web | ✅ Hobby plan |
| **MongoDB Atlas** | Base de données | ✅ M0 Sandbox |
| **Cloudinary** | Stockage images | ✅ Free tier |

👉 Suivez le [**GUIDE DE DUPLICATION**](DUPLICATION_GUIDE.md) pour tous les détails.

---

## 🔑 Variables d'Environnement Requises

### Critiques (DOIVENT être uniques)
- `TELEGRAM_BOT_TOKEN` - Token unique de @BotFather
- `MONGODB_URI` - Votre propre base MongoDB
- `CLOUDINARY_URL` - Votre compte Cloudinary
- `ADMIN_ID` - Votre ID Telegram personnel
- `BOT_API_KEY` - Clé API générée aléatoirement

### Complètes
Voir [**.env.example**](.env.example) pour la liste complète.

---

## 🎯 Checklist de Duplication

- [ ] 📛 Lu le [GUIDE DE SÉCURITÉ](IMPORTANT_SECURITY.md)
- [ ] 🤖 Créé un NOUVEAU bot Telegram
- [ ] 🗄️ Créé une NOUVELLE base MongoDB
- [ ] 📸 Créé un NOUVEAU compte Cloudinary
- [ ] 🔑 Généré de NOUVELLES clés API
- [ ] 🚀 Déployé sur Render (bot)
- [ ] 🌐 Déployé sur Vercel (boutique)
- [ ] ✅ Testé le fonctionnement

---

## 🤝 Support

Si vous rencontrez des problèmes :
1. 📖 Consultez d'abord la [documentation](DUPLICATION_GUIDE.md)
2. 🔒 Vérifiez le [guide de sécurité](IMPORTANT_SECURITY.md)
3. 🌟 Examinez les [fonctionnalités](FEATURES.md)
4. 📊 Vérifiez les logs dans Render/Vercel

---

## 🌟 Fonctionnalités Avancées

- **Multi-admins** supporté
- **Filtrage avancé** par pays/méthode
- **Système de likes** avec cooldown
- **Candidatures** avec workflow complet
- **Mode maintenance** avec compte à rebours
- **Broadcast HTML** vers tous les utilisateurs
- **Analytics** intégrées dans le dashboard
- **100% responsive** (mobile, tablette, PC)

---

## 📄 Licence

Ce projet est open source et disponible pour duplication.

**MAIS** : Respectez les règles de sécurité pour ne pas affecter la boutique principale !

---

## 🙏 Crédits

**Créé avec ❤️ pour CERTIF2PLUG**

Bot original : [@PLGSCRTF_BOT](https://t.me/PLGSCRTF_BOT)

---

⚠️ **RAPPEL FINAL** : Chaque duplication doit avoir ses PROPRES credentials. [Voir le guide de sécurité](IMPORTANT_SECURITY.md)
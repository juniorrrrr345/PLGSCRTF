# 🛍️ Telegram Shop Bot + Boutique Vercel

Un système complet de boutique Telegram avec bot, mini-application web et panel administrateur.

## 🚀 Fonctionnalités

### Bot Telegram
- ✅ Menu interactif avec boutons
- ✅ Système de parrainage avec liens uniques
- ✅ Classement des parrains avec badges
- ✅ Système de likes (1 toutes les 30 minutes)
- ✅ Questionnaire vendeur pas à pas
- ✅ Panel admin sécurisé (/config)

### Application Web (Vercel)
- ✅ Interface moderne et fluide
- ✅ Affichage en temps réel des stats
- ✅ Recherche par localisation
- ✅ Classement des plugs par popularité
- ✅ Fond personnalisable

## 📋 Prérequis

- Node.js 18+
- MongoDB (MongoDB Atlas recommandé)
- Compte Cloudinary
- Bot Telegram (créé via @BotFather)
- Compte Vercel
- Compte Render

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd telegram-shop-bot
npm install
```

### 2. Configuration du Bot

Créer `bot/.env` :
```env
TELEGRAM_BOT_TOKEN=7631105823:AAFIWjyN2hPR__R5QsvWTthVMkGVOCA_xd8
MONGODB_URI=votre_uri_mongodb
WEB_APP_URL=https://votre-app.vercel.app
ADMIN_PASSWORD=JuniorAdmin123
```

### 3. Configuration de l'App Web

Créer `web-app/.env.local` :
```env
MONGODB_URI=votre_uri_mongodb
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=votre_bot_username
ADMIN_PASSWORD=JuniorAdmin123
```

## 🚀 Déploiement

### Bot sur Render

1. Créer un nouveau Web Service sur Render
2. Connecter votre repo GitHub
3. Utiliser les paramètres suivants :
   - Root Directory: `bot`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Ajouter les variables d'environnement

### App Web sur Vercel

1. Importer le projet sur Vercel
2. Root Directory: `web-app`
3. Ajouter les variables d'environnement
4. Déployer

## 📱 Utilisation

### Commandes Bot
- `/start` - Démarrer le bot
- `/start ref_<plugId>` - Démarrer avec parrainage
- `/config` - Accès panel admin (mot de passe requis)

### Panel Admin
Accès via `/config` dans le bot ou `/config` sur l'app web.
Mot de passe par défaut : `JuniorAdmin123`

## 🔧 Structure du Projet

```
telegram-shop-bot/
├── bot/                    # Bot Telegram
│   ├── handlers/          # Gestionnaires d'événements
│   ├── models/           # Modèles MongoDB
│   └── index.js         # Point d'entrée
├── web-app/              # Application Next.js
│   ├── app/             # Pages et API routes
│   ├── components/      # Composants React
│   ├── lib/            # Utilitaires
│   └── models/         # Modèles partagés
└── README.md
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une PR.

## 📄 Licence

MIT
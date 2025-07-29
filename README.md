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
- MongoDB (déjà configuré avec votre URI)
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

### 2. Initialiser les données de test
```bash
cd bot
npm install
npm run init-data
```

### 3. Configuration du Bot

Le fichier `bot/.env` est déjà configuré avec :
- ✅ Token Telegram
- ✅ MongoDB URI
- ❌ À compléter : WEB_APP_URL (après déploiement Vercel)
- ❌ À compléter : TELEGRAM_BOT_USERNAME

### 4. Configuration de l'App Web

Compléter `web-app/.env.local` avec :
- ✅ MongoDB URI (déjà configuré)
- ❌ Cloudinary credentials
- ❌ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

## 🚀 Déploiement

### Bot sur Render

1. Créer un nouveau Web Service sur Render
2. Connecter votre repo GitHub
3. Configuration :
   - Root Directory: `bot`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Variables d'environnement :
   ```
   TELEGRAM_BOT_TOKEN=7631105823:AAFIWjyN2hPR__R5QsvWTthVMkGVOCA_xd8
   MONGODB_URI=mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF
   WEB_APP_URL=[URL de votre app Vercel]
   ADMIN_PASSWORD=JuniorAdmin123
   TELEGRAM_BOT_USERNAME=[username de votre bot]
   ```

### App Web sur Vercel

1. Importer le projet sur Vercel
2. Configuration :
   - Root Directory: `web-app`
3. Variables d'environnement :
   ```
   MONGODB_URI=mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF
   CLOUDINARY_CLOUD_NAME=[votre cloud name]
   CLOUDINARY_API_KEY=[votre api key]
   CLOUDINARY_API_SECRET=[votre api secret]
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=[username de votre bot]
   ADMIN_PASSWORD=JuniorAdmin123
   ```

## 📱 Utilisation

### Commandes Bot
- `/start` - Démarrer le bot
- `/start ref_<plugId>` - Démarrer avec parrainage
- `/config` - Accès panel admin (mot de passe : JuniorAdmin123)

### Panel Admin
- Bot : `/config` dans Telegram
- Web : `https://votre-app.vercel.app/config`
- Mot de passe : `JuniorAdmin123`

### Données de test
Après l'initialisation, vous aurez :
- 3 plugs de test (Paris, Marseille, Lyon)
- Settings par défaut configurés
- Pays et départements pré-remplis

## 🔧 Structure du Projet

```
telegram-shop-bot/
├── bot/                    # Bot Telegram
│   ├── handlers/          # Gestionnaires d'événements
│   ├── models/           # Modèles MongoDB
│   ├── scripts/         # Scripts d'initialisation
│   └── index.js        # Point d'entrée
├── web-app/            # Application Next.js
│   ├── app/           # Pages et API routes
│   ├── components/   # Composants React
│   ├── lib/         # Utilitaires
│   └── models/     # Modèles partagés
└── README.md
```

## 🔐 Sécurité

⚠️ **IMPORTANT** : Les fichiers `.env` contiennent des informations sensibles. Ne les commitez jamais sur GitHub !

Pour la production :
1. Changez le mot de passe admin
2. Utilisez des variables d'environnement sécurisées
3. Activez l'authentification à deux facteurs sur MongoDB Atlas

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une PR.

## 📄 Licence

MIT
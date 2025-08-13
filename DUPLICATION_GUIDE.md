# 🚀 GUIDE COMPLET DE DUPLICATION - BOT TELEGRAM & BOUTIQUE

## ⚠️ AVERTISSEMENT SÉCURITÉ ⚠️
**AVANT DE COMMENCER, LISEZ ABSOLUMENT LE [GUIDE DE SÉCURITÉ](IMPORTANT_SECURITY.md)**

> ⛔ **NE JAMAIS réutiliser les credentials de la boutique principale !**
> 
> ✅ **TOUJOURS créer de nouveaux comptes et tokens pour votre duplication !**

---

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Étape 1 : Dupliquer le code](#étape-1--dupliquer-le-code)
3. [Étape 2 : Créer le bot Telegram](#étape-2--créer-le-bot-telegram)
4. [Étape 3 : Configurer MongoDB](#étape-3--configurer-mongodb)
5. [Étape 4 : Configurer Cloudinary](#étape-4--configurer-cloudinary)
6. [Étape 5 : Déployer le bot sur Render](#étape-5--déployer-le-bot-sur-render)
7. [Étape 6 : Déployer la boutique sur Vercel](#étape-6--déployer-la-boutique-sur-vercel)
8. [Étape 7 : Configuration finale](#étape-7--configuration-finale)
9. [Variables d'environnement complètes](#variables-denvironnement-complètes)
10. [Vérification et tests](#vérification-et-tests)

---

## 📌 Prérequis

### Comptes nécessaires :
- ✅ Compte GitHub
- ✅ Compte Telegram
- ✅ Compte MongoDB Atlas (gratuit)
- ✅ Compte Cloudinary (gratuit)
- ✅ Compte Render (gratuit)
- ✅ Compte Vercel (gratuit)

### Outils requis :
- Git installé sur votre ordinateur
- Un éditeur de code (VS Code recommandé)
- Node.js version 18+ (optionnel pour tests locaux)

---

## 🔧 ÉTAPE 1 : Dupliquer le code

### 1.1 Forker le repository

1. Allez sur : https://github.com/juniorrrrr345/PLGSCRTF
2. Cliquez sur le bouton **"Fork"** en haut à droite
3. Sélectionnez votre compte GitHub
4. Attendez que le fork soit créé

### 1.2 Cloner votre fork en local (optionnel)

```bash
git clone https://github.com/VOTRE_USERNAME/PLGSCRTF.git
cd PLGSCRTF
```

---

## 🤖 ÉTAPE 2 : Créer le bot Telegram

### 2.1 Créer un nouveau bot

1. Ouvrez Telegram et cherchez **@BotFather**
2. Envoyez `/newbot`
3. Choisissez un nom pour votre bot (ex: "Ma Boutique CRTFS")
4. Choisissez un username unique (ex: @MaBoutiqueCRTFS_bot)
5. **IMPORTANT** : Sauvegardez le token que BotFather vous donne
   ```
   Exemple : 7631105823:AAFIWjyN2hPR__R5QsvWTthVMkGVOCA_xd8
   ```

### 2.2 Configurer le bot

Envoyez ces commandes à @BotFather :

```
/setdescription
Sélectionnez votre bot
Entrez : La marketplace exclusive des vendeurs certifiés 🔌

/setabouttext
Sélectionnez votre bot
Entrez : Bot officiel de la boutique PLUGS CRTFS

/setcommands
Sélectionnez votre bot
Entrez :
start - Démarrer le bot
admin - Panel administrateur
broadcast - Envoyer un message global (admin)
```

### 2.3 Créer la Mini App

1. Envoyez `/newapp` à @BotFather
2. Sélectionnez votre bot
3. Choisissez un titre : "PLUGS CRTFS Shop"
4. Entrez une description courte
5. Uploadez une image 640x360px (optionnel)
6. **Pour l'URL** : Entrez temporairement `https://example.com`
   (Vous la changerez après le déploiement Vercel)
7. Choisissez un nom court : `miniapp`

---

## 🗄️ ÉTAPE 3 : Configurer MongoDB

### 3.1 Créer un cluster MongoDB Atlas

1. Allez sur https://www.mongodb.com/atlas
2. Créez un compte gratuit
3. Créez un nouveau cluster (choisissez le plan gratuit M0)
4. Choisissez la région la plus proche (ex: Paris)

### 3.2 Configurer l'accès

1. **Database Access** :
   - Cliquez sur "Add New Database User"
   - Username : `admin`
   - Password : Générez un mot de passe fort (notez-le!)
   - Rôle : "Atlas Admin"

2. **Network Access** :
   - Cliquez sur "Add IP Address"
   - Cliquez sur "Allow Access from Anywhere"
   - Ajoutez : `0.0.0.0/0`

### 3.3 Obtenir l'URI de connexion

1. Cliquez sur "Connect" sur votre cluster
2. Choisissez "Connect your application"
3. Copiez l'URI et remplacez `<password>` par votre mot de passe
   ```
   mongodb+srv://admin:VOTRE_MOT_DE_PASSE@cluster.mongodb.net/plgscrtf?retryWrites=true&w=majority
   ```

---

## 📸 ÉTAPE 4 : Configurer Cloudinary

### 4.1 Créer un compte

1. Allez sur https://cloudinary.com
2. Créez un compte gratuit
3. Confirmez votre email

### 4.2 Obtenir les credentials

1. Dans le dashboard, trouvez votre **Cloudinary URL**
2. Il ressemble à :
   ```
   cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   ```
3. Copiez-le et gardez-le pour plus tard

---

## 🚀 ÉTAPE 5 : Déployer le bot sur Render

### 5.1 Créer un nouveau service

1. Allez sur https://render.com
2. Connectez-vous avec GitHub
3. Cliquez sur "New +" → "Web Service"
4. Connectez votre repository forké
5. Configuration :
   - **Name** : `plgscrtf-bot` (ou ce que vous voulez)
   - **Region** : Frankfurt (EU)
   - **Branch** : main
   - **Root Directory** : `bot`
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : Free

### 5.2 Variables d'environnement

Ajoutez ces variables dans Render :

```env
TELEGRAM_BOT_TOKEN=7631105823:AAFIWjyN2hPR__R5QsvWTthVMkGVOCA_xd8
TELEGRAM_BOT_USERNAME=MaBoutiqueCRTFS_bot
MONGODB_URI=mongodb+srv://admin:MOT_DE_PASSE@cluster.mongodb.net/plgscrtf?retryWrites=true&w=majority
CLOUDINARY_URL=cloudinary://851324984197634:bQJrdNdhts56XuPx4uCoWEme80g@dtjab1akq
WEB_APP_URL=https://votre-boutique.vercel.app
ADMIN_PASSWORD=Admin123!@#
ADMIN_ID=VOTRE_ID_TELEGRAM
CHANNEL_ID=@votre_canal_verification
WEBHOOK_URL=https://plgscrtf-bot.onrender.com
BOT_API_KEY=une_cle_secrete_aleatoire_123456
RENDER=true
```

### 5.3 Obtenir votre ID Telegram

1. Sur Telegram, parlez à @userinfobot
2. Il vous donnera votre ID numérique
3. Mettez cet ID dans `ADMIN_ID`

---

## 🛍️ ÉTAPE 6 : Déployer la boutique sur Vercel

### 6.1 Importer le projet

1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Cliquez sur "Add New..." → "Project"
4. Importez votre repository forké
5. Configuration :
   - **Framework Preset** : Next.js
   - **Root Directory** : `web-app`
   - **Node.js Version** : 18.x

### 6.2 Variables d'environnement

Ajoutez ces variables dans Vercel :

```env
NEXT_PUBLIC_BOT_USERNAME=MaBoutiqueCRTFS_bot
NEXT_PUBLIC_BOT_API_URL=https://plgscrtf-bot.onrender.com
NEXT_PUBLIC_MINI_APP_URL=https://votre-boutique.vercel.app
BOT_API_KEY=une_cle_secrete_aleatoire_123456
ADMIN_PASSWORD=Admin123!@#
MONGODB_URI=mongodb+srv://admin:MOT_DE_PASSE@cluster.mongodb.net/plgscrtf?retryWrites=true&w=majority
CLOUDINARY_URL=cloudinary://851324984197634:bQJrdNdhts56XuPx4uCoWEme80g@dtjab1akq
```

### 6.3 Déployer

1. Cliquez sur "Deploy"
2. Attendez que le déploiement se termine
3. Notez l'URL de votre boutique (ex: `https://plgscrtf.vercel.app`)

---

## ⚙️ ÉTAPE 7 : Configuration finale

### 7.1 Mettre à jour le Webhook du bot

1. Retournez sur Render
2. Dans les variables d'environnement, mettez à jour :
   - `WEB_APP_URL` avec l'URL Vercel
   - `WEBHOOK_URL` avec l'URL Render

### 7.2 Configurer la Mini App

1. Retournez sur @BotFather
2. Envoyez `/myapps`
3. Sélectionnez votre bot
4. Sélectionnez votre app
5. "Edit Web App URL"
6. Entrez : `https://votre-boutique.vercel.app`

### 7.3 Créer un canal de vérification (optionnel)

1. Créez un canal Telegram public
2. Ajoutez votre bot comme administrateur
3. Obtenez l'ID du canal :
   - Envoyez un message dans le canal
   - Allez sur : https://api.telegram.org/bot[VOTRE_TOKEN]/getUpdates
   - Trouvez le chat_id (commence par -100)
4. Mettez à jour `CHANNEL_ID` dans Render

---

## 📝 Variables d'environnement complètes

### Pour Render (Bot) :

```env
# Telegram
TELEGRAM_BOT_TOKEN=votre_token_bot
TELEGRAM_BOT_USERNAME=votre_bot_username
CHANNEL_ID=@votre_canal_ou_-100xxxxx

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/plgscrtf?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# URLs
WEB_APP_URL=https://votre-app.vercel.app
WEBHOOK_URL=https://votre-bot.onrender.com

# Admin
ADMIN_PASSWORD=VotreMotDePasseAdmin123!
ADMIN_ID=votre_id_telegram

# API
BOT_API_KEY=cle_secrete_aleatoire

# Render
RENDER=true
```

### Pour Vercel (Boutique) :

```env
# Public
NEXT_PUBLIC_BOT_USERNAME=votre_bot_username
NEXT_PUBLIC_BOT_API_URL=https://votre-bot.onrender.com
NEXT_PUBLIC_MINI_APP_URL=https://votre-app.vercel.app

# Private
BOT_API_KEY=cle_secrete_aleatoire
ADMIN_PASSWORD=VotreMotDePasseAdmin123!
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/plgscrtf?retryWrites=true&w=majority
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

---

## ✅ Vérification et tests

### 1. Tester le bot

1. Ouvrez Telegram
2. Cherchez votre bot @votre_bot
3. Envoyez `/start`
4. Vérifiez que le menu s'affiche

### 2. Tester l'admin

1. Envoyez `/admin` au bot
2. Entrez votre mot de passe admin
3. Vérifiez l'accès au panel

### 3. Tester la boutique

1. Allez sur votre URL Vercel
2. Vérifiez que la page s'affiche
3. Testez la navigation

### 4. Tester la Mini App

1. Dans le bot, cliquez sur "MINI APP PLGS CRTFS"
2. Vérifiez que la boutique s'ouvre dans Telegram

### 5. Tester le panel admin web

1. Allez sur : `https://votre-boutique.vercel.app/config`
2. Entrez le mot de passe admin
3. Vérifiez l'accès au panel

---

## 🆘 Dépannage

### Le bot ne répond pas
- Vérifiez le token dans Render
- Vérifiez les logs dans Render
- Redémarrez le service

### Erreur MongoDB
- Vérifiez l'URI de connexion
- Vérifiez que l'IP 0.0.0.0/0 est autorisée
- Vérifiez le nom d'utilisateur et mot de passe

### La boutique ne s'affiche pas
- Vérifiez les variables d'environnement Vercel
- Vérifiez les logs de build
- Redéployez si nécessaire

### La Mini App ne s'ouvre pas
- Vérifiez l'URL dans @BotFather
- Vérifiez que l'URL commence par https://
- Attendez quelques minutes après la modification

---

## 📱 Support

Si vous avez des questions ou des problèmes :
1. Vérifiez d'abord ce guide
2. Consultez les logs dans Render/Vercel
3. Vérifiez toutes les variables d'environnement

---

## 🎉 Félicitations !

Votre bot et votre boutique sont maintenant opérationnels ! 

### Prochaines étapes :
1. Personnalisez les messages dans le panel admin
2. Ajoutez vos plugs
3. Configurez vos réseaux sociaux
4. Invitez des utilisateurs !

---

*Guide créé pour PLGSCRTF - Bot Telegram & Boutique*
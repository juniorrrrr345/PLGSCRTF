# 🤖 GUIDE COMPLET : DUPLIQUER AVEC CURSOR AI & CLAUDE SONNET

## 📌 CE GUIDE EST POUR VOUS SI :
- Vous voulez créer VOTRE PROPRE bot et boutique
- Vous voulez utiliser Cursor AI avec Claude Sonnet comme assistant
- Vous voulez tout faire depuis zéro sur VOTRE compte GitHub

---

## 🎯 OBJECTIF FINAL
Vous aurez :
1. ✅ Votre propre repository GitHub avec le code
2. ✅ Votre propre bot Telegram fonctionnel
3. ✅ Votre propre boutique web déployée
4. ✅ Votre propre base de données
5. ✅ Tout configuré et opérationnel

---

## 📋 ÉTAPE 1 : PRÉPARER LES COMPTES (15 minutes)

### 1.1 Créez ces comptes GRATUITS :
- [ ] **GitHub** : https://github.com (si pas déjà fait)
- [ ] **Telegram** : Avoir un compte actif
- [ ] **MongoDB Atlas** : https://mongodb.com/atlas
- [ ] **Cloudinary** : https://cloudinary.com
- [ ] **Render** : https://render.com
- [ ] **Vercel** : https://vercel.com
- [ ] **Cursor** : https://cursor.sh (téléchargez l'éditeur)

### 1.2 Configurez Cursor avec Claude :
1. Ouvrez Cursor
2. Allez dans Settings (⚙️)
3. Dans "Models", sélectionnez "Claude 3.5 Sonnet"
4. Connectez votre compte (ou utilisez la version gratuite)

---

## 📋 ÉTAPE 2 : DUPLIQUER LE CODE AVEC CURSOR (10 minutes)

### 2.1 Forker le repository original :
1. Allez sur : https://github.com/juniorrrrr345/PLGSCRTF
2. Cliquez sur le bouton "Fork" en haut à droite
3. Choisissez VOTRE compte GitHub
4. Attendez que le fork soit créé

### 2.2 Cloner dans Cursor :
1. Ouvrez **Cursor**
2. Cliquez sur "File" → "Open Folder"
3. Créez un nouveau dossier pour votre projet
4. Ouvrez le terminal dans Cursor (Ctrl+`)
5. Tapez :
```bash
git clone https://github.com/VOTRE_USERNAME/PLGSCRTF.git
cd PLGSCRTF
```

### 2.3 Ouvrir le projet :
1. Dans Cursor : "File" → "Open Folder"
2. Sélectionnez le dossier PLGSCRTF que vous venez de cloner
3. Le projet s'ouvre avec tous les fichiers

---

## 📋 ÉTAPE 3 : CRÉER VOTRE BOT TELEGRAM (5 minutes)

### 3.1 Parlez à BotFather :
1. Sur Telegram, cherchez **@BotFather**
2. Envoyez `/newbot`
3. Donnez un nom à votre bot (ex: "Ma Super Boutique")
4. Choisissez un username unique (ex: @MaBoutique2024_bot)
5. **COPIEZ LE TOKEN** qu'il vous donne (TRÈS IMPORTANT!)
   ```
   Exemple: 7123456789:ABCdefGHIjklMNOpqrsTUVwxyz123456789
   ```

### 3.2 Configurez votre bot :
Envoyez ces commandes à @BotFather :
```
/setdescription
[Sélectionnez votre bot]
[Tapez]: Boutique exclusive de produits certifiés

/setcommands
[Sélectionnez votre bot]
[Tapez]:
start - Démarrer le bot
admin - Panel administrateur
```

### 3.3 Obtenez votre ID Telegram :
1. Parlez à **@userinfobot** sur Telegram
2. Il vous donnera votre ID (ex: 123456789)
3. **NOTEZ CET ID** (c'est votre ADMIN_ID)

---

## 📋 ÉTAPE 4 : CRÉER LA BASE DE DONNÉES MONGODB (5 minutes)

### 4.1 Créez votre cluster :
1. Allez sur https://mongodb.com/atlas
2. Créez un compte gratuit
3. Cliquez sur "Build a Database"
4. Choisissez **FREE** (M0 Sandbox)
5. Choisissez la région la plus proche
6. Nommez votre cluster (ex: "MaBoutique")

### 4.2 Créez un utilisateur :
1. Dans "Database Access" → "Add New Database User"
2. Username: `admin`
3. Password: **Générez un mot de passe fort** (notez-le!)
4. Rôle: "Atlas Admin"
5. "Add User"

### 4.3 Autorisez les connexions :
1. Dans "Network Access" → "Add IP Address"
2. Cliquez "Allow Access from Anywhere"
3. Confirmez `0.0.0.0/0`

### 4.4 Récupérez l'URI :
1. Retour sur "Database" → "Connect"
2. "Connect your application"
3. Copiez l'URI et remplacez `<password>` par votre mot de passe
```
mongodb+srv://admin:VOTRE_MOT_DE_PASSE@cluster.mongodb.net/maboutique?retryWrites=true&w=majority
```

---

## 📋 ÉTAPE 5 : CONFIGURER CLOUDINARY (3 minutes)

1. Créez un compte sur https://cloudinary.com
2. Confirmez votre email
3. Dans le Dashboard, trouvez votre **Cloudinary URL**
4. **COPIEZ-LE** (il contient vos clés)
```
cloudinary://123456789:AbCdEfGhIjKlMnOp@votre-cloud-name
```

---

## 📋 ÉTAPE 6 : CONFIGURER AVEC CURSOR AI (10 minutes)

### 6.1 Créez le fichier .env :
1. Dans Cursor, clic droit sur la racine → "New File"
2. Nommez-le `.env`
3. **Demandez à Claude dans Cursor** :
```
"Crée-moi le fichier .env avec ces informations :
- Token bot: [VOTRE_TOKEN]
- MongoDB URI: [VOTRE_URI]
- Cloudinary URL: [VOTRE_URL]
- Admin ID: [VOTRE_ID]
- Username du bot: [VOTRE_USERNAME]
Génère aussi une BOT_API_KEY aléatoire"
```

### 6.2 Claude va créer quelque chose comme :
```env
# Bot Telegram
TELEGRAM_BOT_TOKEN=7123456789:ABCdefGHIjklMNOpqrsTUVwxyz123456789
TELEGRAM_BOT_USERNAME=MaBoutique2024_bot
ADMIN_ID=123456789

# MongoDB
MONGODB_URI=mongodb+srv://admin:VotreMotDePasse@cluster.mongodb.net/maboutique?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_URL=cloudinary://123456789:AbCdEfGhIjKlMnOp@votre-cloud-name

# Sécurité
ADMIN_PASSWORD=AdminPass2024!
BOT_API_KEY=fgh456jkl789mno012pqr345stu678vwx

# URLs (à mettre à jour après déploiement)
WEB_APP_URL=https://votre-app.vercel.app
WEBHOOK_URL=https://votre-bot.onrender.com
RENDER=true
```

---

## 📋 ÉTAPE 7 : DÉPLOYER LE BOT SUR RENDER (10 minutes)

### 7.1 Connectez Render à GitHub :
1. Allez sur https://render.com
2. "Sign up with GitHub"
3. Autorisez l'accès

### 7.2 Créez le service :
1. "New +" → "Web Service"
2. "Connect a repository"
3. Cherchez "PLGSCRTF" → "Connect"
4. Configuration :
   - **Name**: `ma-boutique-bot`
   - **Region**: Frankfurt (EU)
   - **Branch**: main
   - **Root Directory**: `bot` ⚠️ IMPORTANT
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 7.3 Ajoutez les variables d'environnement :
1. Cliquez sur "Advanced"
2. "Add Environment Variable"
3. Ajoutez TOUTES ces variables :

| Key | Value |
|-----|-------|
| TELEGRAM_BOT_TOKEN | [Votre token] |
| TELEGRAM_BOT_USERNAME | [Votre username sans @] |
| MONGODB_URI | [Votre URI MongoDB] |
| CLOUDINARY_URL | [Votre URL Cloudinary] |
| ADMIN_ID | [Votre ID Telegram] |
| ADMIN_PASSWORD | AdminPass2024! |
| BOT_API_KEY | [Clé générée] |
| WEB_APP_URL | https://temp.com (temporaire) |
| WEBHOOK_URL | https://temp.com (temporaire) |
| RENDER | true |

4. "Create Web Service"
5. Attendez le déploiement (5-10 min)
6. **NOTEZ L'URL** de votre service (ex: https://ma-boutique-bot.onrender.com)

---

## 📋 ÉTAPE 8 : DÉPLOYER LA BOUTIQUE SUR VERCEL (10 minutes)

### 8.1 Importez le projet :
1. Allez sur https://vercel.com
2. "Sign up with GitHub"
3. "Add New..." → "Project"
4. Importez "PLGSCRTF"

### 8.2 Configurez :
1. **Framework Preset**: Next.js
2. **Root Directory**: `web-app` ⚠️ IMPORTANT
3. **Node.js Version**: 18.x

### 8.3 Variables d'environnement :
Cliquez "Environment Variables" et ajoutez :

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_BOT_USERNAME | [Votre username sans @] |
| NEXT_PUBLIC_BOT_API_URL | https://ma-boutique-bot.onrender.com |
| NEXT_PUBLIC_MINI_APP_URL | https://temp.com (temporaire) |
| BOT_API_KEY | [Même clé que Render] |
| ADMIN_PASSWORD | [Même mot de passe] |
| MONGODB_URI | [Même URI] |
| CLOUDINARY_URL | [Même URL] |

4. "Deploy"
5. Attendez (3-5 min)
6. **NOTEZ L'URL** (ex: https://ma-boutique.vercel.app)

---

## 📋 ÉTAPE 9 : CONFIGURATION FINALE (5 minutes)

### 9.1 Mettez à jour les URLs sur Render :
1. Retournez sur Render
2. Votre service → "Environment"
3. Mettez à jour :
   - `WEB_APP_URL` = [URL Vercel]
   - `WEBHOOK_URL` = [URL Render]
4. "Save Changes" (le bot redémarre)

### 9.2 Mettez à jour sur Vercel :
1. Sur Vercel → Settings → Environment Variables
2. Mettez à jour :
   - `NEXT_PUBLIC_MINI_APP_URL` = [URL Vercel]
   - `NEXT_PUBLIC_BOT_API_URL` = [URL Render]
3. Redéployez : Deployments → Redeploy

### 9.3 Créez la Mini App Telegram :
1. Retour sur @BotFather
2. `/newapp`
3. Sélectionnez votre bot
4. Titre: "Ma Boutique"
5. Description: "Boutique en ligne"
6. Photo: (optionnel, skip avec /empty)
7. **URL**: [Votre URL Vercel]
8. Nom court: `boutique`

---

## 📋 ÉTAPE 10 : TESTER AVEC CURSOR (5 minutes)

### 10.1 Testez le bot :
1. Sur Telegram, cherchez votre bot
2. Envoyez `/start`
3. Le menu doit apparaître

### 10.2 Si ça ne marche pas, demandez à Claude dans Cursor :
```
"Mon bot ne répond pas, voici les logs de Render : [collez les logs]
Comment corriger ?"
```

### 10.3 Testez l'admin :
1. Envoyez `/admin` au bot
2. Entrez votre mot de passe
3. Vous devez voir le panel admin

### 10.4 Testez la boutique :
1. Allez sur votre URL Vercel
2. La boutique doit s'afficher
3. Allez sur `/config` pour le panel admin web

---

## 🎨 PERSONNALISER AVEC CURSOR AI

### Demandez à Claude dans Cursor :

**Pour changer les couleurs :**
```
"Change la couleur principale de violet à bleu dans toute l'application"
```

**Pour modifier les textes :**
```
"Change le message d'accueil du bot pour dire : [votre texte]"
```

**Pour ajouter des fonctionnalités :**
```
"Ajoute un bouton 'Promotions' dans le menu principal du bot"
```

**Pour corriger des bugs :**
```
"J'ai cette erreur : [erreur]. Comment la corriger ?"
```

### Claude va :
1. Analyser votre demande
2. Modifier les fichiers nécessaires
3. Vous expliquer les changements
4. Vous guider pour déployer

---

## 📊 COMMANDES UTILES DANS CURSOR

### Terminal (Ctrl+`) :
```bash
# Voir les modifications
git status

# Ajouter les changements
git add .

# Commiter
git commit -m "Description du changement"

# Pousser sur GitHub
git push origin main
```

### Après un push :
- **Render** se redéploie automatiquement
- **Vercel** se redéploie automatiquement

---

## 🆘 PROBLÈMES FRÉQUENTS

### "Module not found" sur Render :
```
Demandez à Claude : "J'ai une erreur module not found sur Render, comment installer les dépendances manquantes ?"
```

### Bot ne répond pas :
```
Demandez : "Mon bot ne répond pas, comment vérifier le token et la connexion MongoDB ?"
```

### Images ne s'affichent pas :
```
Demandez : "Les images ne s'upload pas, comment vérifier Cloudinary ?"
```

---

## ✅ CHECKLIST FINALE

- [ ] Bot répond à `/start`
- [ ] Menu principal fonctionne
- [ ] `/admin` avec mot de passe fonctionne
- [ ] Boutique web accessible
- [ ] Panel admin web (`/config`) accessible
- [ ] Mini App s'ouvre dans Telegram
- [ ] Upload d'images fonctionne
- [ ] Base de données connectée

---

## 🎯 RÉSUMÉ : VOS URLS FINALES

- **Votre Bot** : `https://t.me/VOTRE_BOT`
- **Votre Boutique** : `https://votre-app.vercel.app`
- **Panel Admin** : `https://votre-app.vercel.app/config`
- **GitHub** : `https://github.com/VOTRE_USERNAME/PLGSCRTF`
- **Render** : `https://dashboard.render.com`
- **Vercel** : `https://vercel.com/dashboard`

---

## 💡 ASTUCES AVEC CURSOR & CLAUDE

1. **Soyez précis** dans vos demandes
2. **Copiez-collez les erreurs** complètes
3. **Demandez des explications** si vous ne comprenez pas
4. **Faites des commits réguliers** pour pouvoir revenir en arrière
5. **Testez après chaque changement**

---

## 🚀 PROCHAINES ÉTAPES

Avec Cursor et Claude, vous pouvez :
- Changer le design complet
- Ajouter de nouvelles fonctionnalités
- Intégrer des paiements
- Ajouter des langues
- Créer des automatisations
- Et bien plus !

**Demandez simplement à Claude ce que vous voulez faire !**

---

## 📞 BESOIN D'AIDE ?

Dans Cursor, demandez à Claude :
```
"J'ai suivi le guide mais j'ai ce problème : [décrivez le problème]
Voici l'erreur : [collez l'erreur]
Comment le résoudre ?"
```

Claude analysera et vous donnera la solution étape par étape !

---

**🎉 FÉLICITATIONS ! Vous avez maintenant VOTRE PROPRE bot et boutique !**

*Guide créé pour une duplication complète avec Cursor AI & Claude Sonnet*
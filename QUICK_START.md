# ⚡ DÉMARRAGE RAPIDE - PLGSCRTF

## 🎯 En 10 minutes, votre bot et boutique seront en ligne !

### 📋 Checklist rapide

#### 1️⃣ **Fork le projet** (1 min)
- [ ] Allez sur https://github.com/juniorrrrr345/PLGSCRTF
- [ ] Cliquez sur "Fork"

#### 2️⃣ **Créer le bot Telegram** (2 min)
- [ ] Parlez à @BotFather
- [ ] `/newbot` → Choisissez nom et username
- [ ] Sauvegardez le TOKEN

#### 3️⃣ **MongoDB Atlas** (3 min)
- [ ] Créez compte sur mongodb.com/atlas
- [ ] Créez cluster gratuit M0
- [ ] Créez user `admin` avec mot de passe
- [ ] Autorisez IP `0.0.0.0/0`
- [ ] Copiez l'URI

#### 4️⃣ **Cloudinary** (1 min)
- [ ] Créez compte sur cloudinary.com
- [ ] Copiez le Cloudinary URL du dashboard

#### 5️⃣ **Déployer sur Render** (2 min)
- [ ] Connectez-vous avec GitHub
- [ ] New → Web Service
- [ ] Sélectionnez votre fork
- [ ] Root Directory: `bot`
- [ ] Ajoutez les variables d'environnement

#### 6️⃣ **Déployer sur Vercel** (2 min)
- [ ] Connectez-vous avec GitHub
- [ ] Import Project
- [ ] Root Directory: `web-app`
- [ ] Ajoutez les variables d'environnement

#### 7️⃣ **Configuration finale** (1 min)
- [ ] Créez Mini App dans @BotFather avec URL Vercel
- [ ] Testez `/start` dans votre bot

---

## 🔑 Variables essentielles

### Pour Render (Bot)
```
TELEGRAM_BOT_TOKEN=         # Token de @BotFather
TELEGRAM_BOT_USERNAME=       # Username du bot sans @
MONGODB_URI=                 # URI MongoDB Atlas
CLOUDINARY_URL=              # URL Cloudinary complet
WEB_APP_URL=                 # URL Vercel de la boutique
ADMIN_PASSWORD=              # Mot de passe admin
ADMIN_ID=                    # Votre ID Telegram
RENDER=true
```

### Pour Vercel (Boutique)
```
NEXT_PUBLIC_BOT_USERNAME=    # Username du bot sans @
NEXT_PUBLIC_BOT_API_URL=     # URL Render du bot
BOT_API_KEY=                 # Clé API (même que Render)
ADMIN_PASSWORD=              # Même mot de passe
MONGODB_URI=                 # Même URI MongoDB
CLOUDINARY_URL=              # Même URL Cloudinary
```

---

## ✅ C'est tout !

Votre bot et boutique sont maintenant en ligne ! 🎉

- Bot: `https://t.me/VOTRE_BOT`
- Boutique: `https://votre-app.vercel.app`
- Admin: `https://votre-app.vercel.app/config`

---

## 🆘 Problème ?

1. **Bot ne répond pas** → Vérifiez TOKEN dans Render
2. **Erreur MongoDB** → Vérifiez IP autorisée (0.0.0.0/0)
3. **Mini App ne s'ouvre pas** → Attendez 2 min après config

---

*Pour plus de détails, consultez DUPLICATION_GUIDE.md*
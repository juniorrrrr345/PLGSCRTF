# ⚠️ URGENT : SÉPARATION COMPLÈTE DES PROJETS ⚠️

## 🚨 PROBLÈME CRITIQUE IDENTIFIÉ
Les deux projets (original et dupliqué) PARTAGENT des configurations ! C'est DANGEREUX !

## ✅ ACTIONS IMMÉDIATES À FAIRE

### 1. Sur @BotFather (Telegram) - CRÉER UN NOUVEAU BOT
```
1. Ouvrir @BotFather
2. /newbot
3. Choisir un nouveau nom : "CERTIF2PLUG Bot" (ou autre)
4. Choisir un username UNIQUE : @CERTIF2PLUG_BOT (ou autre)
5. NOTER le nouveau TOKEN du bot
```

### 2. Créer une NOUVELLE base MongoDB
```
1. Aller sur MongoDB Atlas
2. Créer un NOUVEAU cluster ou une NOUVELLE base de données
3. NE PAS utiliser la même URI que l'ancien projet !
4. Obtenir une NOUVELLE MongoDB URI
```

### 3. Créer un NOUVEAU compte Cloudinary
```
1. Créer un nouveau compte sur cloudinary.com
2. OU créer un nouveau "cloud" dans votre compte existant
3. Obtenir de NOUVELLES clés :
   - CLOUDINARY_CLOUD_NAME (nouveau)
   - CLOUDINARY_API_KEY (nouveau)
   - CLOUDINARY_API_SECRET (nouveau)
```

### 4. Sur Render (Bot) - Variables d'environnement
Mettre à jour TOUTES ces variables avec de NOUVELLES valeurs :
```
TELEGRAM_BOT_TOKEN=<NOUVEAU_TOKEN_DU_NOUVEAU_BOT>
TELEGRAM_BOT_USERNAME=<NOUVEAU_USERNAME_SANS_@>
TELEGRAM_BOT_ADMIN_ID=<VOTRE_ID_TELEGRAM>
MONGODB_URI=<NOUVELLE_URI_MONGODB>
CLOUDINARY_CLOUD_NAME=<NOUVEAU_CLOUD>
CLOUDINARY_API_KEY=<NOUVELLE_CLÉ>
CLOUDINARY_API_SECRET=<NOUVEAU_SECRET>
WEB_APP_URL=<VOTRE_NOUVELLE_URL_VERCEL>
TELEGRAM_CHANNEL_ID=<NOUVEAU_CHANNEL_SI_DIFFERENT>
```

### 5. Sur Vercel (Web App) - Variables d'environnement
Mettre à jour TOUTES ces variables :
```
MONGODB_URI=<NOUVELLE_URI_MONGODB>
NEXT_PUBLIC_BOT_USERNAME=<NOUVEAU_USERNAME_SANS_@>
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=<NOUVEAU_TOKEN>
CLOUDINARY_CLOUD_NAME=<NOUVEAU_CLOUD>
CLOUDINARY_API_KEY=<NOUVELLE_CLÉ>
CLOUDINARY_API_SECRET=<NOUVEAU_SECRET>
TELEGRAM_BOT_TOKEN=<NOUVEAU_TOKEN>
TELEGRAM_BOT_ADMIN_ID=<VOTRE_ID>
```

### 6. Configurer la Mini App sur le NOUVEAU bot
```
1. Sur @BotFather
2. /myapps
3. Sélectionner le NOUVEAU bot
4. "Create New App"
5. Nom : "CERTIF2PLUG Mini App"
6. Description : "Boutique CERTIF2PLUG"
7. Photo : (optionnel)
8. URL : https://votre-app.vercel.app
9. Short name : certif2plug
```

## ⚠️ VÉRIFICATIONS CRITIQUES

### ✅ Vérifier que vous N'UTILISEZ PAS :
- ❌ Le même TOKEN de bot
- ❌ La même MongoDB URI
- ❌ Les mêmes clés Cloudinary
- ❌ Le même username de bot
- ❌ La même mini app

### ✅ Vérifier que vous AVEZ :
- ✅ Un NOUVEAU bot Telegram (@CERTIF2PLUG_BOT ou autre)
- ✅ Une NOUVELLE base MongoDB
- ✅ De NOUVELLES clés Cloudinary
- ✅ Une NOUVELLE mini app configurée

## 🔄 APRÈS CES CHANGEMENTS

1. **Redémarrer le bot sur Render**
   - Aller dans le dashboard Render
   - "Manual Deploy" → "Deploy latest commit"

2. **Redéployer sur Vercel**
   - Les changements d'env vars déclenchent automatiquement un redéploiement

3. **Tester le nouveau bot**
   - Ouvrir @VOTRE_NOUVEAU_BOT
   - Faire /start
   - Vérifier que tout fonctionne
   - Vérifier que la mini app s'ouvre avec la bonne URL

## ⚠️ IMPORTANT
Si vous utilisez les MÊMES credentials que l'ancien projet :
- Les deux bots vont INTERFÉRER
- Les données vont se MÉLANGER
- Les utilisateurs vont être CONFUS
- C'est un RISQUE DE SÉCURITÉ

## 📝 CHECKLIST FINALE
- [ ] Nouveau bot créé sur @BotFather
- [ ] Nouveau TOKEN obtenu
- [ ] Nouvelle MongoDB URI configurée
- [ ] Nouvelles clés Cloudinary configurées
- [ ] Variables mises à jour sur Render
- [ ] Variables mises à jour sur Vercel
- [ ] Mini app configurée sur le nouveau bot
- [ ] Bot redéployé sur Render
- [ ] Site redéployé sur Vercel
- [ ] Tests effectués sur le nouveau bot

---

⚠️ **NE PAS CONTINUER** tant que TOUTES ces étapes ne sont pas complétées !
# Guide de Migration du Bot Telegram

## Variables d'environnement à configurer sur Render

Lors du déploiement sur un nouveau compte Render, vous devez configurer ces variables d'environnement :

### 1. **TELEGRAM_BOT_TOKEN** (OBLIGATOIRE)
- Le nouveau token de votre bot obtenu depuis @BotFather
- Format : `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. **WEBHOOK_URL** (OBLIGATOIRE pour le nouveau déploiement)
- L'URL de votre nouveau service Render
- Pour votre cas : `https://plgscrtf-xxhv.onrender.com`

### 3. **MONGODB_URI** (OBLIGATOIRE)
- L'URL de connexion à votre base de données MongoDB
- Format : `mongodb+srv://username:password@cluster.mongodb.net/database`

### 4. **CHANNEL_ID** (OBLIGATOIRE)
- L'ID du canal Telegram que les utilisateurs doivent rejoindre
- Format : `@nom_du_canal` ou `-1001234567890`

### 5. **ADMIN_IDS** (OBLIGATOIRE)
- Les IDs Telegram des administrateurs
- Format : `123456789,987654321` (séparés par des virgules)

### 6. **RENDER** (OPTIONNEL)
- Définir à `true` pour activer le mode webhook
- Render le définit automatiquement

### 7. **PORT** (OPTIONNEL)
- Le port sur lequel le serveur écoute
- Render le définit automatiquement

### 8. **WEB_APP_URL** (OPTIONNEL)
- L'URL de votre application web si vous en avez une
- Utilisé pour la synchronisation des utilisateurs

### 9. **WEB_APP_API_KEY** (OPTIONNEL)
- Clé API pour sécuriser la communication avec l'app web

## Étapes de migration

1. **Créer le nouveau bot sur Telegram**
   - Parler à @BotFather
   - Utiliser `/newbot` et suivre les instructions
   - Copier le token du nouveau bot

2. **Configurer les variables sur Render**
   - Aller dans Dashboard > Environment
   - Ajouter toutes les variables listées ci-dessus
   - **IMPORTANT** : Définir `WEBHOOK_URL` avec votre nouvelle URL Render

3. **Redéployer le service**
   - Render devrait redéployer automatiquement après l'ajout des variables
   - Sinon, cliquer sur "Manual Deploy" > "Deploy latest commit"

4. **Vérifier les logs**
   - Vérifier que le webhook est configuré : "✅ Webhook configuré avec succès"
   - Vérifier la connexion MongoDB : "✅ Connected to MongoDB"

5. **Tester le bot**
   - Envoyer `/start` au bot
   - Vérifier que le menu s'affiche correctement

## Problèmes courants

### Le bot ne répond pas à /start
- Vérifier que `TELEGRAM_BOT_TOKEN` est correct
- Vérifier que `WEBHOOK_URL` correspond à votre URL Render
- Vérifier les logs pour des erreurs

### Erreur 409 Conflict
- Un autre webhook est actif
- Solution : Attendre 30 secondes ou redéployer

### Erreur de connexion MongoDB
- Vérifier que `MONGODB_URI` est correct
- Vérifier que l'IP de Render est autorisée dans MongoDB Atlas

## Debug

Pour débugger, vous pouvez temporairement ajouter ces logs dans `index.js` :

```javascript
console.log('🔍 Configuration:', {
  webhookUrl: process.env.WEBHOOK_URL,
  botToken: process.env.TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Missing',
  mongoUri: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
  channelId: process.env.CHANNEL_ID,
  adminIds: process.env.ADMIN_IDS
});
```
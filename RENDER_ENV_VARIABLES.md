# Variables d'environnement pour Render

Voici les variables d'environnement à configurer dans Render pour le bot Telegram :

## Variables requises

### 1. TELEGRAM_BOT_TOKEN
```
7631105823:AAFIWjyN2hPR__R5QsvWTthVMkGVOCA_xd8
```

### 2. MONGODB_URI
```
mongodb+srv://votre_utilisateur:votre_mot_de_passe@cluster.mongodb.net/plgscrtf?retryWrites=true&w=majority
```
⚠️ **Important** : Vous devez remplacer `votre_utilisateur` et `votre_mot_de_passe` par vos identifiants MongoDB Atlas

### 3. WEB_APP_URL
```
https://plgscrtf.vercel.app
```

### 4. ADMIN_PASSWORD
```
votre_mot_de_passe_admin
```
⚠️ **Important** : Choisissez un mot de passe sécurisé pour l'accès au panel admin (ex: Admin123!@#)

### 5. ADMIN_IDS
```
votre_id_telegram
```
⚠️ **Important** : Remplacez par votre ID Telegram. Pour obtenir votre ID :
1. Parlez à @userinfobot sur Telegram
2. Il vous donnera votre ID numérique
3. Si vous avez plusieurs admins, séparez les IDs par des virgules (ex: 123456789,987654321)

### 6. CLOUDINARY_URL
```
cloudinary://851324984197634:bQJrdNdhts56XuPx4uCoWEme80g@dtjab1akq
```

## Configuration dans Render

1. Allez dans votre service sur Render
2. Cliquez sur "Environment" dans le menu de gauche
3. Ajoutez chaque variable d'environnement une par une
4. Cliquez sur "Save Changes"
5. Le service redémarrera automatiquement avec les nouvelles variables

## Variables optionnelles

### PORT
```
3000
```
(Render configure automatiquement cette variable, pas besoin de la définir)

## Vérification

Pour vérifier que toutes les variables sont correctement configurées, consultez les logs du bot au démarrage. Vous devriez voir :

```
📍 Environment:
  mongoUri: ✅ Set
  botToken: ✅ Set
  webAppUrl: https://plgscrtf.vercel.app
```

## Notes importantes

- **Ne partagez jamais** ces variables d'environnement publiquement
- Assurez-vous que votre MongoDB Atlas accepte les connexions depuis Render (ajoutez `0.0.0.0/0` dans la whitelist IP)
- Le bot token Telegram doit correspondre à votre bot @PLGSCRTF_BOT
- Si vous avez plusieurs instances qui tournent, arrêtez toutes les anciennes avant de démarrer la nouvelle

## Exemple de configuration complète

Si vous utilisez MongoDB Atlas avec l'utilisateur "admin" et le mot de passe "MonMotDePasse123", votre MONGODB_URI serait :
```
mongodb+srv://admin:MonMotDePasse123@cluster.mongodb.net/plgscrtf?retryWrites=true&w=majority
```
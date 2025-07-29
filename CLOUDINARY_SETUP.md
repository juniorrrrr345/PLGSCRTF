# Configuration Cloudinary pour PLUGS CRTFS

## 1. Créer un compte Cloudinary

1. Allez sur https://cloudinary.com et créez un compte gratuit
2. Dans le dashboard, notez votre **Cloud Name** (actuellement: `dtjab1akq`)

## 2. Configurer un Upload Preset

1. Dans Cloudinary Dashboard, allez dans **Settings** → **Upload**
2. Cliquez sur **Add upload preset**
3. Configurez le preset :
   - **Preset name**: `ml_default`
   - **Signing Mode**: **Unsigned** (important!)
   - **Folder**: `plugs-crtfs`
   - Cliquez sur **Save**

## 3. Variables d'environnement (optionnel)

Si vous utilisez l'upload signé, ajoutez ces variables dans Vercel :

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dtjab1akq
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## 4. Limites et recommandations

- **Logo**: 500x500px minimum, format carré
- **Fond**: 1920x1080px minimum, haute résolution
- **Image bot**: 1280x720px recommandé
- **Taille max**: 100MB par image

## 5. Dépannage

Si l'upload échoue :

1. Vérifiez que le preset `ml_default` existe et est **Unsigned**
2. Vérifiez votre connexion internet
3. Essayez avec une image plus petite (< 10MB)
4. Ouvrez la console du navigateur (F12) pour voir les erreurs détaillées

## 6. Alternative : Upload direct

Si les problèmes persistent, l'application essaiera automatiquement un upload sans preset.
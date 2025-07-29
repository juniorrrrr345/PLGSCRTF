# Variables d'environnement pour Vercel

Copiez et collez ces variables dans les paramètres de votre projet Vercel :

## Variables requises :

```
MONGODB_URI=mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF

CLOUDINARY_CLOUD_NAME=dtjab1akq

CLOUDINARY_API_KEY=851324984197634

CLOUDINARY_API_SECRET=bQJrdNdhts56XuPx4uCoWEme80g

CLOUDINARY_URL=cloudinary://851324984197634:bQJrdNdhts56XuPx4uCoWEme80g@dtjab1akq

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dtjab1akq

NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=PLGSCRTF_BOT

ADMIN_PASSWORD=JuniorAdmin123
```

## Instructions pour Vercel :

1. Allez dans les paramètres de votre projet Vercel
2. Cliquez sur "Environment Variables"
3. Ajoutez chaque variable une par une (copiez-collez directement)
4. Cliquez sur "Save" après avoir ajouté toutes les variables
5. Redéployez votre application

## Notes importantes :

- Les variables commençant par `NEXT_PUBLIC_` sont accessibles côté client
- Les autres variables sont uniquement accessibles côté serveur
- Ne partagez jamais ces variables publiquement (sauf celles avec NEXT_PUBLIC_)
- Pour la production, pensez à changer le mot de passe admin

## Lien du bot :
https://t.me/PLGSCRTF_BOT
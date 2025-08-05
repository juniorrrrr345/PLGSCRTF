# Configuration de la Synchronisation des Utilisateurs

## Vue d'ensemble

La synchronisation des utilisateurs entre le bot Telegram et la boutique web est maintenant configurée pour fonctionner en temps réel. Voici comment cela fonctionne :

1. **Synchronisation automatique** : Chaque fois qu'un nouvel utilisateur démarre le bot ou met à jour ses informations, il est automatiquement synchronisé avec la boutique web.

2. **Synchronisation manuelle** : Les administrateurs peuvent synchroniser tous les utilisateurs via le panel admin du bot.

3. **Script de synchronisation initiale** : Un script est disponible pour synchroniser tous les utilisateurs existants.

## Variables d'environnement requises

### Pour le Bot Telegram

Ajoutez ces variables dans le fichier `.env` du bot :

```env
# URL de la boutique web
WEB_APP_URL=https://plgscrtf.vercel.app

# Clé secrète pour sécuriser la synchronisation
SYNC_SECRET_KEY=votre-cle-secrete-complexe
```

### Pour la Boutique Web (Vercel)

Ajoutez cette variable d'environnement dans Vercel :

```env
SYNC_SECRET_KEY=votre-cle-secrete-complexe
```

**Important** : Utilisez la même clé secrète des deux côtés !

## Utilisation

### 1. Synchronisation initiale

Pour synchroniser tous les utilisateurs existants, exécutez :

```bash
cd bot
node scripts/syncUsers.js
```

### 2. Synchronisation via le panel admin

1. Tapez `/admin` dans le bot
2. Entrez le mot de passe admin
3. Cliquez sur "🔄 Synchroniser utilisateurs"

### 3. Synchronisation automatique

La synchronisation se fait automatiquement quand :
- Un nouvel utilisateur démarre le bot
- Un utilisateur existant met à jour son username, prénom ou nom

## Résolution des problèmes

### Les utilisateurs ne se synchronisent pas

1. Vérifiez que les variables d'environnement sont correctement définies
2. Vérifiez que la clé secrète est identique des deux côtés
3. Vérifiez les logs du bot pour voir les erreurs de synchronisation

### Erreur de connexion

Si vous voyez des erreurs de connexion, vérifiez :
- L'URL de la boutique web est correcte
- La boutique web est en ligne et accessible
- Les certificats SSL sont valides

## Sécurité

- La synchronisation utilise une clé secrète pour authentifier les requêtes
- Changez la clé par défaut `default-sync-key` par une clé complexe
- Ne partagez jamais votre clé secrète

## Maintenance

- Les logs de synchronisation sont affichés dans la console du bot
- En cas d'échec, les utilisateurs peuvent être resynchronisés manuellement
- La synchronisation est conçue pour être résiliente aux erreurs temporaires
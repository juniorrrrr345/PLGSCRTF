# 📝 GUIDE DE MODIFICATION POUR CERTIF2PLUG

Ce guide vous explique comment modifier VOTRE NOUVEAU repository `Certif2plug` pour le personnaliser complètement.

## 🎯 Prérequis

1. Avoir cloné le nouveau repository :
```bash
git clone https://github.com/juniorrrrr345/Certif2plug.git
cd Certif2plug
```

2. Avoir créé un NOUVEAU bot Telegram (@BotFather)
3. Avoir une NOUVELLE base MongoDB
4. Avoir de NOUVELLES clés Cloudinary

## 📂 FICHIERS À MODIFIER

### 1️⃣ BOT TELEGRAM - Changement des textes

#### `bot/handlers/plugsHandler.js`
```javascript
// Ligne ~340
// AVANT: let message = '🔌 <b>PLUGS CRTFS</b>\n';
// APRÈS:
let message = '🔌 <b>CERTIF2PLUG</b>\n';
```

#### `bot/handlers/startHandler.js`
```javascript
// Ligne ~95
// AVANT: '🔌 <b>Bienvenue sur PLUGS CRTFS !</b>\n\nLa marketplace exclusive des vendeurs certifiés.';
// APRÈS:
'🔌 <b>Bienvenue sur CERTIF2PLUG !</b>\n\nLa marketplace exclusive des vendeurs certifiés.';

// Ligne ~102
// AVANT: '🔌 MINI APP PLGS CRTFS'
// APRÈS:
'🔌 MINI APP CERTIF2PLUG'

// Ligne ~111
// AVANT: [{ text: '🔌 PLUGS CRTFS', callback_data: 'plugs' }],
// APRÈS:
[{ text: '🔌 CERTIF2PLUG', callback_data: 'plugs' }],
```

#### `bot/index.js`
```javascript
// Ligne ~445
// AVANT: `Découvrez-le maintenant dans /start → PLUGS CRTFS`;
// APRÈS:
`Découvrez-le maintenant dans /start → CERTIF2PLUG`;

// Ligne ~449
// AVANT: `Consultez les nouveautés dans /start → PLUGS CRTFS`;
// APRÈS:
`Consultez les nouveautés dans /start → CERTIF2PLUG`;

// Ligne ~540
// AVANT: text: '‼️ IMPORTANT DE REJOINDRE POUR VOIR LES MENUS ‼️\n\nCORDIALEMENT PLUGS CRTFS',
// APRÈS:
text: '‼️ IMPORTANT DE REJOINDRE POUR VOIR LES MENUS ‼️\n\nCORDIALEMENT CERTIF2PLUG',

// Ligne ~575
// AVANT: const message = settings?.infoText || 'Bienvenue sur PLUGS CRTFS !';
// APRÈS:
const message = settings?.infoText || 'Bienvenue sur CERTIF2PLUG !';

// Ligne ~639
// AVANT: // PLUGS CRTFS
// APRÈS:
// CERTIF2PLUG
```

#### `bot/middleware/maintenanceCheck.js`
```javascript
// Ligne ~39
// AVANT: PLUGS CRTFS`;
// APRÈS:
CERTIF2PLUG`;
```

#### `bot/models/Settings.js`
```javascript
// Ligne ~6
// AVANT: default: '🔌 Bienvenue sur PLUGS CRTFS !\n\nLa marketplace exclusive des vendeurs certifiés.'
// APRÈS:
default: '🔌 Bienvenue sur CERTIF2PLUG !\n\nLa marketplace exclusive des vendeurs certifiés.'

// Ligne ~10
// AVANT: default: '🔌 MINI APP PLGS CRTFS'
// APRÈS:
default: '🔌 MINI APP CERTIF2PLUG'
```

### 2️⃣ WEB APP - Changement des textes

#### `web-app/package.json`
```json
// AVANT: "name": "telegram-shop-web",
// APRÈS:
"name": "certif2plug-web",
```

#### `web-app/app/layout.tsx`
```typescript
// Ligne ~10
// AVANT: title: 'PLUGS CRTFS - Marketplace des vendeurs certifiés',
// APRÈS:
title: 'CERTIF2PLUG - Marketplace des vendeurs certifiés',
```

#### `web-app/app/page.tsx`
```typescript
// Ligne ~115
// AVANT: PLUGS <span className="gradient-text">CRTFS</span>
// APRÈS:
CERTIF<span className="gradient-text">2</span>PLUG
```

#### `web-app/app/about/page.tsx`
```typescript
// Ligne ~26
// AVANT: Pourquoi choisir <span className="gradient-text">PLUGS CRTFS</span> ?
// APRÈS:
Pourquoi choisir <span className="gradient-text">CERTIF2PLUG</span> ?
```

#### `web-app/app/config/page.tsx`
```typescript
// Ligne ~2103
// AVANT: const [miniAppButtonText, setMiniAppButtonText] = useState('MINI APP PLGS CRTFS 🔌')
// APRÈS:
const [miniAppButtonText, setMiniAppButtonText] = useState('MINI APP CERTIF2PLUG 🔌')

// Ligne ~2400
// AVANT: placeholder="Ex: MINI APP PLGS CRTFS 🔌"
// APRÈS:
placeholder="Ex: MINI APP CERTIF2PLUG 🔌"
```

#### `web-app/components/Navbar.tsx`
```typescript
// Ligne ~50
// AVANT: PLUGS CRTFS
// APRÈS:
CERTIF2PLUG
```

#### `web-app/components/InitialSplash.tsx`
```typescript
// Ligne ~29
// AVANT: Bienvenu(e)s sur <span className="...">PLUGS CRTFS</span>
// APRÈS:
Bienvenu(e)s sur <span className="...">CERTIF2PLUG</span>
```

#### `web-app/components/SplashScreen.tsx`
```typescript
// Ligne ~17
// AVANT: Bienvenu(e)s sur <span className="...">PLUGS CRTFS</span>
// APRÈS:
Bienvenu(e)s sur <span className="...">CERTIF2PLUG</span>
```

#### `web-app/components/MaintenancePage.tsx`
```typescript
// Ligne ~45
// AVANT: alt="PLUGS CRTFS"
// APRÈS:
alt="CERTIF2PLUG"

// Ligne ~83
// AVANT: <span className="font-semibold">PLUGS CRTFS</span>
// APRÈS:
<span className="font-semibold">CERTIF2PLUG</span>
```

#### `web-app/app/loading.tsx`
```typescript
// Ligne ~17
// AVANT: Bienvenu(e)s sur <span className="...">PLUGS CRTFS</span>
// APRÈS:
Bienvenu(e)s sur <span className="...">CERTIF2PLUG</span>
```

#### `web-app/models/Settings.ts`
```typescript
// Ligne ~6
// AVANT: default: '🔌 Bienvenue sur PLUGS CRTFS !\n\nLa marketplace exclusive des vendeurs certifiés.'
// APRÈS:
default: '🔌 Bienvenue sur CERTIF2PLUG !\n\nLa marketplace exclusive des vendeurs certifiés.'

// Ligne ~10
// AVANT: default: '🔌 MINI APP PLGS CRTFS'
// APRÈS:
default: '🔌 MINI APP CERTIF2PLUG'
```

#### `web-app/app/api/applications/[id]/approve/route.ts`
```typescript
// Ligne ~85
// AVANT: `Vous êtes maintenant un vendeur certifié PLUGS CRTFS.\n` +
// APRÈS:
`Vous êtes maintenant un vendeur certifié CERTIF2PLUG.\n` +
```

### 3️⃣ FICHIERS DE DOCUMENTATION

#### `README.md`
Remplacer toutes les occurrences de "PLGSCRTF" et "PLUGS CRTFS" par "CERTIF2PLUG"

## 🔧 VARIABLES D'ENVIRONNEMENT

### Sur Render (Bot)
```bash
TELEGRAM_BOT_TOKEN=<NOUVEAU_TOKEN>
TELEGRAM_BOT_USERNAME=CERTIF2PLUG_BOT  # Sans le @
TELEGRAM_BOT_ADMIN_ID=<VOTRE_ID>
MONGODB_URI=<NOUVELLE_URI>
CLOUDINARY_CLOUD_NAME=<NOUVEAU>
CLOUDINARY_API_KEY=<NOUVELLE>
CLOUDINARY_API_SECRET=<NOUVEAU>
WEB_APP_URL=https://certif2plug.vercel.app  # Votre URL Vercel
TELEGRAM_CHANNEL_ID=<VOTRE_CHANNEL>
```

### Sur Vercel (Web App)
```bash
MONGODB_URI=<NOUVELLE_URI>
NEXT_PUBLIC_BOT_USERNAME=CERTIF2PLUG_BOT
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=<NOUVEAU_TOKEN>
CLOUDINARY_CLOUD_NAME=<NOUVEAU>
CLOUDINARY_API_KEY=<NOUVELLE>
CLOUDINARY_API_SECRET=<NOUVEAU>
TELEGRAM_BOT_TOKEN=<NOUVEAU_TOKEN>
TELEGRAM_BOT_ADMIN_ID=<VOTRE_ID>
```

## 📱 CONFIGURATION MINI APP

Sur @BotFather :
1. `/myapps`
2. Sélectionner votre NOUVEAU bot (@CERTIF2PLUG_BOT)
3. "Create New App" ou "Edit App"
4. URL : `https://certif2plug.vercel.app`

## 🚀 DÉPLOIEMENT

### 1. Commit et push sur VOTRE repository
```bash
git add .
git commit -m "🎨 Rebranding: CERTIF2PLUG"
git push origin main
```

### 2. Sur Render
- Créer un nouveau Web Service
- Connecter à `https://github.com/juniorrrrr345/Certif2plug`
- Configurer les variables d'environnement
- Deploy

### 3. Sur Vercel
- Import du projet depuis `https://github.com/juniorrrrr345/Certif2plug`
- Root Directory: `web-app`
- Configurer les variables d'environnement
- Deploy

## ⚠️ IMPORTANT
- NE PAS utiliser les mêmes tokens/clés que PLGSCRTF
- Chaque instance doit avoir ses propres credentials
- La base MongoDB doit être différente
- Le bot Telegram doit être différent

## ✅ Vérification finale
Après tous ces changements :
1. Le bot affiche "CERTIF2PLUG" partout
2. La web app affiche "CERTIF2PLUG" partout
3. La mini app s'ouvre avec la bonne URL
4. Les deux projets sont complètement indépendants
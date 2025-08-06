require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';
const SYNC_SECRET_KEY = process.env.SYNC_SECRET_KEY || 'default-sync-key';

// Importer les modèles
const User = require('./bot/models/User');

async function syncAllUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer TOUS les utilisateurs du bot
    const botUsers = await User.find({}).sort({ joinedAt: -1 });
    console.log(`\n📱 Bot Telegram: ${botUsers.length} utilisateurs trouvés`);

    // Vérifier le nombre d'utilisateurs dans la boutique web
    const statsResponse = await axios.get(`${WEB_APP_URL}/api/stats`);
    const webUserCount = statsResponse.data.userCount;
    console.log(`🌐 Boutique Vercel: ${webUserCount} utilisateurs actuellement`);
    console.log(`⚠️  Différence: ${botUsers.length - webUserCount} utilisateurs à synchroniser\n`);

    let synced = 0;
    let failed = 0;
    const errors = [];

    console.log('🔄 Début de la synchronisation...\n');

    // Synchroniser chaque utilisateur
    for (let i = 0; i < botUsers.length; i++) {
      const user = botUsers[i];
      const displayName = user.username || user.firstName || `ID:${user.telegramId}`;
      
      try {
        const userData = {
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          referredBy: user.referredBy,
          hasBeenCountedAsReferral: user.hasBeenCountedAsReferral,
          lastLikeAt: user.lastLikeAt,
          likedPlugs: user.likedPlugs || [],
          joinedAt: user.joinedAt,
          isAdmin: user.isAdmin || false,
          referralCount: user.referralCount || 0
        };

        const response = await axios.post(
          `${WEB_APP_URL}/api/users/sync`,
          userData,
          {
            headers: {
              'Authorization': `Bearer ${SYNC_SECRET_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        if (response.data.success) {
          synced++;
          console.log(`✅ [${i + 1}/${botUsers.length}] ${displayName} synchronisé`);
        } else {
          failed++;
          errors.push(`${displayName}: Réponse négative du serveur`);
          console.log(`❌ [${i + 1}/${botUsers.length}] ${displayName} - Échec`);
        }
      } catch (error) {
        failed++;
        const errorMsg = error.response?.data?.error || error.message;
        errors.push(`${displayName}: ${errorMsg}`);
        console.log(`❌ [${i + 1}/${botUsers.length}] ${displayName} - Erreur: ${errorMsg}`);
      }

      // Pause entre les requêtes pour éviter de surcharger le serveur
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n📊 Résumé de la synchronisation:');
    console.log(`✅ Synchronisés avec succès: ${synced}/${botUsers.length}`);
    console.log(`❌ Échecs: ${failed}`);

    if (errors.length > 0) {
      console.log('\n❌ Détails des erreurs:');
      errors.forEach(err => console.log(`   - ${err}`));
    }

    // Vérifier le nouveau compteur
    console.log('\n🔍 Vérification finale...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalStatsResponse = await axios.get(`${WEB_APP_URL}/api/stats`);
    const finalWebCount = finalStatsResponse.data.userCount;
    
    console.log(`\n📱 Bot Telegram: ${botUsers.length} utilisateurs`);
    console.log(`🌐 Boutique Vercel: ${finalWebCount} utilisateurs`);
    
    if (botUsers.length === finalWebCount) {
      console.log('\n✅ SUCCÈS ! Les compteurs sont maintenant synchronisés !');
    } else {
      console.log(`\n⚠️  Il reste une différence de ${Math.abs(botUsers.length - finalWebCount)} utilisateurs`);
      console.log('   Relancez le script ou vérifiez les logs pour plus de détails.');
    }

    // Déconnexion
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
    process.exit(1);
  }
}

// Vérifier les variables d'environnement
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini dans le fichier .env');
  process.exit(1);
}

// Lancer la synchronisation
console.log('🚀 Script de synchronisation des utilisateurs Bot → Boutique Vercel\n');
syncAllUsers();
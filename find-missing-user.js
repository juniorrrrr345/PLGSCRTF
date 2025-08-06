require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';

// Importer les modèles
const BotUser = require('./bot/models/User');
const WebUser = require('./web-app/models/User');

async function findMissingUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les utilisateurs du bot
    const botUsers = await BotUser.find({}).select('telegramId username firstName joinedAt');
    console.log(`📱 Bot Telegram: ${botUsers.length} utilisateurs`);

    // Récupérer tous les utilisateurs de la boutique
    const webUsers = await WebUser.find({}).select('telegramId username firstName joinedAt');
    console.log(`🌐 Boutique Web: ${webUsers.length} utilisateurs\n`);

    // Créer un Set des IDs Telegram de la boutique pour une recherche rapide
    const webUserIds = new Set(webUsers.map(u => u.telegramId.toString()));

    // Trouver les utilisateurs manquants
    const missingUsers = [];
    for (const botUser of botUsers) {
      if (!webUserIds.has(botUser.telegramId.toString())) {
        missingUsers.push(botUser);
      }
    }

    if (missingUsers.length === 0) {
      console.log('✅ Tous les utilisateurs sont synchronisés !');
    } else {
      console.log(`⚠️  ${missingUsers.length} utilisateur(s) manquant(s) dans la boutique:\n`);
      
      missingUsers.forEach((user, index) => {
        const displayName = user.username || user.firstName || 'Sans nom';
        const joinDate = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('fr-FR') : 'Date inconnue';
        console.log(`${index + 1}. @${displayName} (ID: ${user.telegramId}) - Inscrit le ${joinDate}`);
      });

      // Proposer de synchroniser les utilisateurs manquants
      console.log('\n🔄 Synchronisation des utilisateurs manquants...\n');
      
      const { syncUserToWebApp } = require('./bot/utils/userSync');
      
      for (const user of missingUsers) {
        const displayName = user.username || user.firstName || `ID:${user.telegramId}`;
        try {
          // Récupérer l'utilisateur complet du bot
          const fullUser = await BotUser.findOne({ telegramId: user.telegramId });
          
          if (fullUser) {
            const result = await syncUserToWebApp(fullUser);
            if (result) {
              console.log(`✅ ${displayName} synchronisé avec succès`);
            } else {
              console.log(`❌ Échec de synchronisation pour ${displayName}`);
            }
          }
        } catch (error) {
          console.log(`❌ Erreur pour ${displayName}: ${error.message}`);
        }
      }
    }

    // Vérification inverse : utilisateurs dans la boutique mais pas dans le bot
    console.log('\n🔍 Vérification inverse...');
    const botUserIds = new Set(botUsers.map(u => u.telegramId.toString()));
    const extraUsers = webUsers.filter(u => !botUserIds.has(u.telegramId.toString()));
    
    if (extraUsers.length > 0) {
      console.log(`\n⚠️  ${extraUsers.length} utilisateur(s) dans la boutique mais pas dans le bot:`);
      extraUsers.forEach((user, index) => {
        const displayName = user.username || user.firstName || 'Sans nom';
        console.log(`${index + 1}. @${displayName} (ID: ${user.telegramId})`);
      });
    }

    // Déconnexion
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Lancer la recherche
console.log('🔍 Recherche des utilisateurs manquants...\n');
findMissingUser();
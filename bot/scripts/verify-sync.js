require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';

async function verifySync() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Compter les utilisateurs dans MongoDB (bot)
    const botUserCount = await User.countDocuments();
    console.log(`📱 Bot Telegram: ${botUserCount} utilisateurs`);

    // Récupérer le compteur depuis la boutique web
    const response = await axios.get(`${WEB_APP_URL}/api/stats`);
    const webUserCount = response.data.userCount;
    console.log(`🌐 Boutique Vercel: ${webUserCount} utilisateurs`);

    // Comparer les compteurs
    if (botUserCount === webUserCount) {
      console.log('✅ Les compteurs sont synchronisés !');
    } else {
      console.log(`⚠️ Désynchronisation détectée !`);
      console.log(`   Différence: ${Math.abs(botUserCount - webUserCount)} utilisateur(s)`);
      
      // Forcer une resynchronisation
      console.log('\n🔄 Tentative de resynchronisation...');
      const { refreshUserCount } = require('../utils/userSync');
      await refreshUserCount();
      
      // Vérifier à nouveau après 2 secondes
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response2 = await axios.get(`${WEB_APP_URL}/api/stats`);
      const newWebCount = response2.data.userCount;
      
      if (botUserCount === newWebCount) {
        console.log('✅ Resynchronisation réussie !');
      } else {
        console.log('❌ La resynchronisation a échoué');
        console.log(`   Bot: ${botUserCount}, Web: ${newWebCount}`);
      }
    }

    // Afficher les 5 derniers utilisateurs pour vérification
    console.log('\n📋 5 derniers utilisateurs (Bot):');
    const recentUsers = await User.find()
      .sort({ joinedAt: -1 })
      .limit(5)
      .select('telegramId username joinedAt');
    
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. @${user.username || 'Sans nom'} (ID: ${user.telegramId}) - ${user.joinedAt.toLocaleString('fr-FR')}`);
    });

    // Déconnexion
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Lancer la vérification
verifySync();
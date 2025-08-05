require('dotenv').config({ path: './bot/.env' });
const mongoose = require('mongoose');
const axios = require('axios');

async function checkUserCounts() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF');
    console.log('✅ Connecté à MongoDB\n');
    
    // Compter les utilisateurs dans le bot
    const User = require('./bot/models/User');
    const botUserCount = await User.countDocuments();
    console.log(`🤖 Bot Telegram: ${botUserCount} utilisateurs`);
    
    // Compter les utilisateurs dans la boutique
    const webAppUrl = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';
    try {
      const response = await axios.get(`${webAppUrl}/api/users/count`);
      const webUserCount = response.data.count;
      console.log(`🛍️  Boutique Web: ${webUserCount} utilisateurs`);
      
      // Comparer les comptes
      const difference = botUserCount - webUserCount;
      console.log('\n📊 Résumé:');
      
      if (difference === 0) {
        console.log('✅ Les deux systèmes sont parfaitement synchronisés !');
      } else if (difference > 0) {
        console.log(`⚠️  Il y a ${difference} utilisateur(s) dans le bot qui ne sont pas dans la boutique.`);
        console.log('   Utilisez la synchronisation pour corriger cela.');
      } else {
        console.log(`⚠️  Il y a ${Math.abs(difference)} utilisateur(s) dans la boutique qui ne sont pas dans le bot.`);
        console.log('   Cela peut indiquer un problème de données.');
      }
      
      // Afficher quelques utilisateurs du bot pour vérification
      console.log('\n📋 Derniers utilisateurs du bot:');
      const recentUsers = await User.find()
        .sort({ joinedAt: -1 })
        .limit(5)
        .select('telegramId username firstName joinedAt');
      
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. @${user.username || 'Sans username'} (${user.firstName || 'Sans nom'}) - ${user.joinedAt.toLocaleDateString()}`);
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la connexion à la boutique:', error.message);
      console.log('   Vérifiez que la boutique est en ligne et accessible.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

// Lancer le test
checkUserCounts();
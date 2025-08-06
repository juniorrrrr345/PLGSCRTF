const mongoose = require('mongoose');
const axios = require('axios');

async function checkUserCounts() {
  try {
    // Connexion à MongoDB avec l'URI directe
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // Compter les utilisateurs dans le bot
    const User = require('./models/User');
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
        console.log('   → Solution : Lancer la synchronisation complète');
      } else {
        console.log(`⚠️  Il y a ${Math.abs(difference)} utilisateur(s) dans la boutique qui ne sont pas dans le bot.`);
        console.log('   → Cela peut indiquer des utilisateurs supprimés ou un problème de données.');
      }
      
      // Afficher quelques utilisateurs récents pour vérification
      console.log('\n📋 5 derniers utilisateurs du bot:');
      const recentUsers = await User.find()
        .sort({ joinedAt: -1 })
        .limit(5)
        .select('telegramId username firstName joinedAt');
      
      recentUsers.forEach((user, index) => {
        const username = user.username || 'Sans username';
        const name = user.firstName || 'Sans nom';
        const date = user.joinedAt ? user.joinedAt.toLocaleDateString() : 'Date inconnue';
        console.log(`   ${index + 1}. @${username} (${name}) - ${date}`);
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
console.log('🔍 Vérification de la synchronisation des utilisateurs\n');
checkUserCounts();
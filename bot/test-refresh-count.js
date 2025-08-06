const mongoose = require('mongoose');
const axios = require('axios');

async function testRefreshCount() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté\n');
    
    const User = require('./models/User');
    const webAppUrl = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';
    
    // Compter dans le bot
    const botUserCount = await User.countDocuments();
    console.log(`🤖 Bot Telegram: ${botUserCount} utilisateurs`);
    
    // Test 1: Route normale
    console.log('\n📊 Test 1: Route normale /api/users/count');
    try {
      const response1 = await axios.get(`${webAppUrl}/api/users/count`);
      console.log(`   Résultat: ${response1.data.count} utilisateurs`);
    } catch (error) {
      console.log(`   Erreur: ${error.message}`);
    }
    
    // Test 2: Route refresh
    console.log('\n📊 Test 2: Route refresh /api/users/refresh-count');
    try {
      const response2 = await axios.get(`${webAppUrl}/api/users/refresh-count`);
      console.log(`   Résultat: ${response2.data.count} utilisateurs`);
      console.log(`   Timestamp: ${response2.data.timestamp}`);
      
      if (response2.data.recentUsers) {
        console.log('\n   5 derniers utilisateurs web:');
        response2.data.recentUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. @${user.username || 'Sans username'} (${user.firstName || 'Sans nom'})`);
        });
      }
    } catch (error) {
      console.log(`   Erreur: ${error.message}`);
    }
    
    // Comparaison finale
    console.log('\n📋 Résumé:');
    console.log(`Bot: ${botUserCount} utilisateurs`);
    console.log('Web: Vérifiez les résultats ci-dessus');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

console.log('🔄 Test de rafraîchissement du comptage\n');
testRefreshCount();
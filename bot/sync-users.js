const mongoose = require('mongoose');
const { syncAllUsers } = require('./utils/userSync');
const axios = require('axios');

async function performSync() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // Vérifier l'état avant synchronisation
    const User = require('./models/User');
    const botUserCount = await User.countDocuments();
    console.log(`🤖 Bot Telegram: ${botUserCount} utilisateurs`);
    
    const webAppUrl = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';
    try {
      const response = await axios.get(`${webAppUrl}/api/users/count`);
      const webUserCount = response.data.count;
      console.log(`🛍️  Boutique Web: ${webUserCount} utilisateurs`);
      console.log(`📊 Différence: ${botUserCount - webUserCount} utilisateurs à synchroniser\n`);
    } catch (error) {
      console.log('⚠️  Impossible de vérifier la boutique\n');
    }
    
    // Lancer la synchronisation
    console.log('🔄 Début de la synchronisation...\n');
    const result = await syncAllUsers();
    
    console.log('\n📊 Résultat:');
    console.log(`   Total traité: ${result.total}`);
    console.log(`   ✅ Synchronisés: ${result.synced}`);
    console.log(`   ❌ Échecs: ${result.failed}`);
    
    // Vérifier après synchronisation
    console.log('\n🔍 Vérification finale...');
    try {
      const response = await axios.get(`${webAppUrl}/api/users/count`);
      const newWebUserCount = response.data.count;
      console.log(`🤖 Bot: ${botUserCount} | 🛍️  Web: ${newWebUserCount}`);
      
      if (botUserCount === newWebUserCount) {
        console.log('✅ Synchronisation réussie !');
      } else {
        console.log(`⚠️  Différence restante: ${botUserCount - newWebUserCount}`);
      }
    } catch (error) {
      console.log('⚠️  Impossible de vérifier le résultat');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

console.log('🚀 Synchronisation des utilisateurs\n');
performSync();
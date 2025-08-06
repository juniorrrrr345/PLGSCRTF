require('dotenv').config({ path: './bot/.env' });
const mongoose = require('mongoose');
const { syncAllUsers } = require('./bot/utils/userSync');

async function performFullSync() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF');
    console.log('✅ Connecté à MongoDB\n');
    
    // Vérifier d'abord les comptes
    const User = require('./bot/models/User');
    const axios = require('axios');
    
    const botUserCount = await User.countDocuments();
    console.log(`🤖 Bot Telegram: ${botUserCount} utilisateurs`);
    
    // Vérifier la boutique
    const webAppUrl = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';
    try {
      const response = await axios.get(`${webAppUrl}/api/users/count`);
      const webUserCount = response.data.count;
      console.log(`🛍️  Boutique Web: ${webUserCount} utilisateurs`);
      console.log(`📊 Différence: ${botUserCount - webUserCount} utilisateurs\n`);
    } catch (error) {
      console.log('⚠️  Impossible de vérifier le compte de la boutique\n');
    }
    
    // Demander confirmation
    console.log('🔄 Début de la synchronisation complète...\n');
    
    // Effectuer la synchronisation
    const result = await syncAllUsers();
    
    console.log('\n📊 Résultat de la synchronisation:');
    console.log(`   Total traité: ${result.total}`);
    console.log(`   ✅ Synchronisés: ${result.synced}`);
    console.log(`   ❌ Échecs: ${result.failed}`);
    
    if (result.failed > 0) {
      console.log('\n⚠️  Certains utilisateurs n\'ont pas pu être synchronisés.');
      console.log('   Vérifiez les logs pour plus de détails.');
    }
    
    // Vérifier à nouveau les comptes après synchronisation
    console.log('\n🔍 Vérification après synchronisation...');
    
    try {
      const response = await axios.get(`${webAppUrl}/api/users/count`);
      const newWebUserCount = response.data.count;
      console.log(`🤖 Bot Telegram: ${botUserCount} utilisateurs`);
      console.log(`🛍️  Boutique Web: ${newWebUserCount} utilisateurs`);
      
      if (botUserCount === newWebUserCount) {
        console.log('\n✅ Parfait ! Les deux systèmes sont maintenant synchronisés.');
      } else {
        const diff = botUserCount - newWebUserCount;
        console.log(`\n⚠️  Il reste une différence de ${Math.abs(diff)} utilisateurs.`);
        if (result.failed > 0) {
          console.log('   Cela correspond probablement aux échecs de synchronisation.');
        }
      }
    } catch (error) {
      console.log('\n⚠️  Impossible de vérifier le résultat final');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

// Message d'avertissement
console.log('🚨 SYNCHRONISATION COMPLÈTE DES UTILISATEURS 🚨\n');
console.log('Ce script va synchroniser TOUS les utilisateurs du bot');
console.log('vers la boutique web. Cela peut prendre du temps.\n');
console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes pour continuer...\n');

// Attendre 5 secondes avant de commencer
setTimeout(() => {
  performFullSync();
}, 5000);
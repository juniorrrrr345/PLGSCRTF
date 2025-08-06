const mongoose = require('mongoose');
const axios = require('axios');

async function debugUsers() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté\n');
    
    const User = require('./models/User');
    const webAppUrl = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';
    
    // Obtenir tous les utilisateurs du bot
    const botUsers = await User.find().select('telegramId username firstName joinedAt');
    console.log(`📊 Total utilisateurs bot: ${botUsers.length}`);
    
    // Vérifier chaque utilisateur dans la web app
    console.log('\n🔍 Vérification individuelle...\n');
    
    const notSynced = [];
    let checked = 0;
    
    for (const user of botUsers) {
      try {
        // Faire une requête pour vérifier si l'utilisateur existe
        const response = await axios.get(`${webAppUrl}/api/users/${user.telegramId}`);
        
        if (response.status === 404 || !response.data) {
          notSynced.push(user);
          console.log(`❌ Non trouvé: @${user.username || 'Sans username'} (ID: ${user.telegramId})`);
        } else {
          checked++;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          notSynced.push(user);
          console.log(`❌ Non trouvé: @${user.username || 'Sans username'} (ID: ${user.telegramId})`);
        } else {
          console.log(`⚠️  Erreur pour ${user.username}: ${error.message}`);
        }
      }
      
      // Petite pause pour ne pas surcharger l'API
      if ((checked + notSynced.length) % 10 === 0) {
        process.stdout.write(`\r✅ Vérifiés: ${checked} | ❌ Non synchronisés: ${notSynced.length}`);
      }
    }
    
    console.log(`\n\n📊 Résumé final:`);
    console.log(`✅ Synchronisés: ${checked}`);
    console.log(`❌ Non synchronisés: ${notSynced.length}`);
    
    if (notSynced.length > 0) {
      console.log('\n👥 Utilisateurs non synchronisés:');
      notSynced.forEach((user, index) => {
        console.log(`${index + 1}. @${user.username || 'Sans username'} (${user.firstName || 'Sans nom'}) - ID: ${user.telegramId}`);
      });
      
      // Essayer de les synchroniser manuellement
      console.log('\n🔄 Tentative de synchronisation manuelle...');
      const { syncUserToWebApp } = require('./utils/userSync');
      
      for (const user of notSynced) {
        const success = await syncUserToWebApp(user);
        if (success) {
          console.log(`✅ ${user.username || user.telegramId} synchronisé`);
        } else {
          console.log(`❌ Échec pour ${user.username || user.telegramId}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

console.log('🐛 Debug des utilisateurs non synchronisés\n');
debugUsers();
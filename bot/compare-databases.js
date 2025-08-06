const mongoose = require('mongoose');

async function compareDatabases() {
  let botConnection, webConnection;
  
  try {
    // Connexion à la base du bot
    console.log('🔌 Connexion aux bases de données...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF';
    
    // Connexion pour le bot
    botConnection = await mongoose.createConnection(mongoUri + '?authSource=admin');
    console.log('✅ Connecté à la base du bot');
    
    // Connexion pour la web app (même base)
    webConnection = await mongoose.createConnection(mongoUri + '?authSource=admin');
    console.log('✅ Connecté à la base web\n');
    
    // Modèles
    const BotUser = botConnection.model('User', require('./models/User').schema);
    const WebUser = webConnection.model('User', require('./models/User').schema);
    
    // Récupérer tous les utilisateurs
    const botUsers = await BotUser.find().select('telegramId username firstName joinedAt');
    const webUsers = await WebUser.find().select('telegramId username firstName joinedAt');
    
    console.log(`📊 Utilisateurs bot: ${botUsers.length}`);
    console.log(`📊 Utilisateurs web: ${webUsers.length}`);
    
    // Créer des maps pour comparaison rapide
    const botMap = new Map(botUsers.map(u => [u.telegramId, u]));
    const webMap = new Map(webUsers.map(u => [u.telegramId, u]));
    
    // Trouver les utilisateurs manquants dans la web
    const missingInWeb = [];
    for (const [telegramId, user] of botMap) {
      if (!webMap.has(telegramId)) {
        missingInWeb.push(user);
      }
    }
    
    // Trouver les utilisateurs en trop dans la web
    const extraInWeb = [];
    for (const [telegramId, user] of webMap) {
      if (!botMap.has(telegramId)) {
        extraInWeb.push(user);
      }
    }
    
    console.log(`\n📋 Analyse:`);
    console.log(`❌ Manquants dans web: ${missingInWeb.length}`);
    console.log(`➕ En trop dans web: ${extraInWeb.length}`);
    
    if (missingInWeb.length > 0) {
      console.log('\n👥 Utilisateurs manquants dans la web app:');
      missingInWeb.forEach((user, index) => {
        console.log(`${index + 1}. @${user.username || 'Sans username'} (${user.firstName || 'Sans nom'}) - ID: ${user.telegramId}`);
        console.log(`   Inscrit le: ${user.joinedAt ? user.joinedAt.toLocaleDateString() : 'Date inconnue'}`);
      });
    }
    
    if (extraInWeb.length > 0) {
      console.log('\n👥 Utilisateurs en trop dans la web app:');
      extraInWeb.forEach((user, index) => {
        console.log(`${index + 1}. @${user.username || 'Sans username'} (${user.firstName || 'Sans nom'}) - ID: ${user.telegramId}`);
      });
    }
    
    // Si les bases sont identiques
    if (missingInWeb.length === 0 && extraInWeb.length === 0) {
      console.log('\n✅ Les deux bases de données sont parfaitement synchronisées !');
      console.log('   Le problème de comptage pourrait venir d\'un cache ou d\'un délai de propagation.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (botConnection) await botConnection.close();
    if (webConnection) await webConnection.close();
    console.log('\n🔌 Connexions fermées');
  }
}

console.log('🔍 Comparaison des bases de données\n');
compareDatabases();
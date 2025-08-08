require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugs';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';

async function monitorSync() {
  console.log('🔍 Monitoring de la synchronisation Bot <-> Boutique\n');
  console.log('Appuyez sur Ctrl+C pour arrêter\n');
  
  // Connexion à MongoDB
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');
  
  let lastBotCount = 0;
  let lastWebCount = 0;
  
  setInterval(async () => {
    try {
      // Compter les utilisateurs dans le bot
      const botUserCount = await User.countDocuments();
      
      // Compter les utilisateurs dans la boutique
      const response = await axios.get(`${WEB_APP_URL}/api/users/count`);
      const webUserCount = response.data.count;
      
      // Afficher uniquement si changement
      if (botUserCount !== lastBotCount || webUserCount !== lastWebCount) {
        const now = new Date().toLocaleTimeString();
        console.log(`[${now}] Bot: ${botUserCount} | Web: ${webUserCount} | Diff: ${Math.abs(botUserCount - webUserCount)}`);
        
        if (botUserCount !== webUserCount) {
          console.log(`⚠️  Désynchronisation détectée!`);
          
          // Afficher les derniers utilisateurs pour debug
          const lastUser = await User.findOne().sort({ joinedAt: -1 });
          if (lastUser) {
            console.log(`   Dernier utilisateur bot: @${lastUser.username} (${new Date(lastUser.joinedAt).toLocaleString()})`);
          }
        }
        
        lastBotCount = botUserCount;
        lastWebCount = webUserCount;
      }
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }
  }, 2000); // Vérifier toutes les 2 secondes
}

// Gérer la fermeture propre
process.on('SIGINT', async () => {
  console.log('\n\n👋 Arrêt du monitoring...');
  await mongoose.connection.close();
  process.exit(0);
});

monitorSync().catch(console.error);
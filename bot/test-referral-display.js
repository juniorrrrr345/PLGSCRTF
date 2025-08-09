require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('./models/Plug');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugs';

async function testReferralDisplay() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer un plug pour test
    const plug = await Plug.findOne();
    
    if (!plug) {
      console.log('❌ Aucun plug trouvé dans la base de données');
      return;
    }
    
    console.log('🔌 Plug trouvé:', plug.name);
    console.log('📍 Localisation:', plug.country || 'Non spécifiée');
    
    // Vérifier les réseaux sociaux
    if (plug.customNetworks && plug.customNetworks.length > 0) {
      console.log('\n📱 Réseaux sociaux (customNetworks):');
      plug.customNetworks.forEach(network => {
        console.log(`   ${network.emoji || '🔗'} ${network.name}: ${network.link}`);
      });
    } else if (plug.socialNetworks) {
      console.log('\n📱 Réseaux sociaux (ancien format):');
      Object.entries(plug.socialNetworks).forEach(([key, value]) => {
        if (value) {
          console.log(`   ${key}: ${value}`);
        }
      });
    }
    
    // Afficher le lien de parrainage
    const referralLink = plug.referralLink || `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=plug_${plug._id}`;
    console.log('\n🔗 Lien de parrainage:');
    console.log(`   ${referralLink}`);
    
    console.log('\n✅ Le lien de parrainage sera maintenant affiché après les réseaux sociaux pour tous les utilisateurs!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

testReferralDisplay();
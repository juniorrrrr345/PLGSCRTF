const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://juniorakz:w7q4GYF4NsXpGqUw@plgscrtf.tp0afas.mongodb.net/?retryWrites=true&w=majority&appName=PLGSCRTF';

// Configuration Cloudinary
const CLOUDINARY_URL = 'cloudinary://851324984197634:bQJrdNdhts56XuPx4uCoWEme80g@dtjab1akq';

async function testConnections() {
  console.log('🧪 Test des connexions...\n');
  
  // Test MongoDB
  console.log('📊 Test de MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connecté avec succès!');
    
    // Tester une requête simple
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Collections trouvées: ${collections.map(c => c.name).join(', ') || 'aucune'}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error.message);
  }
  
  // Test Cloudinary
  console.log('\n☁️  Test de Cloudinary...');
  try {
    const cloudinary = require('cloudinary').v2;
    
    // Parser l'URL Cloudinary
    const matches = CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (matches) {
      cloudinary.config({
        cloud_name: matches[3],
        api_key: matches[1],
        api_secret: matches[2]
      });
      
      // Tester la connexion
      const result = await cloudinary.api.ping();
      console.log('✅ Cloudinary connecté avec succès!');
      console.log(`   Cloud name: ${matches[3]}`);
    }
  } catch (error) {
    console.error('❌ Erreur Cloudinary:', error.message);
  }
  
  console.log('\n✨ Test terminé!');
}

testConnections();
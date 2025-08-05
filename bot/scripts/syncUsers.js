require('dotenv').config();
const mongoose = require('mongoose');
const { syncAllUsers } = require('../utils/userSync');

async function main() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    console.log('\n🔄 Démarrage de la synchronisation des utilisateurs...\n');
    
    const result = await syncAllUsers();
    
    console.log('\n📊 Résultats de la synchronisation:');
    console.log(`   Total d'utilisateurs: ${result.total}`);
    console.log(`   Synchronisés avec succès: ${result.synced}`);
    console.log(`   Échecs: ${result.failed}`);
    
    if (result.error) {
      console.error(`\n❌ Erreur: ${result.error}`);
    } else if (result.failed === 0) {
      console.log('\n✨ Tous les utilisateurs ont été synchronisés avec succès !');
    } else {
      console.log(`\n⚠️ ${result.failed} utilisateur(s) n'ont pas pu être synchronisés.`);
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
}

// Lancer le script
main();
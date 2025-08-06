require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('../models/Plug');
const User = require('../models/User');
const { syncPlugToWebApp } = require('../utils/plugSync');

async function syncAllPlugs() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les plugs actifs
    const plugs = await Plug.find({ isActive: true });
    console.log(`📦 ${plugs.length} plugs trouvés`);

    let synced = 0;
    let failed = 0;
    let noOwner = 0;

    // Pour chaque plug, essayer de trouver son créateur
    for (const plug of plugs) {
      // Si le plug a déjà un createdBy, l'utiliser
      if (plug.createdBy) {
        const result = await syncPlugToWebApp(plug, plug.createdBy);
        if (result) {
          synced++;
        } else {
          failed++;
        }
        continue;
      }

      // Sinon, essayer de trouver le créateur par d'autres moyens
      // Par exemple, si le plug a été créé par un admin, on peut chercher dans les referralStats
      if (plug.referralStats && plug.referralStats.length > 0) {
        // Prendre le premier utilisateur dans les stats (probablement le créateur)
        const creatorId = plug.referralStats[0].userId;
        
        // Mettre à jour le plug avec le createdBy
        plug.createdBy = creatorId;
        await plug.save();
        
        const result = await syncPlugToWebApp(plug, creatorId);
        if (result) {
          synced++;
          console.log(`✅ Plug "${plug.name}" associé à l'utilisateur ${creatorId}`);
        } else {
          failed++;
        }
      } else {
        noOwner++;
        console.log(`⚠️ Plug "${plug.name}" n'a pas de propriétaire identifiable`);
      }
    }

    console.log('\n📊 Résumé de la synchronisation:');
    console.log(`✅ Synchronisés: ${synced}`);
    console.log(`❌ Échecs: ${failed}`);
    console.log(`⚠️ Sans propriétaire: ${noOwner}`);
    console.log(`📦 Total: ${plugs.length}`);

    // Déconnexion
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Lancer la synchronisation
syncAllPlugs();
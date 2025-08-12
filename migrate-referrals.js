require('dotenv').config();
const mongoose = require('mongoose');

// Modèles
const ReferralClick = require('./bot/models/ReferralClick');
const PlugReferral = require('./bot/models/PlugReferral');
const Plug = require('./bot/models/Plug');

async function migrateReferrals() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Récupérer tous les ReferralClick existants
    const referralClicks = await ReferralClick.find({}).populate('referrerId').populate('visitorId');
    console.log(`📊 ${referralClicks.length} ReferralClick trouvés`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const click of referralClicks) {
      try {
        // Vérifier si la migration existe déjà
        const existing = await PlugReferral.findOne({
          plugId: click.plugId,
          referrerId: click.referrerId?.telegramId?.toString() || click.referrerId?._id?.toString(),
          referredUserId: click.visitorId?.telegramId?.toString() || click.visitorId?._id?.toString()
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Créer le nouveau PlugReferral
        await PlugReferral.create({
          plugId: click.plugId,
          referrerId: click.referrerId?.telegramId?.toString() || click.referrerId?._id?.toString(),
          referredUserId: click.visitorId?.telegramId?.toString() || click.visitorId?._id?.toString(),
          referredAt: click.createdAt,
          hasVoted: click.hasVoted
        });
        
        migrated++;
      } catch (error) {
        console.log(`⚠️ Erreur migration pour click ${click._id}:`, error.message);
      }
    }
    
    console.log(`✅ Migration terminée: ${migrated} migrés, ${skipped} ignorés`);
    
    // Mettre à jour les compteurs referralCount des plugs
    console.log('📊 Mise à jour des compteurs de parrainage...');
    
    const plugs = await Plug.find({});
    for (const plug of plugs) {
      const count = await PlugReferral.countDocuments({ plugId: plug._id });
      plug.referralCount = count;
      await plug.save();
      console.log(`✅ ${plug.name}: ${count} parrainages`);
    }
    
    console.log('✅ Tous les compteurs ont été mis à jour');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

// Exécuter la migration
migrateReferrals();
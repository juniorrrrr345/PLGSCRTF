/**
 * Script de migration pour ajouter les préférences de notifications aux utilisateurs existants
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function migrateNotifications() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Compter les utilisateurs
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total utilisateurs : ${totalUsers}`);
    
    // Mettre à jour les utilisateurs sans préférences de notifications
    const result = await User.updateMany(
      { notificationPreferences: { $exists: false } },
      { 
        $set: { 
          notificationPreferences: {
            acceptsNotifications: false, // Par défaut : opt-in requis
            acceptsPromotions: false,
            acceptsUpdates: false,
            lastUpdated: new Date()
          },
          isActive: true,
          isBlocked: false,
          broadcastsReceived: 0
        }
      }
    );
    
    console.log(`✅ ${result.modifiedCount} utilisateurs mis à jour`);
    
    // Vérifier les utilisateurs qui ont déjà des préférences
    const usersWithPrefs = await User.countDocuments({ 
      'notificationPreferences.acceptsNotifications': true 
    });
    console.log(`🔔 ${usersWithPrefs} utilisateurs ont les notifications activées`);
    
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('✅ Migration terminée');
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateNotifications();
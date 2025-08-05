const axios = require('axios');

// URL de la boutique web
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';
const SYNC_SECRET_KEY = process.env.SYNC_SECRET_KEY || 'default-sync-key';

/**
 * Synchronise un utilisateur avec la boutique web
 * @param {Object} user - L'objet utilisateur MongoDB
 * @returns {Promise<boolean>} - True si la synchronisation a réussi
 */
async function syncUserToWebApp(user) {
  try {
    const userData = {
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      referredBy: user.referredBy,
      hasBeenCountedAsReferral: user.hasBeenCountedAsReferral,
      lastLikeAt: user.lastLikeAt,
      likedPlugs: user.likedPlugs,
      joinedAt: user.joinedAt,
      isAdmin: user.isAdmin
    };

    const response = await axios.post(
      `${WEB_APP_URL}/api/users/sync`,
      userData,
      {
        headers: {
          'Authorization': `Bearer ${SYNC_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 secondes de timeout
      }
    );

    if (response.data.success) {
      console.log(`✅ Utilisateur ${user.username || user.telegramId} synchronisé avec la boutique`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erreur sync utilisateur ${user.username || user.telegramId}:`, error.message);
    return false;
  }
}

/**
 * Supprime un utilisateur de la boutique web
 * @param {string} telegramId - L'ID Telegram de l'utilisateur
 * @returns {Promise<boolean>} - True si la suppression a réussi
 */
async function deleteUserFromWebApp(telegramId) {
  try {
    const response = await axios.delete(
      `${WEB_APP_URL}/api/users/sync`,
      {
        data: { telegramId },
        headers: {
          'Authorization': `Bearer ${SYNC_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    if (response.data.success) {
      console.log(`✅ Utilisateur ${telegramId} supprimé de la boutique`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erreur suppression utilisateur ${telegramId}:`, error.message);
    return false;
  }
}

/**
 * Synchronise tous les utilisateurs existants
 * @returns {Promise<Object>} - Statistiques de synchronisation
 */
async function syncAllUsers() {
  const User = require('../models/User');
  
  try {
    const users = await User.find({});
    let synced = 0;
    let failed = 0;

    console.log(`🔄 Début de la synchronisation de ${users.length} utilisateurs...`);

    // Synchroniser par lots pour éviter de surcharger l'API
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const promises = batch.map(user => syncUserToWebApp(user));
      const results = await Promise.all(promises);
      
      synced += results.filter(r => r === true).length;
      failed += results.filter(r => r === false).length;

      // Petite pause entre les lots
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ Synchronisation terminée: ${synced} réussis, ${failed} échoués`);
    
    return { total: users.length, synced, failed };
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation globale:', error);
    return { total: 0, synced: 0, failed: 0, error: error.message };
  }
}

module.exports = {
  syncUserToWebApp,
  deleteUserFromWebApp,
  syncAllUsers
};
const axios = require('axios');

// URL de la boutique web
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app';
const SYNC_SECRET_KEY = process.env.SYNC_SECRET_KEY || 'default-sync-key';

/**
 * Synchronise un plug avec la boutique web
 * @param {Object} plug - L'objet plug MongoDB
 * @param {String} userId - L'ID de l'utilisateur propriétaire
 * @returns {Promise<boolean>} - True si la synchronisation a réussi
 */
async function syncPlugToWebApp(plug, userId) {
  try {
    // Préparer les données du plug pour la boutique web
    const plugData = {
      _id: plug._id.toString(),
      name: plug.name,
      description: plug.description,
      category: plug.category || 'Autre',
      location: `${plug.department || ''} ${plug.postalCode || ''}`.trim() || 'France',
      images: plug.photo ? [plug.photo] : [],
      likes: plug.likes || 0,
      views: plug.referralCount || 0, // Utiliser referralCount comme compteur de vues
      isActive: plug.isActive,
      createdBy: userId,
      createdAt: plug.createdAt,
      methods: plug.methods,
      deliveryDepartments: plug.deliveryDepartments,
      deliveryPostalCodes: plug.deliveryPostalCodes,
      meetupDepartments: plug.meetupDepartments,
      meetupPostalCodes: plug.meetupPostalCodes,
      socialNetworks: plug.socialNetworks,
      customNetworks: plug.customNetworks,
      country: plug.country,
      countryFlag: plug.countryFlag
    };

    const response = await axios.post(
      `${WEB_APP_URL}/api/plugs/sync`,
      plugData,
      {
        headers: {
          'Authorization': `Bearer ${SYNC_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    if (response.data.success) {
      console.log(`✅ Plug "${plug.name}" synchronisé avec la boutique`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erreur sync plug "${plug.name}":`, error.message);
    return false;
  }
}

/**
 * Supprime un plug de la boutique web
 * @param {string} plugId - L'ID du plug
 * @returns {Promise<boolean>} - True si la suppression a réussi
 */
async function deletePlugFromWebApp(plugId) {
  try {
    const response = await axios.delete(
      `${WEB_APP_URL}/api/plugs/sync`,
      {
        data: { plugId },
        headers: {
          'Authorization': `Bearer ${SYNC_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    if (response.data.success) {
      console.log(`✅ Plug ${plugId} supprimé de la boutique`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erreur suppression plug ${plugId}:`, error.message);
    return false;
  }
}

/**
 * Synchronise tous les plugs d'un utilisateur
 * @param {string} userId - L'ID MongoDB de l'utilisateur
 * @returns {Promise<Object>} - Statistiques de synchronisation
 */
async function syncUserPlugs(userId) {
  const Plug = require('../models/Plug');
  
  try {
    const plugs = await Plug.find({ createdBy: userId });
    let synced = 0;
    let failed = 0;

    console.log(`🔄 Synchronisation de ${plugs.length} plugs...`);

    for (const plug of plugs) {
      const result = await syncPlugToWebApp(plug, userId);
      if (result) {
        synced++;
      } else {
        failed++;
      }
    }

    console.log(`✅ Synchronisation terminée: ${synced} réussis, ${failed} échoués`);
    
    return { total: plugs.length, synced, failed };
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des plugs:', error);
    return { total: 0, synced: 0, failed: 0, error: error.message };
  }
}

module.exports = {
  syncPlugToWebApp,
  deletePlugFromWebApp,
  syncUserPlugs
};
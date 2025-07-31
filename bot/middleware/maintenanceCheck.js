const Settings = require('../models/Settings');

async function checkMaintenanceMode(bot, chatId) {
  try {
    const settings = await Settings.findOne();
    
    if (settings?.maintenanceMode) {
      // Envoyer le message de maintenance avec l'image d'accueil
      const maintenanceMessage = `🔧 <b>Maintenance en cours</b>\n\nNous sommes bientôt de retour !\n\nCordialement,\nPLUGS CRTFS`;
      
      if (settings.welcomeImage) {
        try {
          await bot.sendPhoto(chatId, settings.welcomeImage, {
            caption: maintenanceMessage,
            parse_mode: 'HTML'
          });
        } catch (error) {
          // Si l'image échoue, envoyer juste le message
          await bot.sendMessage(chatId, maintenanceMessage, {
            parse_mode: 'HTML'
          });
        }
      } else {
        await bot.sendMessage(chatId, maintenanceMessage, {
          parse_mode: 'HTML'
        });
      }
      
      return true; // En maintenance
    }
    
    return false; // Pas en maintenance
  } catch (error) {
    console.error('Erreur vérification maintenance:', error);
    return false;
  }
}

module.exports = {
  checkMaintenanceMode
};
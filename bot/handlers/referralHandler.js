const Plug = require('../models/Plug');
const User = require('../models/User');
const Settings = require('../models/Settings');
const PlugReferral = require('../models/PlugReferral');
const { checkMaintenanceMode } = require('../middleware/maintenanceCheck');

async function handleReferralMenu(bot, chatId) {
  try {
    // Vérifier d'abord si on est en maintenance
    const inMaintenance = await checkMaintenanceMode(bot, chatId);
    if (inMaintenance) {
      return; // Arrêter ici si en maintenance
    }
    
    // Récupérer les paramètres pour l'image d'accueil
    const settings = await Settings.findOne();
    
    // Récupérer tous les plugs actifs
    const plugs = await Plug.find({ isActive: true });
    
    // Pour chaque plug, compter le nombre total de filleuls
    const plugsWithStats = await Promise.all(plugs.map(async (plug) => {
      // Utiliser le nouveau système PlugReferral pour compter les filleuls
      const referralCount = await PlugReferral.countDocuments({ plugId: plug._id });
      
      return {
        plug,
        referralCount
      };
    }));
    
    // Trier par nombre de filleuls décroissant
    plugsWithStats.sort((a, b) => b.referralCount - a.referralCount);
    
    // Limiter à 20 plugs et filtrer ceux qui ont au moins 1 parrainage
    const sortedPlugs = plugsWithStats
      .filter(item => item.referralCount > 0)
      .slice(0, 20)
      .map(item => ({ plug: item.plug, referralCount: item.referralCount }));
    
    if (sortedPlugs.length === 0) {
      await bot.sendMessage(chatId, '📊 Aucun plug disponible pour le moment.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Retour', callback_data: 'main_menu' }]
          ]
        }
      });
      return;
    }
    
    let message = '🏆 <b>TOP PARRAINS</b>\n';
    message += '━━━━━━━━━━━━━━━━\n\n';
    message += '👇 Cliquez sur un plug pour voir les détails\n\n';
    
    const keyboard = {
      inline_keyboard: []
    };
    
    // Créer les boutons pour chaque plug
    sortedPlugs.forEach((item, index) => {
      const { plug, referralCount } = item;
      let emoji = '';
      
      if (index === 0) emoji = '👑';
      else if (index === 1) emoji = '🥈';
      else if (index === 2) emoji = '🥉';
      else emoji = `${index + 1}.`;
      
      const buttonText = `${emoji} ${plug.name} (${referralCount} filleul${referralCount > 1 ? 's' : ''})`;
      keyboard.inline_keyboard.push([{
        text: buttonText,
        callback_data: `plug_from_referral_${plug._id}`
      }]);
    });
    

    
    keyboard.inline_keyboard.push([{ 
      text: '⬅️ RETOUR AU MENU', 
      callback_data: 'main_menu' 
    }]);
    
    // Envoyer avec l'image d'accueil si elle existe
    if (settings?.welcomeImage) {
      try {
        await bot.sendPhoto(chatId, settings.welcomeImage, {
          caption: message,
          reply_markup: keyboard,
          parse_mode: 'HTML'
        });
      } catch (error) {
        console.error('Erreur envoi image:', error);
        // Si l'image échoue, envoyer juste le message
        await bot.sendMessage(chatId, message, {
          reply_markup: keyboard,
          parse_mode: 'HTML'
        });
      }
    } else {
      await bot.sendMessage(chatId, message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
    }
    
  } catch (error) {
    console.error('Error in handleReferralMenu:', error);
    // Pas de message d'erreur visible pour l'utilisateur
    await showMainMenu(bot, chatId);
  }
}

module.exports = { handleReferralMenu };
const Plug = require('../models/Plug');
const User = require('../models/User');
const Settings = require('../models/Settings');

async function handleReferralMenu(bot, chatId) {
  try {
    // Récupérer les paramètres pour l'image d'accueil
    const settings = await Settings.findOne();
    
    // Récupérer les plugs triés par nombre de parrainages
    const plugs = await Plug.find({ isActive: true })
      .populate('referralStats.userId', 'username')
      .sort({ likes: -1 })
      .limit(20);
    
    if (plugs.length === 0) {
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
    plugs.forEach((plug, index) => {
      let emoji = '';
      
      if (index === 0) emoji = '👑';
      else if (index === 1) emoji = '🥈';
      else if (index === 2) emoji = '🥉';
      else emoji = `${index + 1}.`;
      
      // Calculer le total des clics et votes de parrainage
      let totalClicks = 0;
      let totalVotes = 0;
      if (plug.referralStats && plug.referralStats.length > 0) {
        plug.referralStats.forEach(stat => {
          totalClicks += stat.clicks || 0;
          totalVotes += stat.votes || 0;
        });
      }
      
      const buttonText = `${emoji} ${plug.name} (${plug.likes || 0} ❤️)`;
      keyboard.inline_keyboard.push([{
        text: buttonText,
        callback_data: `plug_from_referral_${plug._id}`
      }]);
    });
    

    
    keyboard.inline_keyboard.push([{ 
      text: '⬅️ Retour au menu', 
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
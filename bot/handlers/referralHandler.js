const Plug = require('../models/Plug');
const User = require('../models/User');
const Settings = require('../models/Settings');

async function handleReferralMenu(bot, chatId) {
  try {
    // Récupérer les paramètres pour l'image d'accueil
    const settings = await Settings.findOne();
    
    // Récupérer les plugs triés par nombre de parrainages
    const plugs = await Plug.find({ isActive: true, referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(20);
    
    if (plugs.length === 0) {
      await bot.sendMessage(chatId, '📊 Aucun parrainage enregistré pour le moment.', {
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
    
    plugs.forEach((plug, index) => {
      let emoji = '';
      let badge = '';
      
      if (index === 0) {
        emoji = '👑';
        badge = ' <b>(Top Parrain)</b>';
      } else if (index === 1) {
        emoji = '🥈';
      } else if (index === 2) {
        emoji = '🥉';
      } else {
        emoji = '🔹';
      }
      
      message += `${emoji} #${index + 1} – <b>${plug.name}</b> 🔌 – ${plug.referralCount} filleuls${badge}\n`;
    });
    
    message += '\n💡 <i>Invitez des amis avec votre lien de parrainage pour grimper dans le classement !</i>';
    
    // Récupérer le lien de parrainage de l'utilisateur
    const user = await User.findOne({ telegramId: chatId });
    
    const keyboard = {
      inline_keyboard: []
    };
    
    if (user) {
      keyboard.inline_keyboard.push([{ 
        text: '🔗 Mon lien de parrainage', 
        callback_data: 'my_referral_link' 
      }]);
    }
    
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
    console.error('Erreur dans handleReferralMenu:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue lors du chargement du classement.');
  }
}

module.exports = { handleReferralMenu };
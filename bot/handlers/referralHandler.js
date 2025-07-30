const User = require('../models/User');
const Settings = require('../models/Settings');

async function handleReferralMenu(bot, chatId) {
  try {
    // Récupérer les utilisateurs triés par nombre de parrainages
    const users = await User.find({ referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(10);
    
    if (users.length === 0) {
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
    
    users.forEach((user, index) => {
      let emoji = '';
      let badge = '';
      
      if (index === 0) {
        emoji = '🥇';
        badge = ' 👑';
      } else if (index === 1) {
        emoji = '🥈';
      } else if (index === 2) {
        emoji = '🥉';
      } else {
        emoji = `${index + 1}.`;
      }
      
      const username = user.username || user.firstName || 'Utilisateur';
      message += `${emoji} @${username} - ${user.referralCount} parrainages${badge}\n`;
    });
    
    message += '\n💡 <i>Partagez votre lien de parrainage pour monter dans le classement !</i>';
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '🔗 Mon lien de parrainage', callback_data: 'my_referral_link' }],
        [{ text: '⬅️ Retour au menu', callback_data: 'main_menu' }]
      ]
    };
    
    await bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
    
  } catch (error) {
    console.error('Erreur dans handleReferralMenu:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue lors du chargement du classement.');
  }
}

module.exports = { handleReferralMenu };
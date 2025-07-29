const Plug = require('../models/Plug');

async function handleReferralRanking(bot, chatId) {
  try {
    // Récupérer les plugs triés par nombre de parrainages
    const plugs = await Plug.find({ isActive: true, referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(20);
    
    if (plugs.length === 0) {
      await bot.sendMessage(chatId, '📊 Aucun parrainage enregistré pour le moment.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Retour', callback_data: 'back_to_menu' }]
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
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '⬅️ Retour au menu', callback_data: 'back_to_menu' }]
      ]
    };
    
    await bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
    
  } catch (error) {
    console.error('Erreur dans handleReferralRanking:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue lors du chargement du classement.');
  }
}

module.exports = { handleReferralRanking };
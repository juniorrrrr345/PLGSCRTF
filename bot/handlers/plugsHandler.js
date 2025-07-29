const Plug = require('../models/Plug');

async function handlePlugsMenu(bot, chatId) {
  try {
    // Récupérer tous les plugs actifs, triés par likes (décroissant)
    const plugs = await Plug.find({ isActive: true })
      .sort({ likes: -1 })
      .limit(50); // Limiter à 50 pour éviter des messages trop longs
    
    if (plugs.length === 0) {
      await bot.sendMessage(chatId, '❌ Aucun plug disponible pour le moment.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Retour', callback_data: 'back_to_menu' }]
          ]
        }
      });
      return;
    }
    
    let message = '🔌 <b>PLUGS CRTFS</b>\n';
    message += '━━━━━━━━━━━━━━━━\n\n';
    
    const keyboard = {
      inline_keyboard: []
    };
    
    // Créer les boutons pour chaque plug
    plugs.forEach((plug, index) => {
      // Ajouter un emoji spécial pour le top 3
      let emoji = '';
      if (index === 0) emoji = '🥇 ';
      else if (index === 1) emoji = '🥈 ';
      else if (index === 2) emoji = '🥉 ';
      
      const buttonText = `${emoji}${plug.name} (❤️ ${plug.likes})`;
      keyboard.inline_keyboard.push([{
        text: buttonText,
        callback_data: `plug_${plug._id}`
      }]);
    });
    
    // Ajouter le bouton retour
    keyboard.inline_keyboard.push([{
      text: '⬅️ Retour au menu',
      callback_data: 'back_to_menu'
    }]);
    
    message += '👆 Cliquez sur un plug pour voir les détails';
    
    await bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
    
  } catch (error) {
    console.error('Erreur dans handlePlugsMenu:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue lors du chargement des plugs.');
  }
}

module.exports = { handlePlugsMenu };
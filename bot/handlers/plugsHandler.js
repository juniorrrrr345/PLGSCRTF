const Plug = require('../models/Plug');
const User = require('../models/User');
const Settings = require('../models/Settings');

async function handlePlugsMenu(bot, chatId) {
  try {
    // Récupérer les paramètres pour l'image d'accueil
    const settings = await Settings.findOne();
    
    // Récupérer tous les plugs actifs, triés par likes (décroissant)
    const plugs = await Plug.find({ isActive: true })
      .sort({ likes: -1 })
      .limit(50); // Limiter à 50 pour éviter des messages trop longs
    
    if (plugs.length === 0) {
      await bot.sendMessage(chatId, '❌ Aucun plug disponible pour le moment.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Retour', callback_data: 'main_menu' }]
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
      callback_data: 'main_menu'
    }]);
    
    message += '👆 Cliquez sur un plug pour voir les détails';
    
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
    console.error('Erreur dans handlePlugsMenu:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue lors du chargement des plugs.');
  }
}

async function handlePlugDetails(bot, chatId, plugId) {
  try {
    const plug = await Plug.findById(plugId);
    
    if (!plug) {
      await bot.sendMessage(chatId, '❌ Plug introuvable.');
      return;
    }
    
    let message = `🔌 <b>${plug.name}</b>\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    
    // Localisation
    if (plug.country || plug.department || plug.postalCode) {
      message += `📍 <b>Localisation:</b>\n`;
      if (plug.countryFlag && plug.country) {
        message += `${plug.countryFlag} ${plug.country}`;
      }
      if (plug.department) {
        message += ` - ${plug.department}`;
      }
      message += '\n';
      if (plug.postalCode) {
        message += `📮 <b>Code postal:</b> ${plug.postalCode}\n`;
      }
      message += '\n';
    }
    
    // Méthodes
    message += `📦 <b>Méthodes disponibles:</b>\n`;
    if (plug.methods.delivery) {
      message += '• 🚚 Livraison';
      if (plug.deliveryDepartments && plug.deliveryDepartments.length > 0) {
        message += ` (${plug.deliveryDepartments.join(', ')})`;
      }
      message += '\n';
    }
    if (plug.methods.shipping) {
      message += '• 📮 Envoi';
      if (plug.deliveryDepartments && plug.deliveryDepartments.length > 0) {
        message += ` (${plug.deliveryDepartments.join(', ')})`;
      }
      message += '\n';
    }
    if (plug.methods.meetup) {
      message += '• 🤝 Meetup';
      if (plug.meetupDepartments && plug.meetupDepartments.length > 0) {
        message += ` (${plug.meetupDepartments.join(', ')})`;
      }
      message += '\n';
    }
    message += '\n';
    
    // Réseaux sociaux
    const networks = [];
    if (plug.socialNetworks) {
      if (plug.socialNetworks.snap) networks.push('👻 Snapchat');
      if (plug.socialNetworks.instagram) networks.push('📸 Instagram');
      if (plug.socialNetworks.whatsapp) networks.push('💬 WhatsApp');
      if (plug.socialNetworks.signal) networks.push('🔐 Signal');
      if (plug.socialNetworks.threema) networks.push('🔒 Threema');
      if (plug.socialNetworks.potato) networks.push('🥔 Potato');
      if (plug.socialNetworks.telegram) networks.push('✈️ Telegram');
      if (plug.socialNetworks.other) networks.push(`📱 ${plug.socialNetworks.other}`);
    }
    
    // Ajouter les réseaux personnalisés
    if (plug.customNetworks && plug.customNetworks.length > 0) {
      plug.customNetworks.forEach(network => {
        networks.push(`${network.emoji || '🔗'} ${network.name}`);
      });
    }
    
    if (networks.length > 0) {
      message += `📱 <b>Réseaux sociaux:</b>\n`;
      networks.forEach(network => {
        message += `• ${network}\n`;
      });
      message += '\n';
    }
    
    // Description
    if (plug.description) {
      message += `📝 <b>Description:</b>\n${plug.description}\n\n`;
    }
    
    // Stats
    message += `❤️ <b>Likes:</b> ${plug.likes || 0}\n`;
    message += `🔗 <b>Parrainages:</b> ${plug.referralCount || 0}\n`;
    
    // Photo
    const keyboard = {
      inline_keyboard: [
        [
          { text: `❤️ Like (${plug.likes || 0})`, callback_data: `like_${plug._id}` },
          { text: '🔗 Partager', url: plug.referralLink || `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=plug_${plug._id}` }
        ],
        [
          { text: '⬅️ Retour aux plugs', callback_data: 'plugs' },
          { text: '🏠 Menu principal', callback_data: 'main_menu' }
        ]
      ]
    };
    
    if (plug.photo) {
      await bot.sendPhoto(chatId, plug.photo, {
        caption: message,
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
    } else {
      await bot.sendMessage(chatId, message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
    }
    
  } catch (error) {
    console.error('Erreur dans handlePlugDetails:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue lors du chargement des détails.');
  }
}

async function handleLike(bot, callbackQuery, plugId) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  
  try {
    // Vérifier l'utilisateur
    let user = await User.findOne({ telegramId: userId });
    if (!user) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Veuillez d\'abord démarrer le bot avec /start',
        show_alert: true
      });
      return;
    }
    
    // Vérifier le cooldown
    const lastLike = user.lastLikeTime || new Date(0);
    const cooldownMinutes = 30;
    const timeSinceLastLike = (new Date() - lastLike) / 1000 / 60;
    
    if (timeSinceLastLike < cooldownMinutes) {
      const remainingTime = Math.ceil(cooldownMinutes - timeSinceLastLike);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: `⏱ Vous devez attendre ${remainingTime} minutes avant de liker à nouveau`,
        show_alert: true
      });
      return;
    }
    
    // Mettre à jour le plug
    const plug = await Plug.findByIdAndUpdate(
      plugId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!plug) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Plug introuvable',
        show_alert: true
      });
      return;
    }
    
    // Mettre à jour l'utilisateur
    user.lastLikeTime = new Date();
    if (!user.likedPlugs) user.likedPlugs = [];
    if (!user.likedPlugs.includes(plugId)) {
      user.likedPlugs.push(plugId);
    }
    await user.save();
    
    // Répondre avec succès SANS supprimer le message
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: `❤️ Vous avez liké ${plug.name} ! Total: ${plug.likes} likes`,
      show_alert: false
    });
    
          // Mettre à jour le bouton like dans le message existant
      try {
        const keyboard = callbackQuery.message.reply_markup;
        if (keyboard && keyboard.inline_keyboard) {
          // Mettre à jour le texte du bouton like
          keyboard.inline_keyboard[0][0].text = `❤️ Like (${plug.likes})`;
          
          // Éditer le message pour mettre à jour le nombre de likes
          if (callbackQuery.message.photo) {
            // Si c'est une photo, mettre à jour la caption
            let newCaption = callbackQuery.message.caption;
            newCaption = newCaption.replace(/❤️ <b>Likes:<\/b> \d+/, `❤️ <b>Likes:</b> ${plug.likes}`);
            
            await bot.editMessageCaption(newCaption, {
              chat_id: chatId,
              message_id: callbackQuery.message.message_id,
              reply_markup: keyboard,
              parse_mode: 'HTML'
            });
          } else {
            // Si c'est un message texte
            let newText = callbackQuery.message.text;
            newText = newText.replace(/❤️ <b>Likes:<\/b> \d+/, `❤️ <b>Likes:</b> ${plug.likes}`);
            
            await bot.editMessageText(newText, {
              chat_id: chatId,
              message_id: callbackQuery.message.message_id,
              reply_markup: keyboard,
              parse_mode: 'HTML'
            });
          }
        }
      } catch (editError) {
        console.error('Erreur lors de la mise à jour du message:', editError);
      }
    
  } catch (error) {
    console.error('Erreur dans handleLike:', error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ Une erreur est survenue',
      show_alert: true
    });
  }
}

module.exports = { handlePlugsMenu, handlePlugDetails, handleLike };
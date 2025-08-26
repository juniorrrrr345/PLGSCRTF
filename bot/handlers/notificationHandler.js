const User = require('../models/User');

/**
 * Gère les préférences de notifications des utilisateurs
 */
async function handleNotificationPreferences(bot, chatId, userId) {
  try {
    const user = await User.findOne({ telegramId: userId });
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Utilisateur non trouvé. Veuillez utiliser /start d\'abord.');
      return;
    }
    
    const prefs = user.notificationPreferences || {};
    const currentStatus = prefs.acceptsNotifications ? '✅ Activées' : '❌ Désactivées';
    
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: prefs.acceptsNotifications ? '🔕 Désactiver toutes les notifications' : '🔔 Activer les notifications',
            callback_data: `notif_toggle_all`
          }
        ],
        [
          {
            text: prefs.acceptsPromotions ? '❌ Désactiver promotions' : '✅ Activer promotions',
            callback_data: 'notif_toggle_promo'
          }
        ],
        [
          {
            text: prefs.acceptsUpdates ? '❌ Désactiver mises à jour' : '✅ Activer mises à jour',
            callback_data: 'notif_toggle_updates'
          }
        ],
        [
          { text: '◀️ Retour au menu', callback_data: 'back_to_menu' }
        ]
      ]
    };
    
    const message = `🔔 <b>Préférences de notifications</b>\n\n` +
      `État actuel : ${currentStatus}\n\n` +
      `📢 Promotions : ${prefs.acceptsPromotions ? '✅' : '❌'}\n` +
      `📰 Mises à jour : ${prefs.acceptsUpdates ? '✅' : '❌'}\n\n` +
      `<i>Note : Vous ne recevrez des messages que si vous avez activé les notifications.</i>\n` +
      `<i>Vous pouvez vous désinscrire à tout moment.</i>`;
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
    
  } catch (error) {
    console.error('Erreur gestion préférences notifications:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue. Veuillez réessayer.');
  }
}

/**
 * Traite les callbacks de notifications
 */
async function handleNotificationCallbacks(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  
  try {
    const user = await User.findOne({ telegramId: userId });
    
    if (!user) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Utilisateur non trouvé',
        show_alert: true
      });
      return false;
    }
    
    // Initialiser les préférences si elles n'existent pas
    if (!user.notificationPreferences) {
      user.notificationPreferences = {
        acceptsNotifications: false,
        acceptsPromotions: false,
        acceptsUpdates: false,
        lastUpdated: new Date()
      };
    }
    
    let message = '';
    
    switch (data) {
      case 'notif_toggle_all':
        user.notificationPreferences.acceptsNotifications = !user.notificationPreferences.acceptsNotifications;
        
        // Si on désactive tout, désactiver aussi les sous-catégories
        if (!user.notificationPreferences.acceptsNotifications) {
          user.notificationPreferences.acceptsPromotions = false;
          user.notificationPreferences.acceptsUpdates = false;
        }
        
        message = user.notificationPreferences.acceptsNotifications 
          ? '✅ Notifications activées !' 
          : '🔕 Notifications désactivées';
        break;
        
      case 'notif_toggle_promo':
        user.notificationPreferences.acceptsPromotions = !user.notificationPreferences.acceptsPromotions;
        
        // Activer les notifications globales si on active une sous-catégorie
        if (user.notificationPreferences.acceptsPromotions) {
          user.notificationPreferences.acceptsNotifications = true;
        }
        
        message = user.notificationPreferences.acceptsPromotions 
          ? '✅ Promotions activées' 
          : '❌ Promotions désactivées';
        break;
        
      case 'notif_toggle_updates':
        user.notificationPreferences.acceptsUpdates = !user.notificationPreferences.acceptsUpdates;
        
        // Activer les notifications globales si on active une sous-catégorie
        if (user.notificationPreferences.acceptsUpdates) {
          user.notificationPreferences.acceptsNotifications = true;
        }
        
        message = user.notificationPreferences.acceptsUpdates 
          ? '✅ Mises à jour activées' 
          : '❌ Mises à jour désactivées';
        break;
        
      default:
        return false;
    }
    
    user.notificationPreferences.lastUpdated = new Date();
    await user.save();
    
    // Répondre au callback
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: message,
      show_alert: false
    });
    
    // Mettre à jour le message
    try {
      await bot.deleteMessage(chatId, callbackQuery.message.message_id);
    } catch (error) {
      // Ignorer l'erreur si le message n'existe plus
      console.log('Info: Message de notification déjà supprimé');
    }
    await handleNotificationPreferences(bot, chatId, userId);
    
    return true;
    
  } catch (error) {
    console.error('Erreur callback notifications:', error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ Erreur lors de la mise à jour',
      show_alert: true
    });
    return false;
  }
}

/**
 * Commande /notifications pour gérer les préférences
 */
async function handleNotificationsCommand(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  await handleNotificationPreferences(bot, chatId, userId);
}

/**
 * Obtenir les utilisateurs qui acceptent un type de notification
 */
async function getUsersForNotification(type = 'all') {
  try {
    let query = {
      isActive: true,
      isBlocked: { $ne: true },
      'notificationPreferences.acceptsNotifications': true
    };
    
    switch (type) {
      case 'promotion':
        query['notificationPreferences.acceptsPromotions'] = true;
        break;
      case 'update':
        query['notificationPreferences.acceptsUpdates'] = true;
        break;
      case 'all':
        // Déjà filtré par acceptsNotifications
        break;
      default:
        // Type spécifique
        query[`notificationPreferences.${type}`] = true;
    }
    
    const users = await User.find(query).select('telegramId username firstName');
    return users;
    
  } catch (error) {
    console.error('Erreur récupération utilisateurs pour notification:', error);
    return [];
  }
}

module.exports = {
  handleNotificationPreferences,
  handleNotificationCallbacks,
  handleNotificationsCommand,
  getUsersForNotification
};
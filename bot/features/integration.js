// Fichier d'intégration pour ajouter les nouvelles fonctionnalités au bot existant
// Ce fichier doit être importé dans index.js après les imports existants

const features = require('./index');
const moment = require('moment');
moment.locale('fr');

// Fonction pour intégrer les nouvelles fonctionnalités au bot
function integrateFeatures(bot) {
  console.log('🔧 Intégration des nouvelles fonctionnalités...');
  
  // Initialiser les fonctionnalités
  features.initializeFeatures(bot);
  
  // Intercepter les callbacks existants pour ajouter les nouvelles fonctionnalités
  const originalCallbackHandler = bot._events.callback_query;
  
  bot.on('callback_query', async (query) => {
    const data = query.data;
    
    // Vérifier si c'est un callback des nouvelles fonctionnalités
    const featureCallbacks = [
      'my_badges',
      'rankings_menu',
      'rankings_daily',
      'rankings_weekly',
      'rankings_trending',
      'rankings_global',
      'battles_menu',
      'battles_active',
      'battles_history',
      'battles_mystats',
      'notification_settings'
    ];
    
    // Vérifier aussi les patterns
    const featurePatterns = [
      /^battle_vote_/,
      /^battle_view_/,
      /^battle_details_/,
      /^pref_toggle_/,
      /^pref_/,
      /^favorite_plug_/
    ];
    
    const isFeatureCallback = featureCallbacks.includes(data) || 
                             featurePatterns.some(pattern => pattern.test(data));
    
    if (isFeatureCallback) {
      // Traiter avec le gestionnaire des nouvelles fonctionnalités
      await features.handleFeatureCallbacks(bot, query);
    } else if (data === 'back_to_main') {
      // Retour au menu principal amélioré
      const { showMainMenu } = require('../handlers/startHandler');
      await showMainMenu(bot, query.message.chat.id, query.message.message_id);
    } else {
      // Passer au gestionnaire original si ce n'est pas une nouvelle fonctionnalité
      if (originalCallbackHandler && typeof originalCallbackHandler === 'function') {
        originalCallbackHandler.call(bot, query);
      }
    }
  });
  
  console.log('✅ Nouvelles fonctionnalités intégrées avec succès');
}

// Fonction pour améliorer le handler de vote existant
function enhanceVoteHandler(originalHandler) {
  return async function(bot, chatId, userId, plugId, messageId) {
    // Appeler le handler original
    const result = await originalHandler(bot, chatId, userId, plugId, messageId);
    
    // Ajouter les fonctionnalités supplémentaires
    if (result && result.success) {
      const User = require('../models/User');
      const user = await User.findOne({ telegramId: userId });
      
      if (user) {
        // Traiter les nouvelles fonctionnalités
        const enhancedResult = await features.handleEnhancedVote(bot, user._id, plugId);
        
        // Si des badges ont été débloqués, les afficher
        if (enhancedResult && enhancedResult.unlockedBadges.length > 0) {
          for (const unlock of enhancedResult.unlockedBadges) {
            const badgeHandler = require('./handlers/badgeHandler');
            const message = badgeHandler.formatBadgeNotification(unlock.badge, unlock.reward);
            
            setTimeout(() => {
              bot.sendMessage(chatId, message, { 
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '🏅 Voir tous mes badges', callback_data: 'my_badges' }]
                  ]
                }
              });
            }, 1000);
          }
        }
      }
    }
    
    return result;
  };
}

// Fonction pour améliorer le menu principal
function enhanceMainMenuHandler(originalHandler) {
  return async function(bot, chatId, messageId) {
    // Obtenir le menu original
    const result = await originalHandler(bot, chatId, messageId);
    
    // Si le menu a été envoyé avec succès, le modifier
    if (result && result.reply_markup) {
      result.reply_markup = features.enhanceMainMenu(result.reply_markup);
    }
    
    return result;
  };
}

// Fonction pour ajouter une commande /badges
function addBadgesCommand(bot) {
  bot.onText(/\/badges/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const User = require('../models/User');
    const user = await User.findOne({ telegramId: userId });
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Tu dois d\'abord utiliser /start');
      return;
    }
    
    const badgeHandler = require('./handlers/badgeHandler');
    const { badges, stats } = await badgeHandler.getUserBadges(user._id);
    const message = badgeHandler.formatBadgeDisplay(badges, stats);
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Menu principal', callback_data: 'back_to_main' }]
        ]
      }
    });
  });
}

// Fonction pour ajouter une commande /rankings
function addRankingsCommand(bot) {
  bot.onText(/\/rankings/, async (msg) => {
    const chatId = msg.chat.id;
    const rankingHandler = require('./handlers/rankingHandler');
    const keyboard = rankingHandler.createRankingsMenu();
    
    await bot.sendMessage(chatId, '📊 <b>CLASSEMENTS</b>\n\nChoisis le classement à consulter:', {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  });
}

// Fonction pour ajouter une commande /battles
function addBattlesCommand(bot) {
  bot.onText(/\/battles/, async (msg) => {
    const chatId = msg.chat.id;
    const battleHandler = require('./handlers/battleHandler');
    const keyboard = battleHandler.createBattlesMenu();
    
    await bot.sendMessage(chatId, '⚔️ <b>BATTLES</b>\n\nChoisis une option:', {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  });
}

// Fonction pour ajouter toutes les nouvelles commandes
function addNewCommands(bot) {
  addBadgesCommand(bot);
  addRankingsCommand(bot);
  addBattlesCommand(bot);
  
  // Commande pour les préférences de notification
  bot.onText(/\/notifications/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const User = require('../models/User');
    const user = await User.findOne({ telegramId: userId });
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Tu dois d\'abord utiliser /start');
      return;
    }
    
    const UserPreferences = require('./models/UserPreferences');
    let userPrefs = await UserPreferences.findOne({ userId: user._id });
    
    if (!userPrefs) {
      userPrefs = await UserPreferences.create({ userId: user._id });
    }
    
    const notificationHandler = require('./handlers/notificationHandler');
    const message = notificationHandler.formatPreferencesMenu(userPrefs);
    const keyboard = notificationHandler.createPreferencesKeyboard(userPrefs);
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  });
  
  console.log('✅ Nouvelles commandes ajoutées: /badges, /rankings, /battles, /notifications');
}

// Export de la fonction principale d'intégration
module.exports = {
  integrateFeatures,
  enhanceVoteHandler,
  enhanceMainMenuHandler,
  addNewCommands
};
// Point d'entrée principal pour toutes les nouvelles fonctionnalités
const badgeHandler = require('./handlers/badgeHandler');
const rankingHandler = require('./handlers/rankingHandler');
const battleHandler = require('./handlers/battleHandler');
const notificationHandler = require('./handlers/notificationHandler');
const UserPreferences = require('./models/UserPreferences');
const moment = require('moment');
moment.locale('fr');

// Import des modèles nécessaires
const User = require('../models/User');
const Plug = require('../models/Plug');

// Vérifier si node-cron est disponible
let cron;
try {
  cron = require('node-cron');
} catch (error) {
  console.log('⚠️ node-cron non disponible, les tâches automatiques seront désactivées');
}

// Initialisation des fonctionnalités
async function initializeFeatures(bot) {
  try {
    console.log('🚀 Initialisation des nouvelles fonctionnalités...');
    
    // Initialiser les badges par défaut
    await badgeHandler.initializeBadges();
    
    // Programmer les tâches automatiques si cron est disponible
    if (cron) {
      scheduleTasks(bot);
    }
    
    console.log('✅ Nouvelles fonctionnalités initialisées');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des fonctionnalités:', error);
  }
}

// Programmer les tâches récurrentes
function scheduleTasks(bot) {
  if (!cron) {
    console.log('⚠️ Tâches automatiques désactivées (node-cron non disponible)');
    return;
  }
  
  // Nettoyer les anciens classements tous les lundis à 3h
  cron.schedule('0 3 * * 1', async () => {
    console.log('🧹 Nettoyage des anciens classements...');
    await rankingHandler.cleanOldRankings(30);
  });
  
  // Envoyer le top du jour tous les jours à 20h
  cron.schedule('0 20 * * *', async () => {
    console.log('📊 Envoi du top du jour...');
    await notificationHandler.notifyDailyTop(bot);
  });
  
  // Créer la battle du week-end tous les vendredis à 17h
  cron.schedule('0 17 * * 5', async () => {
    console.log('⚔️ Création de la battle du week-end...');
    const battle = await battleHandler.scheduleWeekendBattle();
    if (battle) {
      setTimeout(() => {
        notificationHandler.notifyBattleStart(bot, battle._id);
      }, 60000); // Notifier après 1 minute
    }
  });
  
  // Vérifier les battles actives toutes les heures
  cron.schedule('0 * * * *', async () => {
    const battles = await battleHandler.getActiveBattles();
    for (const battle of battles) {
      const hoursLeft = Math.ceil((battle.endDate - new Date()) / (1000 * 60 * 60));
      
      // Rappel à mi-parcours
      if (hoursLeft === 24 && !battle.notifications.reminderSent) {
        await notificationHandler.notifyBattleReminder(bot, battle._id);
      }
      
      // Notification de fin imminente
      if (hoursLeft <= 2 && !battle.notifications.endingSoonSent) {
        await notificationHandler.notifyBattleEndingSoon(bot, battle._id);
      }
    }
  });
  
  // Terminer les battles expirées toutes les 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    const Battle = require('./models/Battle');
    const expiredBattles = await Battle.find({
      status: 'active',
      endDate: { $lt: new Date() }
    });
    
    for (const battle of expiredBattles) {
      const finished = await battleHandler.finishBattle(battle._id);
      if (finished) {
        await notificationHandler.notifyBattleResults(bot, battle._id);
      }
    }
  });
}

// Gestionnaire amélioré pour les votes (à intégrer dans handleLike existant)
async function handleEnhancedVote(bot, userId, plugId) {
  try {
    // Mettre à jour les stats de vote
    const stats = await badgeHandler.updateVoteStats(userId);
    
    // Mettre à jour le classement quotidien
    await rankingHandler.updateDailyRanking(plugId, userId);
    
    // Vérifier les nouveaux badges
    const Plug = require('../models/Plug');
    const plug = await Plug.findById(plugId);
    const position = await getPlugPosition(plugId);
    
    const unlockedBadges = await badgeHandler.checkUserBadges(userId, {
      plugPosition: position,
      votedPlugId: plugId
    });
    
    // Envoyer les notifications de badges
    for (const unlock of unlockedBadges) {
      const message = badgeHandler.formatBadgeNotification(unlock.badge, unlock.reward);
      await bot.sendMessage(userId, message, { parse_mode: 'HTML' });
    }
    
    // Vérifier les paliers du plug
    await checkPlugMilestones(bot, plug);
    
    return { stats, unlockedBadges };
  } catch (error) {
    console.error('Erreur dans handleEnhancedVote:', error);
    return null;
  }
}

// Vérifier les paliers d'un plug
async function checkPlugMilestones(bot, plug) {
  const milestones = [
    { votes: 100, type: '100votes' },
    { votes: 500, type: '500votes' },
    { votes: 1000, type: '1000votes' }
  ];
  
  for (const milestone of milestones) {
    if (plug.likes === milestone.votes) {
      await notificationHandler.notifyMilestone(bot, plug._id, milestone.type);
    }
  }
  
  // Vérifier la position
  const position = await getPlugPosition(plug._id);
  if (position === 1 && plug.likes > 50) {
    await notificationHandler.notifyMilestone(bot, plug._id, 'top1');
  } else if (position <= 3 && plug.likes > 30) {
    await notificationHandler.notifyMilestone(bot, plug._id, 'top3');
  } else if (position <= 10 && plug.likes > 20) {
    await notificationHandler.notifyMilestone(bot, plug._id, 'top10');
  }
}

// Obtenir la position d'un plug
async function getPlugPosition(plugId) {
  const Plug = require('../models/Plug');
  const plugs = await Plug.find({ isActive: true }).sort({ likes: -1 });
  const position = plugs.findIndex(p => p._id.toString() === plugId.toString()) + 1;
  return position;
}

// Gestionnaires de callbacks pour les nouvelles fonctionnalités
async function handleFeatureCallbacks(bot, query) {
  try {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    
    console.log(`📱 Feature callback: ${data} from user ${userId}`);
    
    // Gestion des badges
    if (data === 'my_badges') {
      try {
        const user = await User.findOne({ telegramId: userId });
        if (!user) {
          await bot.answerCallbackQuery(query.id, {
            text: '❌ Utilisateur non trouvé. Utilise /start d\'abord.',
            show_alert: true
          });
          return;
        }
        
        const { badges, stats } = await badgeHandler.getUserBadges(user._id);
        const message = badgeHandler.formatBadgeDisplay(badges, stats);
        
        const keyboard = {
          inline_keyboard: [
            [{ text: '🔙 Menu principal', callback_data: 'back_to_main' }]
          ]
        };
        
        await bot.editMessageText(message, {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
        
        await bot.answerCallbackQuery(query.id);
      } catch (error) {
        console.error('Erreur badges:', error);
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Erreur lors du chargement des badges',
          show_alert: true
        });
      }
    }
    
    // Gestion des classements
    else if (data === 'rankings_menu') {
      try {
        const keyboard = rankingHandler.createRankingsMenu();
        const message = '📊 <b>CLASSEMENTS</b>\n\nChoisis le classement à consulter:';
        
        await bot.editMessageText(message, {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
        
        await bot.answerCallbackQuery(query.id);
      } catch (error) {
        console.error('Erreur menu rankings:', error);
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Erreur lors du chargement du menu',
          show_alert: true
        });
      }
    }
    
    else if (data === 'rankings_daily') {
      try {
        const rankings = await rankingHandler.getDailyTop();
        const message = rankingHandler.formatDailyTop(rankings);
        const keyboard = rankingHandler.createRankingsMenu();
        
        await bot.editMessageText(message, {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
        
        await bot.answerCallbackQuery(query.id);
      } catch (error) {
        console.error('Erreur rankings daily:', error);
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Erreur lors du chargement du classement',
          show_alert: true
        });
      }
    }
  
  else if (data === 'rankings_weekly') {
    try {
      const rankings = await rankingHandler.getWeeklyTop();
      const message = rankingHandler.formatWeeklyTop(rankings);
      const keyboard = rankingHandler.createRankingsMenu();
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Erreur rankings weekly:', error);
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Erreur lors du chargement du classement',
        show_alert: true
      });
    }
  }
  
  else if (data === 'rankings_trending') {
    try {
      const trending = await rankingHandler.getTrendingPlugs();
      const message = rankingHandler.formatTrendingPlugs(trending);
      const keyboard = rankingHandler.createRankingsMenu();
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Erreur rankings trending:', error);
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Erreur lors du chargement des tendances',
        show_alert: true
      });
    }
  }
  
  // Gestion des battles
  else if (data === 'battles_menu') {
    try {
      const keyboard = battleHandler.createBattlesMenu();
      const message = '⚔️ <b>BATTLES</b>\n\nChoisis une option:';
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Erreur battles menu:', error);
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Erreur lors du chargement du menu battles',
        show_alert: true
      });
    }
  }
  
  else if (data === 'battles_active') {
    try {
      const battles = await battleHandler.getActiveBattles();
      
      if (battles.length === 0) {
        await bot.editMessageText('❌ Aucune battle en cours pour le moment.', {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: battleHandler.createBattlesMenu()
        });
        await bot.answerCallbackQuery(query.id);
        return;
      }
      
      const battle = battles[0]; // Afficher la première battle active
      const message = battleHandler.formatActiveBattle(battle);
      const keyboard = battleHandler.createBattleKeyboard(battle);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Erreur battles active:', error);
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Erreur lors du chargement des battles',
        show_alert: true
      });
    }
  }
  
  else if (data.startsWith('battle_vote_')) {
    const [, , battleId, plugId] = data.split('_');
    const User = require('../models/User');
    const user = await User.findOne({ telegramId: userId });
    
    if (!user) return;
    
    const result = await battleHandler.voteInBattle(battleId, user._id, plugId);
    
    if (result.success) {
      await bot.answerCallbackQuery(query.id, {
        text: '✅ Vote enregistré !',
        show_alert: false
      });
      
      // Rafraîchir l'affichage
      const message = battleHandler.formatActiveBattle(result.battle);
      const keyboard = battleHandler.createBattleKeyboard(result.battle);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    } else {
      await bot.answerCallbackQuery(query.id, {
        text: `❌ ${result.error}`,
        show_alert: true
      });
    }
  }
  
  else if (data === 'battles_history') {
    const battles = await battleHandler.getBattleHistory(5);
    
    if (battles.length === 0) {
      await bot.editMessageText('❌ Aucune battle terminée pour le moment.', {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: battleHandler.createBattlesMenu()
      });
      return;
    }
    
    let message = '🏆 <b>HISTORIQUE DES BATTLES</b>\n';
    message += '━━━━━━━━━━━━━━━━\n\n';
    
    battles.forEach(battle => {
      const winner = battle.winner ? 
        (battle.participants[0].plugId._id.toString() === battle.winner.plugId.toString() ?
         battle.participants[0].plugId : battle.participants[1].plugId) : null;
      
      message += `📅 ${moment(battle.endDate).format('DD/MM/YYYY')}\n`;
      if (winner) {
        message += `🏆 ${winner.name}\n`;
        message += `📊 ${battle.winner.finalVotes} votes (marge: ${battle.winner.margin})\n`;
      } else {
        message += `⚖️ Match nul\n`;
      }
      message += '\n';
    });
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'HTML',
      reply_markup: battleHandler.createBattlesMenu()
    });
  }
  
  // Gestion des préférences
  else if (data === 'notification_settings') {
    try {
      const user = await User.findOne({ telegramId: userId });
      if (!user) {
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Utilisateur non trouvé',
          show_alert: true
        });
        return;
      }
      
      let userPrefs = await UserPreferences.findOne({ userId: user._id });
      if (!userPrefs) {
        userPrefs = await UserPreferences.create({ userId: user._id });
      }
      
      const message = notificationHandler.formatPreferencesMenu(userPrefs);
      const keyboard = notificationHandler.createPreferencesKeyboard(userPrefs);
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      
      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Erreur notification settings:', error);
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Erreur lors du chargement des préférences',
        show_alert: true
      });
    }
  }
  
  else if (data.startsWith('pref_toggle_')) {
    const User = require('../models/User');
    const user = await User.findOne({ telegramId: userId });
    if (!user) return;
    
    const preference = data.replace('pref_toggle_', '');
    let userPrefs = await UserPreferences.findOne({ userId: user._id });
    
    if (!userPrefs) {
      userPrefs = await UserPreferences.create({ userId: user._id });
    }
    
    // Basculer la préférence
    switch (preference) {
      case 'badges':
        userPrefs.notifications.badges.enabled = !userPrefs.notifications.badges.enabled;
        break;
      case 'rankings':
        userPrefs.notifications.rankings.enabled = !userPrefs.notifications.rankings.enabled;
        break;
      case 'battles':
        userPrefs.notifications.battles.enabled = !userPrefs.notifications.battles.enabled;
        break;
      case 'daily':
        userPrefs.notifications.rankings.dailyTop = !userPrefs.notifications.rankings.dailyTop;
        break;
    }
    
    await userPrefs.save();
    
    const message = notificationHandler.formatPreferencesMenu(userPrefs);
    const keyboard = notificationHandler.createPreferencesKeyboard(userPrefs);
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
    
    await bot.answerCallbackQuery(query.id, {
      text: '✅ Préférences mises à jour',
      show_alert: false
    });
  }
  } catch (error) {
    console.error('❌ Erreur globale dans handleFeatureCallbacks:', error);
    try {
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Une erreur est survenue',
        show_alert: true
      });
    } catch (e) {
      // Ignorer si on ne peut pas répondre au callback
    }
  }
}

// Ajouter les nouveaux boutons au menu principal
function enhanceMainMenu(keyboard) {
  // Ajouter une nouvelle ligne de boutons
  keyboard.inline_keyboard.splice(2, 0, [
    { text: '🏅 Mes Badges', callback_data: 'my_badges' },
    { text: '📊 Classements', callback_data: 'rankings_menu' }
  ]);
  
  keyboard.inline_keyboard.splice(3, 0, [
    { text: '⚔️ Battles', callback_data: 'battles_menu' },
    { text: '🔔 Notifications', callback_data: 'notification_settings' }
  ]);
  
  return keyboard;
}

module.exports = {
  initializeFeatures,
  handleEnhancedVote,
  handleFeatureCallbacks,
  enhanceMainMenu,
  checkPlugMilestones
};
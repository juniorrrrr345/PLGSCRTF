console.log('🚀 Démarrage du bot...');
console.log('📅 Date:', new Date().toISOString());

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

console.log('📦 Modules chargés avec succès');

// Modèles
const User = require('./models/User');
const Plug = require('./models/Plug');
const Settings = require('./models/Settings');
const VendorApplication = require('./models/VendorApplication');

// Handlers
const { handleStart, showMainMenu } = require('./handlers/startHandler');
const { handlePlugsMenu, handlePlugDetails, handleLike } = require('./handlers/plugsHandler');
const { handleReferralMenu } = require('./handlers/referralHandler');
const { handleVendorApplication } = require('./handlers/vendorHandler');
const { handleAdminCommand, handleAdminCallbacks } = require('./handlers/adminHandler');
const { handleNotificationCallbacks, handleNotificationsCommand, getUsersForNotification } = require('./handlers/notificationHandler');

// Import des nouvelles fonctionnalités
const { initializeEnhancedFeatures } = require('./features-hook');

// Utils
const MessageQueue = require('./utils/messageQueue');

// Configuration du bot avec gestion des conflits
let bot;
let pollingError = false;

// Vérifier si on est sur Render (webhook) ou local (polling)
const isRender = process.env.RENDER === 'true' || process.env.RENDER_SERVICE_NAME !== undefined;
const PORT = process.env.PORT || 3000;

console.log('🔍 Environment check:', {
  RENDER: process.env.RENDER,
  RENDER_SERVICE_NAME: process.env.RENDER_SERVICE_NAME,
  isRender: isRender
});

if (isRender) {
  // Mode webhook pour Render
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { webHook: true });
  
  // Configurer le webhook avec le bon URL
  const baseUrl = (process.env.WEBHOOK_URL || 'https://plgscrtf.onrender.com').replace(/\/$/, ''); // Enlever le / final s'il existe
  const webhookPath = `/bot${process.env.TELEGRAM_BOT_TOKEN}`;
  const webhookUrl = `${baseUrl}${webhookPath}`;
  
  // Définir le webhook après un court délai pour s'assurer que le serveur est prêt
  setTimeout(() => {
    bot.setWebHook(webhookUrl).then(() => {
      console.log(`✅ Webhook configuré avec succès`);
      console.log(`📍 URL: ${baseUrl}/bot${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
    }).catch(err => {
      console.error('❌ Erreur configuration webhook:', err);
    });
  }, 2000);
  
  console.log('🌐 Bot configuré en mode webhook pour Render');
} else {
  // Mode polling pour développement local
  try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });
    console.log('🔄 Bot configuré en mode polling pour développement local');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du bot:', error);
    process.exit(1);
  }
}

// Gestion des erreurs de polling
bot.on('polling_error', (error) => {
  if (error.code === 'ETELEGRAM' && error.response && error.response.body && error.response.body.error_code === 409) {
    if (!pollingError) {
      console.log('⚠️ Conflit détecté: Une autre instance du bot est en cours d\'exécution.');
      console.log('⏳ Arrêt du polling pour éviter les conflits...');
      pollingError = true;
      
      // Arrêter le polling
      bot.stopPolling();
      
      // Attendre 30 secondes avant de réessayer
      setTimeout(() => {
        console.log('🔄 Tentative de redémarrage du polling...');
        pollingError = false;
        bot.startPolling();
      }, 30000);
    }
  } else {
    console.error('Polling error:', error.code || error.message);
  }
});

// Nettoyer les webhooks seulement en mode polling
if (!isRender) {
  bot.deleteWebHook().then(() => {
    console.log('✅ Webhook cleared, starting polling...');
  }).catch(err => {
    console.log('⚠️ Error clearing webhook:', err.message);
  });
}

// État des utilisateurs pour les formulaires
const userStates = new Map();

// Initialiser la queue de messages
const messageQueue = new MessageQueue(bot);

// Connexion à MongoDB
console.log('🔄 Tentative de connexion à MongoDB...');
console.log('📍 MongoDB URI exists:', !!process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Timeout après 30 secondes
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Initialiser les nouvelles fonctionnalités après la connexion MongoDB
    try {
      initializeEnhancedFeatures(bot);
      console.log('✅ Enhanced features initialized');
    } catch (error) {
      console.error('⚠️ Error initializing enhanced features:', error.message);
      // Le bot continue même si les nouvelles fonctionnalités échouent
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('💡 Le bot va continuer sans MongoDB si possible');
  });

// Serveur Express avec API
const app = express();
app.use(cors());
app.use(express.json());

// API pour vérifier que le bot fonctionne
app.get('/', (req, res) => {
  res.send('Bot is running! 🤖');
});

// API pour envoyer des messages broadcast (VERSION SÉCURISÉE)
app.post('/api/broadcast', async (req, res) => {
  try {
    const { message, userIds, type = 'all' } = req.body;
    const apiKey = req.headers['x-api-key'];
    
    // Vérifier la clé API
    if (apiKey !== process.env.BOT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    let targetUsers = [];
    
    // Si des userIds spécifiques sont fournis
    if (userIds && Array.isArray(userIds)) {
      // Vérifier que ces utilisateurs ont accepté les notifications
      const users = await User.find({
        telegramId: { $in: userIds },
        'notificationPreferences.acceptsNotifications': true,
        isActive: true,
        isBlocked: { $ne: true }
      });
      targetUsers = users.map(u => u.telegramId);
    } else {
      // Sinon, obtenir tous les utilisateurs qui acceptent ce type de notification
      const users = await getUsersForNotification(type);
      targetUsers = users.map(u => u.telegramId);
    }
    
    if (targetUsers.length === 0) {
      return res.json({ 
        success: true, 
        sent: 0, 
        failed: 0,
        message: 'No users with notification consent found'
      });
    }
    
    // Préparer les messages pour la queue
    const messages = targetUsers.map(telegramId => ({
      chatId: telegramId,
      message: message,
      options: { 
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }
    }));
    
    // Ajouter à la queue
    const queued = await messageQueue.addBatch(messages);
    
    // Mise à jour des stats utilisateurs
    await User.updateMany(
      { telegramId: { $in: targetUsers } },
      { 
        $set: { lastBroadcastReceived: new Date() },
        $inc: { broadcastsReceived: 1 }
      }
    );
    
    res.json({ 
      success: true, 
      queued: queued,
      message: 'Messages added to queue for processing'
    });
    
  } catch (error) {
    console.error('Broadcast API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API webhook pour les notifications de changements (VERSION SÉCURISÉE)
app.post('/api/webhook/update', async (req, res) => {
  try {
    const { type, action, data } = req.body;
    const apiKey = req.headers['x-api-key'];
    
    // Vérifier la clé API
    if (apiKey !== process.env.BOT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    let message = '';
    let notificationType = 'update'; // Type de notification par défaut
    
    switch (type) {
      case 'plug':
        if (action === 'create') {
          message = `🎉 <b>Nouveau PLUG disponible !</b>\n\n` +
                   `🔌 <b>${data.name}</b>\n` +
                   `📍 ${data.countryFlag} ${data.department || 'National'}\n\n` +
                   `Découvrez-le maintenant dans /start → PLUGS DU MOMENT`;
          notificationType = 'promotion';
        } else if (action === 'update') {
          message = `📢 <b>PLUG mis à jour !</b>\n\n` +
                   `🔌 <b>${data.name}</b> a été modifié\n` +
                   `Consultez les nouveautés dans /start → PLUGS DU MOMENT`;
          notificationType = 'update';
        } else if (action === 'delete') {
          message = `⚠️ <b>PLUG retiré</b>\n\n` +
                   `Le PLUG "${data.name}" n'est plus disponible.`;
          notificationType = 'update';
        }
        break;
        
      case 'settings':
        // Ne pas notifier pour les changements de paramètres
        return res.json({ success: true, notified: false });
        
      default:
        return res.status(400).json({ error: 'Unknown notification type' });
    }
    
    if (message) {
      // Récupérer SEULEMENT les utilisateurs qui acceptent ce type de notification
      const users = await getUsersForNotification(notificationType);
      
      if (users.length === 0) {
        return res.json({ 
          success: true, 
          notified: false,
          message: 'No users with notification consent for this type'
        });
      }
      
      // Préparer les messages pour la queue
      const messages = users.map(user => ({
        chatId: user.telegramId,
        message: message,
        options: { 
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          priority: 5 // Priorité moyenne pour les notifications automatiques
        }
      }));
      
      // Ajouter à la queue
      const queued = await messageQueue.addBatch(messages);
      
      res.json({ 
        success: true, 
        queued: queued,
        targetUsers: users.length,
        message: 'Notifications added to queue'
      });
    } else {
      res.json({ success: true, notified: false });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route webhook pour Telegram (seulement en mode Render)
if (isRender) {
  app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  console.log(`📨 Webhook route configurée: /bot${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
}

console.log(`🔄 Démarrage du serveur Express sur le port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur Express démarré sur le port ${PORT}`);
  console.log(`🤖 Bot Telegram opérationnel !`);
  console.log(`📡 Mode: ${isRender ? 'WEBHOOK (Render)' : 'POLLING (Local)'}`);
  
  if (isRender) {
    console.log('📌 Webhook URL configuré');
    console.log('✨ Bot prêt à recevoir des messages !');
  }
});

// Fonction de synchronisation périodique
async function periodicSync() {
  try {
    const { syncAllUsers } = require('./utils/userSync');
    console.log('🔄 Synchronisation périodique automatique...');
    
    // Compter avant
    const botCount = await User.countDocuments();
    console.log(`📊 Nombre d'utilisateurs dans le bot: ${botCount}`);
    
    // Synchroniser
    const result = await syncAllUsers();
    
    if (result.failed > 0) {
      console.log(`⚠️ ${result.failed} utilisateurs n'ont pas pu être synchronisés`);
    } else {
      console.log('✅ Synchronisation périodique terminée avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation périodique:', error);
  }
}

// Lancer la synchronisation périodique toutes les 5 minutes
setInterval(periodicSync, 5 * 60 * 1000);

// Synchronisation initiale au démarrage
setTimeout(periodicSync, 10000); // 10 secondes après le démarrage

// Commande /start avec gestion des références
bot.onText(/\/start(.*)/, async (msg, match) => {
  console.log('🚀 Commande /start reçue');
  const chatId = msg.chat.id;
  const param = match[1].trim();
  
  try {
    await handleStart(bot, msg, param);
  } catch (error) {
    console.error('❌ Erreur dans /start:', error);
    // Pas de message d'erreur visible pour l'utilisateur
  }
});

// Commande /notifications pour gérer les préférences (version existante)
bot.onText(/\/notifications/, async (msg) => {
  await handleNotificationsCommand(bot, msg);
});

// Commande /stats pour voir les statistiques de broadcast (admin uniquement)
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Vérifier si admin
    const adminId = process.env.ADMIN_ID ? process.env.ADMIN_ID.trim() : null;
    const settings = await Settings.findOne();
    const settingsAdminIds = settings?.adminChatIds || [];
    const isAdmin = (adminId && chatId.toString() === adminId) || settingsAdminIds.includes(chatId.toString());
    
    if (!isAdmin) {
      return;
    }
    
    const stats = messageQueue.getStats();
    const totalUsers = await User.countDocuments({ isActive: true });
    const optedInUsers = await User.countDocuments({ 
      'notificationPreferences.acceptsNotifications': true,
      isActive: true 
    });
    const optInRate = totalUsers > 0 ? ((optedInUsers / totalUsers) * 100).toFixed(1) : 0;
    
    await bot.sendMessage(chatId,
      `📊 <b>Statistiques du bot</b>\n\n` +
      `<b>Utilisateurs :</b>\n` +
      `• Total actifs : ${totalUsers}\n` +
      `• Notifications activées : ${optedInUsers} (${optInRate}%)\n\n` +
      `<b>Queue de messages :</b>\n` +
      `• En attente : ${stats.queueLength}\n` +
      `• Envoyés : ${stats.totalSent}\n` +
      `• Échecs : ${stats.totalFailed}\n` +
      `• Vitesse : ${stats.messagesPerMinute} msg/min\n` +
      `• Taux de succès : ${stats.successRate}\n` +
      `• Temps d'exécution : ${stats.runtime}s`,
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    console.error('Erreur /stats:', error);
  }
});

// Map pour stocker les derniers messages de boutique par utilisateur
const lastShopMessages = new Map();

// Commande /buy pour acheter un badge par numéro
bot.onText(/\/buy\s*(\d+)?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const badgeNumber = match[1] ? parseInt(match[1]) : null;
  
  try {
    // Supprimer la commande de l'utilisateur
    try {
      await bot.deleteMessage(chatId, msg.message_id);
    } catch (e) {
      // Ignorer si on ne peut pas supprimer
    }
    
    const UserStats = require('./models/UserStats');
    const BadgeConfig = require('./models/BadgeConfig');
    
    // Initialiser les badges
    await BadgeConfig.initializeDefaults();
    
    // Récupérer ou créer les stats de l'utilisateur
    let userStats = await UserStats.findOne({ userId: msg.from.id });
    
    if (!userStats) {
      const User = require('./models/User');
      const user = await User.findOne({ telegramId: msg.from.id });
      
      userStats = new UserStats({
        userId: msg.from.id,
        username: user?.username || msg.from.username || 'Utilisateur'
      });
      await userStats.save();
    }
    
    // Récupérer tous les badges
    const badges = await BadgeConfig.find({ isActive: true }).sort({ cost: 1 });
    
    if (!badgeNumber || badgeNumber < 1 || badgeNumber > badges.length) {
      // Supprimer l'ancien message de boutique s'il existe
      const lastMessageId = lastShopMessages.get(userId);
      if (lastMessageId) {
        try {
          await bot.deleteMessage(chatId, lastMessageId);
        } catch (e) {
          // Ignorer si on ne peut pas supprimer
        }
      }
      
      // Afficher la liste des badges avec leurs numéros
      let message = `🛍️ <b>BOUTIQUE DE BADGES</b>\n`;
      message += `━━━━━━━━━━━━━━━━\n\n`;
      message += `💰 Tes points: ${userStats.points}\n`;
      message += `🎖️ Niveau: ${userStats.level}\n\n`;
      message += `📌 <b>Pour acheter un badge:</b>\n`;
      message += `Utilise /buy [numéro]\n\n`;
      message += `<b>Badges disponibles:</b>\n\n`;
      
      badges.forEach((badge, index) => {
        const owned = userStats.badges && userStats.badges.some(b => b.badgeId === badge.badgeId && !b.used);
        const canAfford = userStats.points >= badge.cost;
        const meetsLevel = userStats.level >= badge.requirements.minLevel;
        
        message += `${index + 1}. ${badge.emoji} <b>${badge.name}</b> - ${badge.cost} pts\n`;
        
        if (!meetsLevel) {
          message += `   ⚠️ Niveau ${badge.requirements.minLevel} requis\n`;
        } else if (owned) {
          message += `   ✅ Déjà acheté\n`;
        } else if (!canAfford) {
          message += `   ❌ ${badge.cost - userStats.points} points manquants\n`;
        } else {
          message += `   ✨ Disponible - /buy ${index + 1}\n`;
        }
        message += '\n';
      });
      
      // Ajouter un bouton de retour au menu
      const keyboard = {
        inline_keyboard: [
          [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
        ]
      };
      
      const sentMessage = await bot.sendMessage(chatId, message, { 
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      
      // Sauvegarder l'ID du message pour pouvoir le supprimer plus tard
      lastShopMessages.set(userId, sentMessage.message_id);
      return;
    }
    
    // Supprimer l'ancien message de boutique s'il existe
    const lastMessageId = lastShopMessages.get(userId);
    if (lastMessageId) {
      try {
        await bot.deleteMessage(chatId, lastMessageId);
        lastShopMessages.delete(userId);
      } catch (e) {
        // Ignorer si on ne peut pas supprimer
      }
    }
    
    // Acheter le badge spécifié
    const badge = badges[badgeNumber - 1];
    const owned = userStats.badges && userStats.badges.some(b => b.badgeId === badge.badgeId && !b.used);
    const canAfford = userStats.points >= badge.cost;
    const meetsLevel = userStats.level >= badge.requirements.minLevel;
    
    // Créer un message temporaire qui sera remplacé
    const tempMessage = await bot.sendMessage(chatId, '⏳ Traitement de l\'achat...', { parse_mode: 'HTML' });
    
    if (!meetsLevel) {
      await bot.editMessageText(
        `❌ Tu dois être niveau ${badge.requirements.minLevel} pour acheter ce badge.\n` +
        `Tu es actuellement niveau ${userStats.level}.`,
        {
          chat_id: chatId,
          message_id: tempMessage.message_id,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛍️ Retour à la boutique', callback_data: 'shop' }],
              [{ text: '🔙 Menu principal', callback_data: 'main_menu' }]
            ]
          }
        }
      );
      return;
    }
    
    if (owned) {
      await bot.editMessageText(
        `❌ Tu possèdes déjà le badge ${badge.emoji} ${badge.name} !`,
        {
          chat_id: chatId,
          message_id: tempMessage.message_id,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛍️ Retour à la boutique', callback_data: 'shop' }],
              [{ text: '🔙 Menu principal', callback_data: 'main_menu' }]
            ]
          }
        }
      );
      return;
    }
    
    if (!canAfford) {
      await bot.editMessageText(
        `❌ Tu n'as pas assez de points !\n\n` +
        `Badge: ${badge.emoji} ${badge.name}\n` +
        `Coût: ${badge.cost} points\n` +
        `Tes points: ${userStats.points}\n` +
        `Il te manque: ${badge.cost - userStats.points} points`,
        {
          chat_id: chatId,
          message_id: tempMessage.message_id,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛍️ Retour à la boutique', callback_data: 'shop' }],
              [{ text: '🔙 Menu principal', callback_data: 'main_menu' }]
            ]
          }
        }
      );
      return;
    }
    
    // Acheter le badge
    try {
      await userStats.purchaseBadge(badge);
      
      let message = `🎉 <b>Badge acheté avec succès !</b>\n\n`;
      message += `${badge.emoji} <b>${badge.name}</b>\n`;
      message += `<i>${badge.description}</i>\n\n`;
      message += `💰 Points restants: ${userStats.points}\n\n`;
      message += `Tu peux maintenant l'offrir à un plug !`;
      
      const keyboard = {
        inline_keyboard: [
          [{ text: '🔌 Voir les plugs', callback_data: 'plugs' }],
          [{ text: '🏅 Mes badges', callback_data: 'my_badges' }],
          [{ text: '🛍️ Retour à la boutique', callback_data: 'shop' }]
        ]
      };
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: tempMessage.message_id,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      
    } catch (error) {
      await bot.editMessageText(
        `❌ ${error.message}`,
        {
          chat_id: chatId,
          message_id: tempMessage.message_id,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛍️ Retour à la boutique', callback_data: 'shop' }],
              [{ text: '🔙 Menu principal', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
  } catch (error) {
    console.error('Erreur /buy:', error);
    await bot.sendMessage(chatId, '❌ Erreur lors de l\'achat du badge.', { parse_mode: 'HTML' });
  }
});

// Commande admin pour gérer les points des utilisateurs
bot.onText(/\/points(?:\s+(\d+)\s+([\+\-]?\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Vérifier si l'utilisateur est admin
  const adminId = process.env.ADMIN_ID ? process.env.ADMIN_ID.trim() : null;
  const Settings = require('./models/Settings');
  const settings = await Settings.findOne();
  const settingsAdminIds = settings?.adminChatIds || [];
  const isAdmin = (adminId && userId.toString() === adminId) || settingsAdminIds.includes(userId.toString());
  
  if (!isAdmin) {
    await bot.sendMessage(chatId, '❌ Cette commande est réservée aux administrateurs.', { parse_mode: 'HTML' });
    return;
  }
  
  const targetUserId = match[1] ? parseInt(match[1]) : null;
  const pointsChange = match[2] ? parseInt(match[2]) : null;
  
  try {
    const UserStats = require('./models/UserStats');
    
    // Si pas de paramètres, afficher l'aide
    if (!targetUserId || pointsChange === null) {
      let message = `⭐ <b>GESTION DES POINTS (ADMIN)</b>\n`;
      message += `━━━━━━━━━━━━━━━━\n\n`;
      message += `<b>Utilisation:</b>\n`;
      message += `/points [ID] [+/-points]\n\n`;
      message += `<b>Exemples:</b>\n`;
      message += `/points 123456789 +50\n`;
      message += `  → Ajoute 50 points\n\n`;
      message += `/points 123456789 -20\n`;
      message += `  → Retire 20 points\n\n`;
      message += `/points 123456789 100\n`;
      message += `  → Définit à 100 points\n\n`;
      message += `💡 <i>L'ID est l'identifiant Telegram de l'utilisateur</i>`;
      
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return;
    }
    
    // Récupérer ou créer les stats de l'utilisateur cible
    let userStats = await UserStats.findOne({ userId: targetUserId });
    
    if (!userStats) {
      const User = require('./models/User');
      const user = await User.findOne({ telegramId: targetUserId });
      
      if (!user) {
        await bot.sendMessage(chatId, 
          `❌ Utilisateur avec l'ID ${targetUserId} non trouvé.\n\n` +
          `L'utilisateur doit d'abord interagir avec le bot.`,
          { parse_mode: 'HTML' }
        );
        return;
      }
      
      userStats = new UserStats({
        userId: targetUserId,
        username: user.username || 'Utilisateur',
        points: 0
      });
      await userStats.save();
    }
    
    const oldPoints = userStats.points;
    let newPoints;
    let action;
    
    // Déterminer l'action selon le format
    if (match[2].startsWith('+')) {
      // Ajouter des points
      newPoints = oldPoints + Math.abs(pointsChange);
      action = 'ajouté';
    } else if (match[2].startsWith('-')) {
      // Retirer des points
      newPoints = Math.max(0, oldPoints - Math.abs(pointsChange));
      action = 'retiré';
    } else {
      // Définir les points
      newPoints = Math.max(0, pointsChange);
      action = 'défini à';
    }
    
    // Mettre à jour les points
    userStats.points = newPoints;
    
    // Recalculer le niveau basé sur les nouveaux points
    const calculateLevel = (points) => {
      if (points < 10) return 1;
      if (points < 25) return 2;
      if (points < 50) return 3;
      if (points < 100) return 4;
      if (points < 150) return 5;
      if (points < 250) return 6;
      if (points < 400) return 7;
      if (points < 600) return 8;
      if (points < 850) return 9;
      if (points < 1200) return 10;
      if (points < 1600) return 11;
      if (points < 2100) return 12;
      if (points < 2700) return 13;
      if (points < 3400) return 14;
      if (points < 4200) return 15;
      if (points < 5100) return 16;
      if (points < 6100) return 17;
      if (points < 7200) return 18;
      if (points < 8400) return 19;
      return 20;
    };
    
    const oldLevel = userStats.level;
    userStats.level = calculateLevel(newPoints);
    
    await userStats.save();
    
    // Créer le message de confirmation
    let message = `✅ <b>Points modifiés avec succès !</b>\n\n`;
    message += `👤 <b>Utilisateur:</b> ${userStats.username}\n`;
    message += `🆔 <b>ID:</b> ${targetUserId}\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    
    if (match[2].startsWith('+') || match[2].startsWith('-')) {
      message += `📊 <b>Changement:</b> ${match[2]} points\n`;
    }
    
    message += `💰 <b>Points:</b> ${oldPoints} → ${newPoints}\n`;
    
    if (oldLevel !== userStats.level) {
      message += `🎖️ <b>Niveau:</b> ${oldLevel} → ${userStats.level}\n`;
    } else {
      message += `🎖️ <b>Niveau:</b> ${userStats.level}\n`;
    }
    
    // Boutons pour actions supplémentaires
    const keyboard = {
      inline_keyboard: [
        [
          { text: '➕ Ajouter', callback_data: `admin_points_${targetUserId}_add` },
          { text: '➖ Retirer', callback_data: `admin_points_${targetUserId}_remove` }
        ],
        [{ text: '📊 Stats utilisateur', callback_data: `admin_stats_${targetUserId}` }]
      ]
    };
    
    await bot.sendMessage(chatId, message, { 
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
    
    // Notifier l'utilisateur si ses points ont été modifiés
    try {
      let notifMessage = '';
      if (match[2].startsWith('+')) {
        notifMessage = `🎉 Tu as reçu ${Math.abs(pointsChange)} points !\n\n`;
        notifMessage += `💰 Total: ${newPoints} points\n`;
        if (oldLevel !== userStats.level) {
          notifMessage += `🎖️ Nouveau niveau: ${userStats.level} !`;
        }
      } else if (match[2].startsWith('-')) {
        notifMessage = `📉 ${Math.abs(pointsChange)} points ont été retirés.\n\n`;
        notifMessage += `💰 Total: ${newPoints} points`;
      } else {
        notifMessage = `📊 Tes points ont été ajustés.\n\n`;
        notifMessage += `💰 Total: ${newPoints} points\n`;
        notifMessage += `🎖️ Niveau: ${userStats.level}`;
      }
      
      await bot.sendMessage(targetUserId, notifMessage, { parse_mode: 'HTML' });
    } catch (e) {
      // L'utilisateur a peut-être bloqué le bot
      console.log(`Impossible de notifier l'utilisateur ${targetUserId}`);
    }
    
  } catch (error) {
    console.error('Erreur /points:', error);
    await bot.sendMessage(chatId, '❌ Erreur lors de la modification des points.', { parse_mode: 'HTML' });
  }
});

// Gestion des callback queries (IMPORTANT: éviter les doublons)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  
  // RÉPONDRE IMMÉDIATEMENT pour éviter TOUT message d'erreur
  try {
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (e) {
    // Ignorer si déjà répondu
  }
  
  // Flag pour éviter les doubles envois
  let messageSent = false;
  
  try {
    let callbackAnswered = true; // Déjà répondu au début
    // Vérifier d'abord si c'est une callback admin
    const isAdminCallback = await handleAdminCallbacks(bot, callbackQuery);
    if (isAdminCallback) return;
    
    // Vérifier si c'est une callback de notifications
    if (data.startsWith('notif_')) {
      const isNotifCallback = await handleNotificationCallbacks(bot, callbackQuery);
      if (isNotifCallback) return;
    }
    
    // Vérifier si on est en maintenance (sauf pour les callbacks admin)
    const { checkMaintenanceMode } = require('./middleware/maintenanceCheck');
    const inMaintenance = await checkMaintenanceMode(bot, chatId);
    if (inMaintenance) {
      await bot.deleteMessage(chatId, messageId);
      return; // Arrêter ici si en maintenance
    }
    
    // Vérification de l'appartenance au canal
    if (data === 'check_membership') {
      const { checkChannelMembership } = require('./middleware/channelCheck');
      const userId = callbackQuery.from.id;
      const isMember = await checkChannelMembership(bot, userId);
      
      if (isMember) {
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: '✅ Vérification réussie ! Bienvenue !',
          show_alert: true
        });
        await bot.deleteMessage(chatId, messageId);
        await showMainMenu(bot, chatId);
      } else {
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: '‼️ IMPORTANT DE REJOINDRE POUR VOIR LES MENUS ‼️\n\nCORDIALEMENT PLUGS DU MOMENT',
          show_alert: true
        });
        
        // Supprimer l'ancien message et renvoyer le message de vérification
        await bot.deleteMessage(chatId, messageId);
        const { requireChannelMembership } = require('./middleware/channelCheck');
        await requireChannelMembership(bot, chatId, userId);
      }
    }
    // Menu principal
    else if (data === 'main_menu') {
      await bot.deleteMessage(chatId, messageId);
      await showMainMenu(bot, chatId, callbackQuery.from.id);
    }
    
    // Informations
    else if (data === 'info') {
      await bot.deleteMessage(chatId, messageId);
      const settings = await Settings.findOne();
      const message = settings?.infoText || 'Bienvenue sur PLUGS DU MOMENT !';
      
      // Envoyer avec l'image d'accueil si elle existe
      if (settings?.welcomeImage) {
        try {
          await bot.sendPhoto(chatId, settings.welcomeImage, {
            caption: `ℹ️ <b>Informations</b>\n\n${message}`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ RETOUR', callback_data: 'main_menu' }]]
            }
          });
        } catch (error) {
          console.error('Erreur envoi image:', error);
          // Si l'image échoue, envoyer juste le message
          await bot.sendMessage(chatId, `ℹ️ <b>Informations</b>\n\n${message}`, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ RETOUR', callback_data: 'main_menu' }]]
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, `ℹ️ <b>Informations</b>\n\n${message}`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ RETOUR', callback_data: 'main_menu' }]]
          }
        });
      }
    }
    
    // Ajouter contact/réseaux
    else if (data === 'add_contact') {
      await bot.deleteMessage(chatId, messageId);
      await handleVendorApplication(bot, chatId, userStates);
    }
    
    // PLUGS DU MOMENT
    else if (data === 'plugs') {
      const { requireChannelMembership } = require('./middleware/channelCheck');
      const userId = callbackQuery.from.id;
      const hasAccess = await requireChannelMembership(bot, chatId, userId);
      if (hasAccess) {
        await bot.deleteMessage(chatId, messageId);
        await handlePlugsMenu(bot, chatId);
      }
    }
    
    // Filtres par pays (avec ou sans méthode)
    else if (data.startsWith('plugs_filter_country_')) {
      const parts = data.replace('plugs_filter_country_', '').split('_method_');
      const country = parts[0];
      const method = parts[1] || null;
      await bot.deleteMessage(chatId, messageId);
      await handlePlugsMenu(bot, chatId, { country, method });
    }
    
    // Filtres par méthode (avec ou sans pays)
    else if (data.startsWith('plugs_filter_method_')) {
      const parts = data.replace('plugs_filter_method_', '').split('_country_');
      const method = parts[0];
      const country = parts[1] || null;
      await bot.deleteMessage(chatId, messageId);
      await handlePlugsMenu(bot, chatId, { country, method });
    }
    
    // Pagination des plugs
    else if (data.startsWith('plugs_page_')) {
      // Extraire le numéro de page et les filtres
      const pageData = data.replace('plugs_page_', '');
      const parts = pageData.split('_');
      const page = parseInt(parts[0]);
      
      let country = null;
      let method = null;
      
      // Chercher les filtres dans les parties restantes
      for (let i = 1; i < parts.length; i++) {
        if (parts[i] === 'country' && parts[i + 1]) {
          country = parts[i + 1];
          i++; // Skip next part as it's the country value
        } else if (parts[i] === 'method' && parts[i + 1]) {
          method = parts[i + 1];
          i++; // Skip next part as it's the method value
        }
      }
      
      await bot.deleteMessage(chatId, messageId);
      await handlePlugsMenu(bot, chatId, { country, method }, page);
    }
    
    // Page actuelle (ne rien faire)
    else if (data === 'current_page') {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Vous êtes déjà sur cette page',
        show_alert: false
      });
      callbackAnswered = true;
      return;
    }
    
    // Séparateur (ne rien faire)
    else if (data === 'separator') {
      await bot.answerCallbackQuery(callbackQuery.id);
      callbackAnswered = true;
      return;
    }
    
    // Top Parrains
    else if (data === 'referrals' || data === 'top_referrals') {
      await bot.deleteMessage(chatId, messageId);
      await handleReferralMenu(bot, chatId, callbackQuery.from.id);
    }
    
    // Mon lien de parrainage
    else if (data === 'my_referral_link') {
      const user = await User.findOne({ telegramId: callbackQuery.from.id });
      if (user) {
        const referralLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=ref_${user._id}`;
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: '🔗 Lien copié dans le presse-papier !',
          show_alert: false
        });
        await bot.sendMessage(chatId, 
          `🔗 <b>Votre lien de parrainage :</b>\n\n<code>${referralLink}</code>\n\n` +
          `📊 Vous avez déjà parrainé <b>${user.referralCount || 0}</b> personnes.\n\n` +
          `💡 Partagez ce lien pour inviter vos amis et monter dans le classement !`,
          { parse_mode: 'HTML' }
        );
      }
    }
    
    // Afficher le lien de parrainage
    else if (data.startsWith('show_referral_')) {
      const parts = data.split('_');
      const plugId = parts[2];
      const referrerId = parts[3];
      
      const referralLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=plug_${plugId}_${referrerId}`;
      
      // Récupérer les infos du plug et le nombre de filleuls
      const PlugReferral = require('./models/PlugReferral');
      const plug = await Plug.findById(plugId);
      const userReferralCount = await PlugReferral.countDocuments({
        plugId: plugId,
        referrerId: referrerId
      });
      
      // Envoyer le message et stocker son ID
      const sentMessage = await bot.sendMessage(chatId, 
        `🔗 <b>Lien de parrainage ADMIN pour ${plug.name} :</b>\n\n` +
        `<code>${referralLink}</code>\n\n` +
        `📋 <i>Cliquez sur le lien pour le copier</i>\n\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `🔌 <b>Détails du plug :</b>\n` +
        `• Nom : ${plug.name}\n` +
        `• Localisation : ${plug.country || 'Non spécifiée'}\n` +
        `• Likes : ${plug.likes || 0}\n` +
        `• Total parrainages : ${plug.referralCount || 0}\n\n` +
        `📊 <b>Vos statistiques pour ce plug :</b>\n` +
        `• Filleuls invités par vous : ${userReferralCount}\n\n` +
        `💡 <b>Fonctionnement :</b>\n` +
        `• Partagez ce lien pour inviter des filleuls\n` +
        `• Vous serez notifié avec le nom du plug et du filleul\n` +
        `• Les notifications se suppriment automatiquement\n\n` +
        `⏱️ <i>Ce message sera supprimé dans 1 minute</i>`,
        { 
          parse_mode: 'HTML',
          disable_web_page_preview: true
        }
      );
      
      // Supprimer le message après 1 minute (60000 ms)
      setTimeout(async () => {
        try {
          await bot.deleteMessage(chatId, sentMessage.message_id);
        } catch (error) {
          // Ignorer l'erreur si le message a déjà été supprimé
          console.log('Message déjà supprimé ou erreur:', error.message);
        }
      }, 60000); // 1 minute
      
      // Stocker l'ID du message pour pouvoir le supprimer quand un filleul rejoint
      if (!global.referralMessages) {
        global.referralMessages = new Map();
      }
      global.referralMessages.set(`${referrerId}_${plugId}`, {
        messageId: sentMessage.message_id,
        chatId: chatId
      });
    }
    
    // Callback pour le séparateur (ne rien faire)
    else if (data === 'separator') {
      // Ne rien faire, juste répondre à la callback
      return;
    }
    
    // Callback pour le cooldown (afficher le message de cooldown)
    else if (data.startsWith('cooldown_')) {
      callbackAnswered = true; // Marquer comme répondu
      const plugId = data.replace('cooldown_', '');
      const userId = callbackQuery.from.id;
      
      // Vérifier le temps restant
      const User = require('./models/User');
      const user = await User.findOne({ telegramId: userId });
      
      if (user && user.lastLikeAt) {
        const now = new Date();
        const lastLikeTime = new Date(user.lastLikeAt);
        const timeSinceLastLike = (now - lastLikeTime) / 1000 / 60; // en minutes
        const remainingTime = Math.ceil(30 - timeSinceLastLike);
        
        if (remainingTime > 0 && remainingTime <= 30) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: `⏱️ Veuillez patienter ${remainingTime} minute${remainingTime > 1 ? 's' : ''} avant de liker à nouveau.\n\n💡 Vous pourrez voter à nouveau dans ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.\n\n❤️ Merci pour votre soutien !`,
            show_alert: true
          });
          
          // Mettre à jour le bouton avec le temps actuel
          try {
            const keyboard = callbackQuery.message.reply_markup;
            if (keyboard && keyboard.inline_keyboard) {
              for (let row of keyboard.inline_keyboard) {
                for (let button of row) {
                  if (button.callback_data && button.callback_data === data) {
                    button.text = `⏱️ Restant ${remainingTime}min (${button.text.match(/\((\d+)\)/)?.[1] || '0'})`;
                    break;
                  }
                }
              }
              
              // Éditer le message pour mettre à jour le bouton
              if (callbackQuery.message.photo) {
                await bot.editMessageReplyMarkup(keyboard, {
                  chat_id: chatId,
                  message_id: callbackQuery.message.message_id
                });
              } else {
                await bot.editMessageReplyMarkup(keyboard, {
                  chat_id: chatId,
                  message_id: callbackQuery.message.message_id
                });
              }
            }
          } catch (error) {
            console.error('Erreur mise à jour bouton cooldown:', error);
          }
        } else {
          // Le cooldown est terminé, réactiver le bouton
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '✅ Vous pouvez maintenant liker à nouveau !',
            show_alert: false
          });
          
          // Changer le bouton pour le réactiver
          try {
            const keyboard = callbackQuery.message.reply_markup;
            if (keyboard && keyboard.inline_keyboard) {
              for (let row of keyboard.inline_keyboard) {
                for (let button of row) {
                  if (button.callback_data && button.callback_data === data) {
                    button.text = `❤️ Like (${button.text.match(/\((\d+)\)/)?.[1] || '0'})`;
                    button.callback_data = `like_${plugId}`;
                    break;
                  }
                }
              }
              
              // Éditer le message pour mettre à jour le bouton
              if (callbackQuery.message.photo) {
                await bot.editMessageReplyMarkup(keyboard, {
                  chat_id: chatId,
                  message_id: callbackQuery.message.message_id
                });
              } else {
                await bot.editMessageReplyMarkup(keyboard, {
                  chat_id: chatId,
                  message_id: callbackQuery.message.message_id
                });
              }
            }
          } catch (error) {
            console.error('Erreur réactivation bouton:', error);
          }
        }
      }
      return;
    }
    
    // Détails d'un plug depuis le top parrains
    else if (data.startsWith('plug_from_referral_')) {
      const plugId = data.replace('plug_from_referral_', '');
      const userId = callbackQuery.from.id;
      console.log(`🔌 Callback reçu pour afficher le plug depuis top parrains: ${plugId}`);
      try {
        await bot.deleteMessage(chatId, messageId);
        await handlePlugDetails(bot, chatId, plugId, 'top_referrals', userId);
      } catch (error) {
        console.error('❌ Erreur lors de l\'affichage du plug:', error);
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: 'Erreur lors du chargement du plug',
          show_alert: true
        });
      }
    }
    
    // Détails d'un plug
    else if (data.startsWith('plug_')) {
      const plugId = data.replace('plug_', '');
      const userId = callbackQuery.from.id;
      console.log(`🔌 Callback reçu pour afficher le plug: ${plugId}`);
      try {
        await bot.deleteMessage(chatId, messageId);
        await handlePlugDetails(bot, chatId, plugId, 'plugs', userId);
      } catch (error) {
        console.error('❌ Erreur lors de l\'affichage du plug:', error);
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: 'Erreur lors du chargement du plug',
          show_alert: true
        });
      }
    }
    
    // Like d'un plug
    else if (data.startsWith('like_')) {
      callbackAnswered = true; // handleLike gère sa propre réponse
      const plugId = data.replace('like_', '');
      await handleLike(bot, callbackQuery, plugId);
    }
    
    // Démarrer le questionnaire vendeur
    else if (data === 'apply') {
      await bot.deleteMessage(chatId, messageId);
      await handleVendorApplication(bot, chatId, userStates);
    }
    
    // Gestion du formulaire vendeur
    else if (data.startsWith('vendor_')) {
      const userState = userStates.get(chatId);
      
      // Vérifier que l'utilisateur est bien dans le processus de candidature
      if (!userState || userState.type !== 'vendor_application') {
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: '❌ Session expirée. Veuillez recommencer.',
          show_alert: true
        });
        return;
      }
      
      if (data.startsWith('vendor_toggle_')) {
        // Toggle réseau social
        const network = data.replace('vendor_toggle_', '');
        if (!userState.data.socialNetworks.primary.includes(network)) {
          userState.data.socialNetworks.primary.push(network);
        } else {
          userState.data.socialNetworks.primary = userState.data.socialNetworks.primary.filter(n => n !== network);
        }
        await bot.deleteMessage(chatId, messageId);
        await handleVendorApplication(bot, chatId, userStates);
      }
      else if (data.startsWith('vendor_method_')) {
        // Toggle méthode
        const method = data.replace('vendor_method_', '');
        userState.data.methods[method] = !userState.data.methods[method];
        await bot.deleteMessage(chatId, messageId);
        await handleVendorApplication(bot, chatId, userStates);
      }
      else if (data.startsWith('vendor_country_')) {
        // Sélection pays
        userState.data.country = data.replace('vendor_country_', '');
        userState.stepIndex++;
        userState.step = 'department';
        await bot.deleteMessage(chatId, messageId);
        await handleVendorApplication(bot, chatId, userStates);
      }
      else if (data.startsWith('vendor_dept_')) {
        // Sélection département
        userState.data.department = data.replace('vendor_dept_', '');
        userState.stepIndex++;
        userState.step = 'postal_code';
        await bot.deleteMessage(chatId, messageId);
        await handleVendorApplication(bot, chatId, userStates);
      }
      else if (data === 'vendor_submit') {
        // Soumettre la candidature
        await submitVendorApplication(bot, chatId, userState);
        userStates.delete(chatId);
        await bot.deleteMessage(chatId, messageId);
      }
      else if (data === 'vendor_back' || data === 'vendor_next' || data === 'vendor_skip' || data === 'vendor_cancel') {
        // Actions de navigation vendeur
        await bot.deleteMessage(chatId, messageId);
        await handleVendorApplication(bot, chatId, userStates, data);
      }
    }
    
    // ===== GESTION DES NOUVELLES FONCTIONNALITÉS =====
    // Badges
    else if (data === 'my_badges') {
      try {
        const UserStats = require('./models/UserStats');
        const BadgeConfig = require('./models/BadgeConfig');
        
        // Initialiser les badges par défaut si nécessaire
        await BadgeConfig.initializeDefaults();
        
        // Récupérer les stats de l'utilisateur
        let userStats = await UserStats.findOne({ userId: callbackQuery.from.id });
        
        if (!userStats) {
          // Créer les stats si elles n'existent pas
          const User = require('./models/User');
          const user = await User.findOne({ telegramId: callbackQuery.from.id });
          
          userStats = new UserStats({
            userId: callbackQuery.from.id,
            username: user?.username || callbackQuery.from.username || 'Utilisateur'
          });
          await userStats.save();
        }
        
        // Compter les badges totaux (possédés + utilisés)
        const BadgeConfig = require('./models/BadgeConfig');
        const allBadges = await BadgeConfig.find({ isActive: true });
        const totalBadges = allBadges.length;
        const ownedBadges = userStats.badges.filter(b => !b.used).length;
        const usedBadges = userStats.badges.filter(b => b.used).length;
        
        // Construire le message avec les vraies données
        let message = `🏅 <b>MES BADGES ET RÉCOMPENSES</b>\n`;
        message += `━━━━━━━━━━━━━━━━\n\n`;
        message += `📊 <b>Statistiques</b>\n`;
        message += `🎖️ Niveau: ${userStats.level}\n`;
        message += `⭐ Points: ${userStats.points}\n`;
        message += `🏆 Badges possédés: ${ownedBadges}\n`;
        message += `🎁 Badges offerts: ${usedBadges}\n`;
        message += `📦 Badges totaux: ${ownedBadges + usedBadges}/${totalBadges}\n`;
        message += `🗳️ Votes totaux: ${userStats.totalVotes}\n\n`;
        
        // Progression vers le prochain niveau
        const votesForNextLevel = (userStats.level * 5) - userStats.totalVotes;
        if (votesForNextLevel > 0) {
          message += `📈 <b>Prochain niveau dans ${votesForNextLevel} vote${votesForNextLevel > 1 ? 's' : ''}</b>\n`;
          message += `<i>(+3 points au prochain niveau)</i>\n\n`;
        }
        
        // Afficher les badges possédés
        if (userStats.badges.length > 0) {
          message += `🏆 <b>Mes Badges:</b>\n`;
          for (const badge of userStats.badges) {
            message += `${badge.emoji} ${badge.name}\n`;
          }
          message += '\n';
        }
        
        // Info sur les badges
        if (userStats.points >= 10) {
          message += `💎 Tu peux acheter des badges avec tes ${userStats.points} points !\n`;
        } else {
          const pointsNeeded = 10 - userStats.points;
          message += `🔒 <i>Boutique débloquée à 10 points (encore ${pointsNeeded} points)</i>\n`;
        }
        
        // Créer le clavier avec les boutons appropriés
        const keyboard = {
          inline_keyboard: []
        };
        
        // Ajouter bouton boutique si 10+ points
        if (userStats.points >= 10) {
          keyboard.inline_keyboard.push([
            { text: `🛍️ Boutique de badges (${userStats.points} pts)`, callback_data: 'badge_shop' }
          ]);
        }
        
        keyboard.inline_keyboard.push([
          { text: '🔙 Retour au menu', callback_data: 'main_menu' }
        ]);
        
        // Essayer d'éditer le message existant d'abord
        try {
          if (callbackQuery.message.text) {
            await bot.editMessageText(message, {
              chat_id: chatId,
              message_id: messageId,
              parse_mode: 'HTML',
              reply_markup: keyboard
            });
          } else {
            // Si c'est une image, on doit supprimer et recréer
            await bot.deleteMessage(chatId, messageId);
            await bot.sendMessage(chatId, message, {
              parse_mode: 'HTML',
              reply_markup: keyboard
            });
          }
        } catch (error) {
          console.error('Erreur édition my_badges:', error);
          // En cas d'erreur, supprimer et recréer
          try {
            await bot.deleteMessage(chatId, messageId);
          } catch (e) {}
          await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        }
      } catch (error) {
        console.error('Erreur my_badges:', error);
        // Ne pas afficher de message d'erreur
        if (!callbackAnswered) {
          try {
            await bot.answerCallbackQuery(callbackQuery.id);
          } catch (err) {
            // Ignorer
          }
          callbackAnswered = true;
        }
      }
    }
    
    // Menu Classements
    else if (data === 'rankings_menu') {
      try {
        const message = `🗳️ <b>CLASSEMENT PLUGS</b>\n` +
          `━━━━━━━━━━━━━━━━\n\n` +
          `Choisis le classement à consulter:`;
        
        const keyboard = {
          inline_keyboard: [
            [
              { text: '🏆 Top Global', callback_data: 'rankings_global' },
              { text: '📅 Top du Jour', callback_data: 'rankings_daily' }
            ],
            [
              { text: '📊 Top Semaine', callback_data: 'rankings_weekly' },
              { text: '📈 En Progression', callback_data: 'rankings_trending' }
            ],
            [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
          ]
        };
        
        // Essayer d'éditer le message existant d'abord
        try {
          if (callbackQuery.message.text) {
            await bot.editMessageText(message, {
              chat_id: chatId,
              message_id: messageId,
              parse_mode: 'HTML',
              reply_markup: keyboard
            });
          } else {
            // Si c'est une image, on doit supprimer et recréer
            await bot.deleteMessage(chatId, messageId);
            await bot.sendMessage(chatId, message, {
              parse_mode: 'HTML',
              reply_markup: keyboard
            });
          }
        } catch (error) {
          console.error('Erreur édition menu rankings:', error);
          // En cas d'erreur, supprimer et recréer
          try {
            await bot.deleteMessage(chatId, messageId);
          } catch (e) {}
          await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        }
      } catch (error) {
        console.error('Erreur rankings_menu:', error);
        // Ne pas afficher de message d'erreur
        if (!callbackAnswered) {
          try {
            await bot.answerCallbackQuery(callbackQuery.id);
          } catch (e) {}
          callbackAnswered = true;
        }
      }
    }
    
    // Classements détaillés
    else if (data === 'rankings_global' || data === 'rankings_daily' || 
             data === 'rankings_weekly' || data === 'rankings_trending') {
      try {
        const Plug = require('./models/Plug');
        let title = '';
        let plugs = [];
        let noDataMessage = '';
        
        if (data === 'rankings_global') {
          title = '🏆 <b>TOP GLOBAL - TOUS LES TEMPS</b>';
          // Récupérer TOUS les plugs avec des votes, pas seulement 10
          plugs = await Plug.find({ isActive: true, likes: { $gt: 0 } })
            .sort({ likes: -1 });
          noDataMessage = 'Aucun vote enregistré pour le moment.';
        } else if (data === 'rankings_daily') {
          title = '📅 <b>TOP DU JOUR</b>';
          // Filtrer les plugs avec des votes aujourd'hui
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          plugs = await Plug.find({ 
            isActive: true, 
            'dailyVotes.count': { $gt: 0 },
            'dailyVotes.lastReset': { $gte: oneDayAgo }
          })
            .sort({ 'dailyVotes.count': -1 })
            .limit(10);
          noDataMessage = '❌ Aucun vote aujourd\'hui.\n\n💡 Sois le premier à voter !';
        } else if (data === 'rankings_weekly') {
          title = '📊 <b>TOP DE LA SEMAINE</b>';
          // Filtrer les plugs avec des votes cette semaine
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          plugs = await Plug.find({ 
            isActive: true, 
            'weeklyVotes.count': { $gt: 0 },
            'weeklyVotes.lastReset': { $gte: oneWeekAgo }
          })
            .sort({ 'weeklyVotes.count': -1 })
            .limit(10);
          noDataMessage = '❌ Aucun vote cette semaine.\n\n💡 Commence à voter pour voir le classement !';
        } else if (data === 'rankings_trending') {
          title = '📈 <b>PLUGS EN PROGRESSION</b>';
          // Trier par score de tendance
          plugs = await Plug.find({ 
            isActive: true, 
            trendingScore: { $gt: 0 }
          })
            .sort({ trendingScore: -1 })
            .limit(10);
          noDataMessage = '📊 Pas assez de données pour calculer les tendances.\n\n💡 Reviens dans quelques jours !';
        }
        
        let message = `${title}\n`;
        message += `━━━━━━━━━━━━━━━━\n\n`;
        
        if (plugs.length > 0) {
          plugs.forEach((plug, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            let voteCount = 0;
            let suffix = '';
            
            if (data === 'rankings_global') {
              voteCount = plug.likes || 0;
              suffix = ' votes total';
            } else if (data === 'rankings_daily') {
              voteCount = plug.dailyVotes?.count || 0;
              suffix = ' votes aujourd\'hui';
            } else if (data === 'rankings_weekly') {
              voteCount = plug.weeklyVotes?.count || 0;
              suffix = ' votes cette semaine';
            } else if (data === 'rankings_trending') {
              voteCount = Math.round(plug.trendingScore || 0);
              suffix = '% de progression';
            }
            
            message += `${medal} ${plug.name} - ${voteCount}${suffix}\n`;
          });
        } else {
          message += noDataMessage;
        }
        
        message += `\n⏱️ Mise à jour: ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        
        const keyboard = {
          inline_keyboard: [
            [
              { text: '🏆 Top Global', callback_data: 'rankings_global' },
              { text: '📅 Top du Jour', callback_data: 'rankings_daily' }
            ],
            [
              { text: '📊 Top Semaine', callback_data: 'rankings_weekly' },
              { text: '📈 En Progression', callback_data: 'rankings_trending' }
            ],
            [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
          ]
        };
        
        // Éditer le message existant au lieu de le recréer
        try {
          if (callbackQuery.message.text) {
            // Si c'est un message texte, on peut l'éditer directement
            await bot.editMessageText(message, {
              chat_id: chatId,
              message_id: messageId,
              parse_mode: 'HTML',
              reply_markup: keyboard
            });
          } else {
            // Si c'est une image ou autre, on doit supprimer et recréer
            await bot.deleteMessage(chatId, messageId);
            await bot.sendMessage(chatId, message, {
              parse_mode: 'HTML',
              reply_markup: keyboard
            });
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du classement:', error);
          // En cas d'erreur, essayer de supprimer et recréer
          try {
            await bot.deleteMessage(chatId, messageId);
            await bot.sendMessage(chatId, message, {
              parse_mode: 'HTML',
              reply_markup: keyboard
            });
          } catch (e) {
            console.error('Erreur critique:', e);
          }
        }
        
        callbackAnswered = true;
      } catch (error) {
        console.error('Erreur rankings:', error);
        // Répondre silencieusement sans message d'erreur
        try {
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (e) {}
        callbackAnswered = true;
      }
    }
    
    /*
    // Menu Battles (désactivé)
    else if (data === 'battles_menu') {
      try {
        const message = `⚔️ <b>BATTLES</b>\n\n` +
          `Choisis une option:`;
        
        const keyboard = {
          inline_keyboard: [
            [
              { text: '⚔️ Battles en cours', callback_data: 'battles_active' },
              { text: '🏆 Historique', callback_data: 'battles_history' }
            ],
            [{ text: '📊 Mes stats de battle', callback_data: 'battles_mystats' }],
            [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
          ]
        };
        
        if (callbackQuery.message.text) {
          await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        } else {
          await bot.deleteMessage(chatId, messageId);
          await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        }
        callbackAnswered = true;
      } catch (error) {
        console.error('Erreur battles_menu:', error);
        try {
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (e) {}
        callbackAnswered = true;
      }
    }
    */
    
    // Battles détails (désactivé)
    /*
    else if (data === 'battles_active' || data === 'battles_history' || data === 'battles_mystats') {
      try {
        let title = '';
        let content = '';
        
        if (data === 'battles_active') {
          title = '⚔️ BATTLES EN COURS';
          content = '❌ Aucune battle en cours pour le moment.\n\n' +
                   '💡 Les battles du week-end arrivent bientôt !';
        } else if (data === 'battles_history') {
          title = '🏆 HISTORIQUE DES BATTLES';
          content = '📜 Aucune battle terminée pour le moment.';
        } else if (data === 'battles_mystats') {
          title = '📊 MES STATS DE BATTLE';
          content = 'Battles participées: 0\n' +
                   'Battles gagnées: 0\n' +
                   'Taux de victoire: 0%';
        }
        
        const message = `${title}\n` +
          `━━━━━━━━━━━━━━━━\n\n` +
          `${content}`;
        
        const keyboard = {
          inline_keyboard: [
            [
              { text: '⚔️ Battles en cours', callback_data: 'battles_active' },
              { text: '🏆 Historique', callback_data: 'battles_history' }
            ],
            [{ text: '📊 Mes stats', callback_data: 'battles_mystats' }],
            [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
          ]
        };
        
        if (callbackQuery.message.text) {
          await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        } else {
          await bot.deleteMessage(chatId, messageId);
          await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        }
        callbackAnswered = true;
      } catch (error) {
        console.error('Erreur battles:', error);
        try {
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (e) {}
        callbackAnswered = true;
      }
    }
    */
    
    // Notifications (désactivé)
    /*
    else if (data === 'notification_settings') {
      try {
        const message = `🔔 <b>PRÉFÉRENCES DE NOTIFICATION</b>\n` +
          `━━━━━━━━━━━━━━━━\n\n` +
          `📱 <b>Types de notifications:</b>\n` +
          `✅ Badges et récompenses\n` +
          `✅ Classements\n` +
          `✅ Battles\n\n` +
          `⏰ <b>Horaires préférés:</b>\n` +
          `✅ Matin (8h-12h)\n` +
          `✅ Après-midi (12h-18h)\n` +
          `✅ Soir (18h-22h)\n` +
          `❌ Nuit (22h-8h)\n\n` +
          `📊 <b>Limite quotidienne:</b> 5 notifications/jour`;
        
        const keyboard = {
          inline_keyboard: [
            [
              { text: '✅ Badges', callback_data: 'pref_toggle_badges' },
              { text: '✅ Classements', callback_data: 'pref_toggle_rankings' }
            ],
            [
              { text: '✅ Battles', callback_data: 'pref_toggle_battles' },
              { text: '❌ Top du jour', callback_data: 'pref_toggle_daily' }
            ],
            [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
          ]
        };
        
        if (callbackQuery.message.text) {
          await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        } else {
          await bot.deleteMessage(chatId, messageId);
          await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        }
        callbackAnswered = true;
      } catch (error) {
        console.error('Erreur notifications:', error);
        try {
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (e) {}
        callbackAnswered = true;
      }
    }
    */
    
    // Toggle préférences (désactivé)
    /*
    else if (data.startsWith('pref_toggle_')) {
      try {
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: '✅ Préférences mises à jour',
          show_alert: false
        });
        
        // Recharger le menu des notifications
        const message = `🔔 <b>PRÉFÉRENCES DE NOTIFICATION</b>\n` +
          `━━━━━━━━━━━━━━━━\n\n` +
          `📱 <b>Types de notifications:</b>\n` +
          `✅ Badges et récompenses\n` +
          `✅ Classements\n` +
          `✅ Battles\n\n` +
          `⏰ <b>Horaires préférés:</b>\n` +
          `✅ Matin (8h-12h)\n` +
          `✅ Après-midi (12h-18h)\n` +
          `✅ Soir (18h-22h)\n` +
          `❌ Nuit (22h-8h)\n\n` +
          `📊 <b>Limite quotidienne:</b> 5 notifications/jour\n\n` +
          `✅ Préférences mises à jour !`;
        
        const keyboard = {
          inline_keyboard: [
            [
              { text: '✅ Badges', callback_data: 'pref_toggle_badges' },
              { text: '✅ Classements', callback_data: 'pref_toggle_rankings' }
            ],
            [
              { text: '✅ Battles', callback_data: 'pref_toggle_battles' },
              { text: '❌ Top du jour', callback_data: 'pref_toggle_daily' }
            ],
            [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
          ]
        };
        
        if (callbackQuery.message.text) {
          await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        } else {
          await bot.deleteMessage(chatId, messageId);
          await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
        }
        callbackAnswered = true;
      } catch (error) {
        console.error('Erreur toggle pref:', error);
        try {
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (e) {}
        callbackAnswered = true;
      }
    }
    */
    
    // Boutique de badges (depuis menu principal)
    else if (data === 'badge_shop_direct') {
      try {
        const UserStats = require('./models/UserStats');
        const BadgeConfig = require('./models/BadgeConfig');
        
        // Initialiser les badges par défaut si nécessaire
        await BadgeConfig.initializeDefaults();
        
        // Récupérer ou créer les stats de l'utilisateur
        let userStats = await UserStats.findOne({ userId: callbackQuery.from.id });
        
        if (!userStats) {
          const User = require('./models/User');
          const user = await User.findOne({ telegramId: callbackQuery.from.id });
          
          userStats = new UserStats({
            userId: callbackQuery.from.id,
            username: user?.username || callbackQuery.from.username || 'Utilisateur'
          });
          await userStats.save();
        }
        
        // Récupérer les badges disponibles
        const badges = await BadgeConfig.find({ isActive: true }).sort({ cost: 1 });
        
        let message = `🛍️ <b>BOUTIQUE DE BADGES</b>\n`;
        message += `━━━━━━━━━━━━━━━━\n\n`;
        message += `💰 Points disponibles: ${userStats.points}\n`;
        message += `🎖️ Niveau actuel: ${userStats.level}\n\n`;
        message += `📌 <b>Badges à acheter pour offrir aux plugs:</b>\n\n`;
        
        const keyboard = {
          inline_keyboard: []
        };
        
        let badgesList = '';
        let badgeNumber = 1;
        
        // Afficher tous les badges avec leurs détails et numéros
        for (const badge of badges) {
          const owned = userStats.badges && userStats.badges.some(b => b.badgeId === badge.badgeId && !b.used);
          const canAfford = userStats.points >= badge.cost;
          const meetsLevel = userStats.level >= badge.requirements.minLevel;
          
          badgesList += `${badgeNumber}. ${badge.emoji} <b>${badge.name}</b> - ${badge.cost} pts\n`;
          badgesList += `   <i>${badge.description}</i>\n`;
          
          if (!meetsLevel) {
            badgesList += `   ⚠️ Niveau ${badge.requirements.minLevel} requis\n`;
          } else if (owned) {
            badgesList += `   ✅ Déjà acheté (usage unique)\n`;
          } else if (canAfford) {
            badgesList += `   ✨ Disponible à l'achat\n`;
            keyboard.inline_keyboard.push([
              { text: `${badgeNumber}. ${badge.emoji} ${badge.name} (${badge.cost} pts)`, callback_data: `buy_badge_${badge.badgeId}` }
            ]);
          } else {
            badgesList += `   ❌ ${badge.cost - userStats.points} points manquants\n`;
          }
          badgesList += '\n';
          badgeNumber++;
        }
        
        message += badgesList;
        
        // Info sur l'utilisation
        message += `💡 <b>Comment ça marche:</b>\n`;
        message += `• Achète des badges avec tes points\n`;
        message += `• Utilise /buy [numéro] pour acheter\n`;
        message += `• Offre-les aux plugs que tu soutiens\n`;
        message += `• Les plugs gagnent visibilité et pub gratuite\n`;
        message += `• Usage unique: 1 badge = 1 cadeau\n`;
        
        // Toujours ajouter les boutons de navigation
        keyboard.inline_keyboard.push(
          [{ text: '🏅 Mes badges achetés', callback_data: 'my_badges' }],
          [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
        );
        
        // TOUJOURS supprimer et envoyer un nouveau message
        try {
          await bot.deleteMessage(chatId, messageId);
        } catch (deleteError) {
          console.log('Impossible de supprimer le message:', deleteError.message);
        }
        
        await bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
        
        callbackAnswered = true;
      } catch (error) {
        console.error('Erreur badge_shop_direct:', error);
        // Répondre silencieusement sans message d'erreur
        try {
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (e) {}
        callbackAnswered = true;
      }
    }
    
    // Boutique de badges (depuis mes badges)
    else if (data === 'badge_shop') {
      try {
        const UserStats = require('./models/UserStats');
        const BadgeConfig = require('./models/BadgeConfig');
        
        // Initialiser les badges par défaut si nécessaire
        await BadgeConfig.initializeDefaults();
        
        // Récupérer ou créer les stats de l'utilisateur
        let userStats = await UserStats.findOne({ userId: callbackQuery.from.id });
        
        if (!userStats) {
          const User = require('./models/User');
          const user = await User.findOne({ telegramId: callbackQuery.from.id });
          
          userStats = new UserStats({
            userId: callbackQuery.from.id,
            username: user?.username || callbackQuery.from.username || 'Utilisateur'
          });
          await userStats.save();
        }
        
        // Récupérer TOUS les badges disponibles
        const badges = await BadgeConfig.find({ isActive: true }).sort({ cost: 1 });
        
        let message = `🛍️ <b>BOUTIQUE DE BADGES</b>\n`;
        message += `━━━━━━━━━━━━━━━━\n\n`;
        message += `💰 Tes points: ${userStats.points}\n`;
        message += `🎖️ Niveau: ${userStats.level}\n\n`;
        
        const keyboard = {
          inline_keyboard: []
        };
        
        let hasAvailableBadges = false;
        
        // Afficher tous les badges
        for (const badge of badges) {
          const owned = userStats.badges && userStats.badges.some(b => b.badgeId === badge.badgeId && !b.used);
          const canAfford = userStats.points >= badge.cost;
          
          if (!owned) {
            hasAvailableBadges = true;
            let badgeText = `${badge.emoji} ${badge.name}`;
            
            if (canAfford) {
              badgeText += ` - ${badge.cost} pts`;
              keyboard.inline_keyboard.push([
                { text: badgeText, callback_data: `buy_badge_${badge.badgeId}` }
              ]);
            } else {
              message += `${badge.emoji} <b>${badge.name}</b> - ${badge.cost} pts ❌\n`;
              message += `   <i>${badge.description}</i>\n\n`;
            }
          }
        }
        
        if (!hasAvailableBadges) {
          message += `✅ Tu possèdes tous les badges disponibles !`;
        } else if (userStats.points < 10) {
          message += `\n💡 <i>Vote pour gagner des points !</i>\n`;
          message += `<i>5 votes = 1 niveau = 3 points</i>`;
        }
        
        keyboard.inline_keyboard.push(
          [{ text: '🔙 Retour aux badges', callback_data: 'my_badges' }],
          [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
        );
        
        // TOUJOURS supprimer et envoyer un nouveau message
        try {
          await bot.deleteMessage(chatId, messageId);
        } catch (deleteError) {
          console.log('Impossible de supprimer le message:', deleteError.message);
        }
        
        await bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
        
        callbackAnswered = true;
      } catch (error) {
        console.error('Erreur badge_shop:', error);
        // Répondre silencieusement sans message d'erreur
        try {
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (e) {}
        callbackAnswered = true;
      }
    }
    
    // Achat de badge
    else if (data.startsWith('buy_badge_')) {
      try {
        const badgeId = data.replace('buy_badge_', '');
        const UserStats = require('./models/UserStats');
        const BadgeConfig = require('./models/BadgeConfig');
        
        const userStats = await UserStats.findOne({ userId: callbackQuery.from.id });
        const badge = await BadgeConfig.findOne({ badgeId: badgeId });
        
        if (!badge) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Badge introuvable',
            show_alert: true
          });
          return;
        }
        
        try {
          await userStats.purchaseBadge(badge);
          
          // Message de confirmation et demande de choix du plug
          let message = `✅ <b>Badge acheté avec succès !</b>\n\n`;
          message += `${badge.emoji} <b>${badge.name}</b>\n`;
          message += `<i>${badge.description}</i>\n\n`;
          message += `🎁 <b>À quel plug veux-tu l'offrir ?</b>\n\n`;
          message += `Choisis un plug ci-dessous:`;
          
          // Récupérer les plugs disponibles
          const Plug = require('./models/Plug');
          const plugs = await Plug.find({ isActive: true }).limit(10).sort({ voteCount: -1 });
          
          const keyboard = {
            inline_keyboard: []
          };
          
          for (const plug of plugs) {
            keyboard.inline_keyboard.push([
              { text: `🔌 ${plug.name}`, callback_data: `give_badge_${badge.badgeId}_to_${plug._id}` }
            ]);
          }
          
          keyboard.inline_keyboard.push(
            [{ text: '🔍 Voir plus de plugs', callback_data: 'plugs' }],
            [{ text: '💾 Garder pour plus tard', callback_data: 'my_badges' }]
          );
          
          // Supprimer l'ancien message et envoyer le nouveau
          try {
            await bot.deleteMessage(chatId, messageId);
          } catch (e) {}
          
          await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
          });
          
        } catch (error) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: `❌ ${error.message}`,
            show_alert: true
          });
        }
        
        callbackAnswered = true;
      } catch (error) {
        console.error('Erreur buy_badge:', error);
        // Répondre silencieusement sans message d'erreur
        try {
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (e) {}
        callbackAnswered = true;
      }
    }
    
    // Offrir un badge depuis le menu du plug
    else if (data.startsWith('give_badge_to_')) {
      try {
        const plugId = data.replace('give_badge_to_', '');
        const UserStats = require('./models/UserStats');
        const Plug = require('./models/Plug');
        
        // Récupérer les stats de l'utilisateur
        const userStats = await UserStats.findOne({ userId: callbackQuery.from.id });
        
        if (!userStats || !userStats.badges || userStats.badges.length === 0) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Tu n\'as pas de badges à offrir.\n\n💡 Va dans la boutique pour en acheter !',
            show_alert: true
          });
          return;
        }
        
        // Filtrer les badges non utilisés
        const availableBadges = userStats.badges.filter(b => !b.used);
        
        if (availableBadges.length === 0) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Tous tes badges ont déjà été utilisés.\n\n💡 Achète de nouveaux badges dans la boutique !',
            show_alert: true
          });
          return;
        }
        
        // Récupérer le plug
        const plug = await Plug.findById(plugId);
        if (!plug) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Plug introuvable',
            show_alert: true
          });
          return;
        }
        
        // Créer le message avec les badges disponibles
        let message = `🎁 <b>OFFRIR UN BADGE À ${plug.name}</b>\n`;
        message += `━━━━━━━━━━━━━━━━\n\n`;
        message += `Choisis le badge à offrir:\n\n`;
        
        const keyboard = {
          inline_keyboard: []
        };
        
        // Lister les badges disponibles avec numéros
        availableBadges.forEach((badge, index) => {
          message += `${index + 1}. ${badge.emoji} ${badge.name}\n`;
          keyboard.inline_keyboard.push([
            { text: `${index + 1}. ${badge.emoji} ${badge.name}`, callback_data: `give_badge_${badge.badgeId}_to_${plugId}` }
          ]);
        });
        
        keyboard.inline_keyboard.push([
          { text: '🔙 Retour', callback_data: `plug_${plugId}` }
        ]);
        
        // Supprimer l'ancien message et envoyer le nouveau
        try {
          await bot.deleteMessage(chatId, messageId);
        } catch (e) {}
        
        await bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
        
      } catch (error) {
        console.error('Erreur give_badge_to:', error);
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: '❌ Erreur lors du chargement des badges',
          show_alert: true
        });
      }
    }
    
    // Donner un badge à un plug (confirmation)
    else if (data.startsWith('give_badge_') && data.includes('_to_')) {
      try {
        const parts = data.split('_to_');
        const badgeId = parts[0].replace('give_badge_', '');
        const plugId = parts[1];
        
        const UserStats = require('./models/UserStats');
        const BadgeConfig = require('./models/BadgeConfig');
        const PlugBadges = require('./models/PlugBadges');
        const Plug = require('./models/Plug');
        
        const userStats = await UserStats.findOne({ userId: callbackQuery.from.id });
        const badge = await BadgeConfig.findOne({ badgeId: badgeId });
        const plug = await Plug.findById(plugId);
        
        if (!badge || !plug) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Badge ou plug introuvable',
            show_alert: true
          });
          return;
        }
        
        // Vérifier que l'utilisateur possède ce badge
        const ownedBadge = userStats.badges && userStats.badges.find(b => b.badgeId === badgeId);
        if (!ownedBadge || ownedBadge.used) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Tu ne possèdes pas ce badge ou il a déjà été utilisé',
            show_alert: true
          });
          return;
        }
        
        // Marquer le badge comme utilisé
        ownedBadge.used = true;
        ownedBadge.usedFor = { plugId: plug._id, plugName: plug.name, usedAt: new Date() };
        await userStats.save();
        
        // Ajouter le badge au plug
        let plugBadges = await PlugBadges.findOne({ plugId: plug._id });
        if (!plugBadges) {
          plugBadges = new PlugBadges({ plugId: plug._id });
        }
        
        await plugBadges.addBadge(badge, {
          userId: callbackQuery.from.id,
          username: callbackQuery.from.username || 'Utilisateur'
        });
        
        // Message de confirmation
        let message = `🎉 <b>Badge offert avec succès !</b>\n\n`;
        message += `Tu as offert ${badge.emoji} <b>${badge.name}</b> à <b>${plug.name}</b>\n\n`;
        
        if (badge.shopRewards?.freeAdDays > 0) {
          message += `🎁 Le plug gagne ${badge.shopRewards.freeAdDays} jours de pub gratuite !\n`;
        }
        if (badge.shopRewards?.boostMultiplier > 1) {
          const boost = Math.round((badge.shopRewards.boostMultiplier - 1) * 100);
          message += `📈 Le plug gagne +${boost}% de visibilité !\n`;
        }
        
        message += `\n✨ Merci pour ton soutien !`;
        
        const keyboard = {
          inline_keyboard: [
            [{ text: '🏅 Mes badges', callback_data: 'my_badges' }],
            [{ text: '🛍️ Acheter d\'autres badges', callback_data: 'badge_shop_direct' }],
            [{ text: '🔙 Retour au menu', callback_data: 'main_menu' }]
          ]
        };
        
        try {
          await bot.deleteMessage(chatId, messageId);
        } catch (e) {}
        
        await bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
        
        callbackAnswered = true;
      } catch (error) {
        console.error('Erreur give_badge:', error);
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: '❌ Erreur lors du don du badge',
          show_alert: true
        });
        callbackAnswered = true;
      }
    }
    
    // ===== CALLBACK RETOUR AU MENU PRINCIPAL =====
    else if (data === 'back_to_main') {
      // Rediriger vers main_menu qui édite le message au lieu de le supprimer
      data = 'main_menu';
      // Le code de main_menu sera exécuté plus haut dans la condition
      // On doit donc re-traiter ce cas
      try {
        const { handleStart } = require('./handlers/startHandler');
        const mainMenu = await generateMainMenu(callbackQuery.from.id);
        
        await bot.editMessageText(mainMenu.message, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: mainMenu.keyboard
        });
      } catch (error) {
        // Si l'édition échoue, essayer de supprimer et créer un nouveau message
        try {
          await bot.deleteMessage(chatId, messageId);
          const { handleStart } = require('./handlers/startHandler');
          const fakeMessage = {
            chat: { id: chatId },
            from: callbackQuery.from,
            message_id: messageId
          };
          await handleStart(bot, fakeMessage);
        } catch (e) {
          console.error('Erreur back_to_main:', e);
        }
      }
    }
    
    // Callback déjà répondu au début, pas besoin de répondre à nouveau
    
  } catch (error) {
    console.error('Error handling callback query:', error);
    // Ne pas afficher de message d'erreur, callback déjà répondu au début
  }
});

// Commande /broadcastraw pour envoyer un message sans formatage HTML (VERSION SÉCURISÉE)
bot.onText(/\/broadcastraw (.+)/s, async (msg, match) => {
  const chatId = msg.chat.id;
  // Récupérer tout le message après /broadcastraw, y compris les sauts de ligne
  const fullText = msg.text || '';
  const message = fullText.replace(/^\/broadcastraw\s+/s, '');
  
  try {
    // Vérifier si l'utilisateur est admin via ADMIN_ID ou Settings
    const adminId = process.env.ADMIN_ID ? process.env.ADMIN_ID.trim() : null;
    const settings = await Settings.findOne();
    const settingsAdminIds = settings?.adminChatIds || [];
    
    // Vérifier si l'utilisateur est admin
    const isAdmin = (adminId && chatId.toString() === adminId) || settingsAdminIds.includes(chatId.toString());
    
    if (!isAdmin) {
      await bot.sendMessage(chatId, '❌ Vous n\'êtes pas autorisé à utiliser cette commande.');
      return;
    }
    
    // Récupérer TOUS les utilisateurs actifs (pas seulement ceux avec notifications)
    const users = await User.find({ 
      isActive: true,
      isBlocked: { $ne: true }
    }).select('telegramId username firstName');
    
    if (users.length === 0) {
      await bot.sendMessage(chatId, 
        '❌ Aucun utilisateur actif trouvé.'
      );
      return;
    }
    
    const totalUsers = users.length;
    
    // Envoyer un message de confirmation à l'admin
    await bot.sendMessage(chatId, 
      `📢 <b>BROADCAST - Protection Anti-Bannissement Activée</b>\n\n` +
      `👥 <b>Utilisateurs actifs :</b> ${totalUsers}\n` +
      `📝 <b>Message :</b> ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}\n\n` +
      `🛡️ <b>Protections actives :</b>\n` +
      `• Limite : 25 messages/seconde\n` +
      `• Délai : 50ms entre chaque envoi\n` +
      `• Batch : 20 messages puis pause 2s\n` +
      `• Gestion automatique des erreurs\n` +
      `• Retry intelligent avec backoff\n\n` +
      `⏳ <i>Envoi en cours en arrière-plan...</i>`,
      { parse_mode: 'HTML' }
    );
    
    // Préparer les messages pour la queue (sans parse_mode)
    const messages = users.map(user => ({
      chatId: user.telegramId,
      message: message,
      options: { 
        disable_web_page_preview: true 
      }
    }));
    
    // Ajouter tous les messages à la queue
    await messageQueue.addBatch(messages);
    
    // Attendre un peu pour avoir des stats initiales
    setTimeout(async () => {
      const stats = messageQueue.getStats();
      const estimatedTime = stats.queueLength > 0 
        ? Math.ceil((stats.queueLength / 25) + (stats.queueLength / 20 * 2)) 
        : 0;
      
      await bot.sendMessage(chatId,
        `📊 <b>Statistiques du Broadcast :</b>\n\n` +
        `📤 <b>Progression :</b>\n` +
        `• En attente : ${stats.queueLength}\n` +
        `• Envoyés : ${stats.totalSent}/${totalUsers}\n` +
        `• Échecs : ${stats.totalFailed}\n\n` +
        `⚡ <b>Performance :</b>\n` +
        `• Vitesse : ${stats.messagesPerMinute} msg/min\n` +
        `• Taux de succès : ${stats.successRate}\n` +
        `• Temps estimé : ~${estimatedTime}s\n\n` +
        `✅ <i>Le broadcast continue en arrière-plan de manière sécurisée.</i>`,
        { parse_mode: 'HTML' }
      );
    }, 5000);
    
    // Mise à jour des statistiques utilisateur
    for (const user of users) {
      await User.updateOne(
        { telegramId: user.telegramId },
        { 
          $set: { lastBroadcastReceived: new Date() },
          $inc: { broadcastsReceived: 1 }
        }
      );
    }
    
  } catch (error) {
    console.error('Erreur /broadcastraw:', error);
    await bot.sendMessage(chatId, '❌ Erreur lors de l\'envoi du message.');
  }
});

// Commande /config pour l'admin
bot.onText(/\/config/, async (msg) => {
  await handleAdminCommand(bot, msg);
});

// Gestion des messages texte
bot.on('message', async (msg) => {
  if (msg.text && (msg.text.startsWith('/start') || msg.text === '/config' || msg.text.startsWith('/broadcastraw'))) return;
  
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);
  
  if (userState && userState.type === 'vendor_application') {
    // Traiter les réponses du formulaire vendeur
    if (userState.step === 'social_links' ||
        userState.step === 'social_other' || 
        userState.step === 'delivery_zones' || 
        userState.step === 'shipping_zones' || 
        userState.step === 'meetup_zones' || 
        userState.step === 'base_location' || 
        userState.step === 'description') {
      // Supprimer le message de l'utilisateur
      try {
        await bot.deleteMessage(chatId, msg.message_id);
      } catch (e) {
        console.log('Impossible de supprimer le message utilisateur:', e.message);
      }
      await processVendorTextResponse(bot, chatId, msg.text, userState);
    }
  }
});

// Gestion des photos
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);
  
  if (userState && userState.type === 'vendor_application' && userState.step === 'photo') {
    const photo = msg.photo[msg.photo.length - 1];
    userState.data.photo = photo.file_id;
    userState.stepIndex++;
    userState.step = 'description';
    await handleVendorApplication(bot, chatId, userStates);
  }
});

// Fonction pour traiter les réponses texte du vendeur
async function processVendorTextResponse(bot, chatId, text, userState) {
  const { handleVendorApplication } = require('./handlers/vendorHandler');
  
  // Importer vendorSteps
  const vendorSteps = [
    'social_primary', 'social_links', 'social_other', 'methods', 'delivery_zones', 
    'shipping_zones', 'meetup_zones', 'base_location', 'photo', 
    'description', 'confirm'
  ];
  
  try {
    switch (userState.step) {
      case 'social_links':
        // Enregistrer le lien pour le réseau social actuel
        if (userState.currentNetwork) {
          if (!userState.data.socialNetworks.links) {
            userState.data.socialNetworks.links = {};
          }
          userState.data.socialNetworks.links[userState.currentNetwork] = text;
          delete userState.currentNetwork;
        }
        // handleVendorApplication gérera la transition vers le prochain réseau ou étape
        break;
      case 'social_other':
        userState.data.socialNetworks.others = text;
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        break;
      case 'delivery_zones':
        userState.data.deliveryZones = text;
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        break;
      case 'shipping_zones':
        userState.data.shippingZones = text;
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        break;
      case 'meetup_zones':
        userState.data.meetupZones = text;
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        break;
      case 'base_location':
        // Parser la localisation (pays, département, code postal)
        const parts = text.split(',').map(p => p.trim());
        if (parts[0]) userState.data.country = parts[0];
        if (parts[1]) userState.data.department = parts[1];
        if (parts[2]) userState.data.postalCode = parts[2];
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        break;
      case 'description':
        userState.data.description = text;
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        break;
    }
    
    // Envoyer un message de confirmation temporaire
    const confirmMsg = await bot.sendMessage(chatId, '✅ Réponse enregistrée');
    
    // Supprimer le message de confirmation après 2 secondes
    setTimeout(() => {
      bot.deleteMessage(chatId, confirmMsg.message_id).catch(() => {});
    }, 2000);
    
    // Continuer avec la prochaine étape
    await handleVendorApplication(bot, chatId, userStates);
  } catch (error) {
    console.error('Erreur dans processVendorTextResponse:', error);
    // Pas de message d'erreur visible pour l'utilisateur
  }
}

// Fonction pour soumettre la candidature vendeur
async function submitVendorApplication(bot, chatId, userState) {
  try {
    const user = await User.findOne({ telegramId: chatId });
    
    const application = new VendorApplication({
      userId: user._id,
      telegramId: chatId,
      username: user.username,
      socialNetworks: userState.data.socialNetworks,
      methods: userState.data.methods,
      deliveryZones: userState.data.deliveryZones,
      shippingZones: userState.data.shippingZones,
      meetupZones: userState.data.meetupZones,
      country: userState.data.country,
      department: userState.data.department,
      postalCode: userState.data.postalCode,
      photo: userState.data.photo,
      description: userState.data.description
    });
    
    await application.save();
    
    await bot.sendMessage(chatId, 
      '✅ <b>Candidature envoyée !</b>\n\n' +
      'Votre candidature a été soumise avec succès.\n' +
      'Un administrateur la validera dans les plus brefs délais.',
      { parse_mode: 'HTML' }
    );
    
    // Notifier les admins
    const settings = await Settings.findOne();
    if (settings && settings.adminChatIds) {
      for (const adminId of settings.adminChatIds) {
        await bot.sendMessage(adminId,
          `📥 <b>Nouvelle candidature vendeur</b>\n\n` +
          `De: @${user.username}\n` +
          `Pays: ${userState.data.country}\n` +
          `Département: ${userState.data.department}`,
          { parse_mode: 'HTML' }
        );
      }
    }
    
    await showMainMenu(bot, chatId);
  } catch (error) {
    console.error('Error submitting vendor application:', error);
    // Pas de message d'erreur visible pour l'utilisateur
    await showMainMenu(bot, chatId);
  }
}

// Gestion des erreurs
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

// Log de démarrage
console.log('🤖 Bot is starting...');
console.log('📍 Environment:', {
  mongoUri: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
  botToken: process.env.TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Missing',
  webAppUrl: process.env.WEB_APP_URL || 'Using default'
});

// Vérifier la connexion MongoDB
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

console.log('🤖 Bot is running...');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

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
  const webhookPath = `/bot${process.env.TELEGRAM_BOT_TOKEN}`;
  const webhookUrl = `${process.env.WEBHOOK_URL || 'https://plgscrtf.onrender.com'}${webhookPath}`;
  
  // Définir le webhook après un court délai pour s'assurer que le serveur est prêt
  setTimeout(() => {
    bot.setWebHook(webhookUrl).then(() => {
      console.log(`✅ Webhook configuré avec succès`);
      console.log(`📍 URL: ${process.env.WEBHOOK_URL || 'https://plgscrtf.onrender.com'}/bot${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
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

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Serveur Express avec API
const app = express();
app.use(cors());
app.use(express.json());

// API pour vérifier que le bot fonctionne
app.get('/', (req, res) => {
  res.send('Bot is running! 🤖');
});

// API pour envoyer des messages broadcast
app.post('/api/broadcast', async (req, res) => {
  try {
    const { message, userIds } = req.body;
    const apiKey = req.headers['x-api-key'];
    
    // Vérifier la clé API
    if (apiKey !== process.env.BOT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!message || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    let sent = 0;
    let failed = 0;
    
    // Envoyer le message à chaque utilisateur
    for (const telegramId of userIds) {
      try {
        await bot.sendMessage(telegramId, message, { parse_mode: 'HTML' });
        sent++;
      } catch (error) {
        console.error(`Failed to send to ${telegramId}:`, error.message);
        failed++;
      }
    }
    
    res.json({ success: true, sent, failed });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API webhook pour les notifications de changements
app.post('/api/webhook/update', async (req, res) => {
  try {
    const { type, action, data } = req.body;
    const apiKey = req.headers['x-api-key'];
    
    // Vérifier la clé API
    if (apiKey !== process.env.BOT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Récupérer tous les utilisateurs actifs
    const users = await User.find({ isActive: { $ne: false } });
    
    let message = '';
    
    switch (type) {
      case 'plug':
        if (action === 'create') {
          message = `🎉 <b>Nouveau PLUG disponible !</b>\n\n` +
                   `🔌 <b>${data.name}</b>\n` +
                   `📍 ${data.countryFlag} ${data.department || 'National'}\n\n` +
                   `Découvrez-le maintenant dans /start → PLUGS CRTFS`;
        } else if (action === 'update') {
          message = `📢 <b>PLUG mis à jour !</b>\n\n` +
                   `🔌 <b>${data.name}</b> a été modifié\n` +
                   `Consultez les nouveautés dans /start → PLUGS CRTFS`;
        } else if (action === 'delete') {
          message = `⚠️ <b>PLUG retiré</b>\n\n` +
                   `Le PLUG "${data.name}" n'est plus disponible.`;
        }
        break;
        
      case 'settings':
        // Ne pas notifier pour les changements de paramètres
        return res.json({ success: true, notified: false });
        
      default:
        return res.status(400).json({ error: 'Unknown notification type' });
    }
    
    if (message) {
      let sent = 0;
      let failed = 0;
      
      // Envoyer la notification à tous les utilisateurs
      for (const user of users) {
        try {
          await bot.sendMessage(user.telegramId, message, { parse_mode: 'HTML' });
          sent++;
        } catch (error) {
          console.error(`Failed to notify ${user.telegramId}:`, error.message);
          failed++;
        }
      }
      
      res.json({ success: true, sent, failed });
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

app.listen(PORT, () => {
  console.log(`🌐 Server listening on port ${PORT}`);
});

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

// Gestion des callback queries (IMPORTANT: éviter les doublons)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  
  // Répondre immédiatement à la callback query pour éviter le chargement infini
  await bot.answerCallbackQuery(callbackQuery.id);
  
  try {
    // Vérifier d'abord si c'est une callback admin
    const isAdminCallback = await handleAdminCallbacks(bot, callbackQuery);
    if (isAdminCallback) return;
    
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
          text: '‼️ IMPORTANT DE REJOINDRE POUR VOIR LES MENUS ‼️\n\nCORDIALEMENT PLUGS CRTFS',
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
      const message = settings?.welcomeMessage || 'Bienvenue sur PLUGS CRTFS !';
      
      // Envoyer avec l'image d'accueil si elle existe
      if (settings?.welcomeImage) {
        try {
          await bot.sendPhoto(chatId, settings.welcomeImage, {
            caption: `ℹ️ <b>Informations</b>\n\n${message}`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ Retour', callback_data: 'main_menu' }]]
            }
          });
        } catch (error) {
          console.error('Erreur envoi image:', error);
          // Si l'image échoue, envoyer juste le message
          await bot.sendMessage(chatId, `ℹ️ <b>Informations</b>\n\n${message}`, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ Retour', callback_data: 'main_menu' }]]
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, `ℹ️ <b>Informations</b>\n\n${message}`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ Retour', callback_data: 'main_menu' }]]
          }
        });
      }
    }
    
    // Ajouter contact/réseaux
    else if (data === 'add_contact') {
      await bot.deleteMessage(chatId, messageId);
      await handleVendorApplication(bot, chatId, userStates);
    }
    
    // PLUGS CRTFS
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
    
    // Top Parrains
    else if (data === 'referrals' || data === 'top_referrals') {
      await bot.deleteMessage(chatId, messageId);
      await handleReferralMenu(bot, chatId);
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
    
    // Callback pour le séparateur (ne rien faire)
    else if (data === 'separator') {
      // Ne rien faire, juste répondre à la callback
      return;
    }
    
    // Callback pour le cooldown (afficher le message de cooldown)
    else if (data.startsWith('cooldown_')) {
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
  } catch (error) {
    console.error('Error handling callback query:', error);
    // Pas de message d'erreur visible pour l'utilisateur
  }
});

// Commande /config pour l'admin
bot.onText(/\/config/, async (msg) => {
  await handleAdminCommand(bot, msg);
});

// Gestion des messages texte
bot.on('message', async (msg) => {
  if (msg.text && (msg.text.startsWith('/start') || msg.text === '/config')) return;
  
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
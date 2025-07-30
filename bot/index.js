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

// Configuration du bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Gestion des erreurs de polling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code);
  if (error.code === 'ETELEGRAM' && error.response.body.error_code === 409) {
    console.log('⚠️ Another instance is running. Waiting...');
  }
});

// Nettoyer les webhooks au démarrage
bot.deleteWebHook().then(() => {
  console.log('✅ Webhook cleared, starting polling...');
}).catch(err => {
  console.log('⚠️ Error clearing webhook:', err.message);
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server listening on port ${PORT}`);
});

// Commande /start avec gestion des références
bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const param = match[1].trim();
  
  await handleStart(bot, msg, param);
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
    // Menu principal
    if (data === 'main_menu') {
      await bot.deleteMessage(chatId, messageId);
      await showMainMenu(bot, chatId);
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
      await bot.deleteMessage(chatId, messageId);
      await handlePlugsMenu(bot, chatId);
    }
    
    // Top Parrains
    else if (data === 'referrals') {
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
    
    // Détails d'un plug
    else if (data.startsWith('plug_')) {
      const plugId = data.replace('plug_', '');
      await bot.deleteMessage(chatId, messageId);
      await handlePlugDetails(bot, chatId, plugId);
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
      else {
        // Autres actions vendeur (back, skip, cancel, next)
        await bot.deleteMessage(chatId, messageId);
        await handleVendorApplication(bot, chatId, userStates, data.replace('vendor_', ''));
      }
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue. Veuillez réessayer.');
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
    if (userState.step === 'social_other' || userState.step === 'postal_code' || userState.step === 'description') {
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
  switch (userState.step) {
    case 'social_other':
      userState.data.socialNetworks.others = text;
      userState.stepIndex++;
      userState.step = 'methods';
      break;
    case 'postal_code':
      userState.data.postalCode = text;
      userState.stepIndex++;
      userState.step = 'photo';
      break;
    case 'description':
      userState.data.description = text;
      userState.stepIndex++;
      userState.step = 'confirm';
      break;
  }
  
  await handleVendorApplication(bot, chatId, userStates);
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
      location: {
        country: userState.data.country,
        department: userState.data.department,
        postalCode: userState.data.postalCode
      },
      shopPhoto: userState.data.photo,
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
    await bot.sendMessage(chatId, '❌ Erreur lors de l\'envoi de la candidature.');
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
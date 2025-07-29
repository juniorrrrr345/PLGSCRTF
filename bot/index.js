require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const http = require('http');

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
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// État des utilisateurs pour les formulaires
const userStates = new Map();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Serveur HTTP simple pour Render
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running! 🤖');
});

server.listen(PORT, () => {
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
      
      await bot.sendMessage(chatId, `ℹ️ <b>Informations</b>\n\n${message}`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: '⬅️ Retour', callback_data: 'main_menu' }]]
        }
      });
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
    
    // Top Referrals
    else if (data === 'referrals') {
      await bot.deleteMessage(chatId, messageId);
      await handleReferralMenu(bot, chatId);
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

console.log('🤖 Bot is running...');
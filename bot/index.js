require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('./models/User');
const Plug = require('./models/Plug');
const Settings = require('./models/Settings');
const VendorApplication = require('./models/VendorApplication');
const { handleStart } = require('./handlers/startHandler');
const { handlePlugsMenu } = require('./handlers/plugsHandler');
const { handleVendorApplication } = require('./handlers/vendorHandler');
const { handleAdminPanel } = require('./handlers/adminHandler');
const { handleReferralRanking } = require('./handlers/referralHandler');

// Configuration du bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Initialisation des settings par défaut
async function initializeSettings() {
  const settings = await Settings.findOne();
  if (!settings) {
    await Settings.create({
      countries: [
        {
          code: 'FR',
          name: 'France',
          flag: '🇫🇷',
          departments: [
            { code: '75', name: 'Paris' },
            { code: '13', name: 'Bouches-du-Rhône' },
            { code: '69', name: 'Rhône' },
            { code: '06', name: 'Alpes-Maritimes' },
            { code: '31', name: 'Haute-Garonne' }
          ]
        },
        {
          code: 'BE',
          name: 'Belgique',
          flag: '🇧🇪',
          departments: [
            { code: 'BRU', name: 'Bruxelles' },
            { code: 'ANT', name: 'Anvers' },
            { code: 'LIE', name: 'Liège' }
          ]
        },
        {
          code: 'CH',
          name: 'Suisse',
          flag: '🇨🇭',
          departments: [
            { code: 'GE', name: 'Genève' },
            { code: 'VD', name: 'Vaud' },
            { code: 'ZH', name: 'Zurich' }
          ]
        }
      ]
    });
    console.log('✅ Default settings initialized');
  }
}

initializeSettings();

// Stockage des états utilisateurs pour le questionnaire
const userStates = new Map();

// Commande /start avec gestion du parrainage
bot.onText(/\/start(?:\s+ref_(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const referralId = match[1];
  
  await handleStart(bot, msg, referralId, userStates);
});

// Menu principal
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  
  try {
    // Supprimer le message précédent pour garder le chat propre
    await bot.deleteMessage(chatId, messageId).catch(() => {});
    
    switch (data) {
      case 'info':
        await handleInfoButton(bot, chatId);
        break;
        
      case 'social':
        await handleSocialButton(bot, chatId);
        break;
        
      case 'plugs':
        await handlePlugsMenu(bot, chatId);
        break;
        
      case 'top_referrals':
        await handleReferralRanking(bot, chatId);
        break;
        
      case 'vendor_form':
        await handleVendorApplication(bot, chatId, userStates);
        break;
        
      case 'back_to_menu':
        await showMainMenu(bot, chatId);
        break;
        
      default:
        // Gestion des callbacks spécifiques
        if (data.startsWith('plug_')) {
          await handlePlugDetails(bot, chatId, data);
        } else if (data.startsWith('like_')) {
          await handleLike(bot, chatId, data, callbackQuery);
        } else if (data.startsWith('vendor_')) {
          await handleVendorApplication(bot, chatId, userStates, data);
        }
    }
    
    // Répondre au callback pour enlever l'icône de chargement
    await bot.answerCallbackQuery(callbackQuery.id);
    
  } catch (error) {
    console.error('Callback error:', error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ Une erreur est survenue',
      show_alert: true
    });
  }
});

// Commande /config pour l'admin
bot.onText(/\/config/, async (msg) => {
  await handleAdminPanel(bot, msg);
});

// Fonction pour afficher le menu principal
async function showMainMenu(bot, chatId) {
  const settings = await Settings.findOne();
  const userCount = await User.countDocuments();
  const plugCount = await Plug.countDocuments({ isActive: true });
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '📋 Informations', callback_data: 'info' }],
      [{ text: '📱 Réseaux sociaux', callback_data: 'social' }],
      [{ text: '🔌 PLUGS CRTFS', callback_data: 'plugs' }],
      [{ text: '🏆 Top Parrains', callback_data: 'top_referrals' }],
      [{ text: '📝 Devenir vendeur', callback_data: 'vendor_form' }]
    ]
  };
  
  let message = settings.welcomeMessage + '\n\n';
  message += `👥 Utilisateurs: ${userCount}\n`;
  message += `🔌 Plugs actifs: ${plugCount}`;
  
  if (settings.welcomeImage) {
    await bot.sendPhoto(chatId, settings.welcomeImage, {
      caption: message,
      reply_markup: keyboard
    });
  } else {
    await bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
  }
}

// Handler pour le bouton Info
async function handleInfoButton(bot, chatId) {
  const settings = await Settings.findOne();
  const keyboard = {
    inline_keyboard: [
      [{ text: '⬅️ Retour', callback_data: 'back_to_menu' }]
    ]
  };
  
  await bot.sendMessage(chatId, settings.infoText || 'Aucune information disponible', {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Handler pour le bouton Réseaux sociaux
async function handleSocialButton(bot, chatId) {
  const settings = await Settings.findOne();
  let message = '📱 <b>Nos réseaux sociaux</b>\n\n';
  
  const networks = [
    { key: 'snap', emoji: '👻', name: 'Snapchat' },
    { key: 'instagram', emoji: '📸', name: 'Instagram' },
    { key: 'whatsapp', emoji: '💬', name: 'WhatsApp' },
    { key: 'signal', emoji: '🔐', name: 'Signal' },
    { key: 'threema', emoji: '🔒', name: 'Threema' },
    { key: 'potato', emoji: '🥔', name: 'Potato' },
    { key: 'telegram', emoji: '✈️', name: 'Telegram' }
  ];
  
  for (const network of networks) {
    if (settings.socialNetworks?.[network.key]) {
      message += `${network.emoji} <b>${network.name}:</b> ${settings.socialNetworks[network.key]}\n`;
    }
  }
  
  if (settings.socialNetworks?.other) {
    message += `\n📌 <b>Autres:</b> ${settings.socialNetworks.other}`;
  }
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '⬅️ Retour', callback_data: 'back_to_menu' }]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Handler pour les détails d'un plug
async function handlePlugDetails(bot, chatId, data) {
  const plugId = data.replace('plug_', '');
  const plug = await Plug.findById(plugId);
  
  if (!plug) {
    await bot.sendMessage(chatId, '❌ Plug introuvable');
    return;
  }
  
  // Générer le lien de parrainage si nécessaire
  if (!plug.referralLink) {
    plug.referralLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME || 'YourBotUsername'}?start=ref_${plugId}`;
    await plug.save();
  }
  
  let message = `🔌 <b>${plug.name}</b>\n\n`;
  
  if (plug.country && plug.department) {
    message += `📍 ${plug.countryFlag} ${plug.country} - ${plug.department}\n`;
  }
  
  message += '\n📦 <b>Méthodes:</b>\n';
  if (plug.methods.delivery) message += '✅ Livraison\n';
  if (plug.methods.shipping) message += '✅ Envoi\n';
  if (plug.methods.meetup) message += '✅ Meetup\n';
  
  if (plug.description) {
    message += `\n📝 <b>Description:</b>\n${plug.description}\n`;
  }
  
  message += '\n📱 <b>Contact:</b>\n';
  const networks = [
    { key: 'snap', emoji: '👻' },
    { key: 'instagram', emoji: '📸' },
    { key: 'whatsapp', emoji: '💬' },
    { key: 'signal', emoji: '🔐' },
    { key: 'telegram', emoji: '✈️' }
  ];
  
  for (const network of networks) {
    if (plug.socialNetworks?.[network.key]) {
      message += `${network.emoji} ${plug.socialNetworks[network.key]}\n`;
    }
  }
  
  message += `\n❤️ ${plug.likes} likes`;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: `❤️ Liker (${plug.likes})`, callback_data: `like_${plugId}` }],
      [{ text: '🔗 Parrainer', url: plug.referralLink }],
      [{ text: '⬅️ Retour aux plugs', callback_data: 'plugs' }]
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
}

// Handler pour les likes
async function handleLike(bot, chatId, data, callbackQuery) {
  const plugId = data.replace('like_', '');
  const user = await User.findOne({ telegramId: chatId.toString() });
  
  if (!user) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ Utilisateur non trouvé',
      show_alert: true
    });
    return;
  }
  
  // Vérifier le cooldown de 30 minutes
  const now = new Date();
  if (user.lastLikeAt) {
    const timeDiff = now - user.lastLikeAt;
    const minutesLeft = Math.ceil((30 * 60 * 1000 - timeDiff) / 60000);
    
    if (minutesLeft > 0) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: `⏰ Vous pourrez liker dans ${minutesLeft} minutes`,
        show_alert: true
      });
      return;
    }
  }
  
  // Ajouter le like
  await Plug.findByIdAndUpdate(plugId, { $inc: { likes: 1 } });
  
  // Mettre à jour l'utilisateur
  user.lastLikeAt = now;
  user.likedPlugs.push({ plugId, likedAt: now });
  await user.save();
  
  await bot.answerCallbackQuery(callbackQuery.id, {
    text: '❤️ Like ajouté !',
    show_alert: false
  });
  
  // Rafraîchir l'affichage
  await handlePlugDetails(bot, chatId, `plug_${plugId}`);
}

// Gestion des messages texte pour le questionnaire vendeur
bot.on('message', async (msg) => {
  if (msg.text?.startsWith('/')) return; // Ignorer les commandes
  
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);
  
  if (userState && userState.type === 'vendor_application') {
    await handleVendorApplication(bot, chatId, userStates, null, msg);
  }
});

// Gestion des photos pour le questionnaire
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);
  
  if (userState && userState.type === 'vendor_application' && userState.step === 'photo') {
    const photo = msg.photo[msg.photo.length - 1];
    userState.data.photo = photo.file_id;
    await handleVendorApplication(bot, chatId, userStates, 'vendor_next');
  }
});

// Export pour les tests
module.exports = { bot, showMainMenu };
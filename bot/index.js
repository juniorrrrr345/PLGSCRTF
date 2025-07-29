require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const http = require('http');
const User = require('./models/User');
const Plug = require('./models/Plug');
const Settings = require('./models/Settings');
const VendorApplication = require('./models/VendorApplication');

// Configuration du bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Serveur HTTP pour Render
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running! 🤖');
});

server.listen(PORT, () => {
  console.log(`🌐 Server listening on port ${PORT}`);
});

// Stockage des états utilisateurs
const userStates = new Map();

// Commande /start avec gestion du parrainage
bot.onText(/\/start(?:\s+ref_(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const referralId = match[1];
  const messageId = msg.message_id;
  
  try {
    // Supprimer le message de commande
    await bot.deleteMessage(chatId, messageId).catch(() => {});
    
    // Vérifier ou créer l'utilisateur
    let user = await User.findOne({ telegramId });
    
    if (!user) {
      user = new User({
        telegramId,
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name
      });
      
      // Gestion du parrainage
      if (referralId) {
        const referringPlug = await Plug.findById(referralId);
        if (referringPlug && !user.hasBeenCountedAsReferral) {
          user.referredBy = referralId;
          user.hasBeenCountedAsReferral = true;
          await Plug.findByIdAndUpdate(referralId, { $inc: { referralCount: 1 } });
        }
      }
      
      await user.save();
    }
    
    await showMainMenu(bot, chatId);
  } catch (error) {
    console.error('Start error:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue.');
  }
});

// Fonction pour afficher le menu principal
async function showMainMenu(bot, chatId) {
  const settings = await Settings.findOne() || {};
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
  
  let message = settings.welcomeMessage || 'Bienvenue sur PLUGS CRTFS ! 🔌';
  message += '\n\n';
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

// Gestion des callbacks
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  
  try {
    // Supprimer le message précédent
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
        await handleTopReferrals(bot, chatId);
        break;
        
      case 'vendor_form':
        await handleVendorForm(bot, chatId);
        break;
        
      case 'back_to_menu':
        await showMainMenu(bot, chatId);
        break;
        
      default:
        if (data.startsWith('plug_')) {
          await handlePlugDetails(bot, chatId, data);
        } else if (data.startsWith('like_')) {
          await handleLike(bot, chatId, data, callbackQuery);
        } else if (data === 'plugs_all') {
          await showPlugsList(bot, chatId);
        } else if (data.startsWith('plugs_country_')) {
          const country = data.replace('plugs_country_', '');
          await showPlugsList(bot, chatId, country);
        } else if (data === 'referrals_all') {
          await showReferralsList(bot, chatId);
        } else if (data.startsWith('referrals_country_')) {
          const country = data.replace('referrals_country_', '');
          await showReferralsList(bot, chatId, country);
        } else if (data.startsWith('vendor_')) {
          await handleVendorCallback(bot, chatId, data, callbackQuery);
        }
    }
    
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error('Callback error:', error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ Une erreur est survenue',
      show_alert: true
    });
  }
});

// Handler pour le bouton Info
async function handleInfoButton(bot, chatId) {
  const settings = await Settings.findOne() || {};
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

// Handler pour les réseaux sociaux
async function handleSocialButton(bot, chatId) {
  const settings = await Settings.findOne() || {};
  let message = '📱 <b>Nos réseaux sociaux</b>\n━━━━━━━━━━━━━━━━\n\n';
  
  const networks = [
    { key: 'snap', emoji: '👻', name: 'Snapchat' },
    { key: 'instagram', emoji: '📸', name: 'Instagram' },
    { key: 'whatsapp', emoji: '💬', name: 'WhatsApp' },
    { key: 'signal', emoji: '🔐', name: 'Signal' },
    { key: 'threema', emoji: '🔒', name: 'Threema' },
    { key: 'potato', emoji: '🥔', name: 'Potato' },
    { key: 'telegram', emoji: '✈️', name: 'Telegram' }
  ];
  
  const keyboard = { inline_keyboard: [] };
  
  for (const network of networks) {
    if (settings.socialNetworks?.[network.key]) {
      keyboard.inline_keyboard.push([{
        text: `${network.emoji} ${network.name}`,
        url: `https://t.me/${settings.socialNetworks[network.key]}`
      }]);
    }
  }
  
  keyboard.inline_keyboard.push([{ text: '⬅️ Retour', callback_data: 'back_to_menu' }]);
  
  await bot.sendMessage(chatId, message + 'Cliquez sur un réseau pour nous contacter', {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Handler pour la liste des plugs
async function handlePlugsMenu(bot, chatId) {
  // Afficher d'abord le menu de sélection par pays
  const countries = await Plug.distinct('country', { isActive: true, country: { $exists: true, $ne: null } });
  
  if (countries.length === 0) {
    // Si aucun pays, afficher tous les plugs
    await showPlugsList(bot, chatId);
    return;
  }
  
  let message = '🌍 <b>Sélectionnez un pays</b>\n━━━━━━━━━━━━━━━━\n\n';
  const keyboard = { inline_keyboard: [] };
  
  // Ajouter un bouton pour voir tous les plugs
  keyboard.inline_keyboard.push([{
    text: '🌐 Tous les pays',
    callback_data: 'plugs_all'
  }]);
  
  // Ajouter les boutons pour chaque pays
  for (const country of countries.sort()) {
    const plugsInCountry = await Plug.countDocuments({ isActive: true, country });
    const countryFlag = (await Plug.findOne({ country }))?.countryFlag || '🏳️';
    
    keyboard.inline_keyboard.push([{
      text: `${countryFlag} ${country} (${plugsInCountry})`,
      callback_data: `plugs_country_${country}`
    }]);
  }
  
  keyboard.inline_keyboard.push([{ text: '⬅️ Retour', callback_data: 'back_to_menu' }]);
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Fonction pour afficher la liste des plugs (filtrée ou non)
async function showPlugsList(bot, chatId, country = null) {
  const filter = { isActive: true };
  if (country) {
    filter.country = country;
  }
  
  const plugs = await Plug.find(filter).sort({ likes: -1 }).limit(20);
  
  if (plugs.length === 0) {
    await bot.sendMessage(chatId, '❌ Aucun plug disponible', {
      reply_markup: {
        inline_keyboard: [[{ text: '⬅️ Retour', callback_data: 'plugs' }]]
      }
    });
    return;
  }
  
  let message = '🔌 <b>PLUGS CRTFS</b>\n';
  if (country) {
    const countryFlag = plugs[0]?.countryFlag || '🏳️';
    message += `📍 ${countryFlag} ${country}\n`;
  }
  message += '━━━━━━━━━━━━━━━━\n\n';
  
  const keyboard = { inline_keyboard: [] };
  
  plugs.forEach((plug, index) => {
    let emoji = '';
    if (index === 0) emoji = '🥇 ';
    else if (index === 1) emoji = '🥈 ';
    else if (index === 2) emoji = '🥉 ';
    
    keyboard.inline_keyboard.push([{
      text: `${emoji}${plug.name} (❤️ ${plug.likes})`,
      callback_data: `plug_${plug._id}`
    }]);
  });
  
  keyboard.inline_keyboard.push([{ text: '⬅️ Retour', callback_data: 'plugs' }]);
  
  await bot.sendMessage(chatId, message + '👆 Cliquez sur un plug pour voir les détails', {
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
  
  // Générer le lien de parrainage
  if (!plug.referralLink) {
    plug.referralLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=ref_${plugId}`;
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

// Handler pour le top des parrains
async function handleTopReferrals(bot, chatId) {
  // Afficher d'abord le menu de sélection par pays
  const countries = await Plug.distinct('country', { 
    isActive: true, 
    referralCount: { $gt: 0 },
    country: { $exists: true, $ne: null } 
  });
  
  if (countries.length === 0) {
    // Si aucun pays, afficher tous les parrains
    await showReferralsList(bot, chatId);
    return;
  }
  
  let message = '🌍 <b>Sélectionnez un pays</b>\n━━━━━━━━━━━━━━━━\n\n';
  const keyboard = { inline_keyboard: [] };
  
  // Ajouter un bouton pour voir tous les parrains
  keyboard.inline_keyboard.push([{
    text: '🌐 Tous les pays',
    callback_data: 'referrals_all'
  }]);
  
  // Ajouter les boutons pour chaque pays
  for (const country of countries.sort()) {
    const plugsInCountry = await Plug.countDocuments({ 
      isActive: true, 
      country,
      referralCount: { $gt: 0 }
    });
    const countryFlag = (await Plug.findOne({ country }))?.countryFlag || '🏳️';
    
    keyboard.inline_keyboard.push([{
      text: `${countryFlag} ${country} (${plugsInCountry})`,
      callback_data: `referrals_country_${country}`
    }]);
  }
  
  keyboard.inline_keyboard.push([{ text: '⬅️ Retour', callback_data: 'back_to_menu' }]);
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Fonction pour afficher la liste des parrains (filtrée ou non)
async function showReferralsList(bot, chatId, country = null) {
  const filter = { isActive: true, referralCount: { $gt: 0 } };
  if (country) {
    filter.country = country;
  }
  
  const plugs = await Plug.find(filter).sort({ referralCount: -1 }).limit(20);
  
  if (plugs.length === 0) {
    await bot.sendMessage(chatId, '📊 Aucun parrainage pour le moment', {
      reply_markup: {
        inline_keyboard: [[{ text: '⬅️ Retour', callback_data: 'top_referrals' }]]
      }
    });
    return;
  }
  
  let message = '🏆 <b>TOP PARRAINS</b>\n';
  if (country) {
    const countryFlag = plugs[0]?.countryFlag || '🏳️';
    message += `📍 ${countryFlag} ${country}\n`;
  }
  message += '━━━━━━━━━━━━━━━━\n\n';
  
  const keyboard = { inline_keyboard: [] };
  
  plugs.forEach((plug, index) => {
    let emoji = '';
    if (index === 0) emoji = '👑 ';
    else if (index === 1) emoji = '🥈 ';
    else if (index === 2) emoji = '🥉 ';
    
    keyboard.inline_keyboard.push([{
      text: `${emoji}${plug.name} (👥 ${plug.referralCount} filleuls)`,
      callback_data: `plug_${plug._id}`
    }]);
  });
  
  keyboard.inline_keyboard.push([{ text: '⬅️ Retour', callback_data: 'top_referrals' }]);
  
  await bot.sendMessage(chatId, message + '👆 Cliquez sur un parrain pour voir les détails', {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Handler pour le formulaire vendeur
async function handleVendorForm(bot, chatId) {
  const telegramId = chatId.toString();
  
  // Initialiser l'état du questionnaire
  userStates.set(telegramId, {
    type: 'vendor_form',
    step: 1,
    data: {
      telegramId,
      socialNetworks: {},
      methods: {}
    }
  });
  
  await showVendorQuestion(bot, chatId, 1);
}

// Afficher une question du formulaire vendeur
async function showVendorQuestion(bot, chatId, step, messageId = null) {
  const telegramId = chatId.toString();
  const state = userStates.get(telegramId);
  
  if (!state || state.type !== 'vendor_form') return;
  
  // Supprimer le message précédent si fourni
  if (messageId) {
    await bot.deleteMessage(chatId, messageId).catch(() => {});
  }
  
  let message = '';
  let keyboard = { inline_keyboard: [] };
  
  switch (step) {
    case 1: // Réseaux sociaux principaux
      message = '📱 <b>Question 1/8</b>\n\nQuels réseaux sociaux utilisez-vous ?\n\n<i>Sélectionnez tous ceux que vous utilisez</i>';
      
      const networks = [
        { key: 'snap', emoji: '👻', name: 'Snapchat' },
        { key: 'instagram', emoji: '📸', name: 'Instagram' },
        { key: 'whatsapp', emoji: '💬', name: 'WhatsApp' },
        { key: 'telegram', emoji: '✈️', name: 'Telegram' }
      ];
      
      for (const network of networks) {
        const isSelected = state.data.socialNetworks[network.key] !== undefined;
        keyboard.inline_keyboard.push([{
          text: `${isSelected ? '✅' : '⬜'} ${network.emoji} ${network.name}`,
          callback_data: `vendor_toggle_${network.key}`
        }]);
      }
      
      keyboard.inline_keyboard.push([
        { text: '⏭ Suivant', callback_data: 'vendor_next' }
      ]);
      break;
      
    case 2: // Autres réseaux
      message = '📱 <b>Question 2/8</b>\n\nUtilisez-vous d\'autres réseaux ?\n\n<i>Sélectionnez si applicable</i>';
      
      const otherNetworks = [
        { key: 'signal', emoji: '🔐', name: 'Signal' },
        { key: 'threema', emoji: '🔒', name: 'Threema' },
        { key: 'potato', emoji: '🥔', name: 'Potato' }
      ];
      
      for (const network of otherNetworks) {
        const isSelected = state.data.socialNetworks[network.key] !== undefined;
        keyboard.inline_keyboard.push([{
          text: `${isSelected ? '✅' : '⬜'} ${network.emoji} ${network.name}`,
          callback_data: `vendor_toggle_${network.key}`
        }]);
      }
      
      keyboard.inline_keyboard.push([
        { text: '⬅ Retour', callback_data: 'vendor_back' },
        { text: '⏭ Suivant', callback_data: 'vendor_next' }
      ]);
      break;
      
    case 3: // Méthodes de vente
      message = '📦 <b>Question 3/8</b>\n\nQuelles méthodes de vente proposez-vous ?\n\n<i>Sélectionnez toutes les méthodes disponibles</i>';
      
      const methods = [
        { key: 'delivery', emoji: '🚚', name: 'Livraison' },
        { key: 'shipping', emoji: '📮', name: 'Envoi' },
        { key: 'meetup', emoji: '🤝', name: 'Meetup' }
      ];
      
      for (const method of methods) {
        const isSelected = state.data.methods[method.key] === true;
        keyboard.inline_keyboard.push([{
          text: `${isSelected ? '✅' : '⬜'} ${method.emoji} ${method.name}`,
          callback_data: `vendor_method_${method.key}`
        }]);
      }
      
      keyboard.inline_keyboard.push([
        { text: '⬅ Retour', callback_data: 'vendor_back' },
        { text: '⏭ Suivant', callback_data: 'vendor_next' }
      ]);
      break;
      
    case 4: // Pays
      message = '🌍 <b>Question 4/8</b>\n\nDans quel pays êtes-vous ?\n\n<i>Sélectionnez votre pays</i>';
      
      const countries = [
        { name: 'France', flag: '🇫🇷' },
        { name: 'Belgique', flag: '🇧🇪' },
        { name: 'Suisse', flag: '🇨🇭' },
        { name: 'Luxembourg', flag: '🇱🇺' },
        { name: 'Canada', flag: '🇨🇦' }
      ];
      
      for (const country of countries) {
        keyboard.inline_keyboard.push([{
          text: `${country.flag} ${country.name}`,
          callback_data: `vendor_country_${country.name}_${country.flag}`
        }]);
      }
      
      keyboard.inline_keyboard.push([
        { text: '⬅ Retour', callback_data: 'vendor_back' }
      ]);
      break;
      
    case 5: // Département
      message = '📍 <b>Question 5/8</b>\n\nQuel est votre département ?\n\n<i>Entrez le numéro ou le nom de votre département</i>';
      
      keyboard.inline_keyboard.push([
        { text: '⬅ Retour', callback_data: 'vendor_back' },
        { text: '⏭ Passer', callback_data: 'vendor_skip' }
      ]);
      
      state.waitingForText = true;
      state.textType = 'department';
      break;
      
    case 6: // Code postal
      message = '📮 <b>Question 6/8</b>\n\nQuel est votre code postal ?\n\n<i>Entrez votre code postal ou choisissez une grande ville</i>';
      
      const cities = [
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice',
        'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'
      ];
      
      const cityRows = [];
      for (let i = 0; i < cities.length; i += 2) {
        const row = [{ text: cities[i], callback_data: `vendor_city_${cities[i]}` }];
        if (cities[i + 1]) {
          row.push({ text: cities[i + 1], callback_data: `vendor_city_${cities[i + 1]}` });
        }
        cityRows.push(row);
      }
      
      keyboard.inline_keyboard.push(...cityRows);
      keyboard.inline_keyboard.push([
        { text: '⬅ Retour', callback_data: 'vendor_back' },
        { text: '⏭ Passer', callback_data: 'vendor_skip' }
      ]);
      
      state.waitingForText = true;
      state.textType = 'postalCode';
      break;
      
    case 7: // Photo
      message = '📸 <b>Question 7/8</b>\n\nEnvoyez une photo de votre boutique\n\n<i>Cette photo sera visible sur votre profil vendeur</i>';
      
      keyboard.inline_keyboard.push([
        { text: '⬅ Retour', callback_data: 'vendor_back' },
        { text: '⏭ Passer', callback_data: 'vendor_skip' }
      ]);
      
      state.waitingForPhoto = true;
      break;
      
    case 8: // Description
      message = '📝 <b>Question 8/8</b>\n\nDécrivez votre service\n\n<i>Présentez ce que vous proposez, vos spécialités, etc.</i>';
      
      keyboard.inline_keyboard.push([
        { text: '⬅ Retour', callback_data: 'vendor_back' },
        { text: '⏭ Passer', callback_data: 'vendor_skip' }
      ]);
      
      state.waitingForText = true;
      state.textType = 'description';
      break;
  }
  
  const sentMessage = await bot.sendMessage(chatId, message, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
  
  state.lastMessageId = sentMessage.message_id;
  state.step = step;
}

// Commande /config pour l'admin
bot.onText(/\/config/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  // Vérifier si l'utilisateur est admin
  const user = await User.findOne({ telegramId: userId });
  
  if (!user?.isAdmin) {
    // Demander le mot de passe
    await bot.sendMessage(chatId, '🔐 Entrez le mot de passe administrateur:');
    
    bot.once('message', async (response) => {
      if (response.chat.id === chatId && response.text === process.env.ADMIN_PASSWORD) {
        await User.findOneAndUpdate({ telegramId: userId }, { isAdmin: true });
        await showAdminMenu(bot, chatId);
      } else {
        await bot.sendMessage(chatId, '❌ Mot de passe incorrect.');
      }
    });
  } else {
    await showAdminMenu(bot, chatId);
  }
});

// Menu admin
async function showAdminMenu(bot, chatId) {
  const adminUrl = `${process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app'}/config`;
  
  await bot.sendMessage(chatId, 
    `🔐 <b>Panel Administrateur</b>\n\n` +
    `Accédez au panel admin complet via ce lien :\n` +
    `${adminUrl}\n\n` +
    `Mot de passe : <code>${process.env.ADMIN_PASSWORD}</code>`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔐 Ouvrir le panel admin', url: adminUrl }]
        ]
      }
    }
  );
}

// Gestion des erreurs
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Initialisation des settings par défaut
async function initializeSettings() {
  const settings = await Settings.findOne();
  if (!settings) {
    await Settings.create({
      welcomeMessage: 'Bienvenue sur PLUGS CRTFS ! 🔌',
      infoText: `<b>À propos de PLUGS CRTFS</b>\n\n🔌 Plateforme de mise en relation sécurisée\n✅ Vendeurs certifiés\n🔒 Transactions sécurisées\n📍 Livraison dans toute la France`,
      socialNetworks: {
        telegram: '@PLGSCRTF_SUPPORT',
        instagram: '@plugscrtfs'
      }
    });
    
    // Créer quelques plugs de test
    const testPlugs = [
      {
        name: 'ParisPlug 75',
        description: 'Service rapide et fiable sur Paris et proche banlieue.',
        methods: { delivery: true, shipping: false, meetup: true },
        socialNetworks: { snap: 'parisplug75', telegram: '@parisplug75' },
        country: 'France',
        countryFlag: '🇫🇷',
        department: 'Paris',
        likes: 127,
        referralCount: 15
      },
      {
        name: 'MarseillePlug 13',
        description: 'Le meilleur service sur Marseille.',
        methods: { delivery: true, shipping: true, meetup: false },
        socialNetworks: { snap: 'marsplug13', instagram: '@marsplug13' },
        country: 'France',
        countryFlag: '🇫🇷',
        department: 'Bouches-du-Rhône',
        likes: 89,
        referralCount: 8
      }
    ];
    
    for (const plugData of testPlugs) {
      const plug = await Plug.create(plugData);
      plug.referralLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=ref_${plug._id}`;
      await plug.save();
    }
  }
}

initializeSettings();

console.log('�� Bot is running...');

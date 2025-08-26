const Plug = require('../models/Plug');
const User = require('../models/User');
const PlugReferral = require('../models/PlugReferral');

// Fonction pour obtenir le drapeau d'un pays
function getCountryFlag(countryCode) {
  const flags = {
    'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'DE': '🇩🇪', 'GB': '🇬🇧',
    'PT': '🇵🇹', 'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹',
    'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷', 'AR': '🇦🇷',
    'JP': '🇯🇵', 'CN': '🇨🇳', 'KR': '🇰🇷', 'IN': '🇮🇳', 'AU': '🇦🇺'
  };
  return flags[countryCode] || '🌍';
}

// Fonction pour obtenir le nom complet d'un pays
function getCountryName(countryCode) {
  const countries = {
    'FR': 'France', 'ES': 'Espagne', 'IT': 'Italie', 'DE': 'Allemagne', 'GB': 'Royaume-Uni',
    'PT': 'Portugal', 'NL': 'Pays-Bas', 'BE': 'Belgique', 'CH': 'Suisse', 'AT': 'Autriche',
    'US': 'États-Unis', 'CA': 'Canada', 'MX': 'Mexique', 'BR': 'Brésil', 'AR': 'Argentine',
    'JP': 'Japon', 'CN': 'Chine', 'KR': 'Corée du Sud', 'IN': 'Inde', 'AU': 'Australie'
  };
  return countries[countryCode] || countryCode;
}
const Settings = require('../models/Settings');
const { checkMaintenanceMode } = require('../middleware/maintenanceCheck');

async function handlePlugsMenu(bot, chatId, filters = {}, page = 1) {
  try {
    // Vérifier d'abord si on est en maintenance
    const inMaintenance = await checkMaintenanceMode(bot, chatId);
    if (inMaintenance) {
      return; // Arrêter ici si en maintenance
    }
    
    // Récupérer les paramètres pour l'image d'accueil
    const settings = await Settings.findOne();
    
    // Configuration de la pagination
    const PLUGS_PER_PAGE = 8;
    const skip = (page - 1) * PLUGS_PER_PAGE;
    
    // Construire la requête avec les filtres
    const query = { isActive: true };
    
    if (filters.country) {
      query.country = filters.country;
    }
    
    if (filters.method) {
      query[`methods.${filters.method}`] = true;
    }
    
    // Compter le nombre total de plugs pour la pagination
    const totalPlugs = await Plug.countDocuments(query);
    const totalPages = Math.ceil(totalPlugs / PLUGS_PER_PAGE);
    
    // Récupérer les plugs pour la page actuelle
    const plugs = await Plug.find(query)
      .sort({ likes: -1 })
      .skip(skip)
      .limit(PLUGS_PER_PAGE);
    
    // Récupérer tous les plugs pour les statistiques
    const allPlugs = await Plug.find({ isActive: true });
    
    // Collecter les pays et méthodes disponibles
    const countriesSet = new Set();
    const methodsAvailable = {
      delivery: false,
      shipping: false,
      meetup: false
    };
    
    allPlugs.forEach(plug => {
      // Récupérer le pays du plug
      if (plug.country) {
        countriesSet.add(plug.country);
      }
      
      if (plug.methods) {
        if (plug.methods.delivery) methodsAvailable.delivery = true;
        if (plug.methods.shipping) methodsAvailable.shipping = true;
        if (plug.methods.meetup) methodsAvailable.meetup = true;
      }
    });
    
    const countries = Array.from(countriesSet).sort();
    
    // Construire le message
    let message = '🔌 <b>PLUGS DU MOMENT</b>\n';
    message += '━━━━━━━━━━━━━━━━\n\n';
    
    // Afficher les filtres actifs
    if (filters.country || filters.method) {
      message += '🔍 <b>Filtres actifs:</b> ';
      if (filters.country) {
        message += `${getCountryFlag(filters.country)} ${getCountryName(filters.country)} `;
      }
      if (filters.method) {
        const methodEmojis = {
          delivery: '🚚 Livraison',
          shipping: '📮 Envoi',
          meetup: '🤝 Meetup'
        };
        message += methodEmojis[filters.method] || '';
      }
      message += '\n\n';
    }
    
    if (plugs.length === 0) {
      message += '❌ Aucun plug trouvé avec ces critères.';
    } else {
      message += `📊 <b>${totalPlugs} plug${totalPlugs > 1 ? 's' : ''} trouvé${totalPlugs > 1 ? 's' : ''}</b>\n`;
      if (totalPages > 1) {
        message += `📄 <b>Page ${page} sur ${totalPages}</b>\n`;
      }
      message += '\n';
    }
    
    const keyboard = {
      inline_keyboard: []
    };
    
    // Créer les boutons de pays uniquement pour ceux qui ont des plugs
    const countryButtons = countries
      .filter(country => {
        // Ne garder que les pays qui ont au moins un plug
        const countryPlugsCount = allPlugs.filter(plug => plug.country === country).length;
        return countryPlugsCount > 0;
      })
      .map(country => {
        const isSelected = filters.country === country;
        // Compter le nombre de plugs pour ce pays
        const countryPlugsCount = allPlugs.filter(plug => 
          plug.country === country
        ).length;
        
        return {
          text: isSelected 
            ? `✅ ${getCountryFlag(country)} (${countryPlugsCount})`
            : `${getCountryFlag(country)} (${countryPlugsCount})`,
          callback_data: isSelected 
            ? (filters.method ? `plugs_filter_method_${filters.method}` : 'plugs')
            : `plugs_filter_country_${country}${filters.method ? '_method_' + filters.method : ''}`
        };
      });
    

    
    // Diviser les pays en lignes de 4 maximum
    for (let i = 0; i < countryButtons.length; i += 4) {
      keyboard.inline_keyboard.push(countryButtons.slice(i, i + 4));
    }
    
    // Ligne des méthodes de vente
    const methodButtons = [];
    if (methodsAvailable.delivery) {
      const isSelected = filters.method === 'delivery';
      methodButtons.push({
        text: isSelected ? '✅ 🚚 Livraison' : '🚚 Livraison',
        callback_data: isSelected
          ? (filters.country ? `plugs_filter_country_${filters.country}` : 'plugs')
          : `plugs_filter_method_delivery${filters.country ? '_country_' + filters.country : ''}`
      });
    }
    if (methodsAvailable.shipping) {
      const isSelected = filters.method === 'shipping';
      methodButtons.push({
        text: isSelected ? '✅ 📮 Envoi' : '📮 Envoi',
        callback_data: isSelected
          ? (filters.country ? `plugs_filter_country_${filters.country}` : 'plugs')
          : `plugs_filter_method_shipping${filters.country ? '_country_' + filters.country : ''}`
      });
    }
    if (methodsAvailable.meetup) {
      const isSelected = filters.method === 'meetup';
      methodButtons.push({
        text: isSelected ? '✅ 🤝 Meetup' : '🤝 Meetup',
        callback_data: isSelected
          ? (filters.country ? `plugs_filter_country_${filters.country}` : 'plugs')
          : `plugs_filter_method_meetup${filters.country ? '_country_' + filters.country : ''}`
      });
    }
    
    if (methodButtons.length > 0) {
      keyboard.inline_keyboard.push(methodButtons);
    }
    
    // Bouton pour réinitialiser les filtres (si des filtres sont actifs)
    if (filters.country || filters.method) {
      keyboard.inline_keyboard.push([{
        text: '🔄 RÉINITIALISER LES FILTRES',
        callback_data: 'plugs'
      }]);
    }
    

    
    // Liste des plugs
    plugs.forEach((plug, index) => {
      let buttonText = '';
      
      // Toujours afficher le drapeau en premier
      if (plug.country) {
        const flag = getCountryFlag(plug.country);
        if (flag) buttonText += `${flag} `;
      }
      
      // Si un filtre méthode est actif, afficher l'emoji de la méthode
      if (filters.method) {
        if (filters.method === 'delivery') buttonText += '🚚 ';
        else if (filters.method === 'shipping') buttonText += '📮 ';
        else if (filters.method === 'meetup') buttonText += '🤝 ';
      }
      
      // Nom du plug
      buttonText += plug.name;
      
      // Nombre de likes et parrainages
      buttonText += ` (${plug.likes || 0}❤️`;
      if (plug.referralCount > 0) {
        buttonText += ` ${plug.referralCount}👥`;
      }
      buttonText += ')';
      
      keyboard.inline_keyboard.push([{
        text: buttonText,
        callback_data: `plug_${plug._id}`
      }]);
    });
    
    // Boutons de pagination si nécessaire
    if (totalPages > 1) {
      const paginationButtons = [];
      
      // Bouton page précédente
      if (page > 1) {
        paginationButtons.push({
          text: '⬅️ Page précédente',
          callback_data: `plugs_page_${page - 1}${filters.country ? '_country_' + filters.country : ''}${filters.method ? '_method_' + filters.method : ''}`
        });
      }
      
      // Bouton page suivante
      if (page < totalPages) {
        paginationButtons.push({
          text: 'Page suivante ➡️',
          callback_data: `plugs_page_${page + 1}${filters.country ? '_country_' + filters.country : ''}${filters.method ? '_method_' + filters.method : ''}`
        });
      }
      
      if (paginationButtons.length > 0) {
        keyboard.inline_keyboard.push(paginationButtons);
      }
      
      // Indicateur de pages (pour navigation rapide)
      const pageIndicators = [];
      const maxPagesToShow = 5;
      let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      // Ajuster si on est près de la fin
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        if (i === page) {
          pageIndicators.push({
            text: `[${i}]`,
            callback_data: 'current_page'
          });
        } else {
          pageIndicators.push({
            text: `${i}`,
            callback_data: `plugs_page_${i}${filters.country ? '_country_' + filters.country : ''}${filters.method ? '_method_' + filters.method : ''}`
          });
        }
      }
      
      if (pageIndicators.length > 1) {
        keyboard.inline_keyboard.push(pageIndicators);
      }
    }
    
    // Bouton retour au menu principal
    keyboard.inline_keyboard.push([{
      text: '⬅️ RETOUR AU MENU',
      callback_data: 'main_menu'
    }]);
    
    // Envoyer le message
    if (settings?.welcomeImage) {
      try {
        await bot.sendPhoto(chatId, settings.welcomeImage, {
          caption: message,
          reply_markup: keyboard,
          parse_mode: 'HTML'
        });
      } catch (error) {
        console.error('Erreur envoi image:', error);
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
    // Pas de message d'erreur visible pour l'utilisateur
  }
}

async function handlePlugDetails(bot, chatId, plugId, fromMenu = 'plugs', userId = null) {
  try {
    // Vérifier d'abord si on est en maintenance
    const inMaintenance = await checkMaintenanceMode(bot, chatId);
    if (inMaintenance) {
      return; // Arrêter ici si en maintenance
    }
    
    console.log(`📱 Chargement des détails du plug: ${plugId}`);
    console.log(`📱 ChatId: ${chatId}, UserId: ${userId || chatId}`);
    
    // Récupérer le plug
    const plug = await Plug.findById(plugId);
    
    if (!plug) {
      console.log(`❌ Plug non trouvé: ${plugId}`);
      // Au lieu d'afficher une erreur, retourner au menu des plugs
      await handlePlugsMenu(bot, chatId);
      return;
    }
    
    console.log(`✅ Plug trouvé: ${plug.name}, Photo: ${plug.photo ? 'OUI' : 'NON'}`);
    
    let message = `🔌 <b>${plug.name}</b>\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    
    // Localisation simplifiée
    message += `📍 <b>Localisation:</b> `;
    
    if (plug.country) {
      message += `${getCountryFlag(plug.country)} ${getCountryName(plug.country)}`;
    } else {
      message += 'Non spécifiée';
    }
    message += '\n\n';
    
    // Méthodes disponibles avec détails
    message += `📦 <b>Méthodes disponibles:</b>\n`;
    
    if (plug.methods?.delivery) {
      message += '🚚 <b>Livraison</b>';
      if (plug.deliveryDepartments && plug.deliveryDepartments.length > 0) {
        message += ` - Départements: ${plug.deliveryDepartments.join(', ')}`;
      }
      message += '\n';
    }
    
    if (plug.methods?.shipping) {
      message += '📮 <b>Envoi</b>';
      const shippingCountries = plug.shippingCountries || plug.countries || [];
      if (shippingCountries.length > 0) {
        message += ' - Pays: ';
        message += shippingCountries.map(c => `${getCountryFlag(c)} ${c}`).join(', ');
      }
      message += '\n';
    }
    
    if (plug.methods?.meetup) {
      message += '🤝 <b>Meetup</b>';
      if (plug.meetupDepartments && plug.meetupDepartments.length > 0) {
        message += ` - Départements: ${plug.meetupDepartments.join(', ')}`;
      }
      message += '\n';
    }
    
    if (!plug.methods?.delivery && !plug.methods?.shipping && !plug.methods?.meetup) {
      message += 'Aucune méthode spécifiée\n';
    }
    
    message += '\n';
    
    // Description
    if (plug.description) {
      message += `📝 <b>Description:</b>\n${plug.description}\n\n`;
    }
    
    // Stats
    message += `❤️ <b>Likes:</b> ${plug.likes || 0}\n`;
    
    // Compter les filleuls de l'utilisateur actuel pour ce plug (pour le lien de parrainage)
    const currentUserId = userId || chatId;
    
    // Afficher seulement le total des parrainages
    message += `🔗 <b>Total parrainages:</b> ${plug.referralCount || 0}\n`;
    
    // Créer le clavier avec les réseaux sociaux
    const keyboard = {
      inline_keyboard: []
    };
    
    // Réseaux sociaux en boutons
    const socialButtons = [];
    const networkNames = {
      snap: '👻 Snapchat',
      instagram: '📸 Instagram',
      whatsapp: '💬 WhatsApp',
      signal: '🔐 Signal',
      threema: '🔒 Threema',
      potato: '🥔 Potato',
      telegram: '✈️ Telegram'
    };
    
    // Utiliser customNetworks en priorité s'il existe, sinon utiliser socialNetworks
    if (plug.customNetworks && plug.customNetworks.length > 0) {
      // Utiliser uniquement customNetworks
      plug.customNetworks.forEach(network => {
        if (network.link) {
          let url = network.link;
          
          // Valider et corriger l'URL
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Si c'est un username avec @
            if (url.startsWith('@')) {
              url = `https://t.me/${url.substring(1)}`;
            } else {
              // Sinon, ajouter https://
              url = `https://${url}`;
            }
          }
          
          socialButtons.push({ 
            text: `${network.emoji || '🔗'} ${network.name}`, 
            url: url 
          });
        }
      });
    } else if (plug.socialNetworks) {
      // Utiliser l'ancien format seulement si customNetworks n'existe pas
      if (plug.socialNetworks.snap) {
        const snapUrl = plug.socialNetworks.snap.startsWith('http') ? plug.socialNetworks.snap : `https://snapchat.com/add/${plug.socialNetworks.snap}`;
        socialButtons.push({ text: '👻 Snapchat', url: snapUrl });
      }
      if (plug.socialNetworks.instagram) {
        const instaUrl = plug.socialNetworks.instagram.startsWith('http') ? plug.socialNetworks.instagram : `https://instagram.com/${plug.socialNetworks.instagram.replace('@', '')}`;
        socialButtons.push({ text: '📸 Instagram', url: instaUrl });
      }
      if (plug.socialNetworks.whatsapp) {
        const whatsappUrl = plug.socialNetworks.whatsapp.startsWith('http') ? plug.socialNetworks.whatsapp : `https://wa.me/${plug.socialNetworks.whatsapp.replace(/[^0-9]/g, '')}`;
        socialButtons.push({ text: '💬 WhatsApp', url: whatsappUrl });
      }
      if (plug.socialNetworks.signal) {
        const signalUrl = plug.socialNetworks.signal.startsWith('http') ? plug.socialNetworks.signal : `https://signal.me/#p/${plug.socialNetworks.signal}`;
        socialButtons.push({ text: '🔐 Signal', url: signalUrl });
      }
      if (plug.socialNetworks.telegram) {
        const telegramUrl = plug.socialNetworks.telegram.startsWith('http') ? plug.socialNetworks.telegram : `https://t.me/${plug.socialNetworks.telegram.replace('@', '')}`;
        socialButtons.push({ text: '✈️ Telegram', url: telegramUrl });
      }
    }
    
    // Filtrer les boutons avec des URLs valides
    const validButtons = socialButtons.filter(button => {
      try {
        new URL(button.url); // Vérifier que l'URL est valide
        return true;
      } catch (e) {
        console.error(`URL invalide pour ${button.text}: ${button.url}`);
        return false;
      }
    });
    
    // Organiser les boutons de réseaux sociaux par lignes de 2
    for (let i = 0; i < validButtons.length; i += 2) {
      const row = [validButtons[i]];
      if (i + 1 < validButtons.length) {
        row.push(validButtons[i + 1]);
      }
      keyboard.inline_keyboard.push(row);
    }
    
    // Si des réseaux sociaux ont été ajoutés, ajouter un séparateur visuel
    if (validButtons.length > 0) {
      keyboard.inline_keyboard.push([{ text: '━━━━━━━━━━━━━━━━', callback_data: 'separator' }]);
    }
    
    // Ajouter le lien de parrainage UNIQUEMENT pour l'admin
    // currentUserId est déjà défini plus haut (ligne 335)
    const adminId = process.env.ADMIN_ID ? process.env.ADMIN_ID.trim() : null;
    // Settings est déjà importé en haut du fichier (ligne 26)
    const settings = await Settings.findOne();
    const settingsAdminIds = settings?.adminChatIds || [];
    const isAdmin = (adminId && currentUserId.toString() === adminId) || settingsAdminIds.includes(currentUserId.toString());
    
    if (isAdmin) {
      const referralLink = plug.referralLink || `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=plug_${plug._id}_${currentUserId}`;
      keyboard.inline_keyboard.push([
        { text: '🔗 LIEN DE PARRAINAGE (ADMIN)', callback_data: `show_referral_${plug._id}_${currentUserId}` }
      ]);
      
      // Ajouter un autre séparateur après le lien de parrainage
      keyboard.inline_keyboard.push([{ text: '━━━━━━━━━━━━━━━━', callback_data: 'separator' }]);
    }
    
    // Boutons d'action - Vérifier le temps restant pour le like
    const User = require('../models/User');
    const Vote = require('../models/Vote');
    const userIdToSearch = userId || chatId; // Utiliser userId si fourni, sinon chatId
    let likeButtonText = `❤️ Like (${plug.likes || 0})`;
    let isInCooldown = false;
    
    // Vérifier si l'utilisateur a déjà voté pour ce plug spécifique
    const existingVote = await Vote.findOne({ 
      userId: userIdToSearch.toString(), 
      plugId: plug._id 
    });
    
    console.log(`🔍 Vérification vote pour user ${userIdToSearch} et plug ${plug._id}:`, {
      voteFound: !!existingVote,
      votedAt: existingVote?.votedAt
    });
    
    if (existingVote) {
      const now = new Date();
      const lastVoteTime = new Date(existingVote.votedAt);
      const timeSinceLastVote = (now - lastVoteTime) / 1000 / 60; // en minutes
      const remainingTime = Math.ceil(30 - timeSinceLastVote);
      
      console.log(`⏱️ Calcul cooldown:`, {
        now: now.toISOString(),
        lastVoteTime: lastVoteTime.toISOString(),
        timeSinceLastVote: timeSinceLastVote.toFixed(2),
        remainingTime
      });
      
      if (remainingTime > 0 && remainingTime <= 30) {
        likeButtonText = `⏱️ Restant ${remainingTime}min (${plug.likes || 0})`;
        isInCooldown = true;
      }
    }
    
    // Créer le bouton avec callback_data différent si en cooldown
    keyboard.inline_keyboard.push([
      { 
        text: likeButtonText, 
        callback_data: isInCooldown ? `cooldown_${plug._id}` : `like_${plug._id}` 
      }
    ]);
    
    // Ajouter le bouton pour offrir un badge
    keyboard.inline_keyboard.push([
      { 
        text: '🎁 Offrir un badge', 
        callback_data: `give_badge_to_${plug._id}` 
      }
    ]);
    
    // Navigation
    const backButton = fromMenu === 'top_referrals' 
      ? { text: '⬅️ RETOUR AU TOP PARRAINS', callback_data: 'top_referrals' }
      : { text: '⬅️ RETOUR AUX PLUGS', callback_data: 'plugs' };
    
    keyboard.inline_keyboard.push([
      backButton,
      { text: '🏠 MENU PRINCIPAL', callback_data: 'main_menu' }
    ]);
    
    console.log('📨 Préparation envoi du message, longueur:', message.length);
    console.log('⌨️ Nombre de boutons:', keyboard.inline_keyboard.length);
    
    if (plug.photo) {
      console.log(`📸 Tentative d'envoi avec photo: ${plug.photo.substring(0, 50)}...`);
      try {
        // Essayer d'envoyer avec la photo
        await bot.sendPhoto(chatId, plug.photo, {
          caption: message,
          reply_markup: keyboard,
          parse_mode: 'HTML'
        });
        console.log('✅ Photo envoyée avec succès');
      } catch (photoError) {
        console.error('❌ Erreur envoi photo:', photoError.message);
        console.error('📝 Message complet:', message);
        
        // Ajouter une note sur l'erreur de photo dans le message
        const messageWithPhotoError = message + '\n\n⚠️ <i>Photo non disponible</i>';
        
        // Si l'envoi de la photo échoue, envoyer sans photo
        await bot.sendMessage(chatId, messageWithPhotoError, {
          reply_markup: keyboard,
          parse_mode: 'HTML'
        });
      }
    } else {
      console.log('⚠️ Pas de photo pour ce plug');
      await bot.sendMessage(chatId, message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur dans handlePlugDetails:', error);
    console.error('Stack trace:', error.stack);
    console.error('PlugId:', plugId);
    
    // Envoyer un message d'erreur à l'utilisateur
    try {
      await bot.sendMessage(chatId, '❌ Une erreur est survenue lors du chargement des détails.\n\nVeuillez réessayer.', {
        reply_markup: {
          inline_keyboard: [[
            { text: '⬅️ Retour aux plugs', callback_data: 'plugs' },
            { text: '🏠 Menu principal', callback_data: 'main_menu' }
          ]],
        },
        parse_mode: 'HTML'
      });
    } catch (sendError) {
      console.error('❌ Erreur envoi message erreur:', sendError);
    }
  }
}

async function handleLike(bot, callbackQuery, plugId) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const Vote = require('../models/Vote');
  const UserStats = require('../models/UserStats');
  
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
    
    // Vérifier le cooldown pour CE plug spécifique
    const existingVote = await Vote.findOne({ 
      userId: userId.toString(), 
      plugId: plugId 
    });
    
    const now = new Date();
    const cooldownMinutes = 30;
    
    if (existingVote) {
      const lastVoteTime = new Date(existingVote.votedAt);
      const timeSinceLastVote = (now - lastVoteTime) / 1000 / 60; // en minutes
      
      if (timeSinceLastVote < cooldownMinutes) {
        const remainingTime = Math.ceil(cooldownMinutes - timeSinceLastVote);
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: `⏱️ Vous avez déjà voté pour ce plug.\n\n⏰ Prochain vote possible dans ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.\n\n💡 Vous pouvez voter pour d'autres plugs en attendant !`,
          show_alert: true
        });
      
      // Mettre à jour le bouton pour afficher le temps restant
      try {
        const keyboard = callbackQuery.message.reply_markup;
        if (keyboard && keyboard.inline_keyboard) {
          // Récupérer le plug pour avoir le nombre de likes actuel
          const plug = await Plug.findById(plugId);
          
          for (let row of keyboard.inline_keyboard) {
            for (let button of row) {
              if (button.callback_data && (button.callback_data.startsWith('like_') || button.callback_data.startsWith('cooldown_'))) {
                button.text = `⏱️ Restant ${remainingTime}min (${plug.likes || 0})`;
                button.callback_data = `cooldown_${plugId}`; // Désactiver le bouton
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
        console.error('Erreur mise à jour bouton:', error);
      }
      
        return;
      }
    }
    
    // Récupérer le plug d'abord pour vérifier les dates de reset
    let plug = await Plug.findById(plugId);
    
    if (!plug) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Plug introuvable',
        show_alert: true
      });
      return;
    }
    
    // Vérifier et réinitialiser les compteurs si nécessaire
    // 'now' est déjà déclaré plus haut
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Reset journalier
    if (!plug.dailyVotes.lastReset || plug.dailyVotes.lastReset < oneDayAgo) {
      plug.dailyVotes.count = 0;
      plug.dailyVotes.lastReset = now;
    }
    
    // Reset hebdomadaire
    if (!plug.weeklyVotes.lastReset || plug.weeklyVotes.lastReset < oneWeekAgo) {
      plug.previousWeekVotes = plug.weeklyVotes.count || 0;
      plug.weeklyVotes.count = 0;
      plug.weeklyVotes.lastReset = now;
    }
    
    // Reset mensuel
    if (!plug.monthlyVotes.lastReset || plug.monthlyVotes.lastReset < oneMonthAgo) {
      plug.monthlyVotes.count = 0;
      plug.monthlyVotes.lastReset = now;
    }
    
    // Incrémenter tous les compteurs
    plug.likes = (plug.likes || 0) + 1;
    plug.dailyVotes.count = (plug.dailyVotes.count || 0) + 1;
    plug.weeklyVotes.count = (plug.weeklyVotes.count || 0) + 1;
    plug.monthlyVotes.count = (plug.monthlyVotes.count || 0) + 1;
    
    // Calculer le score de tendance
    if (plug.previousWeekVotes > 0) {
      plug.trendingScore = ((plug.weeklyVotes.count - plug.previousWeekVotes) / plug.previousWeekVotes) * 100;
    } else {
      plug.trendingScore = plug.weeklyVotes.count * 100;
    }
    
    // Sauvegarder les changements
    plug = await plug.save();
    
    // Créer ou mettre à jour le vote pour ce plug
    if (existingVote) {
      // Mettre à jour la date du vote existant
      existingVote.votedAt = new Date();
      await existingVote.save();
    } else {
      // Créer un nouveau vote
      await Vote.create({
        userId: userId.toString(),
        plugId: plugId,
        votedAt: new Date()
      });
    }
    
    // === SYSTÈME DE POINTS ET NIVEAUX ===
    const UserStats = require('../models/UserStats');
    
    // Créer ou récupérer les stats de l'utilisateur
    let userStats = await UserStats.findOne({ userId: userId });
    if (!userStats) {
      userStats = new UserStats({
        userId: userId,
        username: user.username || user.firstName || 'Utilisateur'
      });
    }
    
    // Ajouter le vote et calculer les points/niveau
    const voteResult = await userStats.addVote(plugId, plug.name);
    
    console.log(`✅ Vote enregistré pour user ${userId} et plug ${plugId} - Niveau: ${voteResult.newLevel}`);
    
    // Mettre à jour les stats de parrainage si l'utilisateur est venu via un lien
    const ReferralClick = require('../models/ReferralClick');
    const referralClick = await ReferralClick.findOne({
      plugId: plugId,
      visitorId: user._id,
      hasVoted: false
    });
    
    if (referralClick) {
      // Marquer comme voté
      referralClick.hasVoted = true;
      await referralClick.save();
      
      // Mettre à jour les stats du plug
      const statIndex = plug.referralStats.findIndex(stat => 
        stat.userId.toString() === referralClick.referrerId.toString()
      );
      
      if (statIndex >= 0) {
        plug.referralStats[statIndex].votes += 1;
        await plug.save();
      }
    }
    
    // Message de succès simple et clair
    let successMessage = `✅ Merci pour ton vote sur ${plug.name} !\n\n`;
    successMessage += `📊 Ton statut:\n`;
    successMessage += `🗳️ ${userStats.totalVotes} votes total\n`;
    successMessage += `🎖️ Niveau ${voteResult.newLevel}\n`;
    successMessage += `⭐ ${userStats.points} points`;
    
    if (voteResult.levelUp) {
      successMessage += ` (+3 points)\n\n🎉 NIVEAU SUPÉRIEUR ! 🎉`;
      successMessage += `\nFélicitations ! Tu es maintenant niveau ${voteResult.newLevel} !`;
      
      if (userStats.points >= 10 && userStats.points - 3 < 10) {
        successMessage += `\n\n🛍️ Tu peux maintenant acheter des badges !`;
      }
    } else {
      const votesForNext = (voteResult.newLevel * 5) - userStats.totalVotes;
      successMessage += `\n\n📈 Plus que ${votesForNext} vote${votesForNext > 1 ? 's' : ''} pour le niveau ${voteResult.newLevel + 1}`;
    }
    
    successMessage += `\n\n⏰ Tu pourras voter à nouveau dans 30 minutes`;
    
    // Répondre avec succès SANS supprimer le message
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: successMessage,
      show_alert: true
    });
    
    // Mettre à jour le bouton like dans le message existant
    try {
      const keyboard = callbackQuery.message.reply_markup;
      if (keyboard && keyboard.inline_keyboard) {
        // Trouver le bouton like et mettre à jour son texte avec le temps restant
        for (let row of keyboard.inline_keyboard) {
          for (let button of row) {
            if (button.callback_data && (button.callback_data.startsWith('like_') || button.callback_data.startsWith('cooldown_'))) {
              button.text = `⏱️ Restant 30min (${plug.likes})`;
              button.callback_data = `cooldown_${plug._id}`; // Changer le callback pour désactiver le bouton
              break;
            }
          }
        }
          
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
      text: 'Veuillez réessayer',
      show_alert: false
    });
  }
}

module.exports = { handlePlugsMenu, handlePlugDetails, handleLike };
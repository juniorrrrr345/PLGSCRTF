const Plug = require('../models/Plug');
const User = require('../models/User');

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

async function handlePlugsMenu(bot, chatId, filters = {}) {
  try {
    // Récupérer les paramètres pour l'image d'accueil
    const settings = await Settings.findOne();
    
    // Construire la requête avec les filtres
    const query = { isActive: true };
    
    if (filters.country) {
      query.country = filters.country;
    }
    
    if (filters.method) {
      query[`methods.${filters.method}`] = true;
    }
    
    // Récupérer tous les plugs avec les filtres appliqués
    const plugs = await Plug.find(query)
      .sort({ likes: -1 })
      .limit(50);
    
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
    let message = '🔌 <b>PLUGS CRTFS</b>\n';
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
      message += `📊 <b>${plugs.length} plug${plugs.length > 1 ? 's' : ''} trouvé${plugs.length > 1 ? 's' : ''}</b>\n\n`;
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
        text: '🔄 Réinitialiser les filtres',
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
      
      // Nombre de likes
      buttonText += ` (${plug.likes || 0}) ❤️`;
      
      keyboard.inline_keyboard.push([{
        text: buttonText,
        callback_data: `plug_${plug._id}`
      }]);
    });
    
    // Bouton retour au menu principal
    keyboard.inline_keyboard.push([{
      text: '⬅️ Retour au menu',
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

async function handlePlugDetails(bot, chatId, plugId, fromMenu = 'plugs') {
  try {
    console.log(`📱 Chargement des détails du plug: ${plugId}`);
    console.log(`📱 ChatId: ${chatId}`);
    
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
    
    // Méthodes disponibles (sans les zones car déjà affichées dans la localisation)
    message += `📦 <b>Méthodes disponibles:</b>\n`;
    const methods = [];
    if (plug.methods?.delivery) {
      methods.push('🚚 Livraison');
    }
    if (plug.methods?.shipping) {
      methods.push('📮 Envoi');
    }
    if (plug.methods?.meetup) {
      methods.push('🤝 Meetup');
    }
    
    if (methods.length > 0) {
      message += methods.join(' • ') + '\n\n';
    } else {
      message += 'Aucune méthode spécifiée\n\n';
    }
    
    // Description
    if (plug.description) {
      message += `📝 <b>Description:</b>\n${plug.description}\n\n`;
    }
    
    // Stats
    message += `❤️ <b>Likes:</b> ${plug.likes || 0}\n`;
    message += `🔗 <b>Parrainages:</b> ${plug.referralCount || 0}\n`;
    
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
    
    if (plug.socialNetworks) {
      // Gérer les réseaux primaires avec leurs liens
      if (plug.socialNetworks.primary && plug.socialNetworks.links) {
        const networkCounts = {};
        plug.socialNetworks.primary.forEach((network, index) => {
          const link = plug.socialNetworks.links[network];
          if (link) {
            let url = link;
            
            // Si c'est déjà une URL complète, la garder
            if (link.startsWith('http://') || link.startsWith('https://')) {
              url = link;
            }
            // Gérer les usernames avec @
            else if (link.startsWith('@')) {
              const username = link.substring(1);
              if (network === 'instagram') {
                url = `https://instagram.com/${username}`;
              } else if (network === 'telegram') {
                url = `https://t.me/${username}`;
              } else if (network === 'snap' || network === 'snapchat') {
                url = `https://snapchat.com/add/${username}`;
              } else {
                url = `https://${network}.com/${username}`;
              }
            }
            // Gérer les liens sans @ ni http
            else {
              if (network === 'whatsapp') {
                // Pour WhatsApp, extraire seulement les chiffres
                const phoneNumber = link.replace(/[^0-9]/g, '');
                url = phoneNumber ? `https://wa.me/${phoneNumber}` : `https://wa.me/${link}`;
              } else if (network === 'instagram') {
                url = `https://instagram.com/${link}`;
              } else if (network === 'snap' || network === 'snapchat') {
                url = `https://snapchat.com/add/${link}`;
              } else if (network === 'telegram') {
                url = `https://t.me/${link}`;
              } else if (network === 'signal') {
                url = `https://signal.me/#p/${link}`;
              } else {
                // Pour les autres, essayer de créer une URL valide
                url = `https://${link}`;
              }
            }
            
            // Gérer les multiples comptes du même réseau
            networkCounts[network] = (networkCounts[network] || 0) + 1;
            const displayName = networkCounts[network] > 1 
              ? `${networkNames[network] || network} ${networkCounts[network]}`
              : networkNames[network] || network;
            
            // Log pour débugger
            console.log(`Réseau: ${network}, Lien original: ${link}, URL générée: ${url}`);
            
            socialButtons.push({ 
              text: displayName, 
              url: url 
            });
          }
        });
      }
      
      // Gérer l'ancienne structure pour la compatibilité
      else {
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
      }
      if (plug.socialNetworks.telegram) {
        const telegramUrl = plug.socialNetworks.telegram.startsWith('http') ? plug.socialNetworks.telegram : `https://t.me/${plug.socialNetworks.telegram.replace('@', '')}`;
        socialButtons.push({ text: '✈️ Telegram', url: telegramUrl });
      }
    }
    
    // Ajouter les réseaux personnalisés
    if (plug.customNetworks && plug.customNetworks.length > 0) {
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
    
    // Boutons d'action - Vérifier le temps restant pour le like
    const User = require('../models/User');
    const user = await User.findOne({ telegramId: chatId });
    let likeButtonText = `❤️ Like (${plug.likes || 0})`;
    let isInCooldown = false;
    
    console.log(`🔍 Vérification cooldown pour user ${chatId}:`, {
      userFound: !!user,
      lastLikeTime: user?.lastLikeTime,
      telegramId: user?.telegramId
    });
    
    if (user && user.lastLikeTime) {
      const now = new Date();
      const lastLikeTime = new Date(user.lastLikeTime);
      const timeSinceLastLike = (now - lastLikeTime) / 1000 / 60; // en minutes
      const remainingTime = Math.ceil(30 - timeSinceLastLike);
      
      console.log(`⏱️ Calcul cooldown:`, {
        now: now.toISOString(),
        lastLikeTime: lastLikeTime.toISOString(),
        timeSinceLastLike: timeSinceLastLike.toFixed(2),
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
    
    // Lien de parrainage (visible uniquement pour les admins)
    const settings = await Settings.findOne();
    if (settings && settings.adminChatIds && settings.adminChatIds.includes(chatId.toString())) {
      const referralLink = plug.referralLink || `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=plug_${plug._id}`;
      keyboard.inline_keyboard.push([
        { text: '🔗 Lien de parrainage (Admin)', url: referralLink }
      ]);
    }
    
    // Navigation
    const backButton = fromMenu === 'top_referrals' 
      ? { text: '⬅️ Retour au top parrains', callback_data: 'top_referrals' }
      : { text: '⬅️ Retour aux plugs', callback_data: 'plugs' };
    
    keyboard.inline_keyboard.push([
      backButton,
      { text: '🏠 Menu principal', callback_data: 'main_menu' }
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
    
    // Vérifier le cooldown
    const now = new Date();
    const lastLike = user.lastLikeTime ? new Date(user.lastLikeTime) : new Date(0);
    const cooldownMinutes = 30;
    const timeSinceLastLike = (now - lastLike) / 1000 / 60; // en minutes
    
    if (timeSinceLastLike < cooldownMinutes) {
      const remainingTime = Math.ceil(cooldownMinutes - timeSinceLastLike);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: `⏱️ Veuillez patienter ${remainingTime} minute${remainingTime > 1 ? 's' : ''} avant de liker à nouveau.\n\n💡 Vous pourrez voter à nouveau dans ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.\n\n❤️ Merci pour votre soutien !`,
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
    
    // Mettre à jour le plug
    const plug = await Plug.findByIdAndUpdate(
      plugId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!plug) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Plug introuvable',
        show_alert: true
      });
      return;
    }
    
    // Mettre à jour l'utilisateur
    user.lastLikeTime = new Date();
    if (!user.likedPlugs) user.likedPlugs = [];
    if (!user.likedPlugs.includes(plugId)) {
      user.likedPlugs.push(plugId);
    }
    await user.save();
    
    console.log(`✅ User ${userId} mis à jour avec lastLikeTime:`, user.lastLikeTime);
    
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
    
    // Répondre avec succès SANS supprimer le message
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: `❤️ Merci pour votre vote !\n\n✅ ${plug.name} a maintenant ${plug.likes} like${plug.likes > 1 ? 's' : ''}\n\n⏱️ Prochain vote possible dans 30 minutes`,
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
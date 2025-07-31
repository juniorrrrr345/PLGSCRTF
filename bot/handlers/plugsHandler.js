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
      query['location.countries'] = filters.country;
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
      if (plug.location && plug.location.countries) {
        plug.location.countries.forEach(country => {
          countriesSet.add(country);
        });
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
    
    // Ligne 1: Drapeaux des pays (max 4 par ligne)
    const countryButtons = countries.map(country => {
      const isSelected = filters.country === country;
      return {
        text: isSelected ? `✅ ${getCountryFlag(country)}` : getCountryFlag(country),
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
    
    // Séparateur
    keyboard.inline_keyboard.push([{
      text: '━━━━━━━━━━━━━━━━',
      callback_data: 'separator'
    }]);
    
    // Liste des plugs
    plugs.forEach((plug, index) => {
      // Construire le texte du bouton avec les infos appropriées
      let buttonText = '';
      
      // Emoji de classement pour le top 3
      if (!filters.country && !filters.method) {
        if (index === 0) buttonText += '🥇 ';
        else if (index === 1) buttonText += '🥈 ';
        else if (index === 2) buttonText += '🥉 ';
      }
      
      buttonText += plug.name;
      
      // Ajouter les drapeaux si on n'a pas filtré par pays
      if (!filters.country && plug.location?.countries) {
        const flags = plug.location.countries.map(c => getCountryFlag(c)).join('');
        if (flags) buttonText += ` ${flags}`;
      }
      
      // Ajouter les emojis de méthodes si on n'a pas filtré par méthode
      if (!filters.method) {
        const methods = [];
        if (plug.methods?.delivery) methods.push('🚚');
        if (plug.methods?.shipping) methods.push('📮');
        if (plug.methods?.meetup) methods.push('🤝');
        if (methods.length > 0) buttonText += ` ${methods.join('')}`;
      }
      
      // Ajouter le nombre de likes
      buttonText += ` (❤️ ${plug.likes || 0})`;
      
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
    await bot.sendMessage(chatId, '❌ Une erreur est survenue lors du chargement des plugs.');
  }
}

async function handlePlugDetails(bot, chatId, plugId) {
  try {
    console.log(`📱 Chargement des détails du plug: ${plugId}`);
    const plug = await Plug.findById(plugId);
    
    if (!plug) {
      console.error(`❌ Plug introuvable: ${plugId}`);
      await bot.sendMessage(chatId, '❌ Plug introuvable.');
      await handlePlugsMenu(bot, chatId);
      return;
    }
    
    console.log(`✅ Plug trouvé: ${plug.name}, Photo: ${plug.photo ? 'OUI' : 'NON'}`);
    
    let message = `🔌 <b>${plug.name}</b>\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    
    // Localisation - Afficher les pays et villes organisés
    message += `📍 <b>Localisation:</b>\n`;
    
    // Organiser les zones par pays
    const zonesByCountry = {};
    
    // Si on a une liste de pays
    if (plug.countries && plug.countries.length > 0) {
      plug.countries.forEach(countryCode => {
        zonesByCountry[countryCode] = [];
      });
    } else if (plug.country || plug.location?.country) {
      // Fallback sur l'ancien format
      const country = plug.country || plug.location?.country;
      zonesByCountry[country] = [];
    }
    
    // Créer un objet pour stocker les zones par type
    const deliveryZones = plug.deliveryZones ? plug.deliveryZones.split(',').map(z => z.trim()) : [];
    const shippingZones = plug.shippingZones ? plug.shippingZones.split(',').map(z => z.trim()) : [];
    const meetupZones = plug.meetupZones ? plug.meetupZones.split(',').map(z => z.trim()) : [];
    
    // Pour chaque pays, ajouter ses zones spécifiques
    Object.keys(zonesByCountry).forEach(country => {
      const countryZones = [];
      
      // Ajouter les zones de livraison
      if (deliveryZones.length > 0 && plug.methods?.delivery) {
        countryZones.push(`  🚚 Livraison: ${deliveryZones.join(', ')}`);
      }
      
      // Ajouter les zones d'envoi
      if (shippingZones.length > 0 && plug.methods?.shipping) {
        countryZones.push(`  📮 Envoi: ${shippingZones.join(', ')}`);
      }
      
      // Ajouter les zones de meetup
      if (meetupZones.length > 0 && plug.methods?.meetup) {
        countryZones.push(`  🤝 Meetup: ${meetupZones.join(', ')}`);
      }
      
      zonesByCountry[country] = countryZones;
    });
    
    // Afficher les pays avec leurs zones
    Object.entries(zonesByCountry).forEach(([countryCode, zones]) => {
      const flag = getCountryFlag(countryCode);
      const countryName = getCountryName(countryCode);
      message += `\n${flag} <b>${countryName}</b>`;
      
      if (zones.length > 0) {
        message += '\n' + zones.join('\n');
      }
      message += '\n';
    });
    
    message += '\n';
    
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
    
    // Boutons d'action
    keyboard.inline_keyboard.push([
      { text: `❤️ Like (${plug.likes || 0})`, callback_data: `like_${plug._id}` }
    ]);
    
    // Lien de parrainage du plug
    const referralLink = plug.referralLink || `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=plug_${plug._id}`;
    keyboard.inline_keyboard.push([
      { text: '🔗 Lien de parrainage', url: referralLink }
    ]);
    
    // Navigation
    keyboard.inline_keyboard.push([
      { text: '⬅️ Retour aux plugs', callback_data: 'plugs' },
      { text: '🏠 Menu principal', callback_data: 'main_menu' }
    ]);
    
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
        console.error('Details:', photoError);
        // Si l'envoi de la photo échoue, envoyer sans photo
        await bot.sendMessage(chatId, message, {
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
    console.error('Erreur dans handlePlugDetails:', error);
    // Ne pas envoyer de message d'erreur à l'utilisateur
    // Essayer de retourner au menu des plugs
    try {
      await handlePlugsMenu(bot, chatId);
    } catch (e) {
      // Si même ça échoue, ne rien faire
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
    const lastLike = user.lastLikeTime || new Date(0);
    const cooldownMinutes = 30;
    const timeSinceLastLike = (new Date() - lastLike) / 1000 / 60;
    
    if (timeSinceLastLike < cooldownMinutes) {
      const remainingTime = Math.ceil(cooldownMinutes - timeSinceLastLike);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: `⏱ Vous devez attendre ${remainingTime} minutes avant de liker à nouveau`,
        show_alert: true
      });
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
    
    // Répondre avec succès SANS supprimer le message
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: `❤️ Vous avez liké ${plug.name} ! Total: ${plug.likes} likes`,
      show_alert: false
    });
    
          // Mettre à jour le bouton like dans le message existant
      try {
        const keyboard = callbackQuery.message.reply_markup;
        if (keyboard && keyboard.inline_keyboard) {
          // Mettre à jour le texte du bouton like
          keyboard.inline_keyboard[0][0].text = `❤️ Like (${plug.likes})`;
          
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
      text: '❌ Une erreur est survenue',
      show_alert: true
    });
  }
}

module.exports = { handlePlugsMenu, handlePlugDetails, handleLike };
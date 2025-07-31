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
const Settings = require('../models/Settings');

async function handlePlugsMenu(bot, chatId) {
  try {
    // Récupérer les paramètres pour l'image d'accueil
    const settings = await Settings.findOne();
    
    // Récupérer tous les plugs actifs, triés par likes (décroissant)
    const plugs = await Plug.find({ isActive: true })
      .sort({ likes: -1 })
      .limit(50); // Limiter à 50 pour éviter des messages trop longs
    
    if (plugs.length === 0) {
      await bot.sendMessage(chatId, '❌ Aucun plug disponible pour le moment.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Retour', callback_data: 'main_menu' }]
          ]
        }
      });
      return;
    }
    
    let message = '🔌 <b>PLUGS CRTFS</b>\n';
    message += '━━━━━━━━━━━━━━━━\n\n';
    
    const keyboard = {
      inline_keyboard: []
    };
    
    // Créer les boutons pour chaque plug
    plugs.forEach((plug, index) => {
      // Ajouter un emoji spécial pour le top 3
      let emoji = '';
      if (index === 0) emoji = '🥇 ';
      else if (index === 1) emoji = '🥈 ';
      else if (index === 2) emoji = '🥉 ';
      
      const buttonText = `${emoji}${plug.name} (❤️ ${plug.likes})`;
      keyboard.inline_keyboard.push([{
        text: buttonText,
        callback_data: `plug_${plug._id}`
      }]);
    });
    
    // Ajouter le bouton retour
    keyboard.inline_keyboard.push([{
      text: '⬅️ Retour au menu',
      callback_data: 'main_menu'
    }]);
    
    message += '👆 Cliquez sur un plug pour voir les détails';
    
    // Envoyer avec l'image d'accueil si elle existe
    if (settings?.welcomeImage) {
      try {
        await bot.sendPhoto(chatId, settings.welcomeImage, {
          caption: message,
          reply_markup: keyboard,
          parse_mode: 'HTML'
        });
      } catch (error) {
        console.error('Erreur envoi image:', error);
        // Si l'image échoue, envoyer juste le message
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
    
    // Localisation - Afficher tous les pays sélectionnés
    if (plug.countries && plug.countries.length > 0) {
      message += `📍 <b>Localisation:</b>\n`;
      plug.countries.forEach((countryCode, index) => {
        const flag = getCountryFlag(countryCode);
        message += `${flag} ${countryCode}`;
        if (index < plug.countries.length - 1) {
          message += ' • ';
        }
      });
      message += '\n\n';
    } else if (plug.country || plug.location?.country) {
      // Fallback sur l'ancien format
      const country = plug.country || plug.location?.country;
      message += `📍 <b>Localisation:</b>\n`;
      if (plug.countryFlag && country) {
        message += `${plug.countryFlag} ${country}`;
      } else if (country) {
        message += country;
      }
      message += '\n\n';
    }
    
    // Méthodes
    message += `📦 <b>Méthodes disponibles:</b>\n`;
    if (plug.methods?.delivery) {
      message += '• 🚚 Livraison';
      if (plug.deliveryZones) {
        message += ` (${plug.deliveryZones})`;
      } else if (plug.deliveryDepartments?.length > 0) {
        message += ` (${plug.deliveryDepartments.join(', ')})`;
      }
      message += '\n';
    }
    if (plug.methods?.shipping) {
      message += '• 📮 Envoi';
      if (plug.shippingZones) {
        message += ` (${plug.shippingZones})`;
      } else if (plug.deliveryDepartments?.length > 0) {
        message += ` (${plug.deliveryDepartments.join(', ')})`;
      }
      message += '\n';
    }
    if (plug.methods?.meetup) {
      message += '• 🤝 Meetup';
      if (plug.meetupZones) {
        message += ` (${plug.meetupZones})`;
      } else if (plug.meetupDepartments?.length > 0) {
        message += ` (${plug.meetupDepartments.join(', ')})`;
      }
      message += '\n';
    }
    message += '\n';
    
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
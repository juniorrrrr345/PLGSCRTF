const User = require('../models/User');
const VendorApplication = require('../models/VendorApplication');
const Settings = require('../models/Settings');

const vendorSteps = [
  'social_primary',
  'social_links',       // Liens des réseaux sociaux sélectionnés
  'social_other',
  'methods',
  'delivery_zones',     // Zones de livraison
  'shipping_zones',     // Zones d'envoi
  'meetup_zones',       // Zones de meetup
  'base_location',      // Localisation principale du vendeur
  'photo',
  'description',
  'confirm'
];

async function handleVendorApplication(bot, chatId, userStates, action = null, msg = null) {
  let userState = userStates.get(chatId);
  
  // Initialiser l'état si nécessaire
  if (!userState || userState.type !== 'vendor_application') {
    userState = {
      type: 'vendor_application',
      step: 'social_primary',
      stepIndex: 0,
      lastQuestionMessageId: null,  // ID du dernier message de question envoyé
      data: {
        socialNetworks: { primary: [], links: {}, others: '' },
        methods: { delivery: false, shipping: false, meetup: false },
        deliveryZones: '',    // Départements/codes postaux pour livraison
        shippingZones: '',    // Pays/départements pour envoi
        meetupZones: '',      // Villes/départements pour meetup
        country: '',
        department: '',
        postalCode: '',
        photo: '',
        description: ''
      }
    };
    userStates.set(chatId, userState);
  }
  
  // Debug log
  console.log(`Vendor action: ${action}, step: ${userState.step}, index: ${userState.stepIndex}`);
  
  // Gestion des actions
  if (action === 'vendor_back' && userState.stepIndex > 0) {
    userState.stepIndex--;
    userState.step = vendorSteps[userState.stepIndex];
  } else if (action === 'vendor_next') {
    // Pour "Suivant", on passe à l'étape suivante même si rien n'est sélectionné
    if (userState.stepIndex < vendorSteps.length - 1) {
      userState.stepIndex++;
      userState.step = vendorSteps[userState.stepIndex];
    }
  } else if (action === 'vendor_skip') {
    // Pour skip, on passe à l'étape suivante en gardant les valeurs par défaut
    if (userState.stepIndex < vendorSteps.length - 1) {
      // Définir des valeurs par défaut pour les étapes optionnelles
      if (userState.step === 'social_other') {
        userState.data.socialNetworks.others = '';
      } else if (userState.step === 'delivery_zones') {
        userState.data.deliveryZones = '';
      } else if (userState.step === 'shipping_zones') {
        userState.data.shippingZones = '';
      } else if (userState.step === 'meetup_zones') {
        userState.data.meetupZones = '';
      } else if (userState.step === 'base_location') {
        userState.data.country = 'France';
        userState.data.department = '';
        userState.data.postalCode = '';
      } else if (userState.step === 'photo') {
        userState.data.photo = '';
      } else if (userState.step === 'description') {
        userState.data.description = '';
      }
      userState.stepIndex++;
      userState.step = vendorSteps[userState.stepIndex];
    }
  } else if (action === 'vendor_cancel') {
    userStates.delete(chatId);
    await bot.sendMessage(chatId, '❌ Candidature annulée.');
    const { showMainMenu } = require('./startHandler');
    await showMainMenu(bot, chatId);
    return;
  }
  
  // Traiter les réponses selon l'étape
  if (msg && msg.text) {
    await processVendorResponse(userState, msg.text);
    
    // Supprimer le message de l'utilisateur
    try {
      await bot.deleteMessage(chatId, msg.message_id);
    } catch (e) {
      // Ignorer l'erreur si le message ne peut pas être supprimé
    }
  }
  
  // Supprimer l'ancien message de question si il existe
  if (userState.lastQuestionMessageId) {
    try {
      await bot.deleteMessage(chatId, userState.lastQuestionMessageId);
    } catch (e) {
      // Ignorer l'erreur si le message ne peut pas être supprimé
    }
  }
  
  // Afficher l'étape actuelle
  await displayVendorStep(bot, chatId, userState, userStates);
}

async function processVendorResponse(userState, response) {
  switch (userState.step) {
    case 'social_links':
      if (userState.currentNetwork) {
        userState.data.socialNetworks.links[userState.currentNetwork] = response;
        delete userState.currentNetwork;
      }
      break;
    case 'social_other':
      userState.data.socialNetworks.others = response;
      break;
    case 'delivery_zones':
      userState.data.deliveryZones = response;
      break;
    case 'shipping_zones':
      userState.data.shippingZones = response;
      break;
    case 'meetup_zones':
      userState.data.meetupZones = response;
      break;
    case 'base_location':
      // Parser la localisation (pays, département, code postal)
      const parts = response.split(',').map(p => p.trim());
      if (parts[0]) userState.data.country = parts[0];
      if (parts[1]) userState.data.department = parts[1];
      if (parts[2]) userState.data.postalCode = parts[2];
      break;
    case 'description':
      userState.data.description = response;
      break;
  }
}

async function displayVendorStep(bot, chatId, userState, userStates) {
  let message = '';
  let keyboard = { inline_keyboard: [] };
  
  switch (userState.step) {
    case 'social_primary':
      message = '📱 <b>Étape 1/8 - Réseaux sociaux principaux</b>\n\n';
      message += 'Sélectionnez vos réseaux sociaux principaux:';
      
      const socialNetworks = [
        { id: 'snap', name: '👻 Snapchat' },
        { id: 'instagram', name: '📸 Instagram' },
        { id: 'whatsapp', name: '💬 WhatsApp' },
        { id: 'signal', name: '🔐 Signal' },
        { id: 'threema', name: '🔒 Threema' },
        { id: 'potato', name: '🥔 Potato' },
        { id: 'telegram', name: '✈️ Telegram' }
      ];
      
      socialNetworks.forEach(network => {
        const isSelected = userState.data.socialNetworks.primary.includes(network.id);
        keyboard.inline_keyboard.push([{
          text: `${isSelected ? '✅' : '⬜'} ${network.name}`,
          callback_data: `vendor_toggle_${network.id}`
        }]);
      });
      break;
      
    case 'social_links':
      message = '🔗 <b>Étape 2/11 - Liens des réseaux sociaux</b>\n\n';
      const selectedNetworks = userState.data.socialNetworks.primary;
      
      if (selectedNetworks.length === 0) {
        // Si aucun réseau sélectionné, passer à l'étape suivante
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        await displayVendorStep(bot, chatId, userState);
        return;
      }
      
      // Trouver le prochain réseau sans lien
      let currentNetwork = null;
      for (const network of selectedNetworks) {
        if (!userState.data.socialNetworks.links[network]) {
          currentNetwork = network;
          break;
        }
      }
      
      if (!currentNetwork) {
        // Tous les liens sont remplis, passer à l'étape suivante
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        await displayVendorStep(bot, chatId, userState);
        return;
      }
      
      const networkNames = {
        snap: '👻 Snapchat',
        instagram: '📸 Instagram',
        whatsapp: '💬 WhatsApp',
        signal: '🔐 Signal',
        threema: '🔒 Threema',
        potato: '🥔 Potato',
        telegram: '✈️ Telegram'
      };
      
      message += `Quel est votre lien/username pour ${networkNames[currentNetwork]} ?\n\n`;
      message += '💡 Exemples:\n';
      message += '• @username\n';
      message += '• https://...\n';
      message += '• Numéro de téléphone\n';
      
      userState.currentNetwork = currentNetwork;
      break;
      
    case 'social_other':
      message = '📝 <b>Étape 3/11 - Autres réseaux</b>\n\n';
      message += 'Avez-vous d\'autres réseaux sociaux ? (optionnel)\n';
      message += 'Format: NomDuRéseau: @username ou lien\n';
      message += 'Exemple: TikTok: @moncompte\n\n';
      message += 'Envoyez votre réponse ou passez à l\'étape suivante.';
      break;
      
    case 'methods':
      message = '📦 <b>Étape 3/8 - Méthodes de vente</b>\n\n';
      message += 'Sélectionnez vos méthodes de vente:';
      
      const methods = [
        { id: 'delivery', name: '🚚 Livraison' },
        { id: 'shipping', name: '📮 Envoi' },
        { id: 'meetup', name: '🤝 Meetup' }
      ];
      
      methods.forEach(method => {
        const isSelected = userState.data.methods[method.id];
        keyboard.inline_keyboard.push([{
          text: `${isSelected ? '✅' : '⬜'} ${method.name}`,
          callback_data: `vendor_method_${method.id}`
        }]);
      });
      break;
      
    case 'delivery_zones':
      message = '🚚 <b>Étape 4/10 - Zones de livraison</b>\n\n';
      if (userState.data.methods.delivery) {
        message += '📍 <b>Où livrez-vous ?</b>\n\n';
        message += 'Indiquez les départements et/ou codes postaux où vous livrez.\n';
        message += '<i>Exemples: 75, 92, 93 ou 75001-75020, 92100</i>\n\n';
        message += '💡 Séparez par des virgules si plusieurs zones';
      } else {
        // Passer automatiquement si pas de livraison
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        await displayVendorStep(bot, chatId, userState);
        return;
      }
      break;
      
    case 'shipping_zones':
      message = '📮 <b>Étape 5/10 - Zones d\'envoi</b>\n\n';
      if (userState.data.methods.shipping) {
        message += '🌍 <b>Où envoyez-vous vos colis ?</b>\n\n';
        message += 'Indiquez les pays et/ou départements.\n';
        message += '<i>Exemples: France, Belgique, Suisse ou Toute la France, Europe</i>\n\n';
        message += '💡 Séparez par des virgules si plusieurs zones';
      } else {
        // Passer automatiquement si pas d'envoi
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        await displayVendorStep(bot, chatId, userState);
        return;
      }
      break;
      
    case 'meetup_zones':
      message = '🤝 <b>Étape 6/10 - Zones de meetup</b>\n\n';
      if (userState.data.methods.meetup) {
        message += '📍 <b>Où faites-vous des meetups ?</b>\n\n';
        message += 'Indiquez les villes et/ou départements.\n';
        message += '<i>Exemples: Paris, Lyon, 75, 92 ou Paris 15e, Neuilly</i>\n\n';
        message += '💡 Séparez par des virgules si plusieurs zones';
      } else {
        // Passer automatiquement si pas de meetup
        userState.stepIndex++;
        userState.step = vendorSteps[userState.stepIndex];
        await displayVendorStep(bot, chatId, userState);
        return;
      }
      break;
      
    case 'base_location':
      message = '📍 <b>Étape 7/10 - Votre localisation</b>\n\n';
      message += '<b>Où êtes-vous basé ?</b>\n\n';
      message += 'Indiquez votre pays, département et code postal.\n';
      message += '<i>Exemple: France, 75, 75015</i>\n\n';
      message += '💡 Cette information aide les clients à vous trouver';
      break;
      
    case 'photo':
      message = '📸 <b>Étape 8/10 - Photo de votre boutique</b>\n\n';
      message += 'Envoyez une photo de votre boutique (optionnel):';
      break;
      
    case 'description':
      message = '📝 <b>Étape 9/10 - Description</b>\n\n';
      message += 'Décrivez votre boutique en quelques lignes:';
      break;
      
    case 'confirm':
      message = '✅ <b>Étape 10/10 - Confirmation</b>\n\n';
      message += '<b>Résumé de votre candidature:</b>\n';
      message += '━━━━━━━━━━━━━━━━\n\n';
      
      // Résumé des réseaux sociaux
      message += '📱 <b>Réseaux sociaux:</b>\n';
      if (userState.data.socialNetworks.primary.length > 0) {
        userState.data.socialNetworks.primary.forEach(network => {
          message += `• ${network}\n`;
        });
      } else {
        message += '• <i>Aucun réseau principal sélectionné</i>\n';
      }
      if (userState.data.socialNetworks.others) {
        message += `• Autres: ${userState.data.socialNetworks.others}\n`;
      }
      message += '\n';
      
      // Résumé des méthodes et zones
      message += '📦 <b>Méthodes de vente et zones:</b>\n';
      if (userState.data.methods.delivery) {
        message += `• 🚚 Livraison: ${userState.data.deliveryZones || 'Non spécifié'}\n`;
      }
      if (userState.data.methods.shipping) {
        message += `• 📮 Envoi: ${userState.data.shippingZones || 'Non spécifié'}\n`;
      }
      if (userState.data.methods.meetup) {
        message += `• 🤝 Meetup: ${userState.data.meetupZones || 'Non spécifié'}\n`;
      }
      if (!userState.data.methods.delivery && !userState.data.methods.shipping && !userState.data.methods.meetup) {
        message += '• <i>Aucune méthode sélectionnée</i>\n';
      }
      message += '\n';
      
      // Résumé de la localisation
      message += '📍 <b>Votre localisation:</b>\n';
      if (userState.data.country) {
        message += `• Pays: ${userState.data.country}\n`;
        message += `• Département: ${userState.data.department || 'Non spécifié'}\n`;
        message += `• Code postal: ${userState.data.postalCode || 'Non spécifié'}\n`;
      } else {
        message += '• <i>Localisation non spécifiée</i>\n';
      }
      message += '\n';
      
      // Photo et description
      message += `📸 <b>Photo:</b> ${userState.data.photo ? 'Ajoutée ✅' : 'Non ajoutée ❌'}\n`;
      message += `📝 <b>Description:</b> ${userState.data.description ? 'Complétée ✅' : 'Non complétée ❌'}\n\n`;
      
      message += '━━━━━━━━━━━━━━━━\n';
      message += 'Voulez-vous soumettre cette candidature ?';
      
      keyboard.inline_keyboard = [
        [{ text: '✅ Envoyer', callback_data: 'vendor_submit' }],
        [{ text: '⬅️ Modifier', callback_data: 'vendor_back' }],
        [{ text: '❌ Annuler', callback_data: 'vendor_cancel' }]
      ];
      
      await bot.sendMessage(chatId, message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
      return;
  }
  
  // Ajouter les boutons de navigation
  const navButtons = [];
  if (userState.stepIndex > 0) {
    navButtons.push({ text: '⬅️ Retour', callback_data: 'vendor_back' });
  }
  
  // Boutons spécifiques selon l'étape
  if (userState.step === 'social_primary' || userState.step === 'methods') {
    // Pour les étapes avec sélection multiple, ajouter un bouton "Suivant"
    navButtons.push({ text: '✅ Suivant', callback_data: 'vendor_next' });
  }
  
  // Montrer "Passer" pour toutes les étapes textuelles (optionnelles)
  if (userState.step === 'social_other' || 
      userState.step === 'delivery_zones' || 
      userState.step === 'shipping_zones' || 
      userState.step === 'meetup_zones' || 
      userState.step === 'base_location' ||
      userState.step === 'photo' || 
      userState.step === 'description') {
    navButtons.push({ text: '⏭ Passer', callback_data: 'vendor_skip' });
  }
  
  navButtons.push({ text: '❌ Annuler', callback_data: 'vendor_cancel' });
  
  keyboard.inline_keyboard.push(navButtons);
  
  const sentMessage = await bot.sendMessage(chatId, message, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
  
  // Sauvegarder l'ID du message pour pouvoir le supprimer plus tard
  if (userState) {
    userState.lastQuestionMessageId = sentMessage.message_id;
  }
}

module.exports = { handleVendorApplication };
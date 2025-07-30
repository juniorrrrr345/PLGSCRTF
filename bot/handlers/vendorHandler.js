const User = require('../models/User');
const VendorApplication = require('../models/VendorApplication');
const Settings = require('../models/Settings');

const vendorSteps = [
  'social_primary',
  'social_other',
  'methods',
  'country',
  'department',
  'postal_code',
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
      data: {
        socialNetworks: { primary: [], others: '' },
        methods: { delivery: false, shipping: false, meetup: false },
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
      } else if (userState.step === 'photo') {
        userState.data.photo = '';
      } else if (userState.step === 'description') {
        userState.data.description = '';
      } else if (userState.step === 'postal_code') {
        userState.data.postalCode = '';
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
  }
  
  // Afficher l'étape actuelle
  await displayVendorStep(bot, chatId, userState);
}

async function processVendorResponse(userState, response) {
  switch (userState.step) {
    case 'social_other':
      userState.data.socialNetworks.others = response;
      break;
    case 'postal_code':
      userState.data.postalCode = response;
      break;
    case 'description':
      userState.data.description = response;
      break;
  }
}

async function displayVendorStep(bot, chatId, userState) {
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
      
    case 'social_other':
      message = '📝 <b>Étape 2/8 - Autres réseaux</b>\n\n';
      message += 'Avez-vous d\'autres réseaux sociaux ? (optionnel)\n';
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
      
    case 'country':
      message = '🌍 <b>Étape 4/8 - Pays</b>\n\n';
      message += 'Sélectionnez votre pays:';
      
      const settings = await Settings.findOne();
      settings.countries.forEach(country => {
        keyboard.inline_keyboard.push([{
          text: `${country.flag} ${country.name}`,
          callback_data: `vendor_country_${country.code}`
        }]);
      });
      break;
      
    case 'department':
      message = '📍 <b>Étape 5/8 - Département</b>\n\n';
      message += 'Sélectionnez votre département:';
      
      const settingsDept = await Settings.findOne();
      const selectedCountry = settingsDept.countries.find(c => c.code === userState.data.country);
      
      if (selectedCountry && selectedCountry.departments) {
        selectedCountry.departments.forEach(dept => {
          keyboard.inline_keyboard.push([{
            text: dept.name,
            callback_data: `vendor_dept_${dept.code}`
          }]);
        });
      }
      break;
      
    case 'postal_code':
      message = '📮 <b>Étape 6/8 - Code postal</b>\n\n';
      message += 'Entrez votre code postal ou ville principale:';
      break;
      
    case 'photo':
      message = '📸 <b>Étape 7/8 - Photo de votre boutique</b>\n\n';
      message += 'Envoyez une photo de votre boutique (optionnel):';
      break;
      
    case 'description':
      message = '📝 <b>Étape 8/8 - Description</b>\n\n';
      message += 'Décrivez votre boutique en quelques lignes:';
      break;
      
    case 'confirm':
      message = '✅ <b>Confirmation - Résumé de votre candidature</b>\n\n';
      message += '━━━━━━━━━━━━━━━━\n';
      
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
      
      // Résumé des méthodes
      message += '📦 <b>Méthodes de vente:</b>\n';
      const selectedMethods = [];
      if (userState.data.methods.delivery) selectedMethods.push('🚚 Livraison');
      if (userState.data.methods.shipping) selectedMethods.push('📮 Envoi');
      if (userState.data.methods.meetup) selectedMethods.push('🤝 Meetup');
      if (selectedMethods.length > 0) {
        selectedMethods.forEach(method => message += `• ${method}\n`);
      } else {
        message += '• <i>Aucune méthode sélectionnée</i>\n';
      }
      message += '\n';
      
      // Résumé de la localisation
      message += '📍 <b>Localisation:</b>\n';
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
  if (userState.step === 'social_primary' || userState.step === 'methods' || 
      userState.step === 'country' || userState.step === 'department') {
    // Pour les étapes avec sélection, ajouter un bouton "Suivant"
    navButtons.push({ text: '✅ Suivant', callback_data: 'vendor_next' });
  }
  
  // Montrer "Passer" pour les étapes optionnelles
  if (userState.step === 'social_other' || userState.step === 'photo' || 
      userState.step === 'description' || userState.step === 'postal_code') {
    navButtons.push({ text: '⏭ Passer', callback_data: 'vendor_skip' });
  }
  
  navButtons.push({ text: '❌ Annuler', callback_data: 'vendor_cancel' });
  
  keyboard.inline_keyboard.push(navButtons);
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

module.exports = { handleVendorApplication };
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  welcomeMessage: {
    type: String,
    default: 'Bienvenue sur notre boutique ! 🛍️'
  },
  welcomeImage: String, // URL Cloudinary
  infoText: {
    type: String,
    default: 'Informations sur notre service'
  },
  miniAppButtonText: {
    type: String,
    default: '🔌 MINI APP PLGS CRTFS'
  },
  backgroundImage: String, // URL pour le fond de la web app
  socialNetworks: {
    snap: String,
    instagram: String,
    whatsapp: String,
    signal: String,
    threema: String,
    potato: String,
    telegram: String,
    other: String
  },
  // Réseaux sociaux affichés en bas du bot
  botSocialNetworks: [{
    name: String,
    url: String,
    emoji: String,
    order: { type: Number, default: 0 }
  }],
  // Réseaux sociaux affichés sur la page /social de la boutique
  shopSocialNetworks: [{
    id: String,
    name: String,
    emoji: String,
    link: String
  }],
  countries: [{
    code: String,
    name: String,
    flag: String,
    departments: [{
      code: String,
      name: String
    }]
  }],
  postalCodes: [{
    code: String,
    city: String,
    department: String
  }],
  // Configuration du canal Telegram pour la vérification
  telegramChannelLink: {
    type: String,
    default: 'https://t.me/+RoI-Xzh-ma9iYmY0'
  },
  telegramChannelId: {
    type: String,
    default: '-1002736254394'
  },
  // Mode maintenance
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  // Image de fond pour la page de maintenance
  maintenanceBackgroundImage: {
    type: String,
    default: ''
  },
  // Logo pour la page de maintenance
  maintenanceLogo: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
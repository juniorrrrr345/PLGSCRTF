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
  }]
});

module.exports = mongoose.model('Settings', settingsSchema);
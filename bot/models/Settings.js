const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  welcomeMessage: {
    type: String,
    default: 'Bienvenue sur PLUGS CRTFS ! 🔌'
  },
  welcomeImage: String,
  infoText: {
    type: String,
    default: 'Informations sur notre service'
  },
  backgroundImage: String,
  socialNetworks: {
    snap: String,
    instagram: String,
    whatsapp: String,
    signal: String,
    threema: String,
    potato: String,
    telegram: String,
    other: String
  }
});

module.exports = mongoose.model('Settings', settingsSchema);

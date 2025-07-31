import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  welcomeMessage: {
    type: String,
    default: '🔌 Bienvenue sur PLUGS CRTFS !\n\nLa marketplace exclusive des vendeurs certifiés.'
  },
  welcomeImage: {
    type: String,
    default: ''
  },
  infoText: {
    type: String,
    default: 'Informations sur notre service'
  },
  miniAppButtonText: {
    type: String,
    default: '🔌 MINI APP PLGS CRTFS'
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  logoImage: {
    type: String,
    default: ''
  },
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
  departments: [{
    country: String,
    code: String,
    name: String
  }],
  postalCodes: [{
    code: String,
    city: String,
    department: String
  }]
}, {
  timestamps: true
})

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema)
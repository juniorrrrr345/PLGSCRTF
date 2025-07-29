import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  welcomeMessage: {
    type: String,
    default: 'Bienvenue sur notre boutique ! 🛍️'
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
  },
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
})

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema)
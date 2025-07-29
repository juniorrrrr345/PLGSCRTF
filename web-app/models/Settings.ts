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
  backgroundImage: {
    type: String,
    default: ''
  },
  logoImage: {
    type: String,
    default: ''
  },
  countries: [{
    code: String,
    name: String,
    flag: String
  }],
  departments: [{
    country: String,
    code: String,
    name: String
  }]
}, {
  timestamps: true
})

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema)
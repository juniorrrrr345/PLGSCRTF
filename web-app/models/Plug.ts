import mongoose from 'mongoose'

const plugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  photo: String,
  description: String,
  methods: {
    delivery: { type: Boolean, default: false },
    shipping: { type: Boolean, default: false },
    meetup: { type: Boolean, default: false }
  },
  deliveryDepartments: [{
    type: String
  }],
  meetupDepartments: [{
    type: String
  }],
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
  customNetworks: [{
    id: String,
    name: String,
    emoji: String,
    link: String
  }],
  location: {
    country: String,
    department: String,
    postalCode: String
  },
  countries: [{
    type: String
  }],
  country: String, // Rétrocompatibilité
  countryFlag: String, // Rétrocompatibilité
  department: String,
  postalCode: String,
  likes: {
    type: Number,
    default: 0
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referralLink: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isExample: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

plugSchema.index({ likes: -1 })
plugSchema.index({ referralCount: -1 })

export default mongoose.models.Plug || mongoose.model('Plug', plugSchema)
const mongoose = require('mongoose');

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
  // Départements où la livraison/envoi est disponible
  deliveryDepartments: [{
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
  country: String,
  countryFlag: String,
  department: String, // Département principal du vendeur
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour le tri par likes
plugSchema.index({ likes: -1 });

module.exports = mongoose.model('Plug', plugSchema);
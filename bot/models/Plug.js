const mongoose = require('mongoose');

const plugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  photo: String, // URL Cloudinary
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour le classement
plugSchema.index({ likes: -1 });
plugSchema.index({ referralCount: -1 });

module.exports = mongoose.model('Plug', plugSchema);
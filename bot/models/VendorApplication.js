const mongoose = require('mongoose');

const vendorApplicationSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true
  },
  username: String,
  firstName: String,
  lastName: String,
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
  methods: {
    delivery: { type: Boolean, default: false },
    shipping: { type: Boolean, default: false },
    meetup: { type: Boolean, default: false }
  },
  country: String,
  countryFlag: String,
  department: String,
  postalCode: String,
  photo: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VendorApplication', vendorApplicationSchema);
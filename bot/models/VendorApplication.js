const mongoose = require('mongoose');

const vendorApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  telegramId: String,
  username: String,
  socialNetworks: {
    primary: [String],
    others: String
  },
  methods: {
    delivery: Boolean,
    shipping: Boolean,
    meetup: Boolean
  },
  country: String,
  department: String,
  postalCode: String,
  photo: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VendorApplication', vendorApplicationSchema);
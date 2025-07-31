const mongoose = require('mongoose');

const referralClickSchema = new mongoose.Schema({
  plugId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plug',
    required: true
  },
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hasVoted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour éviter les doublons
referralClickSchema.index({ plugId: 1, referrerId: 1, visitorId: 1 }, { unique: true });

module.exports = mongoose.model('ReferralClick', referralClickSchema);
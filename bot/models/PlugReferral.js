const mongoose = require('mongoose');

const plugReferralSchema = new mongoose.Schema({
  plugId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plug',
    required: true
  },
  referrerId: {
    type: String, // ID Telegram du parrain
    required: true
  },
  referredUserId: {
    type: String, // ID Telegram du filleul
    required: true
  },
  referredAt: {
    type: Date,
    default: Date.now
  },
  hasVoted: {
    type: Boolean,
    default: false
  }
});

// Index pour éviter les doublons et améliorer les performances
plugReferralSchema.index({ plugId: 1, referrerId: 1, referredUserId: 1 }, { unique: true });
plugReferralSchema.index({ plugId: 1, referrerId: 1 });
plugReferralSchema.index({ referredUserId: 1 });

module.exports = mongoose.model('PlugReferral', plugReferralSchema);
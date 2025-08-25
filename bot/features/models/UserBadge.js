const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  // Pour les badges temporaires
  expiresAt: Date,
  // Progression vers le badge (pour les badges progressifs)
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: Number,
    lastUpdate: Date
  },
  // Notifications
  notified: {
    type: Boolean,
    default: false
  }
});

// Index composé pour éviter les doublons
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
// Index pour les recherches par utilisateur
userBadgeSchema.index({ userId: 1, earnedAt: -1 });
// Index pour les badges qui expirent
userBadgeSchema.index({ expiresAt: 1 }, { sparse: true });

module.exports = mongoose.model('UserBadge', userBadgeSchema);
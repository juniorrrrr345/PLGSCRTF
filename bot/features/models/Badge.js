const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  emoji: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['votes', 'loyalty', 'special', 'competition', 'milestone'],
    required: true
  },
  // Conditions pour débloquer le badge
  conditions: {
    type: {
      type: String,
      enum: ['vote_count', 'consecutive_days', 'battle_win', 'top_position', 'special_event'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    // Pour les badges de position (ex: être dans le top 3)
    position: Number,
    // Pour les badges temporaires
    duration: String
  },
  // Récompense associée au badge
  reward: {
    points: {
      type: Number,
      default: 0
    },
    multiplier: {
      type: Number,
      default: 1
    },
    special: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour les recherches rapides
badgeSchema.index({ category: 1, isActive: 1 });
badgeSchema.index({ 'conditions.type': 1 });

module.exports = mongoose.model('Badge', badgeSchema);
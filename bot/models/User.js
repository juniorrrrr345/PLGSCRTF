const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true
  },
  username: String,
  firstName: String,
  lastName: String,
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plug'
  },
  hasBeenCountedAsReferral: {
    type: Boolean,
    default: false
  },
  lastLikeAt: Date,
  lastLikeTime: Date, // Alias pour compatibilité
  likedPlugs: [{
    plugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plug'
    },
    likedAt: Date
  }],
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  // Nouveaux champs pour la gestion des notifications
  notificationPreferences: {
    acceptsNotifications: {
      type: Boolean,
      default: false // Par défaut, pas de notifications (opt-in requis)
    },
    acceptsPromotions: {
      type: Boolean,
      default: false
    },
    acceptsUpdates: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Tracking pour éviter le spam
  lastBroadcastReceived: Date,
  broadcastsReceived: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: String,
  isActive: {
    type: Boolean,
    default: true
  }
});

// Hook pour synchroniser lastLikeAt et lastLikeTime
userSchema.pre('save', function(next) {
  // Si lastLikeTime est défini mais pas lastLikeAt, copier
  if (this.lastLikeTime && !this.lastLikeAt) {
    this.lastLikeAt = this.lastLikeTime;
  }
  // Si lastLikeAt est défini mais pas lastLikeTime, copier
  if (this.lastLikeAt && !this.lastLikeTime) {
    this.lastLikeTime = this.lastLikeAt;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Shops favoris pour les notifications
  favoritePlugs: [{
    plugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plug'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    // Notifications spécifiques à ce plug
    notifications: {
      onMilestone: {
        type: Boolean,
        default: true
      },
      onBattle: {
        type: Boolean,
        default: true
      },
      onTopPosition: {
        type: Boolean,
        default: true
      }
    }
  }],
  // Préférences de notifications globales
  notifications: {
    // Notifications de badges
    badges: {
      enabled: {
        type: Boolean,
        default: true
      },
      onUnlock: {
        type: Boolean,
        default: true
      },
      onProgress: {
        type: Boolean,
        default: false
      }
    },
    // Notifications de classements
    rankings: {
      enabled: {
        type: Boolean,
        default: true
      },
      dailyTop: {
        type: Boolean,
        default: false
      },
      weeklyTop: {
        type: Boolean,
        default: true
      },
      favoriteProgress: {
        type: Boolean,
        default: true
      }
    },
    // Notifications de battles
    battles: {
      enabled: {
        type: Boolean,
        default: true
      },
      onStart: {
        type: Boolean,
        default: true
      },
      onReminder: {
        type: Boolean,
        default: true
      },
      onResults: {
        type: Boolean,
        default: true
      }
    },
    // Heures préférées pour recevoir les notifications
    preferredTimes: {
      morning: {
        type: Boolean,
        default: true
      }, // 8h-12h
      afternoon: {
        type: Boolean,
        default: true
      }, // 12h-18h
      evening: {
        type: Boolean,
        default: true
      }, // 18h-22h
      night: {
        type: Boolean,
        default: false
      } // 22h-8h
    },
    // Fréquence maximale
    maxDaily: {
      type: Number,
      default: 5
    },
    lastNotificationAt: Date,
    dailyCount: {
      type: Number,
      default: 0
    },
    dailyCountResetAt: Date
  },
  // Statistiques personnelles
  stats: {
    totalVotes: {
      type: Number,
      default: 0
    },
    consecutiveDays: {
      type: Number,
      default: 0
    },
    lastVoteDate: Date,
    battlesParticipated: {
      type: Number,
      default: 0
    },
    battlesWon: {
      type: Number,
      default: 0
    },
    badgesEarned: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    experience: {
      type: Number,
      default: 0
    }
  },
  // Paramètres d'affichage
  display: {
    showBadges: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'fr'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour les recherches rapides
userPreferencesSchema.index({ userId: 1 });
userPreferencesSchema.index({ 'favoritePlugs.plugId': 1 });
userPreferencesSchema.index({ 'notifications.lastNotificationAt': 1 });

// Middleware pour mettre à jour updatedAt
userPreferencesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour vérifier si l'utilisateur peut recevoir une notification
userPreferencesSchema.methods.canReceiveNotification = function() {
  const now = new Date();
  const hour = now.getHours();
  
  // Vérifier l'heure préférée
  let timeAllowed = false;
  if (hour >= 8 && hour < 12 && this.notifications.preferredTimes.morning) timeAllowed = true;
  else if (hour >= 12 && hour < 18 && this.notifications.preferredTimes.afternoon) timeAllowed = true;
  else if (hour >= 18 && hour < 22 && this.notifications.preferredTimes.evening) timeAllowed = true;
  else if ((hour >= 22 || hour < 8) && this.notifications.preferredTimes.night) timeAllowed = true;
  
  if (!timeAllowed) return false;
  
  // Vérifier la limite quotidienne
  if (this.notifications.dailyCountResetAt && 
      this.notifications.dailyCountResetAt.toDateString() !== now.toDateString()) {
    this.notifications.dailyCount = 0;
    this.notifications.dailyCountResetAt = now;
  }
  
  return this.notifications.dailyCount < this.notifications.maxDaily;
};

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
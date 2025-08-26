const mongoose = require('mongoose');

const plugBadgesSchema = new mongoose.Schema({
  plugId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plug',
    required: true
  },
  badges: [{
    badgeId: String,
    badgeName: String,
    badgeEmoji: String,
    givenBy: {
      userId: String,
      username: String
    },
    givenAt: {
      type: Date,
      default: Date.now
    },
    rewards: {
      boostMultiplier: Number,
      freeAdDays: Number,
      specialMention: Boolean
    }
  }],
  totalBadges: {
    type: Number,
    default: 0
  },
  totalBoost: {
    type: Number,
    default: 1
  },
  totalFreeAdDays: {
    type: Number,
    default: 0
  },
  hasSpecialMention: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Méthode pour ajouter un badge à un plug
plugBadgesSchema.methods.addBadge = async function(badge, giver) {
  this.badges.push({
    badgeId: badge.badgeId,
    badgeName: badge.name,
    badgeEmoji: badge.emoji,
    givenBy: {
      userId: giver.userId,
      username: giver.username
    },
    rewards: badge.shopRewards
  });
  
  this.totalBadges = this.badges.length;
  
  // Recalculer le boost total
  let totalBoost = 1;
  let totalDays = 0;
  let hasSpecial = false;
  
  for (const b of this.badges) {
    if (b.rewards.boostMultiplier) {
      totalBoost *= b.rewards.boostMultiplier;
    }
    if (b.rewards.freeAdDays) {
      totalDays += b.rewards.freeAdDays;
    }
    if (b.rewards.specialMention) {
      hasSpecial = true;
    }
  }
  
  this.totalBoost = totalBoost;
  this.totalFreeAdDays = totalDays;
  this.hasSpecialMention = hasSpecial;
  
  await this.save();
  return this;
};

// Méthode pour obtenir le résumé des badges
plugBadgesSchema.methods.getBadgeSummary = function() {
  const summary = {};
  for (const badge of this.badges) {
    if (summary[badge.badgeId]) {
      summary[badge.badgeId].count++;
    } else {
      summary[badge.badgeId] = {
        name: badge.badgeName,
        emoji: badge.badgeEmoji,
        count: 1
      };
    }
  }
  return summary;
};

module.exports = mongoose.model('PlugBadges', plugBadgesSchema);
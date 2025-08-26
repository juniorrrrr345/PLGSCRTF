const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  username: String,
  
  // Système de points et niveaux
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  
  // Points spéciaux (gagnés à partir du niveau 15)
  badgePoints: {
    type: Number,
    default: 0
  },
  
  // Badges achetés
  badges: [{
    badgeId: String,
    name: String,
    emoji: String,
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    cost: Number
  }],
  
  // Historique des votes
  voteHistory: [{
    plugId: String,
    plugName: String,
    voteDate: {
      type: Date,
      default: Date.now
    },
    pointsEarned: Number
  }],
  
  // Statistiques
  lastVoteDate: Date,
  dailyVotes: {
    type: Number,
    default: 0
  },
  weeklyVotes: {
    type: Number,
    default: 0
  },
  monthlyVotes: {
    type: Number,
    default: 0
  },
  
  // Achievements
  achievements: {
    firstVote: {
      type: Boolean,
      default: false
    },
    tenVotes: {
      type: Boolean,
      default: false
    },
    hundredVotes: {
      type: Boolean,
      default: false
    },
    level10: {
      type: Boolean,
      default: false
    },
    level25: {
      type: Boolean,
      default: false
    },
    level50: {
      type: Boolean,
      default: false
    },
    firstBadge: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Méthode pour ajouter un vote et calculer les points
userStatsSchema.methods.addVote = async function(plugId, plugName) {
  this.totalVotes += 1;
  this.dailyVotes += 1;
  this.weeklyVotes += 1;
  this.monthlyVotes += 1;
  
  // 1 point par vote
  const pointsEarned = 1;
  this.points += pointsEarned;
  
  // Calculer le niveau (1 niveau tous les 5 votes)
  const newLevel = Math.floor(this.totalVotes / 5) + 1;
  const levelUp = newLevel > this.level;
  this.level = newLevel;
  
  // Points de badge bonus à partir du niveau 15
  if (this.level >= 15) {
    // 1 point de badge tous les 5 niveaux après le niveau 15
    const bonusLevels = Math.floor((this.level - 15) / 5);
    if (bonusLevels > 0 && levelUp) {
      this.badgePoints += 1;
    }
  }
  
  // Ajouter à l'historique
  this.voteHistory.push({
    plugId,
    plugName,
    pointsEarned
  });
  
  // Garder seulement les 100 derniers votes dans l'historique
  if (this.voteHistory.length > 100) {
    this.voteHistory = this.voteHistory.slice(-100);
  }
  
  this.lastVoteDate = new Date();
  
  // Vérifier les achievements
  if (!this.achievements.firstVote) {
    this.achievements.firstVote = true;
  }
  if (this.totalVotes >= 10 && !this.achievements.tenVotes) {
    this.achievements.tenVotes = true;
  }
  if (this.totalVotes >= 100 && !this.achievements.hundredVotes) {
    this.achievements.hundredVotes = true;
  }
  if (this.level >= 10 && !this.achievements.level10) {
    this.achievements.level10 = true;
  }
  if (this.level >= 25 && !this.achievements.level25) {
    this.achievements.level25 = true;
  }
  if (this.level >= 50 && !this.achievements.level50) {
    this.achievements.level50 = true;
  }
  
  await this.save();
  
  return {
    pointsEarned,
    levelUp,
    newLevel,
    totalPoints: this.points,
    badgePoints: this.badgePoints
  };
};

// Méthode pour acheter un badge
userStatsSchema.methods.purchaseBadge = async function(badge) {
  if (this.level < 15) {
    throw new Error('Niveau 15 requis pour acheter des badges');
  }
  
  if (this.badgePoints < badge.cost) {
    throw new Error('Points de badge insuffisants');
  }
  
  // Vérifier si le badge n'est pas déjà possédé
  const alreadyOwned = this.badges.some(b => b.badgeId === badge.badgeId);
  if (alreadyOwned) {
    throw new Error('Badge déjà possédé');
  }
  
  this.badgePoints -= badge.cost;
  this.badges.push({
    badgeId: badge.badgeId,
    name: badge.name,
    emoji: badge.emoji,
    cost: badge.cost
  });
  
  if (!this.achievements.firstBadge) {
    this.achievements.firstBadge = true;
  }
  
  await this.save();
  return true;
};

// Index pour les classements
userStatsSchema.index({ points: -1 });
userStatsSchema.index({ level: -1 });
userStatsSchema.index({ totalVotes: -1 });
userStatsSchema.index({ dailyVotes: -1 });
userStatsSchema.index({ weeklyVotes: -1 });

module.exports = mongoose.model('UserStats', userStatsSchema);
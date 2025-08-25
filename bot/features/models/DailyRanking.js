const mongoose = require('mongoose');

const dailyRankingSchema = new mongoose.Schema({
  plugId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plug',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Votes reçus ce jour
  dailyVotes: {
    type: Number,
    default: 0
  },
  // Position dans le classement du jour
  dailyRank: Number,
  // Utilisateurs qui ont voté aujourd'hui
  voters: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Statistiques détaillées
  stats: {
    hourlyVotes: [{
      hour: Number,
      count: Number
    }],
    peakHour: Number,
    uniqueVoters: Number
  },
  // Pour le calcul de la progression
  previousDayVotes: {
    type: Number,
    default: 0
  },
  growthRate: {
    type: Number,
    default: 0
  }
});

// Index composé pour éviter les doublons par jour
dailyRankingSchema.index({ plugId: 1, date: 1 }, { unique: true });
// Index pour les requêtes de classement
dailyRankingSchema.index({ date: 1, dailyVotes: -1 });
// Index pour les statistiques hebdomadaires
dailyRankingSchema.index({ date: 1, plugId: 1 });

// Méthode pour calculer le taux de croissance
dailyRankingSchema.methods.calculateGrowth = function() {
  if (this.previousDayVotes === 0) {
    this.growthRate = this.dailyVotes > 0 ? 100 : 0;
  } else {
    this.growthRate = ((this.dailyVotes - this.previousDayVotes) / this.previousDayVotes) * 100;
  }
  return this.growthRate;
};

module.exports = mongoose.model('DailyRanking', dailyRankingSchema);
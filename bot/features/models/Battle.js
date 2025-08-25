const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  emoji: {
    type: String,
    default: '⚔️'
  },
  // Les deux plugs en compétition
  participants: [{
    plugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plug',
      required: true
    },
    votes: {
      type: Number,
      default: 0
    },
    voters: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: Date
    }]
  }],
  // Type de battle
  type: {
    type: String,
    enum: ['duel', 'tournament', 'special', 'weekend'],
    default: 'duel'
  },
  // Durée et timing
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // État de la battle
  status: {
    type: String,
    enum: ['scheduled', 'active', 'finished', 'cancelled'],
    default: 'scheduled'
  },
  // Résultats
  winner: {
    plugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plug'
    },
    finalVotes: Number,
    margin: Number
  },
  // Récompenses
  rewards: {
    winnerBadge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    winnerPoints: Number,
    participantPoints: Number
  },
  // Statistiques
  stats: {
    totalVotes: {
      type: Number,
      default: 0
    },
    uniqueVoters: {
      type: Number,
      default: 0
    },
    peakVotingTime: Date,
    comebackMoments: [{
      timestamp: Date,
      leadChange: Boolean,
      plugId: mongoose.Schema.Types.ObjectId
    }]
  },
  // Notifications envoyées
  notifications: {
    startSent: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    endingSoonSent: {
      type: Boolean,
      default: false
    },
    resultsSent: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour les recherches de battles actives
battleSchema.index({ status: 1, startDate: 1, endDate: 1 });
// Index pour l'historique
battleSchema.index({ endDate: -1 });
// Index pour les participants
battleSchema.index({ 'participants.plugId': 1 });

// Méthode pour vérifier si une battle est active
battleSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.startDate && 
         now <= this.endDate;
};

// Méthode pour obtenir le leader actuel
battleSchema.methods.getCurrentLeader = function() {
  if (this.participants.length !== 2) return null;
  
  const [p1, p2] = this.participants;
  if (p1.votes > p2.votes) return p1;
  if (p2.votes > p1.votes) return p2;
  return null; // Égalité
};

module.exports = mongoose.model('Battle', battleSchema);
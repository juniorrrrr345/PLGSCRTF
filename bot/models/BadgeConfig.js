const mongoose = require('mongoose');

const badgeConfigSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  description: String,
  cost: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'special'],
    default: 'bronze'
  },
  // Récompenses pour les boutiques
  shopRewards: {
    freeAdDays: {
      type: Number,
      default: 0
    },
    boostMultiplier: {
      type: Number,
      default: 1
    },
    specialMention: {
      type: Boolean,
      default: false
    }
  },
  // Conditions d'obtention
  requirements: {
    minLevel: {
      type: Number,
      default: 15
    },
    minVotes: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Badges prédéfinis (usage unique - à donner aux plugs)
const defaultBadges = [
  {
    badgeId: 'supporter',
    name: 'Supporter',
    emoji: '🌟',
    description: 'Badge de soutien basique (+5% visibilité)',
    cost: 10,
    category: 'bronze',
    shopRewards: { boostMultiplier: 1.05 },
    requirements: { minLevel: 1 }
  },
  {
    badgeId: 'actif',
    name: 'Actif',
    emoji: '⚡',
    description: 'Pour les votants réguliers (+10% visibilité)',
    cost: 15,
    category: 'bronze',
    shopRewards: { boostMultiplier: 1.10 },
    requirements: { minLevel: 2 }
  },
  {
    badgeId: 'influenceur',
    name: 'Influenceur',
    emoji: '🔥',
    description: 'Influenceur de la communauté (+20% visibilité)',
    cost: 20,
    category: 'silver',
    shopRewards: { boostMultiplier: 1.20, freeAdDays: 1 },
    requirements: { minLevel: 3 }
  },
  {
    badgeId: 'vip',
    name: 'VIP',
    emoji: '💎',
    description: 'Statut VIP premium (+30% visibilité + 3 jours pub)',
    cost: 30,
    category: 'gold',
    shopRewards: { boostMultiplier: 1.30, freeAdDays: 3 },
    requirements: { minLevel: 5 }
  },
  {
    badgeId: 'roi',
    name: 'Roi du Vote',
    emoji: '👑',
    description: 'Top votant (+50% visibilité + 7 jours pub)',
    cost: 50,
    category: 'platinum',
    shopRewards: { boostMultiplier: 1.50, freeAdDays: 7 },
    requirements: { minLevel: 8 }
  },
  {
    badgeId: 'champion',
    name: 'Champion',
    emoji: '🏆',
    description: 'Badge prestigieux (+75% visibilité + 15 jours pub)',
    cost: 75,
    category: 'diamond',
    shopRewards: { boostMultiplier: 1.75, freeAdDays: 15, specialMention: true },
    requirements: { minLevel: 12 }
  },
  {
    badgeId: 'legendaire',
    name: 'Légendaire',
    emoji: '🌈',
    description: 'Le plus rare (+100% visibilité + 30 jours pub)',
    cost: 100,
    category: 'special',
    shopRewards: { boostMultiplier: 2.0, freeAdDays: 30, specialMention: true },
    requirements: { minLevel: 15 }
  }
];

// Méthode statique pour initialiser les badges par défaut
badgeConfigSchema.statics.initializeDefaults = async function() {
  for (const badge of defaultBadges) {
    await this.findOneAndUpdate(
      { badgeId: badge.badgeId },
      badge,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('BadgeConfig', badgeConfigSchema);
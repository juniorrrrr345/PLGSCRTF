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

// Badges prédéfinis
const defaultBadges = [
  {
    badgeId: 'supporter',
    name: 'Supporter',
    emoji: '🎖️',
    description: 'Badge de base pour les supporters actifs',
    cost: 10,
    category: 'bronze',
    requirements: { minLevel: 1 }
  },
  {
    badgeId: 'fan',
    name: 'Fan',
    emoji: '⭐',
    description: 'Fan dévoué des plugs',
    cost: 15,
    category: 'bronze',
    requirements: { minLevel: 2 }
  },
  {
    badgeId: 'expert',
    name: 'Expert',
    emoji: '🏅',
    description: 'Expert en plugs certifiés - 7 jours de pub gratuite',
    cost: 20,
    category: 'silver',
    shopRewards: { freeAdDays: 7 },
    requirements: { minLevel: 3 }
  },
  {
    badgeId: 'influencer',
    name: 'Influenceur',
    emoji: '💎',
    description: 'Influenceur de la communauté - 15 jours de pub gratuite',
    cost: 30,
    category: 'gold',
    shopRewards: { freeAdDays: 15 },
    requirements: { minLevel: 5 }
  },
  {
    badgeId: 'ambassador',
    name: 'Ambassadeur',
    emoji: '👑',
    description: 'Ambassadeur officiel - 30 jours de pub gratuite pour votre plug',
    cost: 45,
    category: 'platinum',
    shopRewards: { freeAdDays: 30, boostMultiplier: 1.5 },
    requirements: { minLevel: 8 }
  },
  {
    badgeId: 'legend',
    name: 'Légende',
    emoji: '🔥',
    description: 'Légende de la communauté - 60 jours de pub gratuite',
    cost: 60,
    category: 'diamond',
    shopRewards: { freeAdDays: 60, boostMultiplier: 2, specialMention: true },
    requirements: { minLevel: 10 }
  },
  {
    badgeId: 'vip',
    name: 'VIP',
    emoji: '💫',
    description: 'Membre VIP exclusif - 90 jours de pub gratuite',
    cost: 90,
    category: 'special',
    shopRewards: { freeAdDays: 90, boostMultiplier: 2.5, specialMention: true },
    requirements: { minLevel: 15 }
  },
  {
    badgeId: 'premium',
    name: 'Premium',
    emoji: '🌟',
    description: 'Membre Premium avec avantages exclusifs - 180 jours de pub gratuite',
    cost: 150,
    category: 'special',
    shopRewards: { freeAdDays: 180, boostMultiplier: 3, specialMention: true },
    requirements: { minLevel: 20 }
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
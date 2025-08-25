const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const UserPreferences = require('../models/UserPreferences');

// Badges prédéfinis
const DEFAULT_BADGES = [
  // Badges de votes
  {
    name: 'Premier Vote',
    emoji: '🎯',
    description: 'Tu as voté pour ton premier plug !',
    category: 'votes',
    conditions: { type: 'vote_count', value: 1 },
    reward: { points: 10 }
  },
  {
    name: 'Voteur Actif',
    emoji: '⭐',
    description: '10 votes effectués',
    category: 'votes',
    conditions: { type: 'vote_count', value: 10 },
    reward: { points: 50 }
  },
  {
    name: 'Voteur Expert',
    emoji: '🌟',
    description: '50 votes effectués',
    category: 'votes',
    conditions: { type: 'vote_count', value: 50 },
    reward: { points: 200 }
  },
  {
    name: 'Voteur Légendaire',
    emoji: '💫',
    description: '100 votes effectués',
    category: 'votes',
    conditions: { type: 'vote_count', value: 100 },
    reward: { points: 500 }
  },
  // Badges de fidélité
  {
    name: 'Régulier',
    emoji: '📅',
    description: '3 jours consécutifs de vote',
    category: 'loyalty',
    conditions: { type: 'consecutive_days', value: 3 },
    reward: { points: 30 }
  },
  {
    name: 'Fidèle',
    emoji: '🔥',
    description: '7 jours consécutifs de vote',
    category: 'loyalty',
    conditions: { type: 'consecutive_days', value: 7 },
    reward: { points: 100, multiplier: 1.1 }
  },
  {
    name: 'Inconditionnel',
    emoji: '💎',
    description: '30 jours consécutifs de vote',
    category: 'loyalty',
    conditions: { type: 'consecutive_days', value: 30 },
    reward: { points: 1000, multiplier: 1.5 }
  },
  // Badges de compétition
  {
    name: 'Combattant',
    emoji: '⚔️',
    description: 'Première participation à une battle',
    category: 'competition',
    conditions: { type: 'battle_win', value: 0 },
    reward: { points: 25 }
  },
  {
    name: 'Vainqueur',
    emoji: '🏆',
    description: 'Première victoire en battle',
    category: 'competition',
    conditions: { type: 'battle_win', value: 1 },
    reward: { points: 150 }
  },
  {
    name: 'Champion',
    emoji: '👑',
    description: '5 victoires en battle',
    category: 'competition',
    conditions: { type: 'battle_win', value: 5 },
    reward: { points: 750, special: 'Titre Champion' }
  },
  // Badges de position
  {
    name: 'Top 10',
    emoji: '🎖️',
    description: 'Ton plug favori a atteint le Top 10',
    category: 'milestone',
    conditions: { type: 'top_position', value: 10 },
    reward: { points: 100 }
  },
  {
    name: 'Top 3',
    emoji: '🥉',
    description: 'Ton plug favori est dans le Top 3',
    category: 'milestone',
    conditions: { type: 'top_position', value: 3 },
    reward: { points: 300 }
  },
  {
    name: 'Numéro 1',
    emoji: '🥇',
    description: 'Ton plug favori est premier !',
    category: 'milestone',
    conditions: { type: 'top_position', value: 1 },
    reward: { points: 1000, special: 'Titre de Supporter #1' }
  }
];

// Initialiser les badges par défaut
async function initializeBadges() {
  try {
    for (const badgeData of DEFAULT_BADGES) {
      await Badge.findOneAndUpdate(
        { name: badgeData.name },
        badgeData,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Badges initialisés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des badges:', error);
  }
}

// Vérifier les badges débloqués pour un utilisateur
async function checkUserBadges(userId, context = {}) {
  try {
    const userPrefs = await UserPreferences.findOne({ userId }) || 
                     await UserPreferences.create({ userId });
    
    const unlockedBadges = [];
    const badges = await Badge.find({ isActive: true });
    
    for (const badge of badges) {
      // Vérifier si l'utilisateur a déjà ce badge
      const existingBadge = await UserBadge.findOne({ userId, badgeId: badge._id });
      if (existingBadge) continue;
      
      let shouldUnlock = false;
      
      switch (badge.conditions.type) {
        case 'vote_count':
          if (userPrefs.stats.totalVotes >= badge.conditions.value) {
            shouldUnlock = true;
          }
          break;
          
        case 'consecutive_days':
          if (userPrefs.stats.consecutiveDays >= badge.conditions.value) {
            shouldUnlock = true;
          }
          break;
          
        case 'battle_win':
          if (badge.conditions.value === 0 && userPrefs.stats.battlesParticipated > 0) {
            shouldUnlock = true;
          } else if (userPrefs.stats.battlesWon >= badge.conditions.value) {
            shouldUnlock = true;
          }
          break;
          
        case 'top_position':
          if (context.plugPosition && context.plugPosition <= badge.conditions.value) {
            shouldUnlock = true;
          }
          break;
      }
      
      if (shouldUnlock) {
        // Créer le badge pour l'utilisateur
        const userBadge = await UserBadge.create({
          userId,
          badgeId: badge._id
        });
        
        // Ajouter les récompenses
        if (badge.reward) {
          userPrefs.stats.points += badge.reward.points || 0;
          userPrefs.stats.badgesEarned += 1;
          
          // Calculer le niveau
          const newLevel = Math.floor(userPrefs.stats.points / 100) + 1;
          if (newLevel > userPrefs.stats.level) {
            userPrefs.stats.level = newLevel;
          }
        }
        
        await userPrefs.save();
        unlockedBadges.push({
          badge,
          userBadge,
          reward: badge.reward
        });
      }
    }
    
    return unlockedBadges;
  } catch (error) {
    console.error('Erreur lors de la vérification des badges:', error);
    return [];
  }
}

// Obtenir les badges d'un utilisateur
async function getUserBadges(userId) {
  try {
    const userBadges = await UserBadge.find({ userId })
      .populate('badgeId')
      .sort({ earnedAt: -1 });
    
    const userPrefs = await UserPreferences.findOne({ userId });
    
    return {
      badges: userBadges,
      stats: userPrefs ? userPrefs.stats : null
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return { badges: [], stats: null };
  }
}

// Formater l'affichage des badges
function formatBadgeDisplay(badges, stats) {
  let message = '🏅 <b>MES BADGES ET RÉCOMPENSES</b>\n';
  message += '━━━━━━━━━━━━━━━━\n\n';
  
  if (stats) {
    message += '📊 <b>Statistiques</b>\n';
    message += `🎖️ Niveau: ${stats.level}\n`;
    message += `⭐ Points: ${stats.points}\n`;
    message += `🏆 Badges: ${stats.badgesEarned}\n`;
    message += `🗳️ Votes totaux: ${stats.totalVotes}\n`;
    if (stats.consecutiveDays > 0) {
      message += `🔥 Série: ${stats.consecutiveDays} jours\n`;
    }
    message += '\n';
  }
  
  if (badges.length === 0) {
    message += '❌ Tu n\'as pas encore de badges.\n';
    message += '💡 Vote pour tes plugs préférés pour débloquer des badges !';
  } else {
    // Grouper par catégorie
    const categories = {
      votes: { name: '🗳️ Votes', badges: [] },
      loyalty: { name: '🔥 Fidélité', badges: [] },
      competition: { name: '⚔️ Compétition', badges: [] },
      milestone: { name: '🎯 Jalons', badges: [] },
      special: { name: '✨ Spéciaux', badges: [] }
    };
    
    badges.forEach(userBadge => {
      const badge = userBadge.badgeId;
      if (badge && categories[badge.category]) {
        categories[badge.category].badges.push(badge);
      }
    });
    
    for (const [key, cat] of Object.entries(categories)) {
      if (cat.badges.length > 0) {
        message += `${cat.name}\n`;
        cat.badges.forEach(badge => {
          message += `${badge.emoji} <b>${badge.name}</b>\n`;
          message += `   └ ${badge.description}\n`;
        });
        message += '\n';
      }
    }
  }
  
  return message;
}

// Formater la notification de nouveau badge
function formatBadgeNotification(badge, reward) {
  let message = `🎉 <b>NOUVEAU BADGE DÉBLOQUÉ !</b>\n\n`;
  message += `${badge.emoji} <b>${badge.name}</b>\n`;
  message += `${badge.description}\n\n`;
  
  if (reward) {
    message += `🎁 <b>Récompenses:</b>\n`;
    if (reward.points) message += `⭐ +${reward.points} points\n`;
    if (reward.multiplier && reward.multiplier > 1) {
      message += `🔥 Multiplicateur x${reward.multiplier}\n`;
    }
    if (reward.special) message += `✨ ${reward.special}\n`;
  }
  
  return message;
}

// Mettre à jour les stats de vote
async function updateVoteStats(userId) {
  try {
    let userPrefs = await UserPreferences.findOne({ userId });
    if (!userPrefs) {
      userPrefs = await UserPreferences.create({ userId });
    }
    
    const now = new Date();
    const lastVote = userPrefs.stats.lastVoteDate;
    
    // Incrémenter le total de votes
    userPrefs.stats.totalVotes += 1;
    
    // Gérer les jours consécutifs
    if (lastVote) {
      const daysDiff = Math.floor((now - lastVote) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        // Vote consécutif
        userPrefs.stats.consecutiveDays += 1;
      } else if (daysDiff > 1) {
        // Série brisée
        userPrefs.stats.consecutiveDays = 1;
      }
      // Si daysDiff === 0, c'est le même jour, on ne change rien
    } else {
      // Premier vote
      userPrefs.stats.consecutiveDays = 1;
    }
    
    userPrefs.stats.lastVoteDate = now;
    await userPrefs.save();
    
    return userPrefs.stats;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des stats de vote:', error);
    return null;
  }
}

module.exports = {
  initializeBadges,
  checkUserBadges,
  getUserBadges,
  formatBadgeDisplay,
  formatBadgeNotification,
  updateVoteStats
};
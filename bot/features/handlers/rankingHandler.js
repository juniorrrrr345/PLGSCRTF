const DailyRanking = require('../models/DailyRanking');
const Plug = require('../../models/Plug');
const moment = require('moment');
moment.locale('fr');

// Mettre à jour le classement quotidien lors d'un vote
async function updateDailyRanking(plugId, userId) {
  try {
    const today = moment().startOf('day').toDate();
    
    // Trouver ou créer l'entrée du jour
    let ranking = await DailyRanking.findOne({
      plugId,
      date: today
    });
    
    if (!ranking) {
      // Récupérer les votes de la veille pour calculer la croissance
      const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
      const yesterdayRanking = await DailyRanking.findOne({
        plugId,
        date: yesterday
      });
      
      ranking = await DailyRanking.create({
        plugId,
        date: today,
        previousDayVotes: yesterdayRanking ? yesterdayRanking.dailyVotes : 0
      });
    }
    
    // Vérifier si l'utilisateur a déjà voté aujourd'hui
    const hasVoted = ranking.voters.some(v => v.userId.toString() === userId.toString());
    if (!hasVoted) {
      ranking.dailyVotes += 1;
      ranking.voters.push({ userId, votedAt: new Date() });
      
      // Mettre à jour les stats horaires
      const hour = new Date().getHours();
      const hourStat = ranking.stats.hourlyVotes.find(h => h.hour === hour);
      if (hourStat) {
        hourStat.count += 1;
      } else {
        ranking.stats.hourlyVotes.push({ hour, count: 1 });
      }
      
      // Calculer l'heure de pointe
      const peakHour = ranking.stats.hourlyVotes.reduce((max, h) => 
        h.count > (max.count || 0) ? h : max, { hour: 0, count: 0 }
      );
      ranking.stats.peakHour = peakHour.hour;
      ranking.stats.uniqueVoters = ranking.voters.length;
      
      // Calculer le taux de croissance
      ranking.calculateGrowth();
      
      await ranking.save();
    }
    
    return ranking;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du classement quotidien:', error);
    return null;
  }
}

// Obtenir le top du jour
async function getDailyTop(limit = 10) {
  try {
    const today = moment().startOf('day').toDate();
    
    const rankings = await DailyRanking.find({ date: today })
      .populate('plugId')
      .sort({ dailyVotes: -1 })
      .limit(limit);
    
    // Mettre à jour les rangs
    rankings.forEach((ranking, index) => {
      ranking.dailyRank = index + 1;
    });
    
    return rankings;
  } catch (error) {
    console.error('Erreur lors de la récupération du top du jour:', error);
    return [];
  }
}

// Obtenir le top de la semaine
async function getWeeklyTop(limit = 10) {
  try {
    const weekStart = moment().startOf('week').toDate();
    const weekEnd = moment().endOf('week').toDate();
    
    // Agrégation des votes de la semaine
    const weeklyStats = await DailyRanking.aggregate([
      {
        $match: {
          date: { $gte: weekStart, $lte: weekEnd }
        }
      },
      {
        $group: {
          _id: '$plugId',
          weeklyVotes: { $sum: '$dailyVotes' },
          dailyAverage: { $avg: '$dailyVotes' },
          bestDay: { $max: '$dailyVotes' },
          daysActive: { $sum: 1 },
          totalGrowth: { $sum: '$growthRate' }
        }
      },
      {
        $sort: { weeklyVotes: -1 }
      },
      {
        $limit: limit
      }
    ]);
    
    // Peupler les données des plugs
    const plugIds = weeklyStats.map(stat => stat._id);
    const plugs = await Plug.find({ _id: { $in: plugIds } });
    
    const results = weeklyStats.map(stat => {
      const plug = plugs.find(p => p._id.toString() === stat._id.toString());
      return {
        plug,
        weeklyVotes: stat.weeklyVotes,
        dailyAverage: Math.round(stat.dailyAverage),
        bestDay: stat.bestDay,
        daysActive: stat.daysActive,
        growthRate: stat.totalGrowth / stat.daysActive
      };
    });
    
    return results;
  } catch (error) {
    console.error('Erreur lors de la récupération du top de la semaine:', error);
    return [];
  }
}

// Obtenir les plugs en progression (meilleure croissance)
async function getTrendingPlugs(limit = 5) {
  try {
    const today = moment().startOf('day').toDate();
    const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
    
    // Récupérer les classements d'aujourd'hui avec une croissance positive
    const trending = await DailyRanking.find({
      date: today,
      growthRate: { $gt: 0 }
    })
      .populate('plugId')
      .sort({ growthRate: -1 })
      .limit(limit);
    
    return trending;
  } catch (error) {
    console.error('Erreur lors de la récupération des plugs en progression:', error);
    return [];
  }
}

// Formater l'affichage du top du jour
function formatDailyTop(rankings) {
  let message = '🏆 <b>TOP DU JOUR</b> 🏆\n';
  message += `📅 ${moment().format('dddd D MMMM YYYY')}\n`;
  message += '━━━━━━━━━━━━━━━━\n\n';
  
  if (rankings.length === 0) {
    message += '❌ Aucun vote aujourd\'hui pour le moment.';
    return message;
  }
  
  rankings.forEach((ranking, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    const plug = ranking.plugId;
    
    message += `${medal} <b>${plug.name}</b>\n`;
    message += `   📊 ${ranking.dailyVotes} vote${ranking.dailyVotes > 1 ? 's' : ''} aujourd'hui\n`;
    
    if (ranking.growthRate !== 0) {
      const arrow = ranking.growthRate > 0 ? '📈' : '📉';
      const sign = ranking.growthRate > 0 ? '+' : '';
      message += `   ${arrow} ${sign}${ranking.growthRate.toFixed(1)}% vs hier\n`;
    }
    
    if (ranking.stats.peakHour !== undefined) {
      message += `   ⏰ Pic à ${ranking.stats.peakHour}h\n`;
    }
    
    message += '\n';
  });
  
  return message;
}

// Formater l'affichage du top de la semaine
function formatWeeklyTop(weeklyStats) {
  let message = '🏆 <b>TOP DE LA SEMAINE</b> 🏆\n';
  message += `📅 Semaine du ${moment().startOf('week').format('D MMM')} au ${moment().endOf('week').format('D MMM')}\n`;
  message += '━━━━━━━━━━━━━━━━\n\n';
  
  if (weeklyStats.length === 0) {
    message += '❌ Aucun vote cette semaine pour le moment.';
    return message;
  }
  
  weeklyStats.forEach((stat, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    
    message += `${medal} <b>${stat.plug.name}</b>\n`;
    message += `   📊 ${stat.weeklyVotes} votes cette semaine\n`;
    message += `   📈 Moyenne: ${stat.dailyAverage}/jour\n`;
    message += `   🎯 Meilleur jour: ${stat.bestDay} votes\n`;
    
    if (stat.growthRate > 0) {
      message += `   🔥 Progression: +${stat.growthRate.toFixed(1)}%\n`;
    }
    
    message += '\n';
  });
  
  return message;
}

// Formater l'affichage des plugs en progression
function formatTrendingPlugs(trending) {
  let message = '📈 <b>PLUGS EN PROGRESSION</b> 📈\n';
  message += '━━━━━━━━━━━━━━━━\n\n';
  
  if (trending.length === 0) {
    message += '❌ Aucun plug en progression aujourd\'hui.';
    return message;
  }
  
  trending.forEach((ranking, index) => {
    const plug = ranking.plugId;
    const fire = ranking.growthRate > 100 ? '🔥🔥🔥' : 
                  ranking.growthRate > 50 ? '🔥🔥' : '🔥';
    
    message += `${index + 1}. <b>${plug.name}</b> ${fire}\n`;
    message += `   📈 +${ranking.growthRate.toFixed(1)}% vs hier\n`;
    message += `   📊 ${ranking.dailyVotes} votes aujourd'hui\n`;
    message += `   📊 ${ranking.previousDayVotes} votes hier\n`;
    message += '\n';
  });
  
  return message;
}

// Créer le menu des classements
function createRankingsMenu() {
  return {
    inline_keyboard: [
      [
        { text: '🏆 Top Global', callback_data: 'rankings_global' },
        { text: '📅 Top du Jour', callback_data: 'rankings_daily' }
      ],
      [
        { text: '📊 Top Semaine', callback_data: 'rankings_weekly' },
        { text: '📈 En Progression', callback_data: 'rankings_trending' }
      ],
      [
        { text: '🔙 Retour', callback_data: 'back_to_main' }
      ]
    ]
  };
}

// Nettoyer les anciennes données (à exécuter périodiquement)
async function cleanOldRankings(daysToKeep = 30) {
  try {
    const cutoffDate = moment().subtract(daysToKeep, 'days').toDate();
    const result = await DailyRanking.deleteMany({
      date: { $lt: cutoffDate }
    });
    console.log(`✅ ${result.deletedCount} anciens classements supprimés`);
  } catch (error) {
    console.error('Erreur lors du nettoyage des classements:', error);
  }
}

module.exports = {
  updateDailyRanking,
  getDailyTop,
  getWeeklyTop,
  getTrendingPlugs,
  formatDailyTop,
  formatWeeklyTop,
  formatTrendingPlugs,
  createRankingsMenu,
  cleanOldRankings
};
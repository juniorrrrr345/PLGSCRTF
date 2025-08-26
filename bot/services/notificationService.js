const cron = require('node-cron');
const User = require('../models/User');
const Plug = require('../models/Plug');
const UserStats = require('../models/UserStats');

class NotificationService {
  constructor(bot) {
    this.bot = bot;
    this.initScheduledJobs();
  }

  initScheduledJobs() {
    // Rappel quotidien à 10h00 pour voter
    cron.schedule('0 10 * * *', async () => {
      console.log('📢 Envoi des rappels quotidiens...');
      await this.sendDailyReminders();
    });

    // Rappel quotidien à 18h00 pour voter
    cron.schedule('0 18 * * *', async () => {
      console.log('📢 Envoi des rappels du soir...');
      await this.sendEveningReminders();
    });

    // Vérifier les nouveaux plugs toutes les heures
    cron.schedule('0 * * * *', async () => {
      console.log('🔍 Vérification des nouveaux plugs...');
      await this.checkNewPlugs();
    });

    console.log('✅ Service de notifications initialisé');
  }

  // Rappel quotidien du matin
  async sendDailyReminders() {
    try {
      const users = await User.find({ 
        isActive: { $ne: false },
        notifications: { $ne: false }
      });

      for (const user of users) {
        try {
          // Récupérer les stats de l'utilisateur
          const userStats = await UserStats.findOne({ userId: user.telegramId });
          
          let message = `☀️ <b>Bonjour ${user.firstName || 'toi'} !</b>\n\n`;
          
          if (userStats) {
            const votesForNextLevel = (userStats.level * 5) - userStats.totalVotes;
            
            if (votesForNextLevel > 0) {
              message += `📊 Tu es niveau ${userStats.level} avec ${userStats.points} points\n`;
              message += `📈 Plus que ${votesForNextLevel} votes pour le niveau ${userStats.level + 1} !\n\n`;
            }
            
            // Si l'utilisateur peut acheter des badges
            if (userStats.points >= 10) {
              message += `💎 Tu as ${userStats.points} points !\n`;
              message += `🛍️ Va dans la boutique pour acheter des badges !\n\n`;
            }
          }
          
          message += `🗳️ <b>N'oublie pas de voter aujourd'hui !</b>\n`;
          message += `Chaque vote te rapproche des récompenses 🎁\n\n`;
          message += `👉 Tape /start pour commencer`;

          await this.bot.sendMessage(user.telegramId, message, {
            parse_mode: 'HTML'
          });

          // Attendre un peu entre chaque envoi pour éviter le spam
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Erreur envoi rappel à ${user.telegramId}:`, error.message);
        }
      }

      console.log(`✅ ${users.length} rappels du matin envoyés`);
    } catch (error) {
      console.error('Erreur envoi rappels quotidiens:', error);
    }
  }

  // Rappel du soir
  async sendEveningReminders() {
    try {
      const users = await User.find({ 
        isActive: { $ne: false },
        notifications: { $ne: false }
      });

      // Filtrer les utilisateurs qui n'ont pas voté aujourd'hui
      const usersToNotify = [];
      for (const user of users) {
        const userStats = await UserStats.findOne({ userId: user.telegramId });
        
        if (userStats) {
          const lastVote = userStats.lastVoteDate;
          const today = new Date();
          
          // Si pas voté aujourd'hui
          if (!lastVote || lastVote.toDateString() !== today.toDateString()) {
            usersToNotify.push(user);
          }
        } else {
          // Si pas de stats, c'est qu'il n'a jamais voté
          usersToNotify.push(user);
        }
      }

      for (const user of usersToNotify) {
        try {
          const message = `🌙 <b>Bonsoir ${user.firstName || 'toi'} !</b>\n\n` +
            `⏰ Dernière chance de voter aujourd'hui !\n\n` +
            `🎯 Rappel : 5 votes = 1 niveau = 3 points\n` +
            `🛍️ Les points permettent d'acheter des badges\n` +
            `🎁 Les badges donnent de la pub gratuite aux plugs !\n\n` +
            `👉 Tape /start pour voter maintenant`;

          await this.bot.sendMessage(user.telegramId, message, {
            parse_mode: 'HTML'
          });

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Erreur envoi rappel soir à ${user.telegramId}:`, error.message);
        }
      }

      console.log(`✅ ${usersToNotify.length} rappels du soir envoyés`);
    } catch (error) {
      console.error('Erreur envoi rappels du soir:', error);
    }
  }

  // Vérifier et notifier les nouveaux plugs
  async checkNewPlugs() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Trouver les plugs créés dans la dernière heure
      const newPlugs = await Plug.find({
        createdAt: { $gte: oneHourAgo },
        isActive: true
      });

      if (newPlugs.length === 0) return;

      // Récupérer tous les utilisateurs actifs avec notifications
      const users = await User.find({ 
        isActive: { $ne: false },
        notifications: { $ne: false }
      });

      let message = `🆕 <b>NOUVEAUX PLUGS DISPONIBLES !</b>\n\n`;
      
      for (const plug of newPlugs) {
        message += `🔌 <b>${plug.name}</b>\n`;
        if (plug.description) {
          message += `📝 ${plug.description.substring(0, 50)}...\n`;
        }
        message += `💰 Prix: ${plug.price || 'Non défini'}\n\n`;
      }
      
      message += `🗳️ Vote pour tes plugs préférés !\n`;
      message += `👉 Tape /start pour voir les nouveaux plugs`;

      // Envoyer à tous les utilisateurs
      let sentCount = 0;
      for (const user of users) {
        try {
          await this.bot.sendMessage(user.telegramId, message, {
            parse_mode: 'HTML'
          });
          sentCount++;
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Erreur notification nouveau plug à ${user.telegramId}:`, error.message);
        }
      }

      console.log(`✅ ${sentCount} notifications envoyées pour ${newPlugs.length} nouveaux plugs`);
    } catch (error) {
      console.error('Erreur vérification nouveaux plugs:', error);
    }
  }

  // Envoyer une notification personnalisée
  async sendCustomNotification(userId, message) {
    try {
      await this.bot.sendMessage(userId, message, {
        parse_mode: 'HTML'
      });
      return true;
    } catch (error) {
      console.error(`Erreur envoi notification à ${userId}:`, error);
      return false;
    }
  }

  // Notification de niveau supérieur
  async sendLevelUpNotification(userId, newLevel, points) {
    const message = `🎉 <b>FÉLICITATIONS !</b>\n\n` +
      `🎯 Tu viens de passer au niveau ${newLevel} !\n` +
      `⭐ Tu as maintenant ${points} points\n\n` +
      `${newLevel >= 10 ? '🛍️ Va dans la boutique acheter des badges !\n' : ''}` +
      `${newLevel === 10 ? '🔓 Boutique de badges débloquée !\n' : ''}` +
      `\n👉 Continue à voter pour gagner plus de points !`;

    return this.sendCustomNotification(userId, message);
  }

  // Notification d'achat de badge réussi
  async sendBadgePurchaseNotification(userId, badgeName, badgeEmoji, shopReward) {
    let message = `✅ <b>BADGE ACHETÉ AVEC SUCCÈS !</b>\n\n` +
      `${badgeEmoji} Tu as acheté le badge "${badgeName}"\n\n`;
    
    if (shopReward && shopReward.freeAdDays > 0) {
      message += `🎁 <b>Récompense:</b>\n` +
        `📢 ${shopReward.freeAdDays} jours de pub gratuite pour ton plug !\n` +
        `📧 Contacte l'admin pour activer ta récompense\n\n`;
    }
    
    message += `🏆 Continue à collectionner des badges !`;

    return this.sendCustomNotification(userId, message);
  }

  // Activer/Désactiver les notifications pour un utilisateur
  async toggleNotifications(userId, enabled) {
    try {
      await User.findOneAndUpdate(
        { telegramId: userId },
        { notifications: enabled }
      );
      
      const message = enabled 
        ? '✅ Notifications activées ! Tu recevras des rappels quotidiens et les alertes de nouveaux plugs.'
        : '🔕 Notifications désactivées. Tu ne recevras plus de rappels.';
      
      return this.sendCustomNotification(userId, message);
    } catch (error) {
      console.error('Erreur toggle notifications:', error);
      return false;
    }
  }
}

module.exports = NotificationService;
const UserPreferences = require('../models/UserPreferences');
const DailyRanking = require('../models/DailyRanking');
const Battle = require('../models/Battle');
const Plug = require('../../models/Plug');
const User = require('../../models/User');
const moment = require('moment');
moment.locale('fr');

// Envoyer une notification à un utilisateur
async function sendNotification(bot, userId, message, keyboard = null) {
  try {
    // Récupérer l'utilisateur et ses préférences
    const user = await User.findById(userId);
    if (!user || !user.telegramId) return false;
    
    const userPrefs = await UserPreferences.findOne({ userId });
    if (!userPrefs) return false;
    
    // Vérifier si l'utilisateur peut recevoir une notification
    if (!userPrefs.canReceiveNotification()) {
      console.log(`Notification ignorée pour ${user.telegramId}: limite atteinte ou hors horaires`);
      return false;
    }
    
    // Envoyer la notification
    const options = {
      parse_mode: 'HTML',
      disable_notification: false
    };
    
    if (keyboard) {
      options.reply_markup = keyboard;
    }
    
    await bot.sendMessage(user.telegramId, message, options);
    
    // Mettre à jour les compteurs
    userPrefs.notifications.lastNotificationAt = new Date();
    userPrefs.notifications.dailyCount += 1;
    await userPrefs.save();
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de notification:', error);
    return false;
  }
}

// Notifier les utilisateurs quand leur plug favori atteint un palier
async function notifyMilestone(bot, plugId, milestone) {
  try {
    const plug = await Plug.findById(plugId);
    if (!plug) return;
    
    // Trouver les utilisateurs qui ont ce plug en favori
    const userPrefs = await UserPreferences.find({
      'favoritePlugs.plugId': plugId,
      'favoritePlugs.notifications.onMilestone': true
    });
    
    let message = '';
    let emoji = '';
    
    switch (milestone) {
      case 'top10':
        emoji = '🎖️';
        message = `${emoji} <b>Félicitations !</b>\n\n`;
        message += `Ton plug favori <b>${plug.name}</b> vient d'entrer dans le TOP 10 ! 🎉\n\n`;
        message += `Continue à voter pour le pousser encore plus haut ! 🚀`;
        break;
        
      case 'top3':
        emoji = '🥉';
        message = `${emoji} <b>Incroyable !</b>\n\n`;
        message += `<b>${plug.name}</b> est maintenant dans le TOP 3 ! 🔥\n\n`;
        message += `Plus que quelques votes pour atteindre la première place ! 💪`;
        break;
        
      case 'top1':
        emoji = '🥇';
        message = `${emoji} <b>VICTOIRE !</b>\n\n`;
        message += `<b>${plug.name}</b> est maintenant NUMÉRO 1 ! 👑\n\n`;
        message += `Bravo pour ton soutien ! Continue à voter pour maintenir cette position ! 🏆`;
        break;
        
      case '100votes':
        emoji = '💯';
        message = `${emoji} <b>Cap des 100 votes franchi !</b>\n\n`;
        message += `<b>${plug.name}</b> a dépassé les 100 votes grâce à toi ! 🎯\n\n`;
        message += `Prochain objectif: 500 votes ! 🚀`;
        break;
        
      case '500votes':
        emoji = '🎊';
        message = `${emoji} <b>500 votes !</b>\n\n`;
        message += `<b>${plug.name}</b> cartonne avec 500 votes ! 🔥\n\n`;
        message += `C'est grâce à des supporters comme toi ! 💪`;
        break;
        
      case '1000votes':
        emoji = '🌟';
        message = `${emoji} <b>1000 VOTES !</b>\n\n`;
        message += `<b>${plug.name}</b> a atteint le cap mythique des 1000 votes ! 🏆\n\n`;
        message += `Tu fais partie de cette légende ! 👑`;
        break;
    }
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '🗳️ Voir le classement', callback_data: 'plugs' }],
        [{ text: '📊 Voir mes stats', callback_data: 'my_badges' }]
      ]
    };
    
    // Envoyer les notifications
    let sent = 0;
    for (const prefs of userPrefs) {
      if (await sendNotification(bot, prefs.userId, message, keyboard)) {
        sent++;
      }
    }
    
    console.log(`✅ ${sent} notifications de palier envoyées pour ${plug.name}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de palier:', error);
  }
}

// Notifier le début d'une battle
async function notifyBattleStart(bot, battleId) {
  try {
    const battle = await Battle.findById(battleId)
      .populate('participants.plugId');
    
    if (!battle || battle.notifications.startSent) return;
    
    const [p1, p2] = battle.participants;
    
    let message = `⚔️ <b>NOUVELLE BATTLE !</b> ⚔️\n\n`;
    message += `${battle.title}\n\n`;
    message += `🔵 <b>${p1.plugId.name}</b>\n`;
    message += `       VS\n`;
    message += `🔴 <b>${p2.plugId.name}</b>\n\n`;
    message += `⏰ Durée: ${moment(battle.endDate).diff(battle.startDate, 'hours')} heures\n`;
    message += `📅 Fin: ${moment(battle.endDate).format('dddd D MMMM à HH:mm')}\n\n`;
    message += `🗳️ Vote maintenant pour ton favori !`;
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '⚔️ Participer à la battle', callback_data: `battle_view_${battle._id}` }]
      ]
    };
    
    // Trouver tous les utilisateurs intéressés par les battles
    const userPrefs = await UserPreferences.find({
      'notifications.battles.enabled': true,
      'notifications.battles.onStart': true
    });
    
    // Ajouter les utilisateurs qui ont l'un des plugs en favori
    const favoriteUsers = await UserPreferences.find({
      $or: [
        { 'favoritePlugs.plugId': p1.plugId._id },
        { 'favoritePlugs.plugId': p2.plugId._id }
      ]
    });
    
    const allUsers = [...new Set([...userPrefs, ...favoriteUsers])];
    
    let sent = 0;
    for (const prefs of allUsers) {
      if (await sendNotification(bot, prefs.userId, message, keyboard)) {
        sent++;
      }
    }
    
    battle.notifications.startSent = true;
    await battle.save();
    
    console.log(`✅ ${sent} notifications de début de battle envoyées`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de battle:', error);
  }
}

// Rappel pour voter dans une battle
async function notifyBattleReminder(bot, battleId) {
  try {
    const battle = await Battle.findById(battleId)
      .populate('participants.plugId');
    
    if (!battle || battle.notifications.reminderSent) return;
    
    const timeLeft = moment(battle.endDate).diff(moment(), 'hours');
    if (timeLeft > 24 || timeLeft < 12) return; // Rappel à mi-parcours
    
    const [p1, p2] = battle.participants;
    const leader = battle.getCurrentLeader();
    
    let message = `⏰ <b>RAPPEL BATTLE !</b> ⏰\n\n`;
    message += `Il reste ${timeLeft} heures pour voter !\n\n`;
    
    if (leader) {
      const leadPlug = leader.plugId._id.toString() === p1.plugId._id.toString() ? p1.plugId : p2.plugId;
      message += `👑 <b>${leadPlug.name}</b> mène avec ${leader.votes} votes\n\n`;
    } else {
      message += `⚖️ Égalité parfaite ! Chaque vote compte !\n\n`;
    }
    
    message += `🔥 C'est le moment de faire la différence !`;
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '🗳️ Voter maintenant', callback_data: `battle_view_${battle._id}` }]
      ]
    };
    
    // Cibler les utilisateurs qui n'ont pas encore voté
    const voterIds = battle.participants.flatMap(p => p.voters.map(v => v.userId.toString()));
    const userPrefs = await UserPreferences.find({
      'notifications.battles.onReminder': true,
      userId: { $nin: voterIds }
    });
    
    let sent = 0;
    for (const prefs of userPrefs) {
      if (await sendNotification(bot, prefs.userId, message, keyboard)) {
        sent++;
      }
    }
    
    battle.notifications.reminderSent = true;
    await battle.save();
    
    console.log(`✅ ${sent} rappels de battle envoyés`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels de battle:', error);
  }
}

// Notifier la fin imminente d'une battle
async function notifyBattleEndingSoon(bot, battleId) {
  try {
    const battle = await Battle.findById(battleId)
      .populate('participants.plugId');
    
    if (!battle || battle.notifications.endingSoonSent) return;
    
    const timeLeft = moment(battle.endDate).diff(moment(), 'hours');
    if (timeLeft > 2) return; // Notification dans les 2 dernières heures
    
    const [p1, p2] = battle.participants;
    const diff = Math.abs(p1.votes - p2.votes);
    
    let message = `🚨 <b>DERNIÈRE CHANCE !</b> 🚨\n\n`;
    message += `La battle se termine dans ${timeLeft} heure${timeLeft > 1 ? 's' : ''} !\n\n`;
    
    if (diff <= 5) {
      message += `⚡ La bataille est TRÈS serrée !\n`;
      message += `Seulement ${diff} vote${diff > 1 ? 's' : ''} d'écart !\n\n`;
      message += `🔥 Chaque vote peut faire la différence !`;
    } else {
      const leader = p1.votes > p2.votes ? p1.plugId : p2.plugId;
      const trailing = p1.votes > p2.votes ? p2.plugId : p1.plugId;
      message += `👑 ${leader.name} mène\n`;
      message += `📊 ${trailing.name} a besoin de ton soutien !\n\n`;
      message += `⚡ Renverse la situation !`;
    }
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '🏃 Voter en urgence !', callback_data: `battle_view_${battle._id}` }]
      ]
    };
    
    // Cibler tous les utilisateurs intéressés
    const userPrefs = await UserPreferences.find({
      'notifications.battles.enabled': true
    });
    
    let sent = 0;
    for (const prefs of userPrefs) {
      if (await sendNotification(bot, prefs.userId, message, keyboard)) {
        sent++;
      }
    }
    
    battle.notifications.endingSoonSent = true;
    await battle.save();
    
    console.log(`✅ ${sent} notifications de fin imminente envoyées`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de fin imminente:', error);
  }
}

// Notifier les résultats d'une battle
async function notifyBattleResults(bot, battleId) {
  try {
    const battle = await Battle.findById(battleId)
      .populate('participants.plugId')
      .populate('winner.plugId');
    
    if (!battle || battle.notifications.resultsSent) return;
    
    const [p1, p2] = battle.participants;
    
    let message = `🏆 <b>RÉSULTATS DE LA BATTLE</b> 🏆\n\n`;
    message += `${battle.title}\n\n`;
    
    if (battle.winner) {
      const winner = battle.winner.plugId._id.toString() === p1.plugId._id.toString() 
        ? p1.plugId : p2.plugId;
      const loser = battle.winner.plugId._id.toString() === p1.plugId._id.toString() 
        ? p2.plugId : p1.plugId;
        
      message += `🥇 <b>VAINQUEUR: ${winner.name}</b>\n`;
      message += `📊 ${battle.winner.finalVotes} votes\n\n`;
      message += `🥈 ${loser.name}\n`;
      message += `📊 ${battle.stats.totalVotes - battle.winner.finalVotes} votes\n\n`;
      
      if (battle.winner.margin <= 10) {
        message += `⚡ Victoire serrée ! Seulement ${battle.winner.margin} vote${battle.winner.margin > 1 ? 's' : ''} d'écart !`;
      } else {
        message += `💪 Victoire écrasante avec ${battle.winner.margin} votes d'avance !`;
      }
    } else {
      message += `⚖️ <b>ÉGALITÉ PARFAITE !</b>\n\n`;
      message += `Les deux plugs terminent avec ${p1.votes} votes chacun !`;
    }
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '📊 Voir tous les résultats', callback_data: 'battles_history' }],
        [{ text: '⚔️ Prochaine battle', callback_data: 'battles_active' }]
      ]
    };
    
    // Notifier tous les participants
    const voterIds = battle.participants.flatMap(p => p.voters.map(v => v.userId));
    const uniqueVoters = [...new Set(voterIds.map(id => id.toString()))];
    
    let sent = 0;
    for (const userId of uniqueVoters) {
      if (await sendNotification(bot, userId, message, keyboard)) {
        sent++;
      }
    }
    
    battle.notifications.resultsSent = true;
    await battle.save();
    
    console.log(`✅ ${sent} notifications de résultats envoyées`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de résultats:', error);
  }
}

// Notifier le top du jour
async function notifyDailyTop(bot) {
  try {
    const rankings = await DailyRanking.find({
      date: moment().startOf('day').toDate()
    })
      .populate('plugId')
      .sort({ dailyVotes: -1 })
      .limit(3);
    
    if (rankings.length === 0) return;
    
    let message = `📅 <b>TOP DU JOUR</b> 📅\n`;
    message += `${moment().format('dddd D MMMM')}\n\n`;
    
    rankings.forEach((ranking, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      message += `${medal} ${ranking.plugId.name}\n`;
      message += `   📊 ${ranking.dailyVotes} votes\n`;
      if (ranking.growthRate > 0) {
        message += `   📈 +${ranking.growthRate.toFixed(0)}% vs hier\n`;
      }
      message += '\n';
    });
    
    message += `🔥 Vote pour faire monter ton plug favori !`;
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '📊 Voir tout le classement', callback_data: 'rankings_daily' }],
        [{ text: '🗳️ Voter maintenant', callback_data: 'plugs' }]
      ]
    };
    
    // Envoyer aux utilisateurs qui veulent le top du jour
    const userPrefs = await UserPreferences.find({
      'notifications.rankings.dailyTop': true
    });
    
    let sent = 0;
    for (const prefs of userPrefs) {
      if (await sendNotification(bot, prefs.userId, message, keyboard)) {
        sent++;
      }
    }
    
    console.log(`✅ ${sent} notifications du top du jour envoyées`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du top du jour:', error);
  }
}

// Gérer les préférences de notification
async function updateNotificationPreferences(userId, preferences) {
  try {
    let userPrefs = await UserPreferences.findOne({ userId });
    if (!userPrefs) {
      userPrefs = await UserPreferences.create({ userId });
    }
    
    // Mettre à jour les préférences
    Object.assign(userPrefs.notifications, preferences);
    await userPrefs.save();
    
    return userPrefs;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    return null;
  }
}

// Ajouter/retirer un plug favori
async function toggleFavoritePlug(userId, plugId) {
  try {
    let userPrefs = await UserPreferences.findOne({ userId });
    if (!userPrefs) {
      userPrefs = await UserPreferences.create({ userId });
    }
    
    const favoriteIndex = userPrefs.favoritePlugs.findIndex(
      f => f.plugId.toString() === plugId.toString()
    );
    
    if (favoriteIndex === -1) {
      // Ajouter aux favoris
      userPrefs.favoritePlugs.push({
        plugId,
        notifications: {
          onMilestone: true,
          onBattle: true,
          onTopPosition: true
        }
      });
      await userPrefs.save();
      return { added: true, userPrefs };
    } else {
      // Retirer des favoris
      userPrefs.favoritePlugs.splice(favoriteIndex, 1);
      await userPrefs.save();
      return { added: false, userPrefs };
    }
  } catch (error) {
    console.error('Erreur lors de la gestion du favori:', error);
    return null;
  }
}

// Formater le menu des préférences
function formatPreferencesMenu(userPrefs) {
  const prefs = userPrefs.notifications;
  
  let message = '⚙️ <b>PRÉFÉRENCES DE NOTIFICATION</b>\n';
  message += '━━━━━━━━━━━━━━━━\n\n';
  
  message += '📱 <b>Types de notifications:</b>\n';
  message += `${prefs.badges.enabled ? '✅' : '❌'} Badges et récompenses\n`;
  message += `${prefs.rankings.enabled ? '✅' : '❌'} Classements\n`;
  message += `${prefs.battles.enabled ? '✅' : '❌'} Battles\n\n`;
  
  message += '⏰ <b>Horaires préférés:</b>\n';
  message += `${prefs.preferredTimes.morning ? '✅' : '❌'} Matin (8h-12h)\n`;
  message += `${prefs.preferredTimes.afternoon ? '✅' : '❌'} Après-midi (12h-18h)\n`;
  message += `${prefs.preferredTimes.evening ? '✅' : '❌'} Soir (18h-22h)\n`;
  message += `${prefs.preferredTimes.night ? '✅' : '❌'} Nuit (22h-8h)\n\n`;
  
  message += `📊 <b>Limite quotidienne:</b> ${prefs.maxDaily} notifications/jour\n`;
  
  if (userPrefs.favoritePlugs.length > 0) {
    message += `\n⭐ <b>Plugs favoris:</b> ${userPrefs.favoritePlugs.length}`;
  }
  
  return message;
}

// Créer le clavier des préférences
function createPreferencesKeyboard(userPrefs) {
  const prefs = userPrefs.notifications;
  
  return {
    inline_keyboard: [
      [
        { 
          text: `${prefs.badges.enabled ? '✅' : '❌'} Badges`, 
          callback_data: 'pref_toggle_badges' 
        },
        { 
          text: `${prefs.rankings.enabled ? '✅' : '❌'} Classements`, 
          callback_data: 'pref_toggle_rankings' 
        }
      ],
      [
        { 
          text: `${prefs.battles.enabled ? '✅' : '❌'} Battles`, 
          callback_data: 'pref_toggle_battles' 
        },
        { 
          text: `${prefs.rankings.dailyTop ? '✅' : '❌'} Top du jour`, 
          callback_data: 'pref_toggle_daily' 
        }
      ],
      [
        { text: '⏰ Horaires', callback_data: 'pref_times' },
        { text: '⭐ Favoris', callback_data: 'pref_favorites' }
      ],
      [
        { text: '🔙 Retour', callback_data: 'back_to_main' }
      ]
    ]
  };
}

module.exports = {
  sendNotification,
  notifyMilestone,
  notifyBattleStart,
  notifyBattleReminder,
  notifyBattleEndingSoon,
  notifyBattleResults,
  notifyDailyTop,
  updateNotificationPreferences,
  toggleFavoritePlug,
  formatPreferencesMenu,
  createPreferencesKeyboard
};
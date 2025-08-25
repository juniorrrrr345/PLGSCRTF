const Battle = require('../models/Battle');
const Plug = require('../../models/Plug');
const User = require('../../models/User');
const UserPreferences = require('../models/UserPreferences');
const { checkUserBadges } = require('./badgeHandler');
const moment = require('moment');
moment.locale('fr');

// Créer une nouvelle battle
async function createBattle(title, plugId1, plugId2, duration = 48, type = 'duel') {
  try {
    const startDate = new Date();
    const endDate = moment(startDate).add(duration, 'hours').toDate();
    
    const battle = await Battle.create({
      title,
      type,
      participants: [
        { plugId: plugId1, votes: 0, voters: [] },
        { plugId: plugId2, votes: 0, voters: [] }
      ],
      startDate,
      endDate,
      status: 'scheduled'
    });
    
    // Programmer le démarrage automatique
    if (startDate <= new Date()) {
      battle.status = 'active';
      await battle.save();
    }
    
    return battle;
  } catch (error) {
    console.error('Erreur lors de la création de la battle:', error);
    return null;
  }
}

// Voter dans une battle
async function voteInBattle(battleId, userId, plugId) {
  try {
    const battle = await Battle.findById(battleId);
    if (!battle) return { success: false, error: 'Battle introuvable' };
    
    // Vérifier que la battle est active
    if (!battle.isActive()) {
      return { success: false, error: 'Cette battle n\'est pas active' };
    }
    
    // Trouver le participant
    const participantIndex = battle.participants.findIndex(
      p => p.plugId.toString() === plugId.toString()
    );
    
    if (participantIndex === -1) {
      return { success: false, error: 'Ce plug ne participe pas à cette battle' };
    }
    
    // Vérifier si l'utilisateur a déjà voté
    const hasVoted = battle.participants.some(p => 
      p.voters.some(v => v.userId.toString() === userId.toString())
    );
    
    if (hasVoted) {
      return { success: false, error: 'Tu as déjà voté dans cette battle' };
    }
    
    // Ajouter le vote
    battle.participants[participantIndex].votes += 1;
    battle.participants[participantIndex].voters.push({
      userId,
      votedAt: new Date()
    });
    
    // Mettre à jour les stats
    battle.stats.totalVotes += 1;
    battle.stats.uniqueVoters = new Set(
      battle.participants.flatMap(p => p.voters.map(v => v.userId.toString()))
    ).size;
    
    // Vérifier s'il y a un changement de leader
    const currentLeader = battle.getCurrentLeader();
    if (currentLeader && battle.stats.comebackMoments.length > 0) {
      const lastMoment = battle.stats.comebackMoments[battle.stats.comebackMoments.length - 1];
      if (lastMoment.plugId.toString() !== currentLeader.plugId.toString()) {
        battle.stats.comebackMoments.push({
          timestamp: new Date(),
          leadChange: true,
          plugId: currentLeader.plugId
        });
      }
    } else if (currentLeader) {
      battle.stats.comebackMoments.push({
        timestamp: new Date(),
        leadChange: false,
        plugId: currentLeader.plugId
      });
    }
    
    await battle.save();
    
    // Mettre à jour les stats utilisateur
    const userPrefs = await UserPreferences.findOne({ userId }) ||
                     await UserPreferences.create({ userId });
    
    if (!userPrefs.stats.battlesParticipated) {
      userPrefs.stats.battlesParticipated = 1;
    }
    
    await userPrefs.save();
    
    return { 
      success: true, 
      battle,
      participant: battle.participants[participantIndex]
    };
  } catch (error) {
    console.error('Erreur lors du vote dans la battle:', error);
    return { success: false, error: 'Erreur lors du vote' };
  }
}

// Obtenir les battles actives
async function getActiveBattles() {
  try {
    const now = new Date();
    const battles = await Battle.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('participants.plugId');
    
    return battles;
  } catch (error) {
    console.error('Erreur lors de la récupération des battles actives:', error);
    return [];
  }
}

// Obtenir l'historique des battles
async function getBattleHistory(limit = 10) {
  try {
    const battles = await Battle.find({
      status: 'finished'
    })
      .populate('participants.plugId')
      .populate('winner.plugId')
      .sort({ endDate: -1 })
      .limit(limit);
    
    return battles;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
}

// Terminer une battle
async function finishBattle(battleId) {
  try {
    const battle = await Battle.findById(battleId)
      .populate('participants.plugId');
    
    if (!battle || battle.status === 'finished') {
      return null;
    }
    
    // Déterminer le gagnant
    const [p1, p2] = battle.participants;
    let winner = null;
    
    if (p1.votes > p2.votes) {
      winner = {
        plugId: p1.plugId._id,
        finalVotes: p1.votes,
        margin: p1.votes - p2.votes
      };
    } else if (p2.votes > p1.votes) {
      winner = {
        plugId: p2.plugId._id,
        finalVotes: p2.votes,
        margin: p2.votes - p1.votes
      };
    }
    
    battle.winner = winner;
    battle.status = 'finished';
    
    // Attribuer les récompenses aux participants
    if (winner) {
      // Mettre à jour les stats du gagnant
      const winnerVoters = battle.participants
        .find(p => p.plugId._id.toString() === winner.plugId.toString())
        .voters;
      
      for (const voter of winnerVoters) {
        const userPrefs = await UserPreferences.findOne({ userId: voter.userId }) ||
                         await UserPreferences.create({ userId: voter.userId });
        
        userPrefs.stats.battlesWon = (userPrefs.stats.battlesWon || 0) + 1;
        userPrefs.stats.points += 100; // Points de victoire
        
        await userPrefs.save();
        
        // Vérifier les badges de victoire
        await checkUserBadges(voter.userId, { battleWin: true });
      }
    }
    
    await battle.save();
    return battle;
  } catch (error) {
    console.error('Erreur lors de la fin de la battle:', error);
    return null;
  }
}

// Formater l'affichage d'une battle active
function formatActiveBattle(battle) {
  const [p1, p2] = battle.participants;
  const totalVotes = p1.votes + p2.votes;
  const p1Percentage = totalVotes > 0 ? (p1.votes / totalVotes * 100).toFixed(1) : 0;
  const p2Percentage = totalVotes > 0 ? (p2.votes / totalVotes * 100).toFixed(1) : 0;
  
  let message = `⚔️ <b>${battle.title}</b> ⚔️\n`;
  message += '━━━━━━━━━━━━━━━━\n\n';
  
  // Temps restant
  const timeLeft = moment(battle.endDate).fromNow(true);
  message += `⏰ Temps restant: ${timeLeft}\n`;
  message += `📊 Total des votes: ${totalVotes}\n\n`;
  
  // Participant 1
  message += `🔵 <b>${p1.plugId.name}</b>\n`;
  message += `${createProgressBar(p1Percentage)} ${p1Percentage}%\n`;
  message += `📊 ${p1.votes} vote${p1.votes > 1 ? 's' : ''}\n\n`;
  
  // VS
  message += '⚡ <b>VS</b> ⚡\n\n';
  
  // Participant 2
  message += `🔴 <b>${p2.plugId.name}</b>\n`;
  message += `${createProgressBar(p2Percentage)} ${p2Percentage}%\n`;
  message += `📊 ${p2.votes} vote${p2.votes > 1 ? 's' : ''}\n\n`;
  
  // Leader actuel
  const leader = battle.getCurrentLeader();
  if (leader) {
    const leadPlug = leader.plugId._id.toString() === p1.plugId._id.toString() ? p1.plugId : p2.plugId;
    message += `👑 En tête: <b>${leadPlug.name}</b>\n`;
  } else {
    message += `⚖️ <b>Égalité parfaite !</b>\n`;
  }
  
  // Moments de retournement
  if (battle.stats.comebackMoments.length > 1) {
    const changes = battle.stats.comebackMoments.filter(m => m.leadChange).length;
    if (changes > 0) {
      message += `🔄 ${changes} changement${changes > 1 ? 's' : ''} de leader\n`;
    }
  }
  
  return message;
}

// Formater l'affichage des résultats d'une battle
function formatBattleResults(battle) {
  const [p1, p2] = battle.participants;
  const totalVotes = p1.votes + p2.votes;
  
  let message = `🏆 <b>RÉSULTATS - ${battle.title}</b> 🏆\n`;
  message += '━━━━━━━━━━━━━━━━\n\n';
  
  if (battle.winner) {
    const winnerPlug = battle.winner.plugId._id.toString() === p1.plugId._id.toString() 
      ? p1.plugId : p2.plugId;
    
    message += `🥇 <b>VAINQUEUR: ${winnerPlug.name}</b> 🥇\n`;
    message += `✨ Victoire avec ${battle.winner.finalVotes} votes\n`;
    message += `📊 Marge de victoire: ${battle.winner.margin} vote${battle.winner.margin > 1 ? 's' : ''}\n\n`;
  } else {
    message += `⚖️ <b>MATCH NUL !</b> ⚖️\n\n`;
  }
  
  // Détails des participants
  message += '<b>Résultats détaillés:</b>\n\n';
  
  // Participant 1
  const p1Percentage = totalVotes > 0 ? (p1.votes / totalVotes * 100).toFixed(1) : 0;
  message += `${battle.winner && battle.winner.plugId._id.toString() === p1.plugId._id.toString() ? '🥇' : '🥈'} <b>${p1.plugId.name}</b>\n`;
  message += `📊 ${p1.votes} votes (${p1Percentage}%)\n`;
  message += `👥 ${p1.voters.length} votants\n\n`;
  
  // Participant 2
  const p2Percentage = totalVotes > 0 ? (p2.votes / totalVotes * 100).toFixed(1) : 0;
  message += `${battle.winner && battle.winner.plugId._id.toString() === p2.plugId._id.toString() ? '🥇' : '🥈'} <b>${p2.plugId.name}</b>\n`;
  message += `📊 ${p2.votes} votes (${p2Percentage}%)\n`;
  message += `👥 ${p2.voters.length} votants\n\n`;
  
  // Statistiques de la battle
  message += '<b>Statistiques:</b>\n';
  message += `📊 Total des votes: ${totalVotes}\n`;
  message += `👥 Participants uniques: ${battle.stats.uniqueVoters}\n`;
  
  if (battle.stats.comebackMoments.length > 1) {
    const changes = battle.stats.comebackMoments.filter(m => m.leadChange).length;
    if (changes > 0) {
      message += `🔄 ${changes} changement${changes > 1 ? 's' : ''} de leader\n`;
    }
  }
  
  message += `📅 Durée: ${moment(battle.startDate).format('DD/MM')} - ${moment(battle.endDate).format('DD/MM')}\n`;
  
  return message;
}

// Créer une barre de progression visuelle
function createProgressBar(percentage) {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Créer le clavier pour voter dans une battle
function createBattleKeyboard(battle) {
  const [p1, p2] = battle.participants;
  
  return {
    inline_keyboard: [
      [
        { 
          text: `🔵 ${p1.plugId.name} (${p1.votes})`, 
          callback_data: `battle_vote_${battle._id}_${p1.plugId._id}` 
        }
      ],
      [
        { 
          text: `🔴 ${p2.plugId.name} (${p2.votes})`, 
          callback_data: `battle_vote_${battle._id}_${p2.plugId._id}` 
        }
      ],
      [
        { text: '📊 Voir les détails', callback_data: `battle_details_${battle._id}` },
        { text: '🔙 Retour', callback_data: 'battles_menu' }
      ]
    ]
  };
}

// Menu principal des battles
function createBattlesMenu() {
  return {
    inline_keyboard: [
      [
        { text: '⚔️ Battles en cours', callback_data: 'battles_active' },
        { text: '🏆 Historique', callback_data: 'battles_history' }
      ],
      [
        { text: '📊 Mes stats de battle', callback_data: 'battles_mystats' }
      ],
      [
        { text: '🔙 Menu principal', callback_data: 'back_to_main' }
      ]
    ]
  };
}

// Programmer les battles automatiques du week-end
async function scheduleWeekendBattle() {
  try {
    // Vérifier s'il y a déjà une battle ce week-end
    const friday = moment().day(5).startOf('day').toDate();
    const sunday = moment().day(7).endOf('day').toDate();
    
    const existingBattle = await Battle.findOne({
      type: 'weekend',
      startDate: { $gte: friday, $lte: sunday }
    });
    
    if (existingBattle) {
      console.log('Une battle de week-end existe déjà');
      return null;
    }
    
    // Sélectionner les 2 meilleurs plugs de la semaine
    const topPlugs = await Plug.find({ isActive: true })
      .sort({ likes: -1 })
      .limit(4);
    
    if (topPlugs.length < 2) {
      console.log('Pas assez de plugs pour créer une battle');
      return null;
    }
    
    // Sélectionner aléatoirement 2 plugs parmi le top 4
    const shuffled = topPlugs.sort(() => 0.5 - Math.random());
    const [plug1, plug2] = shuffled.slice(0, 2);
    
    // Créer la battle du week-end (vendredi 18h à dimanche 22h)
    const startDate = moment().day(5).hour(18).minute(0).second(0).toDate();
    const endDate = moment().day(7).hour(22).minute(0).second(0).toDate();
    
    const battle = await Battle.create({
      title: '🔥 Battle du Week-end 🔥',
      description: 'La battle hebdomadaire des meilleurs plugs !',
      type: 'weekend',
      participants: [
        { plugId: plug1._id, votes: 0, voters: [] },
        { plugId: plug2._id, votes: 0, voters: [] }
      ],
      startDate,
      endDate,
      status: startDate <= new Date() ? 'active' : 'scheduled'
    });
    
    console.log(`✅ Battle du week-end créée: ${plug1.name} vs ${plug2.name}`);
    return battle;
  } catch (error) {
    console.error('Erreur lors de la programmation de la battle du week-end:', error);
    return null;
  }
}

module.exports = {
  createBattle,
  voteInBattle,
  getActiveBattles,
  getBattleHistory,
  finishBattle,
  formatActiveBattle,
  formatBattleResults,
  createBattleKeyboard,
  createBattlesMenu,
  scheduleWeekendBattle
};
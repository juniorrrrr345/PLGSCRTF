const User = require('../models/User');
const Settings = require('../models/Settings');
const { requireChannelMembership } = require('../middleware/channelCheck');
const { checkMaintenanceMode } = require('../middleware/maintenanceCheck');
const { syncUserToWebApp } = require('../utils/userSync');

// Fonction pour supprimer les anciens messages du bot uniquement
async function clearOldMessages(bot, chatId, currentMessageId) {
  try {
    // Essayer de supprimer les messages précédents du bot
    // On commence à partir du message précédent (currentMessageId - 1)
    for (let i = 1; i <= 10; i++) {
      const messageIdToDelete = currentMessageId - i;
      if (messageIdToDelete > 0) {
        try {
          // Tenter de supprimer le message
          // Si c'est un message de l'utilisateur, cela échouera silencieusement
          await bot.deleteMessage(chatId, messageIdToDelete);
        } catch (e) {
          // Ignorer les erreurs (message de l'utilisateur, déjà supprimé, etc.)
        }
      }
    }
  } catch (error) {
    console.log('Erreur lors de la suppression des anciens messages:', error.message);
  }
}

async function handleStart(bot, msg, param) {
  console.log('📱 handleStart appelé pour:', msg.from.username || msg.from.first_name);
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name;
  
  try {
    // Supprimer les anciens messages du bot (mais pas la commande /start de l'utilisateur)
    await clearOldMessages(bot, chatId, msg.message_id);
    
    // Créer ou mettre à jour l'utilisateur
    let user = await User.findOne({ telegramId: userId });
    
    if (!user) {
      user = new User({
        telegramId: userId,
        username: username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
        joinedAt: new Date()
      });
      
      // Gérer le parrainage
      if (param && param.startsWith('ref_')) {
        const referrerId = param.replace('ref_', '');
        const referrer = await User.findById(referrerId);
        
        if (referrer && referrer.telegramId !== userId) {
          user.referredBy = referrerId;
          referrer.referralCount = (referrer.referralCount || 0) + 1;
          await referrer.save();
          
          await bot.sendMessage(chatId, 
            `🎉 Vous avez été parrainé par @${referrer.username} !`,
            { parse_mode: 'HTML' }
          );
        }
      }
      
      await user.save();
      
      // Synchroniser le nouvel utilisateur avec la boutique web et attendre le résultat
      console.log('🔄 Synchronisation du nouvel utilisateur...');
      const syncSuccess = await syncUserToWebApp(user);
      if (!syncSuccess) {
        console.error('⚠️ La synchronisation a échoué mais l\'utilisateur a été créé localement');
      }
    } else {
      // Mettre à jour les informations si elles ont changé
      let needsUpdate = false;
      
      if (user.username !== username) {
        user.username = username;
        needsUpdate = true;
      }
      if (user.firstName !== msg.from.first_name) {
        user.firstName = msg.from.first_name;
        needsUpdate = true;
      }
      if (user.lastName !== msg.from.last_name) {
        user.lastName = msg.from.last_name;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        // Synchroniser les mises à jour avec la boutique web
        console.log('🔄 Synchronisation des mises à jour utilisateur...');
        const syncSuccess = await syncUserToWebApp(user);
        if (!syncSuccess) {
          console.error('⚠️ La synchronisation des mises à jour a échoué');
        }
      }
    }
    
    user.lastSeen = new Date();
    await user.save();
    
    // Gérer les deep links pour les plugs avec traçage
    if (param && param.startsWith('plug_')) {
      // Vérifier d'abord si on est en maintenance
      const inMaintenance = await checkMaintenanceMode(bot, chatId);
      if (inMaintenance) {
        return; // Arrêter ici si en maintenance
      }
      
      // Format: plug_PLUGID_REFERRERID
      const parts = param.split('_');
      const plugId = parts[1];
      const referrerId = parts[2]; // ID de l'admin qui a partagé
      
      console.log(`🔗 Deep link vers le plug: ${plugId} partagé par: ${referrerId}`);
      
      // Importer les modèles nécessaires
      const { handlePlugDetails } = require('./plugsHandler');
      const ReferralClick = require('../models/ReferralClick');
      const Plug = require('../models/Plug');
      
      if (referrerId) {
        try {
          // Enregistrer le clic
          await ReferralClick.create({
            plugId: plugId,
            referrerId: referrerId,
            visitorId: user._id
          });
          
          // Mettre à jour les stats du plug
          const plug = await Plug.findById(plugId);
          if (plug) {
            const statIndex = plug.referralStats.findIndex(stat => 
              stat.userId.toString() === referrerId
            );
            
            if (statIndex >= 0) {
              plug.referralStats[statIndex].clicks += 1;
            } else {
              plug.referralStats.push({
                userId: referrerId,
                clicks: 1,
                votes: 0
              });
            }
            
            await plug.save();
          }
          
          console.log('✅ Clic de parrainage enregistré');
        } catch (error) {
          console.log('⚠️ Erreur enregistrement clic:', error.message);
        }
      }
      
      // Afficher directement les détails du plug
      await handlePlugDetails(bot, chatId, plugId, 'plugs', user.telegramId);
      return; // Ne pas afficher le menu principal
    }
    
    // Afficher le menu principal avec vérification du canal
    await showMainMenu(bot, chatId, userId);
    
  } catch (error) {
    console.error('Error in handleStart:', error);
    // Pas de message d'erreur visible pour l'utilisateur
  }
}

async function showMainMenu(bot, chatId, userId = null) {
  // Vérifier d'abord si le bot est en maintenance
  const inMaintenance = await checkMaintenanceMode(bot, chatId);
  if (inMaintenance) {
    return; // Le message de maintenance a été envoyé
  }
  
  // Si userId est fourni, vérifier l'appartenance au canal
  if (userId) {
    const hasAccess = await requireChannelMembership(bot, chatId, userId);
    if (!hasAccess) {
      return; // Le message de rejoindre le canal a déjà été envoyé
    }
  }
  
  const settings = await Settings.findOne();
  
  // Compter le nombre d'utilisateurs
  const userCount = await User.countDocuments() || 0;
  
  // Compter le nombre de plugs disponibles
  const Plug = require('../models/Plug');
  const plugCount = await Plug.countDocuments() || 0;
  
  const welcomeMessage = settings?.welcomeMessage || 
    '🔌 <b>Bienvenue sur PLUGS CRTFS !</b>\n\nLa marketplace exclusive des vendeurs certifiés.';
  
  // Ajouter le nombre de plugs et d'utilisateurs au message
  const messageWithStats = `${welcomeMessage}\n\n🔌 <b>${plugCount} Plugs Disponibles</b> ✅\n\n👥 <b>${userCount} utilisateurs</b> nous font déjà confiance !`;
  
  // Utiliser le texte personnalisé pour le bouton Mini App
  const miniAppButtonText = settings?.miniAppButtonText || '🔌 MINI APP PLGS CRTFS';
  
  const keyboard = {
    inline_keyboard: [
      [{ text: miniAppButtonText, url: 'https://t.me/PLGSCRTF_BOT/miniapp' }],
      [{ text: '🔌 PLUGS CRTFS', callback_data: 'plugs' }],
      [{ text: '🏆 TOP PARRAINS', callback_data: 'referrals' }],
      [{ text: '✅ DEVENIR CERTIFIÉ', callback_data: 'apply' }],
      [{ text: 'ℹ️ INFORMATIONS', callback_data: 'info' }]
    ]
  };
  
  // Ajouter les réseaux sociaux du bot s'ils existent
  if (settings?.botSocialNetworks && settings.botSocialNetworks.length > 0) {
    // Trier par ordre
    const sortedNetworks = settings.botSocialNetworks.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Créer des lignes de 2 boutons maximum
    for (let i = 0; i < sortedNetworks.length; i += 2) {
      const row = [];
      const network1 = sortedNetworks[i];
      
      if (network1.name && network1.url) {
        row.push({
          text: `${network1.emoji || '🔗'} ${network1.name}`,
          url: network1.url
        });
      }
      
      if (i + 1 < sortedNetworks.length) {
        const network2 = sortedNetworks[i + 1];
        if (network2.name && network2.url) {
          row.push({
            text: `${network2.emoji || '🔗'} ${network2.name}`,
            url: network2.url
          });
        }
      }
      
      if (row.length > 0) {
        keyboard.inline_keyboard.push(row);
      }
    }
  }
  
  // Envoyer l'image d'accueil si elle existe
  if (settings?.welcomeImage) {
    try {
      await bot.sendPhoto(chatId, settings.welcomeImage, {
        caption: messageWithStats,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Erreur envoi image:', error);
      // Si l'image échoue, envoyer juste le message
      await bot.sendMessage(chatId, messageWithStats, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }
  } else {
    await bot.sendMessage(chatId, messageWithStats, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }
}

module.exports = { handleStart, showMainMenu };
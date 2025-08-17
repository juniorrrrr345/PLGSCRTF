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
      const referrerId = parts[2]; // ID Telegram de celui qui a partagé
      
      console.log(`🔗 Deep link vers le plug: ${plugId} partagé par: ${referrerId}`);
      
      // Importer les modèles nécessaires
      const { handlePlugDetails } = require('./plugsHandler');
      const PlugReferral = require('../models/PlugReferral');
      const Plug = require('../models/Plug');
      
      if (referrerId && referrerId !== userId.toString()) {
        try {
          // Vérifier si ce n'est pas déjà un filleul existant
          const existingReferral = await PlugReferral.findOne({
            plugId: plugId,
            referrerId: referrerId,
            referredUserId: userId.toString()
          });
          
          if (!existingReferral) {
            // Créer le parrainage
            await PlugReferral.create({
              plugId: plugId,
              referrerId: referrerId,
              referredUserId: userId.toString()
            });
            
            // Mettre à jour le compteur de parrainages du plug
            const plug = await Plug.findByIdAndUpdate(
              plugId,
              { $inc: { referralCount: 1 } },
              { new: true }
            );
            
            console.log(`✅ Nouveau filleul enregistré pour le plug ${plug.name}`);
            
            // Notifier le parrain (admin)
            try {
              const referrerUser = await User.findOne({ telegramId: referrerId });
              if (referrerUser) {
                // Obtenir les infos du nouveau filleul
                const newUserInfo = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
                
                const notificationMessage = await bot.sendMessage(referrerId, 
                  `🎉 <b>Nouveau filleul pour ${plug.name} !</b>\n\n` +
                  `👤 <b>Filleul :</b> ${newUserInfo}\n` +
                  `🔌 <b>Plug :</b> ${plug.name}\n` +
                  `📍 <b>Localisation :</b> ${plug.country ? `${plug.country}` : 'Non spécifiée'}\n\n` +
                  `📊 <b>Statistiques pour ce plug :</b>\n` +
                  `• Total de vos filleuls : ${await PlugReferral.countDocuments({ plugId: plugId, referrerId: referrerId })}\n` +
                  `• Total parrainages du plug : ${plug.referralCount}\n\n` +
                  `⏱️ <i>Cette notification sera supprimée dans 30 secondes</i>`,
                  { parse_mode: 'HTML' }
                );
                
                // Supprimer la notification après 30 secondes pour éviter le spam
                setTimeout(async () => {
                  try {
                    await bot.deleteMessage(referrerId, notificationMessage.message_id);
                  } catch (error) {
                    console.log('Notification déjà supprimée ou erreur:', error.message);
                  }
                }, 30000); // 30 secondes
                
                // Supprimer aussi le message du lien de parrainage s'il existe
                if (global.referralMessages) {
                  const messageInfo = global.referralMessages.get(`${referrerId}_${plugId}`);
                  if (messageInfo) {
                    try {
                      await bot.deleteMessage(messageInfo.chatId, messageInfo.messageId);
                      global.referralMessages.delete(`${referrerId}_${plugId}`);
                    } catch (error) {
                      console.log('Message de parrainage déjà supprimé ou erreur:', error.message);
                    }
                  }
                }
              }
            } catch (notifError) {
              console.log('⚠️ Impossible de notifier le parrain:', notifError.message);
            }
          } else {
            console.log('ℹ️ Cet utilisateur est déjà un filleul pour ce plug');
          }
        } catch (error) {
          console.log('⚠️ Erreur enregistrement parrainage:', error.message);
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
  try {
    console.log('📱 Affichage du menu principal pour:', chatId);
    
    // Récupérer l'utilisateur pour vérifier le statut des notifications
    const User = require('../models/User');
    const Plug = require('../models/Plug');
    let notificationStatus = '';
    if (userId) {
      const user = await User.findOne({ telegramId: userId });
      if (user && user.notificationPreferences) {
        notificationStatus = user.notificationPreferences.acceptsNotifications ? '🔔' : '🔕';
      }
    }
    
    // Récupérer les paramètres
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    
    // Statistiques
    const userCount = await User.countDocuments() || 0;
    const plugCount = await Plug.countDocuments() || 0;
    
    // Message de bienvenue avec stats
    const welcomeMessage = `🏠 <b>Menu Principal</b>\n\n` +
      `👥 Utilisateurs actifs : ${userCount}\n` +
      `🔌 PLUGs disponibles : ${plugCount}\n\n` +
      `Que souhaitez-vous faire ?`;
    
    // Boutons du menu
    const keyboard = {
      inline_keyboard: [
        [{ text: '🔌 NOS PLUGS DU MOMENT', callback_data: 'plugs' }],
        [{ text: '📊 Classement Parrainages', callback_data: 'referral_menu' }],
        [{ text: '📝 Devenir Vendeur', callback_data: 'vendor_application' }],
        [{ text: `${notificationStatus} Notifications`, callback_data: 'notif_toggle_all' }],
        [{ text: 'ℹ️ Informations', callback_data: 'info' }]
      ]
    };
  
  // Envoyer l'image d'accueil si elle existe
  if (settings?.welcomeImage) {
    try {
      await bot.sendPhoto(chatId, settings.welcomeImage, {
        caption: welcomeMessage,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Erreur envoi image:', error);
      // Si l'image échoue, envoyer juste le message
      await bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }
  } else {
    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }
  } catch (error) {
    console.error('Erreur showMainMenu:', error);
    // Fallback simple
    await bot.sendMessage(chatId, '🏠 Menu Principal', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔌 NOS PLUGS DU MOMENT', callback_data: 'plugs' }],
          [{ text: '📊 Classement', callback_data: 'referral_menu' }]
        ]
      }
    });
  }
}

module.exports = { handleStart, showMainMenu };
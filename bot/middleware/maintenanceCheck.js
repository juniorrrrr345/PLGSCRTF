const Settings = require('../models/Settings');
const User = require('../models/User');

// Cache pour éviter le spam du message de maintenance
const maintenanceMessageCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

async function checkMaintenanceMode(bot, chatId) {
  try {
    const settings = await Settings.findOne();
    
    if (settings?.maintenanceMode) {
      // Vérifier le cache pour éviter le spam
      const lastMessageTime = maintenanceMessageCache.get(chatId);
      const now = Date.now();
      
      if (lastMessageTime && (now - lastMessageTime) < CACHE_DURATION) {
        return true; // En maintenance mais ne pas renvoyer le message
      }
      
      // Mettre à jour le cache
      maintenanceMessageCache.set(chatId, now);
      
      // Compter le nombre d'utilisateurs
      const userCount = await User.countDocuments() || 0;
      
      // Message de maintenance personnalisé
      const maintenanceMessage = `🔧 <b>Maintenance en cours</b>

Nous sommes bientôt de retour !

👥 <b>${userCount} utilisateurs</b> nous font déjà confiance

📱 <b>Consultez la Mini App pour plus d'informations</b>

Pour toutes informations, rejoignez nos réseaux sociaux 👇

Cordialement,
CERTIF2PLUG`;
      
      // Créer le clavier avec les réseaux sociaux
      const keyboard = {
        inline_keyboard: []
      };
      
      // Ajouter le bouton Mini App en premier
      const miniAppButtonText = settings?.miniAppButtonText || '🔌 MINI APP PLGS CRTFS';
      keyboard.inline_keyboard.push([{
        text: miniAppButtonText,
        url: 'https://t.me/PLGSCRTF_BOT/miniapp'
      }]);
      
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
              text: network1.name,
              url: network1.url
            });
          }
          
          // Ajouter le deuxième bouton si disponible
          if (i + 1 < sortedNetworks.length) {
            const network2 = sortedNetworks[i + 1];
            if (network2.name && network2.url) {
              row.push({
                text: network2.name,
                url: network2.url
              });
            }
          }
          
          if (row.length > 0) {
            keyboard.inline_keyboard.push(row);
          }
        }
      }
      
      // Envoyer le message avec l'image et les boutons
      let sentMessage;
      if (settings.welcomeImage) {
        try {
          sentMessage = await bot.sendPhoto(chatId, settings.welcomeImage, {
            caption: maintenanceMessage,
            parse_mode: 'HTML',
            reply_markup: keyboard.inline_keyboard.length > 0 ? keyboard : undefined
          });
        } catch (error) {
          // Si l'image échoue, envoyer juste le message
          sentMessage = await bot.sendMessage(chatId, maintenanceMessage, {
            parse_mode: 'HTML',
            reply_markup: keyboard.inline_keyboard.length > 0 ? keyboard : undefined
          });
        }
      } else {
        sentMessage = await bot.sendMessage(chatId, maintenanceMessage, {
          parse_mode: 'HTML',
          reply_markup: keyboard.inline_keyboard.length > 0 ? keyboard : undefined
        });
      }
      
      // Supprimer le message après 10 secondes
      if (sentMessage) {
        setTimeout(async () => {
          try {
            await bot.deleteMessage(chatId, sentMessage.message_id);
          } catch (error) {
            console.error('Erreur lors de la suppression du message de maintenance:', error);
          }
        }, 10000);
      }
      
      return true; // En maintenance
    }
    
    return false; // Pas en maintenance
  } catch (error) {
    console.error('Erreur vérification maintenance:', error);
    return false;
  }
}

// Nettoyer le cache périodiquement
setInterval(() => {
  const now = Date.now();
  for (const [chatId, time] of maintenanceMessageCache.entries()) {
    if (now - time > CACHE_DURATION * 2) {
      maintenanceMessageCache.delete(chatId);
    }
  }
}, CACHE_DURATION);

module.exports = {
  checkMaintenanceMode
};
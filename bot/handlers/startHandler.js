const User = require('../models/User');
const Settings = require('../models/Settings');

async function handleStart(bot, msg, param) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name;
  
  try {
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
    }
    
    user.lastSeen = new Date();
    await user.save();
    
    // Afficher le menu principal
    await showMainMenu(bot, chatId);
    
  } catch (error) {
    console.error('Error in handleStart:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue. Veuillez réessayer.');
  }
}

async function showMainMenu(bot, chatId) {
  const settings = await Settings.findOne();
  const welcomeMessage = settings?.welcomeMessage || 
    '🔌 <b>Bienvenue sur PLUGS CRTFS !</b>\n\nLa marketplace exclusive des vendeurs certifiés.';
  
  const keyboard = {
    inline_keyboard: [
      [{ text: 'ℹ️ Informations', callback_data: 'info' }],
      [{ text: '📝 Devenir Vendeur', callback_data: 'apply' }],
      [{ text: '🔌 PLUGS CRTFS', callback_data: 'plugs' }],
      [{ text: '🏆 Top Parrains', callback_data: 'referrals' }]
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
}

module.exports = { handleStart, showMainMenu };
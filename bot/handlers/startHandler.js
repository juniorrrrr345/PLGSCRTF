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
        firstSeen: new Date()
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
      [{ text: '➕ Ajouter contact/réseaux', callback_data: 'add_contact' }],
      [{ text: '🔌 PLUGS CRTFS', callback_data: 'plugs' }],
      [{ text: '🏆 Top Referrals', callback_data: 'referrals' }],
      [{ text: '🌐 Boutique Web', url: process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app' }]
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
}

module.exports = { handleStart, showMainMenu };
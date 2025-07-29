const User = require('../models/User');
const Plug = require('../models/Plug');
const Settings = require('../models/Settings');

async function handleStart(bot, msg, referralId, userStates) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  
  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ telegramId });
    
    if (!user) {
      // Créer un nouvel utilisateur
      user = new User({
        telegramId,
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name
      });
      
      // Gestion du parrainage
      if (referralId) {
        const referringPlug = await Plug.findById(referralId);
        if (referringPlug && !user.hasBeenCountedAsReferral) {
          user.referredBy = referralId;
          user.hasBeenCountedAsReferral = true;
          
          // Incrémenter le compteur de parrainage
          await Plug.findByIdAndUpdate(referralId, {
            $inc: { referralCount: 1 }
          });
          
          console.log(`✅ Nouveau filleul pour ${referringPlug.name}`);
        }
      }
      
      await user.save();
      console.log(`✅ Nouvel utilisateur créé: ${telegramId}`);
    }
    
    // Afficher le menu principal
    await showMainMenu(bot, chatId);
    
  } catch (error) {
    console.error('Erreur dans handleStart:', error);
    await bot.sendMessage(chatId, '❌ Une erreur est survenue. Veuillez réessayer.');
  }
}

async function showMainMenu(bot, chatId) {
  const settings = await Settings.findOne();
  const userCount = await User.countDocuments();
  const plugCount = await Plug.countDocuments({ isActive: true });
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '📋 Informations', callback_data: 'info' }],
      [{ text: '📱 Réseaux sociaux', callback_data: 'social' }],
      [{ text: '🔌 PLUGS CRTFS', callback_data: 'plugs' }],
      [{ text: '🏆 Top Parrains', callback_data: 'top_referrals' }],
      [{ text: '📝 Devenir vendeur', callback_data: 'vendor_form' }]
    ]
  };
  
  let message = settings.welcomeMessage + '\n\n';
  message += `👥 Utilisateurs: ${userCount}\n`;
  message += `🔌 Plugs actifs: ${plugCount}`;
  
  if (settings.welcomeImage) {
    await bot.sendPhoto(chatId, settings.welcomeImage, {
      caption: message,
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
  } else {
    await bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
  }
}

module.exports = { handleStart, showMainMenu };
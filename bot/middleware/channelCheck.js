const Settings = require('../models/Settings');

async function getChannelConfig() {
  const settings = await Settings.findOne();
  return {
    channelId: settings?.telegramChannelId || '-1002736254394',
    channelLink: settings?.telegramChannelLink || 'https://t.me/+RoI-Xzh-ma9iYmY0'
  };
}

async function checkChannelMembership(bot, userId) {
  try {
    // Vérifier que l'userId est valide
    if (!userId || userId === 'undefined') {
      console.log('userId invalide pour la vérification du canal');
      return true; // Permettre l'accès si l'userId est invalide
    }
    
    const { channelId } = await getChannelConfig();
    const member = await bot.getChatMember(channelId, userId);
    const allowedStatuses = ['member', 'administrator', 'creator'];
    return allowedStatuses.includes(member.status);
  } catch (error) {
    // Si l'erreur est PARTICIPANT_ID_INVALID, permettre l'accès
    if (error.message && error.message.includes('PARTICIPANT_ID_INVALID')) {
      console.log('PARTICIPANT_ID_INVALID - Accès autorisé par défaut');
      return true;
    }
    console.error('Erreur vérification canal:', error.message);
    return true; // Permettre l'accès en cas d'erreur pour éviter de bloquer les utilisateurs
  }
}

async function requireChannelMembership(bot, chatId, userId) {
  const isMember = await checkChannelMembership(bot, userId);
  
  if (!isMember) {
    const { channelLink } = await getChannelConfig();
    const keyboard = {
      inline_keyboard: [
        [{ text: '📢 REJOINDRE LE CANAL', url: channelLink }],
        [{ text: '✅ J\'AI REJOINT', callback_data: 'check_membership' }]
      ]
    };
    
    await bot.sendMessage(chatId, 
      `🔒 <b>Accès restreint</b>\n\n` +
      `Pour accéder au menu, vous devez d'abord rejoindre notre canal Telegram.\n\n` +
      `👉 Cliquez sur le bouton ci-dessous pour rejoindre, puis sur "J'ai rejoint" pour vérifier.`,
      {
        parse_mode: 'HTML',
        reply_markup: keyboard
      }
    );
    
    return false;
  }
  
  return true;
}

module.exports = {
  checkChannelMembership,
  requireChannelMembership,
  getChannelConfig
};
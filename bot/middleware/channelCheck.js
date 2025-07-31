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
    const { channelId } = await getChannelConfig();
    const member = await bot.getChatMember(channelId, userId);
    const allowedStatuses = ['member', 'administrator', 'creator'];
    return allowedStatuses.includes(member.status);
  } catch (error) {
    console.error('Erreur vérification canal:', error.message);
    return false;
  }
}

async function requireChannelMembership(bot, chatId, userId) {
  const isMember = await checkChannelMembership(bot, userId);
  
  if (!isMember) {
    const { channelLink } = await getChannelConfig();
    const keyboard = {
      inline_keyboard: [
        [{ text: '📢 Rejoindre le canal', url: channelLink }],
        [{ text: '✅ J\'ai rejoint', callback_data: 'check_membership' }]
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
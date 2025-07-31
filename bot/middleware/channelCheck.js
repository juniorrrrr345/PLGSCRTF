const REQUIRED_CHANNEL = '-1001234567890'; // À remplacer par l'ID réel du canal
const CHANNEL_LINK = 'https://t.me/+Gc1zjodbEgdmNzBk';

async function checkChannelMembership(bot, userId) {
  try {
    const member = await bot.getChatMember(REQUIRED_CHANNEL, userId);
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
    const keyboard = {
      inline_keyboard: [
        [{ text: '📢 Rejoindre le canal', url: CHANNEL_LINK }],
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
  REQUIRED_CHANNEL,
  CHANNEL_LINK
};
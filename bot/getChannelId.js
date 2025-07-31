// Script pour obtenir l'ID du canal
// Usage: node getChannelId.js

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Remplacez par votre lien d'invitation
const INVITE_LINK = 'https://t.me/+Gc1zjodbEgdmNzBk';

console.log(`
Pour obtenir l'ID du canal :

1. Ajoutez ce bot comme administrateur du canal
2. Envoyez un message dans le canal
3. Le bot recevra l'update et affichera l'ID du canal

Lien du canal : ${INVITE_LINK}
`);

// Écouter tous les updates
bot.on('channel_post', (msg) => {
  console.log('ID du canal trouvé :', msg.chat.id);
  console.log('Type :', msg.chat.type);
  console.log('Titre :', msg.chat.title);
  process.exit(0);
});

bot.on('message', (msg) => {
  if (msg.chat.type === 'channel' || msg.chat.type === 'supergroup') {
    console.log('ID trouvé :', msg.chat.id);
    console.log('Type :', msg.chat.type);
    console.log('Titre :', msg.chat.title);
  }
});

console.log('En attente de messages...');
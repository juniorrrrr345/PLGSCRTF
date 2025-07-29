require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const http = require('http');

// Configuration du bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Serveur HTTP simple pour Render
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running! 🤖');
});

server.listen(PORT, () => {
  console.log(`🌐 Server listening on port ${PORT}`);
});

// Commande /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🔌 <b>Bienvenue sur PLUGS CRTFS !</b>

La marketplace exclusive des vendeurs certifiés.

🌐 Boutique web : ${process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app'}

Utilisez les boutons ci-dessous pour naviguer :
  `;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '🔌 Voir les Plugs', url: `${process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app'}/plugs` }],
      [{ text: '🔍 Rechercher', url: `${process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app'}/search` }],
      [{ text: '📱 Réseaux sociaux', url: `${process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app'}/social` }],
      [{ text: '🌐 Ouvrir la boutique', url: process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app' }]
    ]
  };
  
  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
});

// Commande /config pour l'admin
bot.onText(/\/config/, async (msg) => {
  const chatId = msg.chat.id;
  const adminUrl = `${process.env.WEB_APP_URL || 'https://plgscrtf.vercel.app'}/config`;
  
  await bot.sendMessage(chatId, 
    `🔐 <b>Panel Administrateur</b>\n\n` +
    `Accédez au panel admin via ce lien :\n` +
    `${adminUrl}\n\n` +
    `Mot de passe : <code>${process.env.ADMIN_PASSWORD}</code>`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔐 Ouvrir le panel admin', url: adminUrl }]
        ]
      }
    }
  );
});

// Gestion des erreurs
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🤖 Bot is running...');
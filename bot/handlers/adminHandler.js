const User = require('../models/User');
const Plug = require('../models/Plug');
const Settings = require('../models/Settings');
const VendorApplication = require('../models/VendorApplication');

const adminStates = new Map();

async function handleAdminPanel(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  // Vérifier si l'utilisateur est déjà authentifié
  const user = await User.findOne({ telegramId: userId });
  
  if (!user?.isAdmin) {
    // Demander le mot de passe
    adminStates.set(chatId, { awaitingPassword: true });
    await bot.sendMessage(chatId, '🔐 Entrez le mot de passe administrateur:');
    
    // Écouter la réponse
    bot.once('message', async (response) => {
      if (response.chat.id === chatId && response.text === process.env.ADMIN_PASSWORD) {
        // Authentification réussie
        await User.findOneAndUpdate(
          { telegramId: userId },
          { isAdmin: true }
        );
        adminStates.delete(chatId);
        await showAdminMenu(bot, chatId);
      } else {
        adminStates.delete(chatId);
        await bot.sendMessage(chatId, '❌ Mot de passe incorrect.');
      }
    });
  } else {
    // Déjà admin
    await showAdminMenu(bot, chatId);
  }
}

async function showAdminMenu(bot, chatId) {
  const userCount = await User.countDocuments();
  const plugCount = await Plug.countDocuments({ isActive: true });
  const pendingApplications = await VendorApplication.countDocuments({ status: 'pending' });
  
  let message = '🛠 <b>PANEL ADMINISTRATEUR</b>\n';
  message += '━━━━━━━━━━━━━━━━\n\n';
  message += `👥 Utilisateurs: ${userCount}\n`;
  message += `🔌 Plugs actifs: ${plugCount}\n`;
  message += `📋 Candidatures en attente: ${pendingApplications}\n`;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '➕ Ajouter un plug', callback_data: 'admin_add_plug' }],
      [{ text: '📝 Gérer les plugs', callback_data: 'admin_manage_plugs' }],
      [{ text: '📋 Candidatures vendeurs', callback_data: 'admin_vendor_apps' }],
      [{ text: '⚙️ Paramètres', callback_data: 'admin_settings' }],
      [{ text: '📢 Message global', callback_data: 'admin_broadcast' }],
      [{ text: '🌍 Gérer pays/départements', callback_data: 'admin_locations' }],
      [{ text: '❌ Fermer', callback_data: 'admin_close' }]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Fonction pour gérer les callbacks admin
async function handleAdminCallbacks(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  if (!data.startsWith('admin_')) return false;
  
  // Vérifier les permissions admin
  const user = await User.findOne({ telegramId: callbackQuery.from.id.toString() });
  if (!user?.isAdmin) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ Accès refusé',
      show_alert: true
    });
    return;
  }
  
  switch (data) {
    case 'admin_settings':
      await showSettingsMenu(bot, chatId);
      break;
      
    case 'admin_manage_plugs':
      await showPlugsManagement(bot, chatId);
      break;
      
    case 'admin_vendor_apps':
      await showVendorApplications(bot, chatId);
      break;
      
    case 'admin_broadcast':
      await initiateBroadcast(bot, chatId);
      break;
      
    case 'admin_close':
      await bot.deleteMessage(chatId, callbackQuery.message.message_id);
      break;
  }
  
  await bot.answerCallbackQuery(callbackQuery.id);
}

async function showSettingsMenu(bot, chatId) {
  const settings = await Settings.findOne();
  
  let message = '⚙️ <b>PARAMÈTRES</b>\n\n';
  message += `📝 Message d'accueil: ${settings.welcomeMessage.substring(0, 50)}...\n`;
  message += `📸 Image d'accueil: ${settings.welcomeImage ? '✅' : '❌'}\n`;
  message += `📋 Texte info: ${settings.infoText.substring(0, 50)}...\n`;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '✏️ Modifier message accueil', callback_data: 'admin_edit_welcome' }],
      [{ text: '📸 Changer image accueil', callback_data: 'admin_edit_image' }],
      [{ text: '📝 Modifier texte info', callback_data: 'admin_edit_info' }],
      [{ text: '🎨 Fond boutique web', callback_data: 'admin_edit_background' }],
      [{ text: '📱 Réseaux sociaux', callback_data: 'admin_edit_social' }],
      [{ text: '⬅️ Retour', callback_data: 'admin_menu' }]
    ]
  };
  
  await bot.editMessageText(message, {
    chat_id: chatId,
    message_id: callbackQuery.message.message_id,
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

async function showPlugsManagement(bot, chatId) {
  const plugs = await Plug.find({ isActive: true }).limit(20);
  
  let message = '📝 <b>GESTION DES PLUGS</b>\n\n';
  
  const keyboard = {
    inline_keyboard: []
  };
  
  plugs.forEach(plug => {
    keyboard.inline_keyboard.push([{
      text: `${plug.name} (❤️ ${plug.likes})`,
      callback_data: `admin_plug_${plug._id}`
    }]);
  });
  
  keyboard.inline_keyboard.push([
    { text: '⬅️ Retour', callback_data: 'admin_menu' }
  ]);
  
  await bot.editMessageText(message, {
    chat_id: chatId,
    message_id: callbackQuery.message.message_id,
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

async function showVendorApplications(bot, chatId) {
  const applications = await VendorApplication.find({ status: 'pending' })
    .populate('userId')
    .limit(10);
  
  let message = '📋 <b>CANDIDATURES VENDEURS</b>\n\n';
  
  if (applications.length === 0) {
    message += 'Aucune candidature en attente.';
  } else {
    applications.forEach((app, index) => {
      message += `${index + 1}. @${app.username || 'Utilisateur'} - ${new Date(app.submittedAt).toLocaleDateString()}\n`;
    });
  }
  
  const keyboard = {
    inline_keyboard: []
  };
  
  applications.forEach(app => {
    keyboard.inline_keyboard.push([{
      text: `👁 Voir ${app.username || app.telegramId}`,
      callback_data: `admin_view_app_${app._id}`
    }]);
  });
  
  keyboard.inline_keyboard.push([
    { text: '⬅️ Retour', callback_data: 'admin_menu' }
  ]);
  
  await bot.editMessageText(message, {
    chat_id: chatId,
    message_id: callbackQuery.message.message_id,
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

async function initiateBroadcast(bot, chatId) {
  adminStates.set(chatId, { 
    type: 'broadcast',
    awaitingMessage: true 
  });
  
  await bot.sendMessage(chatId, '📢 Entrez le message à envoyer à tous les utilisateurs:');
  
  bot.once('message', async (msg) => {
    if (msg.chat.id === chatId) {
      const state = adminStates.get(chatId);
      if (state?.type === 'broadcast' && state.awaitingMessage) {
        // Envoyer le message à tous les utilisateurs
        const users = await User.find({});
        let successCount = 0;
        let failCount = 0;
        
        for (const user of users) {
          try {
            await bot.sendMessage(user.telegramId, msg.text);
            successCount++;
          } catch (error) {
            failCount++;
          }
        }
        
        await bot.sendMessage(chatId, 
          `✅ Message envoyé!\n\n` +
          `📤 Succès: ${successCount}\n` +
          `❌ Échecs: ${failCount}`
        );
        
        adminStates.delete(chatId);
      }
    }
  });
  
  return true;
}

module.exports = { handleAdminCommand: handleAdminPanel, handleAdminCallbacks };
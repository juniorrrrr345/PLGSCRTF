require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

async function testWebhook() {
  console.log('🔍 Test de configuration du webhook\n');
  
  // Vérifier les variables d'environnement
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN manquant !');
    process.exit(1);
  }
  
  const webhookUrl = process.env.WEBHOOK_URL || 'https://plgscrtf.onrender.com';
  console.log(`📍 URL du webhook : ${webhookUrl}`);
  console.log(`🔑 Token : ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
  
  try {
    // Créer une instance du bot sans polling
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    
    // Obtenir les infos du webhook actuel
    console.log('\n📡 Webhook actuel :');
    const webhookInfo = await bot.getWebHookInfo();
    console.log(`- URL : ${webhookInfo.url || 'Aucun'}`);
    console.log(`- Erreurs : ${webhookInfo.last_error_message || 'Aucune'}`);
    console.log(`- Pending updates : ${webhookInfo.pending_update_count || 0}`);
    
    // Si l'URL est différente, la mettre à jour
    const newWebhookUrl = `${webhookUrl}/bot${process.env.TELEGRAM_BOT_TOKEN}`;
    if (webhookInfo.url !== newWebhookUrl) {
      console.log('\n🔄 Mise à jour du webhook...');
      
      // D'abord supprimer l'ancien webhook
      await bot.deleteWebHook();
      console.log('✅ Ancien webhook supprimé');
      
      // Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Configurer le nouveau webhook
      const result = await bot.setWebHook(newWebhookUrl);
      if (result) {
        console.log('✅ Nouveau webhook configuré avec succès !');
        console.log(`📍 URL : ${newWebhookUrl.replace(process.env.TELEGRAM_BOT_TOKEN, 'TOKEN...')}`);
      } else {
        console.log('❌ Échec de la configuration du webhook');
      }
    } else {
      console.log('\n✅ Le webhook est déjà configuré correctement');
    }
    
    // Obtenir les infos du bot
    const me = await bot.getMe();
    console.log(`\n🤖 Bot : @${me.username} (${me.first_name})`);
    
  } catch (error) {
    console.error('\n❌ Erreur :', error.message);
    if (error.response && error.response.body) {
      console.error('Détails :', error.response.body);
    }
  }
}

testWebhook();
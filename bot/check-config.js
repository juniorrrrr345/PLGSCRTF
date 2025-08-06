console.log('🔍 Vérification de la configuration\n');

const requiredVars = [
  'TELEGRAM_BOT_TOKEN',
  'WEBHOOK_URL',
  'MONGODB_URI',
  'CHANNEL_ID',
  'ADMIN_IDS'
];

const optionalVars = [
  'WEB_APP_URL',
  'WEB_APP_API_KEY',
  'RENDER',
  'PORT'
];

console.log('📋 Variables obligatoires :');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName} : ${varName.includes('TOKEN') || varName.includes('URI') ? '***' : value}`);
  } else {
    console.log(`❌ ${varName} : MANQUANT !`);
  }
});

console.log('\n📋 Variables optionnelles :');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${value ? '✅' : '⚠️'} ${varName} : ${value || 'Non défini'}`);
});

// Afficher l'URL du webhook attendue
if (process.env.WEBHOOK_URL && process.env.TELEGRAM_BOT_TOKEN) {
  console.log('\n🌐 URL du webhook attendue :');
  console.log(`${process.env.WEBHOOK_URL}/bot${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
}
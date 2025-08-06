// Script pour corriger immédiatement le webhook
// Remplacez YOUR_BOT_TOKEN par votre token réel

const TOKEN = 'YOUR_BOT_TOKEN'; // Remplacez par votre token
const WEBHOOK_URL = 'https://plgscrtf-xxhv.onrender.com';

const https = require('https');

// Supprimer l'ancien webhook
const deleteOptions = {
  hostname: 'api.telegram.org',
  path: `/bot${TOKEN}/deleteWebhook`,
  method: 'GET'
};

https.get(deleteOptions, (res) => {
  console.log('✅ Ancien webhook supprimé');
  
  // Configurer le nouveau webhook
  setTimeout(() => {
    const setOptions = {
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/setWebhook?url=${WEBHOOK_URL}/bot${TOKEN}`,
      method: 'GET'
    };
    
    https.get(setOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📍 Nouveau webhook configuré:', JSON.parse(data));
        console.log(`✅ URL: ${WEBHOOK_URL}/bot${TOKEN.substring(0, 10)}...`);
      });
    });
  }, 1000);
});
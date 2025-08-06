const https = require('https');

// Configuration
const TOKEN = '7631105823:AAGQxvLOT7I-xKTqGJYxXnCwGiY9rZpqXXX'; // Remplacez XXX par la fin de votre token
const WEBHOOK_URL = 'https://plgscrtf-xxhv.onrender.com';

console.log('🔧 Correction du webhook Telegram\n');
console.log('⚠️  IMPORTANT: Remplacez XXX à la fin du token par les vrais caractères\n');

if (TOKEN.includes('XXX')) {
  console.log('❌ Vous devez remplacer XXX par la fin réelle de votre token !');
  console.log('   Éditez ce fichier et remplacez XXX dans la variable TOKEN');
  process.exit(1);
}

console.log('🔄 Étape 1: Suppression de l\'ancien webhook...');

// Supprimer l'ancien webhook
https.get(`https://api.telegram.org/bot${TOKEN}/deleteWebhook`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.ok) {
      console.log('✅ Ancien webhook supprimé\n');
      
      // Attendre un peu
      setTimeout(() => {
        console.log('🔄 Étape 2: Configuration du nouveau webhook...');
        
        const newWebhookUrl = `${WEBHOOK_URL}/bot${TOKEN}`;
        
        https.get(`https://api.telegram.org/bot${TOKEN}/setWebhook?url=${encodeURIComponent(newWebhookUrl)}`, (res2) => {
          let data2 = '';
          res2.on('data', chunk => data2 += chunk);
          res2.on('end', () => {
            const result2 = JSON.parse(data2);
            if (result2.ok) {
              console.log('✅ Nouveau webhook configuré !\n');
              
              // Vérifier
              setTimeout(() => {
                console.log('🔍 Étape 3: Vérification...');
                
                https.get(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`, (res3) => {
                  let data3 = '';
                  res3.on('data', chunk => data3 += chunk);
                  res3.on('end', () => {
                    const info = JSON.parse(data3);
                    if (info.ok && info.result) {
                      console.log('\n📊 État du webhook:');
                      console.log(`✅ URL: ${info.result.url}`);
                      console.log(`📬 Messages en attente: ${info.result.pending_update_count || 0}`);
                      
                      if (info.result.last_error_message) {
                        console.log(`⚠️  Dernière erreur: ${info.result.last_error_message}`);
                      }
                      
                      console.log('\n🎉 Terminé ! Testez maintenant /start sur votre bot');
                    }
                  });
                });
              }, 1000);
            } else {
              console.log('❌ Erreur:', result2.description);
            }
          });
        });
      }, 1500);
    } else {
      console.log('❌ Erreur:', result.description);
    }
  });
}).on('error', (err) => {
  console.log('❌ Erreur réseau:', err.message);
});
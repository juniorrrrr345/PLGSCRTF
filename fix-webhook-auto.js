const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Script de correction du webhook Telegram\n');

rl.question('📝 Entrez votre token de bot Telegram : ', (token) => {
  if (!token || token.length < 40) {
    console.log('❌ Token invalide !');
    rl.close();
    return;
  }

  const WEBHOOK_URL = 'https://plgscrtf-xxhv.onrender.com';
  
  console.log('\n🔄 Suppression de l\'ancien webhook...');
  
  // Supprimer l'ancien webhook
  https.get(`https://api.telegram.org/bot${token}/deleteWebhook`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      if (result.ok) {
        console.log('✅ Ancien webhook supprimé');
        
        // Attendre un peu avant de configurer le nouveau
        setTimeout(() => {
          console.log('\n🔄 Configuration du nouveau webhook...');
          
          const newWebhookUrl = `${WEBHOOK_URL}/bot${token}`;
          
          https.get(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(newWebhookUrl)}`, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
              const result2 = JSON.parse(data2);
              if (result2.ok) {
                console.log('✅ Nouveau webhook configuré avec succès !');
                console.log(`📍 URL : ${WEBHOOK_URL}/bot${token.substring(0, 10)}...`);
                
                // Vérifier la configuration
                setTimeout(() => {
                  console.log('\n🔍 Vérification de la configuration...');
                  
                  https.get(`https://api.telegram.org/bot${token}/getWebhookInfo`, (res3) => {
                    let data3 = '';
                    res3.on('data', chunk => data3 += chunk);
                    res3.on('end', () => {
                      const info = JSON.parse(data3);
                      if (info.ok && info.result) {
                        console.log('\n📊 Informations du webhook :');
                        console.log(`- URL : ${info.result.url}`);
                        console.log(`- Pending updates : ${info.result.pending_update_count || 0}`);
                        console.log(`- Dernière erreur : ${info.result.last_error_message || 'Aucune'}`);
                        
                        if (info.result.url === newWebhookUrl) {
                          console.log('\n✅ Tout est configuré correctement !');
                          console.log('🎉 Votre bot devrait maintenant répondre à /start');
                        } else {
                          console.log('\n⚠️  L\'URL ne correspond pas, réessayez dans quelques secondes');
                        }
                      }
                      rl.close();
                    });
                  });
                }, 1000);
              } else {
                console.log('❌ Erreur lors de la configuration :', result2);
                rl.close();
              }
            });
          });
        }, 1500);
      } else {
        console.log('❌ Erreur lors de la suppression :', result);
        rl.close();
      }
    });
  }).on('error', (err) => {
    console.log('❌ Erreur réseau :', err.message);
    rl.close();
  });
});
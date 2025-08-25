
// ============================================
// HOOK D'INTÉGRATION DES NOUVELLES FONCTIONNALITÉS
// Ce fichier est chargé automatiquement par index.js
// ============================================

// Vérifier si le dossier features existe
const fs = require('fs');
const path = require('path');

// Fonction d'initialisation appelée après le démarrage du bot
function initializeEnhancedFeatures(bot) {
  try {
    // Vérifier que le dossier features existe
    const featuresPath = path.join(__dirname, 'features');
    if (!fs.existsSync(featuresPath)) {
      console.log('⚠️ Features folder not found, skipping enhanced features');
      return;
    }

    // Vérifier que le fichier d'intégration existe
    const integrationPath = path.join(featuresPath, 'integration.js');
    if (!fs.existsSync(integrationPath)) {
      console.log('⚠️ Features integration file not found, skipping enhanced features');
      return;
    }

    console.log('\n🎯 Activation des fonctionnalités avancées...');
    
    // Charger le module d'intégration
    const { integrateFeatures, addNewCommands } = require('./features/integration');
    
    // Intégrer toutes les nouvelles fonctionnalités
    integrateFeatures(bot);
    
    // Ajouter les nouvelles commandes
    addNewCommands(bot);
    
    console.log('✨ Fonctionnalités avancées activées !\n');
    console.log('📋 Nouvelles commandes disponibles:');
    console.log('  /badges - Voir tes badges et récompenses');
    console.log('  /rankings - Consulter les classements');
    console.log('  /battles - Participer aux battles');
    console.log('  /notifications - Gérer tes préférences\n');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des fonctionnalités avancées:', error.message);
    // Ne pas faire crasher le bot si les nouvelles fonctionnalités échouent
  }
}

module.exports = { initializeEnhancedFeatures };

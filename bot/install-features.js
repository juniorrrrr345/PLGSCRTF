#!/usr/bin/env node

/**
 * Script d'installation des nouvelles fonctionnalités
 * 
 * Ce script ajoute automatiquement les nouvelles fonctionnalités au bot
 * sans modifier le code existant.
 * 
 * Usage: node install-features.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Installation des nouvelles fonctionnalités...\n');

// Vérifier que nous sommes dans le bon dossier
if (!fs.existsSync('./index.js')) {
  console.error('❌ Erreur: Ce script doit être exécuté depuis le dossier /bot');
  process.exit(1);
}

// Créer le fichier de hook pour intégrer les fonctionnalités
const hookContent = `
// ============================================
// HOOK D'INTÉGRATION DES NOUVELLES FONCTIONNALITÉS
// Ce fichier est chargé automatiquement par index.js
// ============================================

const { integrateFeatures, addNewCommands } = require('./features/integration');

// Fonction d'initialisation appelée après le démarrage du bot
function initializeEnhancedFeatures(bot) {
  console.log('\\n🎯 Activation des fonctionnalités avancées...');
  
  // Intégrer toutes les nouvelles fonctionnalités
  integrateFeatures(bot);
  
  // Ajouter les nouvelles commandes
  addNewCommands(bot);
  
  console.log('✨ Fonctionnalités avancées activées !\\n');
  console.log('📋 Nouvelles commandes disponibles:');
  console.log('  /badges - Voir tes badges et récompenses');
  console.log('  /rankings - Consulter les classements');
  console.log('  /battles - Participer aux battles');
  console.log('  /notifications - Gérer tes préférences\\n');
}

module.exports = { initializeEnhancedFeatures };
`;

// Écrire le fichier de hook
fs.writeFileSync('./features-hook.js', hookContent);
console.log('✅ Fichier de hook créé: features-hook.js');

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances...');

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const requiredDeps = ['moment', 'node-cron'];
const missingDeps = [];

requiredDeps.forEach(dep => {
  if (!packageJson.dependencies[dep]) {
    missingDeps.push(dep);
  }
});

if (missingDeps.length > 0) {
  console.log('⚠️  Dépendances manquantes détectées:', missingDeps.join(', '));
  console.log('📝 Ajout des dépendances au package.json...');
  
  // Ajouter les dépendances manquantes
  if (!packageJson.dependencies.moment) {
    packageJson.dependencies.moment = "^2.29.4";
  }
  if (!packageJson.dependencies['node-cron']) {
    packageJson.dependencies['node-cron'] = "^3.0.3";
  }
  
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json mis à jour');
  console.log('\n⚠️  IMPORTANT: Exécutez "npm install" pour installer les nouvelles dépendances');
} else {
  console.log('✅ Toutes les dépendances sont présentes');
}

// Instructions pour l'intégration manuelle
console.log('\n' + '='.repeat(60));
console.log('📝 INSTRUCTIONS D\'INTÉGRATION');
console.log('='.repeat(60));

console.log('\nPour activer les nouvelles fonctionnalités, ajoutez ces lignes dans index.js:\n');
console.log('1. Après les imports existants, ajoutez:');
console.log('   const { initializeEnhancedFeatures } = require(\'./features-hook\');\n');

console.log('2. Après la connexion à MongoDB (après "MongoDB connected"), ajoutez:');
console.log('   // Initialiser les fonctionnalités avancées');
console.log('   initializeEnhancedFeatures(bot);\n');

console.log('3. (Optionnel) Pour améliorer le handler de vote existant:');
console.log('   Dans le fichier handlers/plugsHandler.js, après un vote réussi,');
console.log('   vous pouvez appeler les fonctions du système de badges.\n');

console.log('='.repeat(60));
console.log('\n✨ Installation terminée !');
console.log('\n🎯 Fonctionnalités ajoutées:');
console.log('   • Système de badges et récompenses');
console.log('   • Classements dynamiques (jour/semaine)');
console.log('   • Système de battles et compétitions');
console.log('   • Notifications personnalisées');
console.log('\n🚀 Redémarrez le bot après l\'intégration pour activer les fonctionnalités.\n');
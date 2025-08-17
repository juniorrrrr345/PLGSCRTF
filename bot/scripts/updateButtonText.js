require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');

async function updateButtonText() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer les paramètres actuels
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Créer les paramètres s'ils n'existent pas
      settings = new Settings({
        miniAppButtonText: 'PLUGS DU MOMENT 🔌'
      });
    } else {
      // Mettre à jour le texte du bouton
      settings.miniAppButtonText = 'PLUGS DU MOMENT 🔌';
    }

    await settings.save();
    console.log('✅ Texte du bouton mis à jour : PLUGS DU MOMENT 🔌');

    // Afficher la configuration actuelle
    console.log('Configuration actuelle :', {
      miniAppButtonText: settings.miniAppButtonText
    });

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

updateButtonText();
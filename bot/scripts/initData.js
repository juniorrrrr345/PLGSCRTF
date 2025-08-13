require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('../models/Plug');
const Settings = require('../models/Settings');

async function initializeData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Initialiser les settings
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({
        welcomeMessage: 'Bienvenue sur CERTIF2PLUG ! 🔌',
        infoText: `<b>À propos de CERTIF2PLUG</b>\n\n` +
                  `🔌 Plateforme de mise en relation sécurisée\n` +
                  `✅ Vendeurs certifiés\n` +
                  `🔒 Transactions sécurisées\n` +
                  `📍 Livraison dans toute la France`,
        socialNetworks: {
          telegram: '@plugscrtfs',
          instagram: '@plugscrtfs_official'
        },
        countries: [
          {
            code: 'FR',
            name: 'France',
            flag: '🇫🇷',
            departments: [
              { code: '75', name: 'Paris' },
              { code: '13', name: 'Bouches-du-Rhône' },
              { code: '69', name: 'Rhône' },
              { code: '06', name: 'Alpes-Maritimes' },
              { code: '31', name: 'Haute-Garonne' },
              { code: '33', name: 'Gironde' },
              { code: '59', name: 'Nord' },
              { code: '67', name: 'Bas-Rhin' },
              { code: '34', name: 'Hérault' },
              { code: '44', name: 'Loire-Atlantique' }
            ]
          },
          {
            code: 'BE',
            name: 'Belgique',
            flag: '🇧🇪',
            departments: [
              { code: 'BRU', name: 'Bruxelles' },
              { code: 'ANT', name: 'Anvers' },
              { code: 'LIE', name: 'Liège' },
              { code: 'GAN', name: 'Gand' },
              { code: 'CHA', name: 'Charleroi' }
            ]
          },
          {
            code: 'CH',
            name: 'Suisse',
            flag: '🇨🇭',
            departments: [
              { code: 'GE', name: 'Genève' },
              { code: 'VD', name: 'Vaud' },
              { code: 'ZH', name: 'Zurich' },
              { code: 'BE', name: 'Berne' },
              { code: 'BS', name: 'Bâle' }
            ]
          }
        ]
      });
      console.log('✅ Settings initialized');
    }
    
    // Créer quelques plugs de test
    const testPlugs = [
      {
        name: 'ParisPlug 75',
        description: 'Service rapide et fiable sur Paris et proche banlieue. Disponible 7j/7.',
        methods: { delivery: true, shipping: false, meetup: true },
        socialNetworks: {
          snap: 'parisplug75',
          telegram: '@parisplug75'
        },
        country: 'France',
        countryFlag: '🇫🇷',
        department: 'Paris',
        postalCode: '75001',
        likes: 127,
        referralCount: 15
      },
      {
        name: 'MarseillePlug 13',
        description: 'Le meilleur service sur Marseille et environs. Qualité garantie.',
        methods: { delivery: true, shipping: true, meetup: false },
        socialNetworks: {
          snap: 'marsplug13',
          instagram: '@marsplug13'
        },
        country: 'France',
        countryFlag: '🇫🇷',
        department: 'Bouches-du-Rhône',
        postalCode: '13001',
        likes: 89,
        referralCount: 8
      },
      {
        name: 'LyonPlug 69',
        description: 'Service premium sur Lyon. Livraison express disponible.',
        methods: { delivery: true, shipping: false, meetup: true },
        socialNetworks: {
          telegram: '@lyonplug69',
          whatsapp: '+33612345678'
        },
        country: 'France',
        countryFlag: '🇫🇷',
        department: 'Rhône',
        postalCode: '69001',
        likes: 65,
        referralCount: 12
      }
    ];
    
    // Vérifier si des plugs existent déjà
    const existingPlugs = await Plug.countDocuments();
    if (existingPlugs === 0) {
      const createdPlugs = await Plug.insertMany(testPlugs);
      
      // Générer les liens de parrainage pour chaque plug
      for (const plug of createdPlugs) {
        plug.referralLink = `https://t.me/PLGSCRTF_BOT?start=ref_${plug._id}`;
        await plug.save();
      }
      
      console.log('✅ Test plugs created with referral links');
    }
    
    console.log('✅ Initialization complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeData();
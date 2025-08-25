#!/bin/bash

# Script de déploiement des nouvelles fonctionnalités sur Render
# Usage: ./deploy-features.sh

echo "🚀 Déploiement des nouvelles fonctionnalités..."
echo "============================================"

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "bot/index.js" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier que git est configuré
if ! git config user.email > /dev/null; then
    echo "📧 Configuration de git..."
    git config user.email "bot@deploy.com"
    git config user.name "Deploy Bot"
fi

# Ajouter tous les nouveaux fichiers
echo "📦 Ajout des nouveaux fichiers..."
git add bot/features/
git add bot/features-hook.js
git add bot/install-features.js
git add deploy-features.sh

# Vérifier s'il y a des changements à commiter
if git diff --staged --quiet; then
    echo "✅ Pas de nouveaux changements à déployer"
else
    echo "💾 Commit des changements..."
    git commit -m "feat: Ajout du système de gamification complet

- Système de badges et récompenses
- Classements dynamiques (jour/semaine)
- Système de battles et compétitions
- Notifications personnalisées
- Intégration automatique sans modification du code existant"
fi

# Afficher le statut
echo ""
echo "✅ Préparation terminée !"
echo ""
echo "📋 Prochaines étapes pour déployer sur Render:"
echo "============================================"
echo "1. Pusher les changements:"
echo "   git push origin main"
echo ""
echo "2. Render va automatiquement:"
echo "   - Détecter les changements"
echo "   - Installer les dépendances (moment, node-cron)"
echo "   - Redémarrer le bot avec les nouvelles fonctionnalités"
echo ""
echo "3. Vérifier dans les logs Render que tout fonctionne:"
echo "   - '✅ Enhanced features initialized'"
echo "   - '✨ Fonctionnalités avancées activées !'"
echo ""
echo "🎯 Les nouvelles commandes seront disponibles:"
echo "   /badges - Système de badges"
echo "   /rankings - Classements dynamiques"
echo "   /battles - Compétitions"
echo "   /notifications - Préférences"
echo ""
echo "============================================"
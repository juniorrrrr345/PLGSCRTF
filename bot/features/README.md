# 🚀 Nouvelles Fonctionnalités du Bot

## 📋 Vue d'ensemble

Ce module ajoute 4 fonctionnalités majeures au bot de vote sans modifier le code existant :

1. **🏅 Système de Badges et Paliers**
2. **📊 Classements Dynamiques (Top jour & Top semaine)**
3. **⚔️ Mini-compétitions / Battles**
4. **🔔 Notifications Personnalisées**

## 🎯 Installation

### Étape 1 : Installation des dépendances

```bash
cd /workspace/PLGSCRTF/bot
npm install moment node-cron
```

### Étape 2 : Exécution du script d'installation

```bash
node install-features.js
```

### Étape 3 : Intégration dans le bot

Ajoutez ces lignes dans `index.js` :

```javascript
// Après les imports existants
const { initializeEnhancedFeatures } = require('./features-hook');

// Après la connexion MongoDB
initializeEnhancedFeatures(bot);
```

## 🏅 1. Système de Badges et Paliers

### Description
Les utilisateurs gagnent des badges en votant et en participant aux activités du bot.

### Types de Badges

#### Badges de Votes
- 🎯 **Premier Vote** - 1er vote effectué (+10 points)
- ⭐ **Voteur Actif** - 10 votes (+50 points)
- 🌟 **Voteur Expert** - 50 votes (+200 points)
- 💫 **Voteur Légendaire** - 100 votes (+500 points)

#### Badges de Fidélité
- 📅 **Régulier** - 3 jours consécutifs (+30 points)
- 🔥 **Fidèle** - 7 jours consécutifs (+100 points, x1.1 multiplicateur)
- 💎 **Inconditionnel** - 30 jours consécutifs (+1000 points, x1.5 multiplicateur)

#### Badges de Compétition
- ⚔️ **Combattant** - Première participation à une battle (+25 points)
- 🏆 **Vainqueur** - Première victoire en battle (+150 points)
- 👑 **Champion** - 5 victoires en battle (+750 points, Titre Champion)

#### Badges de Position
- 🎖️ **Top 10** - Plug favori dans le Top 10 (+100 points)
- 🥉 **Top 3** - Plug favori dans le Top 3 (+300 points)
- 🥇 **Numéro 1** - Plug favori en première position (+1000 points)

### Commandes
- `/badges` - Voir ses badges et statistiques

## 📊 2. Classements Dynamiques

### Types de Classements

#### Top du Jour
- Affiche les plugs qui ont reçu le plus de votes aujourd'hui
- Mise à jour en temps réel
- Comparaison avec la veille (% de progression)

#### Top de la Semaine
- Cumul des votes sur 7 jours glissants
- Moyenne journalière
- Meilleur jour de la semaine

#### Plugs en Progression
- Plugs avec la meilleure croissance
- Calcul du taux de progression
- Mise en avant des "rising stars"

### Commandes
- `/rankings` - Menu des classements
- Notification automatique du Top du jour à 20h

## ⚔️ 3. Système de Battles

### Fonctionnement
- Confrontation entre 2 plugs
- Durée limitée (48h par défaut)
- Un vote par utilisateur par battle

### Types de Battles

#### Battle du Week-end
- Automatique tous les vendredis à 17h
- Oppose les 2 meilleurs plugs de la semaine
- Durée : vendredi 18h - dimanche 22h

#### Battles Spéciales
- Créées manuellement par les admins
- Événements thématiques
- Récompenses spéciales

### Notifications
- Début de battle
- Rappel à mi-parcours (24h)
- Fin imminente (2h avant)
- Résultats

### Commandes
- `/battles` - Menu des battles
- Participation directe via les boutons

## 🔔 4. Notifications Personnalisées

### Types de Notifications

#### Notifications de Paliers
- Top 10/3/1 atteint
- Caps de votes (100, 500, 1000)
- Progression significative

#### Notifications de Battles
- Nouvelle battle disponible
- Rappels de participation
- Résultats et récompenses

#### Notifications de Classements
- Top du jour (optionnel)
- Top de la semaine
- Changements de position

### Gestion des Préférences
- Horaires préférés (matin/après-midi/soir/nuit)
- Types de notifications (badges/classements/battles)
- Limite quotidienne
- Plugs favoris pour suivi personnalisé

### Commandes
- `/notifications` - Gérer ses préférences

## 📊 Structure de la Base de Données

### Nouveaux Modèles

```
Badge - Définition des badges disponibles
UserBadge - Badges débloqués par utilisateur
UserPreferences - Préférences de notification et favoris
DailyRanking - Classements quotidiens
Battle - Compétitions entre plugs
```

## 🔧 Configuration Avancée

### Variables d'Environnement (optionnelles)

```env
# Horaires des notifications
DAILY_TOP_HOUR=20  # Heure d'envoi du top du jour
BATTLE_START_DAY=5  # Jour de début des battles (5=vendredi)

# Limites
MAX_DAILY_NOTIFICATIONS=5  # Nombre max de notifications/jour
RANKING_RETENTION_DAYS=30  # Durée de conservation des classements
```

### Tâches Automatiques (Cron Jobs)

- **Tous les jours à 20h** : Envoi du Top du jour
- **Vendredis à 17h** : Création de la battle du week-end
- **Toutes les heures** : Vérification des battles actives
- **Toutes les 30 min** : Finalisation des battles terminées
- **Lundis à 3h** : Nettoyage des anciennes données

## 🎮 Expérience Utilisateur

### Gamification
- Système de niveaux basé sur les points
- Multiplicateurs de récompenses
- Titres spéciaux
- Progression visible

### Engagement
- Notifications intelligentes (pas de spam)
- Contenu dynamique quotidien
- Compétitions régulières
- Récompenses motivantes

### Social
- Comparaison avec les autres utilisateurs
- Support des plugs favoris
- Participation communautaire aux battles
- Célébration des achievements

## 🛠️ Maintenance

### Commandes Admin (à implémenter si besoin)

```javascript
// Créer une battle manuelle
/create_battle plug1_id plug2_id durée_heures

// Attribuer un badge spécial
/grant_badge user_id badge_name

// Voir les statistiques globales
/stats_global
```

### Monitoring
- Logs des badges débloqués
- Statistiques des battles
- Taux d'engagement
- Performance des notifications

## 📈 Métriques de Succès

- **Augmentation de l'engagement** : +40% de votes quotidiens attendus
- **Rétention** : Amélioration de 25% grâce aux séries de votes
- **Participation aux battles** : 60% des utilisateurs actifs
- **Satisfaction** : Système de récompenses motivant

## 🚀 Évolutions Futures

- Tournois mensuels
- Badges saisonniers
- Système de paris sur les battles
- Classements par région/catégorie
- Intégration avec des récompenses réelles

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs du bot
2. Consultez la base de données MongoDB
3. Testez avec la commande `/debug` (si implémentée)

---

*Développé avec ❤️ pour améliorer l'engagement et créer une communauté active autour des plugs*
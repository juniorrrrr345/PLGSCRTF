import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import mongoose from 'mongoose'

// Configuration pour la connexion au bot
const BOT_MONGODB_URI = process.env.MONGODB_URI || process.env.BOT_MONGODB_URI

export async function POST(request: Request) {
  try {
    // Vérifier l'autorisation admin
    const authHeader = request.headers.get('authorization')
    const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-token'
    
    if (authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que l'URI MongoDB est définie
    if (!BOT_MONGODB_URI) {
      return NextResponse.json({ 
        error: 'MongoDB URI not configured',
        details: 'BOT_MONGODB_URI environment variable is missing' 
      }, { status: 500 })
    }

    // Connexion à la base de données de la boutique
    await connectToDatabase()
    
    // Compter les utilisateurs dans la boutique
    const webUserCount = await User.countDocuments()
    
    // Se connecter à la base de données du bot
    const botConnection = await mongoose.createConnection(BOT_MONGODB_URI)
    const BotUser = botConnection.model('User', User.schema)
    
    // Compter les utilisateurs dans le bot
    const botUserCount = await BotUser.countDocuments()
    
    // Récupérer tous les utilisateurs du bot
    const botUsers = await BotUser.find({})
    
    // Récupérer les IDs des utilisateurs de la boutique
    const webUserIds = new Set(
      (await User.find({}, { telegramId: 1 })).map(u => u.telegramId.toString())
    )
    
    // Trouver et synchroniser les utilisateurs manquants
    let synced = 0
    const missingUsers = []
    
    for (const botUser of botUsers) {
      if (!webUserIds.has(botUser.telegramId.toString())) {
        // Créer l'utilisateur dans la boutique
        try {
          await User.create({
            telegramId: botUser.telegramId,
            username: botUser.username,
            firstName: botUser.firstName,
            lastName: botUser.lastName,
            referredBy: botUser.referredBy,
            hasBeenCountedAsReferral: botUser.hasBeenCountedAsReferral,
            lastLikeAt: botUser.lastLikeAt,
            likedPlugs: botUser.likedPlugs || [],
            joinedAt: botUser.joinedAt,
            isAdmin: botUser.isAdmin || false,
            referralCount: botUser.referralCount || 0
          })
          synced++
          missingUsers.push({
            telegramId: botUser.telegramId,
            username: botUser.username || botUser.firstName || 'Unknown'
          })
        } catch (error) {
          console.error(`Failed to sync user ${botUser.telegramId}:`, error)
        }
      }
    }
    
    // Fermer la connexion au bot
    await botConnection.close()
    
    // Compter à nouveau après synchronisation
    const newWebUserCount = await User.countDocuments()
    
    return NextResponse.json({
      success: true,
      before: {
        bot: botUserCount,
        web: webUserCount,
        difference: botUserCount - webUserCount
      },
      after: {
        bot: botUserCount,
        web: newWebUserCount,
        difference: botUserCount - newWebUserCount
      },
      synced: synced,
      missingUsers: missingUsers
    })
    
  } catch (error) {
    console.error('Sync missing users error:', error)
    return NextResponse.json(
      { error: 'Failed to sync missing users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
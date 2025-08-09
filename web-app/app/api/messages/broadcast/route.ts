import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log('Broadcast API called')
    
    // Connexion à MongoDB
    await connectToDatabase()
    console.log('Connected to MongoDB')
    
    const { message } = await request.json()
    console.log('Message received:', message)
    
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    // Récupérer tous les utilisateurs actifs
    const users = await User.find({ isActive: { $ne: false } })
    console.log(`Found ${users.length} active users`)
    
    if (users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sent: 0,
        failed: 0,
        total: 0,
        message: 'Aucun utilisateur actif trouvé'
      })
    }
    
    // Vérifier que le token du bot est configuré
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured')
      return NextResponse.json({ error: 'Bot token not configured. Please add TELEGRAM_BOT_TOKEN to environment variables.' }, { status: 500 })
    }
    
    console.log('Bot token found, starting to send messages...')
    
    let sent = 0
    let failed = 0
    const errors: any[] = []
    
    // Envoyer le message directement via l'API Telegram
    for (const user of users) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegramId,
            text: message,
            parse_mode: 'HTML'
          })
        })
        
        const result = await response.json()
        
        if (response.ok && result.ok) {
          sent++
        } else {
          failed++
          console.error(`Failed to send to ${user.username || user.telegramId}:`, result)
          errors.push({ user: user.username || user.telegramId, error: result.description || 'Unknown error' })
        }
      } catch (error: any) {
        console.error(`Error sending to ${user.username || user.telegramId}:`, error.message)
        failed++
        errors.push({ user: user.username || user.telegramId, error: error.message })
      }
      
      // Petite pause pour éviter de dépasser les limites de l'API Telegram
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    console.log(`Broadcast complete: ${sent} sent, ${failed} failed`)
    
    return NextResponse.json({ 
      success: true, 
      sent,
      failed,
      total: users.length,
      errors: errors.slice(0, 5) // Retourner les 5 premières erreurs pour debug
    })
  } catch (error: any) {
    console.error('Error broadcasting message:', error)
    return NextResponse.json({ 
      error: 'Failed to broadcast message', 
      details: error.message 
    }, { status: 500 })
  }
}
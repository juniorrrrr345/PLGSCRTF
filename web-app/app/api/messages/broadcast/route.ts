import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { message } = await request.json()
    
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    // Récupérer tous les utilisateurs actifs
    const users = await User.find({ isActive: { $ne: false } })
    
    // Vérifier que le token du bot est configuré
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured')
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
    }
    
    let sent = 0
    let failed = 0
    
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
        
        if (response.ok) {
          sent++
        } else {
          failed++
          const error = await response.json()
          console.error(`Failed to send to ${user.telegramId}:`, error)
        }
      } catch (error) {
        console.error(`Error sending to ${user.telegramId}:`, error)
        failed++
      }
      
      // Petite pause pour éviter de dépasser les limites de l'API Telegram
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    return NextResponse.json({ 
      success: true, 
      sent,
      failed,
      total: users.length
    })
  } catch (error) {
    console.error('Error broadcasting message:', error)
    return NextResponse.json({ error: 'Failed to broadcast message' }, { status: 500 })
  }
}
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
    
    // Envoyer le message via l'API du bot
    const botUrl = process.env.BOT_API_URL || 'http://localhost:3000'
    const response = await fetch(`${botUrl}/api/broadcast`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': process.env.BOT_API_KEY || ''
      },
      body: JSON.stringify({ 
        message,
        userIds: users.map(u => u.telegramId)
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to send broadcast message')
    }
    
    const result = await response.json()
    
    return NextResponse.json({ 
      success: true, 
      sent: result.sent || users.length,
      failed: result.failed || 0 
    })
  } catch (error) {
    console.error('Error broadcasting message:', error)
    return NextResponse.json({ error: 'Failed to broadcast message' }, { status: 500 })
  }
}
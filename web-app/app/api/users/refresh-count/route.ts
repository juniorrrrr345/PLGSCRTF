import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    // Vérifier la clé secrète pour les appels depuis le bot
    const authHeader = request.headers.get('authorization')
    const secretKey = process.env.SYNC_SECRET_KEY || 'default-sync-key'
    
    // Permettre l'appel avec la clé secrète ou sans (pour les appels internes)
    const isAuthorized = !authHeader || authHeader === `Bearer ${secretKey}`
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectToDatabase()
    
    const userCount = await User.countDocuments()
    
    // Forcer le rafraîchissement du cache
    revalidatePath('/api/stats')
    revalidatePath('/api/users/count')
    revalidatePath('/')
    
    return NextResponse.json({
      count: userCount,
      success: true,
      message: 'Count refreshed successfully'
    })
  } catch (error) {
    console.error('Refresh count error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh count' },
      { status: 500 }
    )
  }
}
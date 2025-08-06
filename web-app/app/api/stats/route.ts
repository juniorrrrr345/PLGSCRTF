import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Plug from '@/models/Plug'

// Désactiver complètement le cache pour cet endpoint
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    await connectToDatabase()
    
    const userCount = await User.countDocuments()
    const plugCount = await Plug.countDocuments()
    
    return NextResponse.json({
      userCount,
      plugCount,
      timestamp: new Date().toISOString() // Ajouter un timestamp pour vérifier la fraîcheur
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
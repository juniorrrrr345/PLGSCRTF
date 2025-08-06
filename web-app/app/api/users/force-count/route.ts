import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'

// Force le cache à être désactivé
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    await connectToDatabase()
    
    // Forcer un nouveau comptage sans cache
    const userCount = await User.countDocuments({})
    
    // Retourner avec des headers anti-cache stricts
    return new NextResponse(
      JSON.stringify({ 
        count: userCount,
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Type-Options': 'nosniff',
          'X-Vercel-Cache': 'MISS'
        }
      }
    )
  } catch (error) {
    console.error('Force count error:', error)
    return NextResponse.json(
      { error: 'Failed to get count' },
      { status: 500 }
    )
  }
}
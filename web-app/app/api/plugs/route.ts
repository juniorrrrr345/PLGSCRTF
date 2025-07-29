import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Plug from '@/models/Plug'

export async function GET() {
  try {
    await connectToDatabase()
    
    // Récupérer les plugs actifs, triés par likes
    const plugs = await Plug.find({ isActive: true })
      .sort({ likes: -1 })
      .limit(100)
    
    return NextResponse.json(plugs)
  } catch (error) {
    console.error('Plugs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plugs' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Settings from '@/models/Settings'

export async function GET() {
  try {
    await connectToDatabase()
    
    const settings = await Settings.findOne()
    
    if (!settings) {
      return NextResponse.json({
        welcomeMessage: 'Bienvenue sur notre boutique !',
        welcomeImage: null,
        backgroundImage: null,
        infoText: 'Informations sur notre service',
        socialNetworks: {}
      })
    }
    
    return NextResponse.json({
      welcomeMessage: settings.welcomeMessage,
      welcomeImage: settings.welcomeImage,
      backgroundImage: settings.backgroundImage,
      infoText: settings.infoText,
      socialNetworks: settings.socialNetworks
    })
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
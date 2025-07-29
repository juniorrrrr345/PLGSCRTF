import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    
    let settings = await Settings.findOne()
    
    if (!settings) {
      settings = new Settings()
    }
    
    // Mettre à jour les paramètres
    if (body.welcomeMessage !== undefined) {
      settings.welcomeMessage = body.welcomeMessage
    }
    if (body.infoText !== undefined) {
      settings.infoText = body.infoText
    }
    
    await settings.save()
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
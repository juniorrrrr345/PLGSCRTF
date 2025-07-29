import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Settings from '@/models/Settings'

export async function POST(request: Request) {
  try {
    const { backgroundImage, logoImage } = await request.json()
    
    await connectToDatabase()
    
    let settings = await Settings.findOne()
    if (!settings) {
      settings = new Settings()
    }
    
    if (backgroundImage) {
      settings.backgroundImage = backgroundImage
    }
    
    if (logoImage) {
      settings.logoImage = logoImage
    }
    
    await settings.save()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating background/logo:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectToDatabase()
    
    const settings = await Settings.findOne()
    
    return NextResponse.json({
      backgroundImage: settings?.backgroundImage || '',
      logoImage: settings?.logoImage || ''
    })
  } catch (error) {
    console.error('Error fetching background/logo:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
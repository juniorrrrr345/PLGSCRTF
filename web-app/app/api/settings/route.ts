import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Settings from '@/models/Settings'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET() {
  try {
    await connectToDatabase()
    
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({})
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await connectToDatabase()
    
    let settings = await Settings.findOne()
    if (!settings) {
      settings = new Settings(data)
    } else {
      Object.assign(settings, data)
    }
    
    await settings.save()
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
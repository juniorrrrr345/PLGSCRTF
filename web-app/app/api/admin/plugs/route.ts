import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Plug from '@/models/Plug'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await connectToDatabase()
    
    // Ajouter isActive par défaut
    const plugData = {
      ...data,
      isActive: true,
      likes: 0,
      referralCount: 0,
      createdAt: new Date()
    }
    
    const plug = new Plug(plugData)
    await plug.save()
    
    return NextResponse.json(plug, { status: 201 })
  } catch (error) {
    console.error('Error creating plug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
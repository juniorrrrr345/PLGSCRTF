import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import VendorApplication from '@/models/VendorApplication'
import Plug from '@/models/Plug'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const application = await VendorApplication.findById(params.id)
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Créer le plug à partir de la candidature
    const newPlug = new Plug({
      name: application.username,
      telegramId: application.telegramId,
      socialNetworks: application.socialNetworks,
      methods: application.methods,
      location: application.location,
      photo: application.shopPhoto,
      description: application.description,
      isActive: true,
      likes: 0,
      referralCount: 0
    })
    
    await newPlug.save()
    
    // Mettre à jour le statut de la candidature
    application.status = 'approved'
    application.reviewedAt = new Date()
    await application.save()
    
    return NextResponse.json({ 
      success: true, 
      plug: newPlug 
    })
  } catch (error) {
    console.error('Approve application error:', error)
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Plug from '@/models/Plug'

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    
    const plugData = await request.json()
    
    // Vérifier la clé secrète pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization')
    const secretKey = process.env.SYNC_SECRET_KEY || 'default-sync-key'
    
    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Créer ou mettre à jour le plug
    const plug = await Plug.findOneAndUpdate(
      { _id: plugData._id },
      {
        name: plugData.name,
        description: plugData.description,
        category: plugData.category,
        location: plugData.location,
        images: plugData.images,
        likes: plugData.likes,
        views: plugData.views,
        isActive: plugData.isActive,
        createdBy: plugData.createdBy,
        createdAt: plugData.createdAt,
        methods: plugData.methods,
        deliveryDepartments: plugData.deliveryDepartments,
        deliveryPostalCodes: plugData.deliveryPostalCodes,
        meetupDepartments: plugData.meetupDepartments,
        meetupPostalCodes: plugData.meetupPostalCodes,
        socialNetworks: plugData.socialNetworks,
        customNetworks: plugData.customNetworks,
        country: plugData.country,
        countryFlag: plugData.countryFlag
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    )
    
    return NextResponse.json({ 
      success: true,
      plug: {
        _id: plug._id,
        name: plug.name
      }
    })
    
  } catch (error) {
    console.error('Plug sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync plug' },
      { status: 500 }
    )
  }
}

// Route pour supprimer un plug
export async function DELETE(request: Request) {
  try {
    await connectToDatabase()
    
    const { plugId } = await request.json()
    
    // Vérifier la clé secrète
    const authHeader = request.headers.get('authorization')
    const secretKey = process.env.SYNC_SECRET_KEY || 'default-sync-key'
    
    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await Plug.findByIdAndDelete(plugId)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Plug delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete plug' },
      { status: 500 }
    )
  }
}
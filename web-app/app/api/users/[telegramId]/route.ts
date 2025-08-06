import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Plug from '@/models/Plug'

export async function GET(
  request: Request,
  { params }: { params: { telegramId: string } }
) {
  try {
    await connectToDatabase()
    
    const { telegramId } = params
    
    // Récupérer l'utilisateur
    const user = await User.findOne({ telegramId })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Récupérer les plugs de l'utilisateur s'il est admin
    let userPlugs = []
    if (user.isAdmin) {
      userPlugs = await Plug.find({ 
        createdBy: user._id,
        isActive: true 
      }).sort({ createdAt: -1 })
    }
    
    // Récupérer les plugs likés par l'utilisateur
    const likedPlugs = user.likedPlugs || []
    
    return NextResponse.json({
      user: {
        _id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        joinedAt: user.joinedAt,
        referralCount: user.referralCount || 0,
        likedPlugs: likedPlugs
      },
      userPlugs: userPlugs,
      stats: {
        totalPlugs: userPlugs.length,
        totalLikes: userPlugs.reduce((acc, plug) => acc + (plug.likes || 0), 0),
        totalViews: userPlugs.reduce((acc, plug) => acc + (plug.views || 0), 0)
      }
    })
    
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
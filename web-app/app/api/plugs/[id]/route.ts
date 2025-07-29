import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Plug from '@/models/Plug'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const plug = await Plug.findById(params.id)
    
    if (!plug) {
      return NextResponse.json(
        { error: 'Plug not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(plug)
  } catch (error) {
    console.error('Plug API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plug' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const plug = await Plug.findByIdAndDelete(params.id)
    
    if (!plug) {
      return NextResponse.json(
        { error: 'Plug not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete plug error:', error)
    return NextResponse.json(
      { error: 'Failed to delete plug' },
      { status: 500 }
    )
  }
}
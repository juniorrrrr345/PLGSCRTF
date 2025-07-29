import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Plug from '@/models/Plug'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const plug = await Plug.findById(params.id)
    
    if (!plug) {
      return NextResponse.json({ error: 'Plug not found' }, { status: 404 })
    }
    
    return NextResponse.json(plug)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    await connectToDatabase()
    
    const plug = await Plug.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true }
    )
    
    if (!plug) {
      return NextResponse.json({ error: 'Plug not found' }, { status: 404 })
    }
    
    return NextResponse.json(plug)
  } catch (error) {
    console.error('Error updating plug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const plug = await Plug.findByIdAndDelete(params.id)
    
    if (!plug) {
      return NextResponse.json({ error: 'Plug not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Plug deleted successfully' })
  } catch (error) {
    console.error('Error deleting plug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
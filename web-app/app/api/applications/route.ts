import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import VendorApplication from '@/models/VendorApplication'

export async function GET() {
  try {
    await connectToDatabase()
    
    const applications = await VendorApplication.find()
      .sort({ createdAt: -1 })
      .limit(100)
    
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Applications API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
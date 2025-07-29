import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/models/Product'
import Plug from '@/models/Plug'

export async function GET() {
  try {
    await connectToDatabase()
    
    const products = await Product.find({ isActive: true })
      .populate('plugId', 'name photo location likes')
      .sort({ createdAt: -1 })
      .limit(100)
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, productId } = body
    
    if (action === 'like') {
      await connectToDatabase()
      
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { likes: 1 } },
        { new: true }
      )
      
      return NextResponse.json({ success: true, likes: product.likes })
    }
    
    if (action === 'view') {
      await connectToDatabase()
      
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { views: 1 } }
      )
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Product action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
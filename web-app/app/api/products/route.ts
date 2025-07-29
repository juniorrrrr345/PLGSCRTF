import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET() {
  try {
    await connectToDatabase()
    const products = await Product.find({ isActive: true }).sort({ order: 1, createdAt: -1 })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await connectToDatabase()
    
    const product = new Product(data)
    await product.save()
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
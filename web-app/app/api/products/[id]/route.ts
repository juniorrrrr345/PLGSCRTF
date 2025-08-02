import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const product = await Product.findById(params.id)
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    console.log('Updating product with ID:', params.id)
    console.log('Update data:', data)
    
    await connectToDatabase()
    
    // Enlever l'_id du data pour éviter les conflits
    const { _id, ...updateData } = data
    
    const product = await Product.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    if (!product) {
      console.error('Product not found with ID:', params.id)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    console.log('Product updated successfully:', product._id)
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const product = await Product.findByIdAndDelete(params.id)
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
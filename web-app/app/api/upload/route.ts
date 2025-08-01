import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      )
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image trop grande. Maximum 10MB.' },
        { status: 400 }
      )
    }

    // Convertir en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload vers Cloudinary
    const CLOUDINARY_CLOUD_NAME = 'dtjab1akq'
    const CLOUDINARY_UPLOAD_PRESET = 'ml_default'
    
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
    
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', base64)
    cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[API Upload] Cloudinary error:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Erreur Cloudinary' },
        { status: response.status }
      )
    }
    
    return NextResponse.json({ url: data.secure_url })
    
  } catch (error) {
    console.error('[API Upload] Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'upload' },
      { status: 500 }
    )
  }
}
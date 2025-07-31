import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }
    
    // Récupérer le lien du fichier depuis l'API Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    
    const fileResponse = await fetch(getFileUrl)
    const fileData = await fileResponse.json()
    
    if (!fileData.ok || !fileData.result?.file_path) {
      return NextResponse.json(
        { error: 'Failed to get file from Telegram' },
        { status: 500 }
      )
    }
    
    // Construire l'URL de téléchargement
    const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`
    
    // Récupérer l'image
    const imageResponse = await fetch(downloadUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Retourner l'image avec les bons headers
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching Telegram photo:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: 500 }
    )
  }
}
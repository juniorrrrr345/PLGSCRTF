// Configuration Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dtjab1akq'
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'

// Upload vers Cloudinary uniquement
export const uploadImage = async (file: File): Promise<string> => {
  console.log('[Upload] Starting image upload...', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  })
  
  // Vérifier la taille du fichier
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image trop grande. Maximum 10MB.')
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Upload] Cloudinary error:', errorText)
      throw new Error(`Erreur upload: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('[Upload] Success! URL:', data.secure_url)
    
    return data.secure_url
  } catch (error) {
    console.error('[Upload] Error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erreur lors de l\'upload. Veuillez réessayer.')
  }
}
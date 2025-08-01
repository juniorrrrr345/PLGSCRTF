// Upload d'image via notre API
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

  // Vérifier le type de fichier
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image')
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    
    // Utiliser notre route API au lieu d'appeler directement Cloudinary
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('[Upload] API error response:', data)
      throw new Error(data.error || `Erreur upload: ${response.status}`)
    }
    
    console.log('[Upload] Success! URL:', data.url)
    return data.url
    
  } catch (error) {
    console.error('[Upload] Error details:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Erreur lors de l\'upload. Veuillez réessayer.')
  }
}

// Upload direct vers Cloudinary (fallback)
export const uploadDirectToCloudinary = async (file: File): Promise<string> => {
  const CLOUDINARY_CLOUD_NAME = 'dtjab1akq'
  const CLOUDINARY_UPLOAD_PRESET = 'ml_default'
  
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
  
  const data = await response.json()
  
  if (!response.ok) {
    console.error('[Upload] Direct Cloudinary error:', data)
    throw new Error(data.error?.message || 'Erreur Cloudinary')
  }
  
  return data.secure_url
}

// Configuration alternative si tout échoue
export const createBase64Url = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}
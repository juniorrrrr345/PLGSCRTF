// Service d'upload principal - Cloudinary
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const CLOUD_NAME = 'dtjab1akq'
  const UPLOAD_PRESET = 'ml_default'
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('cloud_name', CLOUD_NAME)
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  )
  
  if (!response.ok) {
    throw new Error('Upload échoué')
  }
  
  const data = await response.json()
  return data.secure_url
}

// Service d'upload alternatif - ImgBB
const IMGBB_API_KEY = 'a7d6c5b4a3d2c1b0a9f8e7f6c8e5b8a7'

export const uploadToImgBB = async (file: File): Promise<string> => {
  try {
    // Convertir en base64
    const base64 = await fileToBase64(file)
    const base64String = base64.split(',')[1]
    
    const formData = new FormData()
    formData.append('image', base64String)
    
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    const data = await response.json()
    
    if (!response.ok || !data.success) {
      throw new Error('Upload échoué')
    }
    
    return data.data.url
  } catch (error) {
    console.error('ImgBB upload error:', error)
    throw error
  }
}

// Upload principal avec un seul fallback
export const uploadImage = async (file: File): Promise<string> => {
  console.log('Starting image upload...', file.name)
  
  // Vérifier la taille du fichier
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image trop grande. Maximum 10MB.')
  }
  
  // Essayer Cloudinary d'abord (plus rapide et fiable)
  try {
    const url = await uploadToCloudinary(file)
    console.log('Cloudinary upload successful')
    return url
  } catch (error) {
    console.log('Cloudinary failed, trying ImgBB...')
    
    // Si Cloudinary échoue, essayer ImgBB
    try {
      const url = await uploadToImgBB(file)
      console.log('ImgBB upload successful')
      return url
    } catch (error) {
      throw new Error('Impossible d\'uploader l\'image. Vérifiez votre connexion et réessayez.')
    }
  }
}

// Helper function
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}
// Service d'upload alternatif - ImgBB (gratuit, sans configuration)
const IMGBB_API_KEY = 'a7d6c5b4a3d2c1b0a9f8e7f6c8e5b8a7'; // Clé API publique pour test

export const uploadToImgBB = async (file: File): Promise<string> => {
  try {
    // Convertir en base64
    const base64 = await fileToBase64(file);
    // Retirer le préfixe data:image/...;base64,
    const base64String = base64.split(',')[1];
    
    const formData = new FormData();
    formData.append('image', base64String);
    
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error('Upload échoué');
    }
    
    return data.data.url;
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
};

// Upload vers plusieurs services (fallback)
export const uploadImage = async (file: File): Promise<string> => {
  console.log('Attempting image upload...', file.name);
  
  // Vérifier la taille du fichier (max 10MB pour la plupart des services gratuits)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image trop grande. Maximum 10MB.');
  }
  
  // Essayer d'abord Cloudinary
  try {
    const { uploadToCloudinary } = await import('./cloudinary');
    const url = await uploadToCloudinary(file);
    console.log('Cloudinary upload successful');
    return url;
  } catch (error) {
    console.log('Cloudinary failed, trying ImgBB...');
  }
  
  // Si Cloudinary échoue, essayer ImgBB
  try {
    const url = await uploadToImgBB(file);
    console.log('ImgBB upload successful');
    return url;
  } catch (error) {
    console.log('ImgBB failed, trying direct upload...');
  }
  
  // Dernière option : utiliser un service sans API key
  try {
    const url = await uploadToFreeImage(file);
    console.log('FreeImage upload successful');
    return url;
  } catch (error) {
    throw new Error('Impossible d\'uploader l\'image. Vérifiez votre connexion.');
  }
};

// Service gratuit sans API key
const uploadToFreeImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  const data = await response.json();
  // Convertir l'URL temporaire en URL directe
  const url = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
  return url;
};

// Helper function
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
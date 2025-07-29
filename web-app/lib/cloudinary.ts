// Upload simple et direct vers Cloudinary
export const uploadToCloudinary = async (file: File): Promise<string> => {
  // Convertir le fichier en base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const cloudName = 'dtjab1akq';
        
        // Créer le FormData avec le fichier en base64
        const formData = new FormData();
        formData.append('file', base64);
        formData.append('upload_preset', 'ml_default');
        
        console.log('Uploading file:', file.name, 'Size:', file.size);
        
        // Premier essai avec le preset
        let response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        // Si échec avec preset, essayer sans
        if (!response.ok) {
          console.log('Trying without preset...');
          const formDataNoPreset = new FormData();
          formDataNoPreset.append('file', base64);
          
          response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: 'POST',
              body: formDataNoPreset,
            }
          );
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Cloudinary error:', errorText);
          throw new Error('Upload échoué. Vérifiez votre connexion.');
        }

        const data = await response.json();
        console.log('Upload successful:', data.secure_url);
        resolve(data.secure_url);
      } catch (error) {
        console.error('Upload error:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};
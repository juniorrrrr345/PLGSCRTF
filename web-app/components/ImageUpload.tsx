'use client'

import { useState } from 'react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import toast from 'react-hot-toast'
import { PhotoIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  onUpload: (url: string) => void
  currentImage?: string
  label?: string
}

export default function ImageUpload({ onUpload, currentImage, label = 'Choisir une image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Afficher la prévisualisation immédiatement
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload vers Cloudinary
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      onUpload(url)
      toast.success('Image uploadée avec succès !')
    } catch (error) {
      toast.error('Erreur lors de l\'upload. Réessayez.')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      
      <div className="relative">
        {preview ? (
          <div className="relative rounded-lg overflow-hidden bg-gray-800 border-2 border-gray-700">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Upload en cours...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition-colors">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-400">Cliquez pour choisir une image</p>
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
      
      {currentImage && !preview && (
        <p className="text-xs text-gray-500">Image actuelle : {currentImage.split('/').pop()}</p>
      )}
    </div>
  )
}
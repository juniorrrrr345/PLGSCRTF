'use client'

import { useState } from 'react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import toast from 'react-hot-toast'

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

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 100MB pour permettre des images haute qualité)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 100MB')
      return
    }

    // Afficher la prévisualisation
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
      toast.error('Erreur lors de l\'upload')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`btn-secondary cursor-pointer inline-block ${uploading ? 'opacity-50' : ''}`}
        >
          {uploading ? 'Upload en cours...' : label}
        </label>
      </div>

      {preview && (
        <div className="relative w-full max-w-xs">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
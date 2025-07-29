'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { VideoCameraIcon, XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface VideoUploadProps {
  onUpload: (videos: any[]) => void
  maxVideos?: number
}

export default function VideoUpload({ onUpload, maxVideos = 5 }: VideoUploadProps) {
  const [videos, setVideos] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (videos.length + files.length > maxVideos) {
      toast.error(`Maximum ${maxVideos} vidéos autorisées`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        // Check file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
          throw new Error(`${file.name} est trop volumineux (max 100MB)`)
        }

        // Check file type
        if (!file.type.startsWith('video/')) {
          throw new Error(`${file.name} n'est pas une vidéo`)
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'telegram_shop')
        formData.append('resource_type', 'video')

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
          {
            method: 'POST',
            body: formData
          }
        )

        if (!response.ok) {
          throw new Error('Erreur lors de l\'upload')
        }

        const data = await response.json()

        return {
          url: data.secure_url,
          publicId: data.public_id,
          thumbnail: data.secure_url.replace(/\.[^/.]+$/, '.jpg'), // Generate thumbnail
          duration: data.duration,
          format: data.format
        }
      })

      const uploadedVideos = await Promise.all(uploadPromises)
      const newVideos = [...videos, ...uploadedVideos]
      setVideos(newVideos)
      onUpload(newVideos)
      
      toast.success(`${uploadedVideos.length} vidéo(s) uploadée(s) avec succès`)
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index)
    setVideos(newVideos)
    onUpload(newVideos)
  }

  return (
    <div>
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors ${
          uploading ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-400 mb-2">
          Cliquez pour sélectionner des vidéos
        </p>
        <p className="text-sm text-gray-500">
          MP4, MOV, AVI • Max 100MB par vidéo • {videos.length}/{maxVideos} vidéos
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploaded Videos */}
      {videos.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="aspect-video bg-darker rounded-lg overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={`Video ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <VideoCameraIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <button
                onClick={() => removeVideo(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>

              {video.duration && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="mt-4 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"
          />
          <p className="text-sm text-gray-400 mt-2">Upload en cours...</p>
        </div>
      )}
    </div>
  )
}
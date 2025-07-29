'use client'

import { motion } from 'framer-motion'
import { PlayIcon, HeartIcon, EyeIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface ProductCardProps {
  product: any
  onClick: () => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
      onClick={onClick}
    >
      {/* Video/Image Preview */}
      <div className="relative h-64 bg-darker rounded-t-xl overflow-hidden">
        {product.videos && product.videos.length > 0 ? (
          <>
            {product.videos[0].thumbnail && (
              <img
                src={product.videos[0].thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <PlayIcon className="w-12 h-12 text-white" />
            </div>
          </>
        ) : product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-darker">
            <PlayIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded-full">
          <span className="font-bold text-black">{product.price}€</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <HeartIcon className="w-4 h-4" />
            <span>{product.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            <span>{product.views || 0}</span>
          </div>
        </div>

        {/* Category */}
        <div className="mt-4">
          <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">
            {product.category}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
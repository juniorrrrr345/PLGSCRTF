'use client'

import { motion } from 'framer-motion'
import { XMarkIcon, ShareIcon, ShoppingBagIcon, PlayIcon } from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import useSWR from 'swr'

interface ProductModalProps {
  product: any
  onClose: () => void
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const { data: plug } = useSWR(`/api/plugs/${product.plugId}`, fetcher)

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/products/${product._id}`
    
    if (navigator.share) {
      navigator.share({
        title: `${product.name} - CERTIF2PLUG`,
        text: product.description,
        url: shareUrl
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success('Lien copié !')
    }
  }

  const handleLike = async () => {
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', productId: product._id })
      })
      toast.success('Produit liké !')
    } catch (error) {
      toast.error('Erreur lors du like')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-darker rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-darker/95 backdrop-blur-sm p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Video/Image Section */}
          {product.videos && product.videos.length > 0 ? (
            <div className="mb-8">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
                <video
                  src={product.videos[currentVideoIndex].url}
                  controls
                  className="w-full h-full"
                  poster={product.videos[currentVideoIndex].thumbnail}
                />
              </div>
              
              {/* Video Thumbnails */}
              {product.videos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.videos.map((video: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideoIndex(index)}
                      className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden ${
                        currentVideoIndex === index ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <img
                        src={video.thumbnail}
                        alt={`Video ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <PlayIcon className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : product.images && product.images.length > 0 && (
            <div className="mb-8">
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full rounded-xl"
              />
            </div>
          )}

          {/* Product Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Description</h3>
              <p className="text-gray-400 whitespace-pre-wrap">{product.description}</p>

              {/* Social Networks */}
              {product.socialNetworks && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">Réseaux du produit</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(product.socialNetworks).map(([network, value]) => {
                      if (value && typeof value === 'string') {
                        return (
                          <a
                            key={network}
                            href={`https://${network}.com/${value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            {network}
                          </a>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* Price & Actions */}
              <div className="glass-card p-6 mb-6">
                <div className="text-3xl font-bold gradient-text mb-4">
                  {product.price}€
                </div>
                
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleLike}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <HeartIcon className="w-5 h-5" />
                    J'aime
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <ShareIcon className="w-5 h-5" />
                    Partager
                  </button>
                </div>

                {/* Shop Redirect */}
                {plug && (
                  <a
                    href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=plug_${plug._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Acheter chez {plug.name}
                  </a>
                )}
              </div>

              {/* Shop Info */}
              {plug && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4">Vendu par</h3>
                  <div className="flex items-center gap-4">
                    {plug.photo && (
                      <img
                        src={plug.photo}
                        alt={plug.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-bold">{plug.name}</h4>
                      <p className="text-sm text-gray-400">
                        {plug.location?.department} • {plug.likes} likes
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
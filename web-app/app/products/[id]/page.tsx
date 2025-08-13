'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeftIcon, ShareIcon, ShoppingBagIcon, PlayIcon } from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  
  const { data: product, error, isLoading } = useSWR(
    `/api/products/${params.id}`,
    fetcher
  )
  
  const { data: plug } = useSWR(
    product ? `/api/plugs/${product.plugId}` : null,
    fetcher
  )

  useEffect(() => {
    if (product) {
      // Increment views
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view', productId: product._id })
      })
    }
  }, [product])

  const handleShare = () => {
    const shareUrl = window.location.href
    
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Produit introuvable</p>
          <button
            onClick={() => router.push('/products')}
            className="btn-secondary"
          >
            Retour aux produits
          </button>
        </div>
      </div>
    )
  }

  // Pas d'écran de chargement

  return (
    <div className="min-h-screen pt-20 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Retour
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Media Section */}
          <div>
            {product.videos && product.videos.length > 0 ? (
              <div>
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
                        className={`relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden ${
                          currentVideoIndex === index ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <img
                          src={video.thumbnail}
                          alt={`Video ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <PlayIcon className="w-8 h-8 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full rounded-xl"
              />
            ) : (
              <div className="aspect-video bg-darker rounded-xl flex items-center justify-center">
                <PlayIcon className="w-16 h-16 text-gray-600" />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div>
            <h1 className="text-4xl font-black mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-6 mb-6 text-gray-400">
              <div className="flex items-center gap-2">
                <HeartIcon className="w-5 h-5" />
                <span>{product.likes || 0} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{product.views || 0} vues</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-5xl font-bold gradient-text mb-8">
              {product.price}€
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
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

            {/* Description */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Description</h3>
              <p className="text-gray-400 whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Social Networks */}
            {product.socialNetworks && Object.keys(product.socialNetworks).some((k: string) => product.socialNetworks[k]) && (
              <div className="glass-card p-6 mb-6">
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

            {/* Shop Info & Buy Button */}
            {plug && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Vendu par</h3>
                <div className="flex items-center gap-4 mb-6">
                  {plug.photo && (
                    <img
                      src={plug.photo}
                      alt={plug.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-xl">{plug.name}</h4>
                    <p className="text-gray-400">
                      {plug.location?.department} • {plug.likes} likes
                    </p>
                  </div>
                </div>
                
                <a
                  href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=plug_${plug._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Acheter chez {plug.name}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
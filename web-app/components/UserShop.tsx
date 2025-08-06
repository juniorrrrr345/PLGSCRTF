'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  EyeIcon,
  ShareIcon,
  MapPinIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface UserShopProps {
  telegramId: string
}

interface User {
  _id: string
  telegramId: string
  username: string
  firstName: string
  lastName: string
  isAdmin: boolean
  joinedAt: string
  referralCount: number
  likedPlugs: string[]
}

interface Plug {
  _id: string
  name: string
  description: string
  category: string
  location: string
  likes: number
  views: number
  images: string[]
  isActive: boolean
  createdAt: string
}

export default function UserShop({ telegramId }: UserShopProps) {
  const [user, setUser] = useState<User | null>(null)
  const [plugs, setPlugs] = useState<Plug[]>([])
  const [stats, setStats] = useState({ totalPlugs: 0, totalLikes: 0, totalViews: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [telegramId])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${telegramId}`)
      if (!response.ok) {
        throw new Error('User not found')
      }
      const data = await response.json()
      setUser(data.user)
      setPlugs(data.userPlugs)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const shareShop = () => {
    const shopUrl = `${window.location.origin}?user=${telegramId}`
    const text = `Découvrez ma boutique sur PLUGS CRTFS ! @${user?.username}`
    
    if (navigator.share) {
      navigator.share({
        title: `Boutique de ${user?.username}`,
        text: text,
        url: shopUrl
      })
    } else {
      // Fallback: copier dans le presse-papier
      navigator.clipboard.writeText(shopUrl)
      alert('Lien copié dans le presse-papier !')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Utilisateur non trouvé</h2>
          <p className="text-gray-400 mb-6">Cette boutique n'existe pas ou n'est pas encore active.</p>
          <Link href="/" className="btn-primary px-6 py-3">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const displayName = user.username || user.firstName || 'Utilisateur'

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header de la boutique */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Boutique de {displayName}
              </h1>
              <p className="text-blue-100">
                {user.isAdmin ? 'Vendeur Certifié' : 'Membre'} • Inscrit le {new Date(user.joinedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <button
              onClick={shareShop}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-colors"
              title="Partager la boutique"
            >
              <ShareIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <ShoppingBagIcon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalPlugs}</div>
              <div className="text-sm text-blue-100">Plugs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <HeartIcon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <div className="text-sm text-blue-100">Likes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <UserGroupIcon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{user.referralCount}</div>
              <div className="text-sm text-blue-100">Parrainages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {user.isAdmin && plugs.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">
              Mes Plugs ({plugs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugs.map((plug, index) => (
                <motion.div
                  key={plug._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/plugs/${plug._id}`}>
                    <div className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                      {plug.images && plug.images.length > 0 ? (
                        <div className="relative h-48 bg-gray-700">
                          <Image
                            src={plug.images[0]}
                            alt={plug.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
                            {plug.category}
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-700 flex items-center justify-center">
                          <ShoppingBagIcon className="w-16 h-16 text-gray-600" />
                        </div>
                      )}
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">{plug.name}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{plug.description}</p>
                        
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span>{plug.location}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-gray-400">
                              <HeartIcon className="w-4 h-4" />
                              {plug.likes}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <EyeIcon className="w-4 h-4" />
                              {plug.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        ) : user.isAdmin ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun plug pour le moment</h3>
            <p className="text-gray-400">Les plugs de {displayName} apparaîtront ici.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Profil membre</h3>
            <p className="text-gray-400 mb-6">{displayName} n'est pas encore vendeur certifié.</p>
            <Link href="/plugs" className="btn-primary px-6 py-3">
              Explorer les plugs
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { motion } from 'framer-motion'
import { HeartIcon, MapPinIcon, TruckIcon, CubeIcon, UserGroupIcon } from '@heroicons/react/24/solid'

interface PlugCardProps {
  plug: any
  onClick: () => void
}

export default function PlugCard({ plug, onClick }: PlugCardProps) {
  // Générer une couleur de fond basée sur le nom du plug
  const getGradient = (name: string) => {
    const gradients = [
      'from-purple-600/20 to-pink-600/20',
      'from-blue-600/20 to-cyan-600/20',
      'from-green-600/20 to-emerald-600/20',
      'from-orange-600/20 to-red-600/20',
      'from-indigo-600/20 to-purple-600/20',
      'from-teal-600/20 to-green-600/20',
    ]
    const index = name.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  const gradient = getGradient(plug.name)

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer group"
      onClick={onClick}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity`} />
      
      {/* Card content */}
      <div className="relative bg-darker/90 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
        {/* Header with image or gradient */}
        <div className="relative h-32 overflow-hidden">
          {plug.photo ? (
            <>
              <img
                src={plug.photo}
                alt={plug.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darker to-transparent" />
            </>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
          )}
          
          {/* Rank badge if in top 3 */}
          {plug.rank && plug.rank <= 3 && (
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-lg">
                {plug.rank === 1 && '🥇'}
                {plug.rank === 2 && '🥈'}
                {plug.rank === 3 && '🥉'}
              </span>
            </div>
          )}
          
          {/* Like count */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <HeartIcon className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold">{plug.likes}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold mb-2">{plug.name}</h3>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
            <MapPinIcon className="w-4 h-4" />
            <span>{plug.location?.country} • {plug.location?.department}</span>
          </div>
          
          {/* Methods */}
          <div className="flex gap-2 mb-4">
            {plug.methods?.delivery && (
              <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <TruckIcon className="w-3 h-3" />
                Livraison
              </div>
            )}
            {plug.methods?.shipping && (
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <CubeIcon className="w-3 h-3" />
                Envoi
              </div>
            )}
            {plug.methods?.meetup && (
              <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <UserGroupIcon className="w-3 h-3" />
                Meetup
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-400">
                <span>🔗</span>
                <span>{plug.referralCount || 0} parrainages</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-primary hover:text-primary/80 transition-colors text-sm font-semibold"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              Voir détails →
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
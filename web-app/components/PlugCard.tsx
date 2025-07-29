'use client'

import { motion } from 'framer-motion'
import { HeartIcon, MapPinIcon, TruckIcon, CubeIcon, UserGroupIcon } from '@heroicons/react/24/solid'

interface PlugCardProps {
  plug: any
  onClick: () => void
}

export default function PlugCard({ plug, onClick }: PlugCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer group"
      onClick={onClick}
    >
      {/* Card content */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/10 transition-all shadow-xl">
        {/* Header with image */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          {plug.photo ? (
            <>
              <img
                src={plug.photo}
                alt={plug.name}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-50">🔌</span>
            </div>
          )}
          
          {/* Rank badge if in top 3 */}
          {plug.rank && plug.rank <= 3 && (
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span className="text-xl">
                {plug.rank === 1 && '🥇'}
                {plug.rank === 2 && '🥈'}
                {plug.rank === 3 && '🥉'}
              </span>
            </div>
          )}
          
          {/* Like count */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/20">
            <HeartIcon className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-white">{plug.likes}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="text-xl font-bold text-white bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {plug.name}
          </h3>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-gray-300 text-sm bg-black/20 rounded-lg px-3 py-2">
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            <span>{plug.location?.country} • {plug.location?.department}</span>
          </div>
          
          {/* Methods */}
          <div className="flex flex-wrap gap-2">
            {plug.methods?.delivery && (
              <div className="bg-blue-500/30 backdrop-blur-sm text-blue-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-blue-400/30">
                <TruckIcon className="w-3.5 h-3.5" />
                Livraison
              </div>
            )}
            {plug.methods?.shipping && (
              <div className="bg-green-500/30 backdrop-blur-sm text-green-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-green-400/30">
                <CubeIcon className="w-3.5 h-3.5" />
                Envoi
              </div>
            )}
            {plug.methods?.meetup && (
              <div className="bg-purple-500/30 backdrop-blur-sm text-purple-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-purple-400/30">
                <UserGroupIcon className="w-3.5 h-3.5" />
                Meetup
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-sm text-gray-300">
                🔗 {plug.referralCount || 0} parrainages
              </span>
            </div>
            
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-white/80 hover:text-white text-sm font-medium cursor-pointer"
            >
              Voir plus →
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
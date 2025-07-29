'use client'

import { motion } from 'framer-motion'
import { HeartIcon, MapPinIcon, TruckIcon, CubeIcon, UserGroupIcon } from '@heroicons/react/24/solid'

interface PlugCardProps {
  plug: any
  onClick: () => void
}

export default function PlugCard({ plug, onClick }: PlugCardProps) {
  // Fonction pour obtenir le drapeau du pays
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'FR': '🇫🇷',
      'BE': '🇧🇪',
      'CH': '🇨🇭',
      'CA': '🇨🇦',
      'LU': '🇱🇺',
      'MC': '🇲🇨'
    }
    return flags[country] || '🌍'
  }

  // Fonction pour formater la localisation
  const formatLocation = () => {
    const parts = []
    
    if (plug.location?.country || plug.country) {
      const country = plug.location?.country || plug.country
      const flag = plug.countryFlag || getCountryFlag(country)
      parts.push(`${flag} ${country}`)
    }
    
    if (plug.location?.department || plug.department) {
      const dept = plug.location?.department || plug.department
      parts.push(`Dép. ${dept}`)
    }
    
    if (plug.location?.postalCode || plug.postalCode) {
      const postal = plug.location?.postalCode || plug.postalCode
      parts.push(postal)
    }
    
    return parts.join(' • ')
  }

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
        <div className="p-3 md:p-5 space-y-2 md:space-y-3">
          <h3 className="text-base md:text-xl font-bold text-white bg-black/30 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2 inline-block">
            {plug.name}
          </h3>
          
          {/* Location */}
          <div className="bg-black/20 rounded-lg px-2 md:px-3 py-1.5 md:py-2">
            <div className="flex items-center gap-1 md:gap-2 text-gray-300 text-xs md:text-sm">
              <MapPinIcon className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
              <span className="truncate font-medium">{formatLocation()}</span>
            </div>
          </div>
          
          {/* Départements de livraison */}
          {plug.deliveryDepartments && plug.deliveryDepartments.length > 0 && (
            <div className="bg-green-500/10 rounded-lg px-2 md:px-3 py-1.5 md:py-2 border border-green-500/20">
              <div className="text-[10px] md:text-xs text-green-400">
                <span className="font-medium">📦 Livraison : </span>
                {plug.deliveryDepartments.length > 3 
                  ? `${plug.deliveryDepartments.slice(0, 3).join(', ')} +${plug.deliveryDepartments.length - 3}`
                  : plug.deliveryDepartments.join(', ')
                }
              </div>
            </div>
          )}
          
          {/* Methods */}
          <div className="flex flex-wrap gap-1 md:gap-2">
            {plug.methods?.delivery && (
              <div className="bg-blue-500/30 backdrop-blur-sm text-blue-300 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 border border-blue-400/30">
                <TruckIcon className="w-3 md:w-3.5 h-3 md:h-3.5" />
                <span className="hidden sm:inline">Livraison</span>
                <span className="sm:hidden">Liv.</span>
              </div>
            )}
            {plug.methods?.shipping && (
              <div className="bg-green-500/30 backdrop-blur-sm text-green-300 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 border border-green-400/30">
                <CubeIcon className="w-3 md:w-3.5 h-3 md:h-3.5" />
                <span className="hidden sm:inline">Envoi</span>
                <span className="sm:hidden">Env.</span>
              </div>
            )}
            {plug.methods?.meetup && (
              <div className="bg-purple-500/30 backdrop-blur-sm text-purple-300 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 border border-purple-400/30">
                <UserGroupIcon className="w-3 md:w-3.5 h-3 md:h-3.5" />
                <span className="hidden sm:inline">Meetup</span>
                <span className="sm:hidden">Meet</span>
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-white/10">
            <div className="bg-black/30 backdrop-blur-sm rounded-md md:rounded-lg px-2 md:px-3 py-1 md:py-1.5">
              <span className="text-[10px] md:text-sm text-gray-300">
                🔗 {plug.referralCount || 0}
              </span>
            </div>
            
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-white/80 hover:text-white text-xs md:text-sm font-medium cursor-pointer"
            >
              <span className="hidden sm:inline">Voir plus →</span>
              <span className="sm:hidden">→</span>
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
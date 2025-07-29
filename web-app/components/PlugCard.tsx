'use client'

import { motion } from 'framer-motion'
import { HeartIcon, UserGroupIcon } from '@heroicons/react/24/solid'

interface PlugCardProps {
  plug: any
  onClick: () => void
}

export default function PlugCard({ plug, onClick }: PlugCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-6 cursor-pointer hover:border-primary/50 transition-all"
      onClick={onClick}
    >
      {/* Image */}
      {plug.photo && (
        <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
          <img
            src={plug.photo}
            alt={plug.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Info */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold">{plug.name}</h3>
        
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-lg">{plug.countryFlag}</span>
          <span>{plug.country}</span>
          <span>•</span>
          <span>{plug.department}</span>
        </div>

        {/* Methods */}
        <div className="flex flex-wrap gap-2">
          {plug.methods?.delivery && (
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
              🚚 Livraison
            </span>
          )}
          {plug.methods?.shipping && (
            <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm">
              📮 Envoi
            </span>
          )}
          {plug.methods?.meetup && (
            <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
              🤝 Meetup
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-red-500" />
            <span className="font-bold">{plug.likes || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-blue-500" />
            <span className="font-bold">{plug.referralCount || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
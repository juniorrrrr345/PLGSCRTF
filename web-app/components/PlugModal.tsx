'use client'

import { motion } from 'framer-motion'
import { XMarkIcon, ShareIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface PlugModalProps {
  plug: any
  onClose: () => void
}

export default function PlugModal({ plug, onClose }: PlugModalProps) {
  const handleShare = () => {
    const shareUrl = plug.referralLink || `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=ref_${plug._id}`
    
    if (navigator.share) {
      navigator.share({
        title: `${plug.name} - PLUGS CRTFS`,
        text: `Découvrez ${plug.name} sur PLUGS CRTFS !`,
        url: shareUrl
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success('Lien de parrainage copié !')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-bold pr-10">{plug.name}</h2>
          <div className="flex items-center gap-2 mt-2 text-gray-400">
            <span className="text-lg">{plug.countryFlag}</span>
            <span>{plug.country}</span>
            <span>•</span>
            <span>{plug.department}</span>
            {plug.postalCode && (
              <>
                <span>•</span>
                <span>{plug.postalCode}</span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo */}
          {plug.photo && (
            <div className="relative h-64 rounded-xl overflow-hidden">
              <img
                src={plug.photo}
                alt={plug.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Methods */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📦 Méthodes disponibles</h3>
            <div className="flex flex-wrap gap-3">
              {plug.methods?.delivery && (
                <div className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg">
                  <span className="text-primary">🚚 Livraison</span>
                </div>
              )}
              {plug.methods?.shipping && (
                <div className="px-4 py-2 bg-secondary/20 border border-secondary/30 rounded-lg">
                  <span className="text-secondary">📮 Envoi postal</span>
                </div>
              )}
              {plug.methods?.meetup && (
                <div className="px-4 py-2 bg-accent/20 border border-accent/30 rounded-lg">
                  <span className="text-accent">🤝 Rencontre</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {plug.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3">📝 Description</h3>
              <p className="text-gray-300 leading-relaxed">{plug.description}</p>
            </div>
          )}

          {/* Social Networks */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📱 Réseaux sociaux</h3>
            <div className="space-y-2">
              {plug.socialNetworks?.snap && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👻</span>
                  <span className="text-gray-300">Snapchat: {plug.socialNetworks.snap}</span>
                </div>
              )}
              {plug.socialNetworks?.instagram && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📸</span>
                  <span className="text-gray-300">Instagram: {plug.socialNetworks.instagram}</span>
                </div>
              )}
              {plug.socialNetworks?.whatsapp && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💬</span>
                  <span className="text-gray-300">WhatsApp: {plug.socialNetworks.whatsapp}</span>
                </div>
              )}
              {plug.socialNetworks?.telegram && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✈️</span>
                  <span className="text-gray-300">Telegram: {plug.socialNetworks.telegram}</span>
                </div>
              )}
              {plug.socialNetworks?.signal && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔐</span>
                  <span className="text-gray-300">Signal: {plug.socialNetworks.signal}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 text-center">
              <div className="text-3xl font-bold text-red-500">{plug.likes || 0}</div>
              <div className="text-gray-400 mt-1">❤️ Likes</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-3xl font-bold text-blue-500">{plug.referralCount || 0}</div>
              <div className="text-gray-400 mt-1">👥 Parrainages</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10 flex gap-4">
          <button
            onClick={handleShare}
            className="flex-1 glow-button flex items-center justify-center gap-2"
          >
            <ShareIcon className="w-5 h-5" />
            Partager (Parrainage)
          </button>
          <a
            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-all flex items-center justify-center gap-2"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            Contacter sur Telegram
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, HeartIcon, ShareIcon, MapPinIcon, TruckIcon, CubeIcon, UsersIcon, LinkIcon, ChatBubbleLeftIcon, CameraIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface PlugModalProps {
  plug: any
  onClose: () => void
  isOpen: boolean
  onLike?: () => void
}

export default function PlugModal({ plug, onClose, isOpen, onLike }: PlugModalProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [localLikes, setLocalLikes] = useState(plug?.likes || 0)
  const [hasLiked, setHasLiked] = useState(false)

  if (!plug) return null

  const handleLike = async () => {
    if (isLiking || hasLiked) return
    
    setIsLiking(true)
    setHasLiked(true)
    setLocalLikes(localLikes + 1)
    
    if (onLike) {
      await onLike()
    }
    
    setTimeout(() => setIsLiking(false), 1000)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/plugs?id=${plug._id}`
    navigator.clipboard.writeText(url)
    toast.success('Lien copié dans le presse-papier!')
  }

  const socialNetworks = [
    { name: 'Snapchat', value: plug.socialNetworks?.snap, icon: '👻', color: 'from-yellow-400 to-yellow-500' },
    { name: 'Instagram', value: plug.socialNetworks?.instagram, icon: '📷', color: 'from-purple-500 to-pink-500' },
    { name: 'WhatsApp', value: plug.socialNetworks?.whatsapp, icon: '💬', color: 'from-green-500 to-green-600' },
    { name: 'Signal', value: plug.socialNetworks?.signal, icon: '🔒', color: 'from-blue-500 to-blue-600' },
    { name: 'Telegram', value: plug.socialNetworks?.telegram, icon: '✈️', color: 'from-blue-400 to-blue-500' },
    { name: 'Threema', value: plug.socialNetworks?.threema, icon: '🔐', color: 'from-gray-600 to-gray-700' },
    { name: 'Potato', value: plug.socialNetworks?.potato, icon: '🥔', color: 'from-orange-500 to-orange-600' },
  ].filter(network => network.value)

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'FR': '🇫🇷',
      'BE': '🇧🇪',
      'CH': '🇨🇭',
      'CA': '🇨🇦',
      'LU': '🇱🇺'
    }
    return flags[country] || '🌍'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-50 overflow-hidden"
          >
            <div className="bg-gray-900 rounded-3xl shadow-2xl h-full flex flex-col">
              {/* Header avec image */}
              <div className="relative h-72 md:h-96 flex-shrink-0">
                {plug.photo ? (
                  <img
                    src={plug.photo}
                    alt={plug.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-8xl opacity-50">🔌</span>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{plug.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5" />
                      <span className="font-medium">
                        {getCountryFlag(plug.location?.country || plug.country || 'FR')} {plug.location?.country || plug.country || 'FR'} • 
                        Dép. {plug.location?.department || plug.department} • 
                        {plug.location?.postalCode || plug.postalCode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-8 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-2xl p-4 text-center border border-red-600/30"
                    >
                      <HeartSolid className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{localLikes}</div>
                      <div className="text-sm text-gray-400">J'aime</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-4 text-center border border-blue-600/30"
                    >
                      <LinkIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{plug.referralCount || 0}</div>
                      <div className="text-sm text-gray-400">Parrainages</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-4 text-center border border-green-600/30"
                    >
                      <UsersIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{socialNetworks.length}</div>
                      <div className="text-sm text-gray-400">Réseaux</div>
                    </motion.div>
                  </div>

                  {/* Méthodes de livraison */}
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <TruckIcon className="w-6 h-6 text-blue-400" />
                      Méthodes disponibles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {plug.methods?.delivery && (
                        <div className="bg-blue-600/20 border border-blue-600/30 rounded-xl p-4 text-center">
                          <span className="text-3xl mb-2 block">🚚</span>
                          <span className="text-white font-medium">Livraison</span>
                        </div>
                      )}
                      {plug.methods?.shipping && (
                        <div className="bg-green-600/20 border border-green-600/30 rounded-xl p-4 text-center">
                          <span className="text-3xl mb-2 block">📦</span>
                          <span className="text-white font-medium">Envoi postal</span>
                        </div>
                      )}
                      {plug.methods?.meetup && (
                        <div className="bg-purple-600/20 border border-purple-600/30 rounded-xl p-4 text-center">
                          <span className="text-3xl mb-2 block">🤝</span>
                          <span className="text-white font-medium">Rencontre</span>
                        </div>
                      )}
                    </div>

                    {/* Départements de livraison */}
                    {plug.deliveryDepartments && plug.deliveryDepartments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Livraison disponible dans les départements :</h4>
                        <div className="flex flex-wrap gap-2">
                          {plug.deliveryDepartments.map((dept: string) => (
                            <span key={dept} className="bg-green-600/20 text-green-400 px-3 py-1 rounded-lg text-sm font-medium border border-green-600/30">
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Réseaux sociaux */}
                  {socialNetworks.length > 0 && (
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ChatBubbleLeftIcon className="w-6 h-6 text-purple-400" />
                        Réseaux sociaux
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {socialNetworks.map((network) => (
                          <motion.div
                            key={network.name}
                            whileHover={{ scale: 1.05 }}
                            className={`bg-gradient-to-r ${network.color} p-3 rounded-xl text-center cursor-pointer`}
                            onClick={() => toast.success(`${network.name}: ${network.value}`)}
                          >
                            <span className="text-2xl mb-1 block">{network.icon}</span>
                            <span className="text-white text-sm font-medium">{network.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {plug.description && (
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-4">Description</h3>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{plug.description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLike}
                      disabled={isLiking || hasLiked}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                        hasLiked 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
                      }`}
                    >
                      {hasLiked ? (
                        <>
                          <HeartSolid className="w-6 h-6" />
                          Déjà aimé
                        </>
                      ) : (
                        <>
                          <HeartIcon className="w-6 h-6" />
                          J'aime
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <ShareIcon className="w-6 h-6" />
                      Partager
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
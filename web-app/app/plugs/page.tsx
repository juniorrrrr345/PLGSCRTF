'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Plug {
  _id: string
  name: string
  description: string
  photo: string
  methods: {
    delivery: boolean
    shipping: boolean
    meetup: boolean
  }
  socialNetworks: Record<string, string>
  country: string
  countryFlag: string
  department: string
  likes: number
  referralCount: number
  referralLink: string
}

export default function PlugsPage() {
  const { data: plugs, error, isLoading } = useSWR<Plug[]>('/api/plugs', fetcher, {
    refreshInterval: 10000 // Rafraîchir toutes les 10 secondes
  })
  
  const [selectedPlug, setSelectedPlug] = useState<Plug | null>(null)
  
  const handleShare = (plug: Plug) => {
    if (navigator.share) {
      navigator.share({
        title: `${plug.name} - Telegram Shop`,
        text: `Découvrez ${plug.name} sur notre boutique !`,
        url: plug.referralLink
      })
    } else {
      navigator.clipboard.writeText(plug.referralLink)
      toast.success('Lien copié dans le presse-papier !')
    }
  }
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">Erreur de chargement</p>
    </div>
  )
  
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-telegram-accent"></div>
    </div>
  )
  
  return (
    <div className="min-h-screen bg-telegram-bg">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="text-telegram-accent mb-4 inline-block">
            ← Retour
          </Link>
          <h1 className="text-3xl font-bold mb-2">🔌 PLUGS CRTFS</h1>
          <p className="text-telegram-text-secondary">Classement par popularité</p>
        </motion.div>
        
        <div className="grid gap-4">
          {plugs?.map((plug, index) => (
            <motion.div
              key={plug._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card cursor-pointer hover:bg-opacity-80 transition-all"
              onClick={() => setSelectedPlug(plug)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {index === 0 && <span className="text-2xl">🥇</span>}
                  {index === 1 && <span className="text-2xl">🥈</span>}
                  {index === 2 && <span className="text-2xl">🥉</span>}
                  {index > 2 && <span className="text-telegram-text-secondary">#{index + 1}</span>}
                  
                  <div>
                    <h3 className="font-semibold text-lg">{plug.name}</h3>
                    <p className="text-sm text-telegram-text-secondary">
                      {plug.countryFlag} {plug.country} - {plug.department}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold">❤️ {plug.likes}</p>
                  <p className="text-sm text-telegram-text-secondary">likes</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Modal détails plug */}
      {selectedPlug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPlug(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-telegram-secondary rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPlug(null)}
              className="float-right text-telegram-text-secondary hover:text-white"
            >
              ✕
            </button>
            
            {selectedPlug.photo && (
              <img
                src={selectedPlug.photo}
                alt={selectedPlug.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <h2 className="text-2xl font-bold mb-2">{selectedPlug.name}</h2>
            <p className="text-telegram-text-secondary mb-4">
              {selectedPlug.countryFlag} {selectedPlug.country} - {selectedPlug.department}
            </p>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">📦 Méthodes</h3>
              <div className="flex gap-2">
                {selectedPlug.methods.delivery && <span className="badge">🚚 Livraison</span>}
                {selectedPlug.methods.shipping && <span className="badge">📮 Envoi</span>}
                {selectedPlug.methods.meetup && <span className="badge">🤝 Meetup</span>}
              </div>
            </div>
            
            {selectedPlug.description && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">📝 Description</h3>
                <p className="text-telegram-text-secondary">{selectedPlug.description}</p>
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">📱 Contact</h3>
              <div className="space-y-1">
                {selectedPlug.socialNetworks.snap && (
                  <p>👻 Snap: {selectedPlug.socialNetworks.snap}</p>
                )}
                {selectedPlug.socialNetworks.instagram && (
                  <p>📸 Instagram: {selectedPlug.socialNetworks.instagram}</p>
                )}
                {selectedPlug.socialNetworks.whatsapp && (
                  <p>💬 WhatsApp: {selectedPlug.socialNetworks.whatsapp}</p>
                )}
                {selectedPlug.socialNetworks.telegram && (
                  <p>✈️ Telegram: {selectedPlug.socialNetworks.telegram}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleShare(selectedPlug)}
                className="btn-primary flex-1"
              >
                🔗 Partager (Parrainage)
              </button>
              <a
                href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
                className="btn-secondary flex-1 text-center"
              >
                💬 Contacter
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
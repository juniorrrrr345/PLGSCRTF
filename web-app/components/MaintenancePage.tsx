'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SocialNetwork {
  id: string
  name: string
  url: string
  order: number
}

export default function MaintenancePage() {
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([])
  const [maintenanceBackgroundImage, setMaintenanceBackgroundImage] = useState<string>('')
  const [maintenanceLogo, setMaintenanceLogo] = useState<string>('')
  const [maintenanceEndTime, setMaintenanceEndTime] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    // Récupérer les réseaux sociaux et les images depuis l'API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.shopSocialNetworks) {
          setSocialNetworks(data.shopSocialNetworks.sort((a: SocialNetwork, b: SocialNetwork) => a.order - b.order))
        }
        if (data.maintenanceBackgroundImage) {
          setMaintenanceBackgroundImage(data.maintenanceBackgroundImage)
        }
        if (data.maintenanceLogo) {
          setMaintenanceLogo(data.maintenanceLogo)
        }
        if (data.maintenanceEndTime) {
          setMaintenanceEndTime(new Date(data.maintenanceEndTime))
        }
      })
      .catch(err => console.error('Erreur chargement réseaux sociaux:', err))
  }, [])

  useEffect(() => {
    if (!maintenanceEndTime) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const end = new Date(maintenanceEndTime).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeLeft('')
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) {
        setTimeLeft(`${days}j ${hours}h ${minutes}min`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}min`)
      } else {
        setTimeLeft(`${minutes}min`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [maintenanceEndTime])

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4"
      style={{
        backgroundImage: maintenanceBackgroundImage ? `url(${maintenanceBackgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay sombre si image de fond */}
      {maintenanceBackgroundImage && (
        <div className="absolute inset-0 bg-black/70"></div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center relative z-10"
      >
        {maintenanceLogo && (
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={maintenanceLogo}
            alt="PLUGS CRTFS"
            className="w-48 h-48 mx-auto mb-8 rounded-2xl object-cover"
          />
        )}
        
        {!maintenanceLogo && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-8"
          >
            <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.div>
        )}
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          🔧 Maintenance en cours
        </h1>
        
        <p className="text-xl text-gray-300 mb-4">
          Nous sommes bientôt de retour !
        </p>
        
        {timeLeft && (
          <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl">
            <p className="text-center">
              <span className="block text-sm text-gray-300 mb-2">⏱️ Temps estimé</span>
              <span className="block text-5xl font-bold text-white drop-shadow-lg">{timeLeft}</span>
            </p>
          </div>
        )}
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <p className="text-gray-300 mb-4">
            Pour toutes informations, rejoignez nos réseaux sociaux 👇
          </p>
          
          {socialNetworks.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {socialNetworks.map((network) => (
                <a
                  key={network.id}
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all text-sm"
                >
                  {network.name}
                </a>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="https://t.me/PLGSCRTF_BOT"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.248-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.122.099.155.227.17.319.015.092.034.268.019.415z"/>
            </svg>
            Notre Bot Telegram
          </a>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser la page
          </button>
        </div>
        
        <p className="text-sm text-gray-500">
          Cordialement,<br />
          <span className="font-semibold">PLUGS CRTFS</span>
        </p>
      </motion.div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Home() {
  const { data: stats } = useSWR('/api/stats', fetcher, {
    refreshInterval: 5000 // Rafraîchir toutes les 5 secondes
  })
  
  const { data: settings } = useSWR('/api/settings', fetcher)
  
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-telegram-accent"></div>
      </div>
    )
  }
  
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: settings?.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="min-h-screen bg-black bg-opacity-70 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 py-8"
        >
          {/* Header avec image d'accueil */}
          <div className="text-center mb-8">
            {settings?.welcomeImage && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <Image
                  src={settings.welcomeImage}
                  alt="Bienvenue"
                  width={300}
                  height={300}
                  className="mx-auto rounded-lg shadow-2xl"
                />
              </motion.div>
            )}
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold mb-4"
            >
              {settings?.welcomeMessage || 'Bienvenue sur notre boutique !'}
            </motion.h1>
            
            {/* Stats en temps réel */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-8 mb-8"
            >
              <div className="card">
                <p className="text-telegram-text-secondary text-sm">Utilisateurs</p>
                <p className="text-2xl font-bold">{stats?.userCount || 0}</p>
              </div>
              <div className="card">
                <p className="text-telegram-text-secondary text-sm">Plugs actifs</p>
                <p className="text-2xl font-bold">{stats?.plugCount || 0}</p>
              </div>
            </motion.div>
          </div>
          
          {/* Menu de navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
          >
            <Link href="/plugs" className="card hover:bg-opacity-80 transition-all">
              <h2 className="text-xl font-semibold mb-2">🔌 PLUGS CRTFS</h2>
              <p className="text-telegram-text-secondary">Découvrez toutes nos boutiques</p>
            </Link>
            
            <Link href="/search" className="card hover:bg-opacity-80 transition-all">
              <h2 className="text-xl font-semibold mb-2">🔍 Recherche</h2>
              <p className="text-telegram-text-secondary">Trouvez par localisation</p>
            </Link>
            
            <Link href="/social" className="card hover:bg-opacity-80 transition-all">
              <h2 className="text-xl font-semibold mb-2">📱 Réseaux sociaux</h2>
              <p className="text-telegram-text-secondary">Nos contacts</p>
            </Link>
            
            <Link href="/config" className="card hover:bg-opacity-80 transition-all">
              <h2 className="text-xl font-semibold mb-2">⚙️ Administration</h2>
              <p className="text-telegram-text-secondary">Panel admin</p>
            </Link>
          </motion.div>
          
          {/* Bouton retour au bot */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <a 
              href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
              className="btn-primary inline-block"
            >
              ↩️ Retour au Bot
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
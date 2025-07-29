'use client'

import { motion } from 'framer-motion'
import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const socialIcons = {
  telegram: '✈️',
  instagram: '📸',
  snapchat: '👻',
  whatsapp: '💬',
  twitter: '🐦',
  facebook: '📘',
  tiktok: '🎵',
  youtube: '📺'
}

export default function SocialPage() {
  const { data: settings } = useSWR('/api/settings', fetcher)
  const [copiedNetwork, setCopiedNetwork] = useState<string | null>(null)

  const handleCopy = (network: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedNetwork(network)
    setTimeout(() => setCopiedNetwork(null), 2000)
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Nos <span className="gradient-text">Réseaux Sociaux</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Suivez-nous sur nos différentes plateformes
          </p>
        </motion.div>

        {/* Social Networks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings?.socialNetworks && Object.entries(settings.socialNetworks).map(([network, value], index) => {
            if (!value) return null
            
            const icon = socialIcons[network as keyof typeof socialIcons] || '🌐'
            const displayName = network.charAt(0).toUpperCase() + network.slice(1)
            
            return (
              <motion.div
                key={network}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => handleCopy(network, value as string)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{displayName}</h3>
                    <p className="text-gray-400">{value as string}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {copiedNetwork === network ? '✓ Copié!' : 'Cliquer pour copier'}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bot Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="glass-card p-8 neon-border inline-block">
            <h2 className="text-2xl font-bold mb-4">
              Rejoignez notre <span className="gradient-text">Bot Telegram</span>
            </h2>
            <p className="text-gray-400 mb-6">
              Accédez à toutes nos fonctionnalités directement sur Telegram
            </p>
            <a
              href="https://t.me/PLGSCRTF_BOT"
              target="_blank"
              rel="noopener noreferrer"
              className="glow-button inline-flex items-center gap-2"
            >
              <span className="text-2xl">🤖</span>
              Ouvrir le Bot
            </a>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 max-w-2xl mx-auto">
            Restez connecté avec PLUGS CRTFS sur tous nos réseaux sociaux. 
            Suivez-nous pour des mises à jour exclusives, des annonces et plus encore !
          </p>
        </motion.div>
      </div>
    </div>
  )
}
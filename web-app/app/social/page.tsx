'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function SocialPage() {
  const { data: social } = useSWR('/api/social', fetcher)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const socialPlatforms = [
    { 
      name: 'Instagram', 
      icon: '📷', 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      link: social?.instagram 
    },
    { 
      name: 'Snapchat', 
      icon: '👻', 
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20',
      link: social?.snapchat 
    },
    { 
      name: 'Telegram', 
      icon: '✈️', 
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-400/20 to-blue-600/20',
      link: social?.telegram 
    },
    { 
      name: 'WhatsApp', 
      icon: '💬', 
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-gradient-to-br from-green-400/20 to-green-600/20',
      link: social?.whatsapp 
    },
    { 
      name: 'Signal', 
      icon: '🔒', 
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20',
      link: social?.signal 
    },
    { 
      name: 'TikTok', 
      icon: '🎵', 
      color: 'from-pink-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-pink-500/20 to-purple-600/20',
      link: social?.tiktok 
    }
  ]

  return (
    <div className="min-h-screen relative">
      {/* Background avec effet de particules */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ 
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0
            }}
            animate={{ 
              y: [null, -100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
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
              Suivez-nous sur toutes les plateformes
            </p>
          </motion.div>

          {/* Social Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {socialPlatforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group"
              >
                {platform.link ? (
                  <a
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className={`relative ${platform.bgColor} backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-all`}>
                      {/* Gradient overlay on hover */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${platform.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity`}
                      />
                      
                      <div className="relative z-10">
                        <div className="text-6xl mb-4">{platform.icon}</div>
                        <h3 className="text-2xl font-bold mb-2">{platform.name}</h3>
                        <p className="text-gray-400">Suivez-nous →</p>
                      </div>

                      {/* Hover effect */}
                      {hoveredIndex === index && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-10 blur-xl`} />
                        </motion.div>
                      )}
                    </div>
                  </a>
                ) : (
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 opacity-50">
                    <div className="text-6xl mb-4 grayscale">{platform.icon}</div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-500">{platform.name}</h3>
                    <p className="text-gray-600">Bientôt disponible</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-20"
          >
            <div className="glass-card max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-4">Une question ?</h2>
              <p className="text-gray-400 mb-6">
                N'hésitez pas à nous contacter sur nos réseaux sociaux ou via notre bot Telegram
              </p>
              <Link
                href="https://t.me/PLGSCRTF_BOT"
                target="_blank"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <span>✈️</span>
                Contactez-nous sur Telegram
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
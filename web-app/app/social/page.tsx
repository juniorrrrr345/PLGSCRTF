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
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-600 to-pink-600',
      shadowColor: 'shadow-purple-500/50',
      link: social?.instagram 
    },
    { 
      name: 'Snapchat', 
      icon: '👻', 
      color: 'from-yellow-400 to-yellow-500',
      bgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
      shadowColor: 'shadow-yellow-400/50',
      link: social?.snapchat 
    },
    { 
      name: 'Telegram', 
      icon: '✈️', 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/50',
      link: social?.telegram 
    },
    { 
      name: 'WhatsApp', 
      icon: '💬', 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      shadowColor: 'shadow-green-500/50',
      link: social?.whatsapp 
    },
    { 
      name: 'Signal', 
      icon: '🔒', 
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'bg-gradient-to-br from-blue-600 to-indigo-700',
      shadowColor: 'shadow-indigo-600/50',
      link: social?.signal 
    },
    { 
      name: 'TikTok', 
      icon: '🎵', 
      color: 'from-pink-600 to-purple-700',
      bgColor: 'bg-gradient-to-br from-pink-600 to-purple-700',
      shadowColor: 'shadow-pink-600/50',
      link: social?.tiktok 
    }
  ]

  return (
    <div className="min-h-screen relative bg-black">
      {/* Background simplifié */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Particules subtiles */}
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/5 rounded-full"
            initial={{ 
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0
            }}
            animate={{ 
              y: [null, -100],
              opacity: [0, 0.3, 0]
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
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-4 text-white">
              Nos <span className="gradient-text">Réseaux Sociaux</span>
            </h1>
            <p className="text-gray-200 text-xl font-medium">
              Rejoignez notre communauté sur vos plateformes préférées
            </p>
          </motion.div>

          {/* Social Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {socialPlatforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group"
              >
                {platform.link ? (
                  <a
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transform transition-all duration-300 hover:scale-105"
                  >
                    <div className={`relative ${platform.bgColor} rounded-3xl p-8 ${platform.shadowColor} shadow-2xl hover:shadow-3xl transition-all brightness-110 hover:brightness-125`}>
                      {/* Effet de brillance */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
                      {/* Overlay lumineux supplémentaire */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-3xl" />
                      
                      <div className="relative z-10 text-center">
                        <motion.div 
                          className="text-7xl mb-4 drop-shadow-2xl"
                          animate={hoveredIndex === index ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {platform.icon}
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">{platform.name}</h3>
                        <p className="text-white font-bold flex items-center justify-center gap-2 drop-shadow-md">
                          Suivez-nous 
                          <motion.span
                            animate={hoveredIndex === index ? { x: [0, 5, 0] } : {}}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </p>
                      </div>

                      {/* Particules au hover */}
                      {hoveredIndex === index && (
                        <>
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 bg-white/40 rounded-full"
                              initial={{ 
                                x: "50%", 
                                y: "50%",
                                scale: 0
                              }}
                              animate={{ 
                                x: `${50 + (Math.random() - 0.5) * 100}%`,
                                y: `${50 + (Math.random() - 0.5) * 100}%`,
                                scale: [0, 1, 0]
                              }}
                              transition={{
                                duration: 1,
                                delay: i * 0.1,
                                repeat: Infinity
                              }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </a>
                ) : (
                  <div className="relative bg-gray-800/80 backdrop-blur-md border-2 border-gray-700 rounded-3xl p-8 opacity-50">
                    <div className="text-center">
                      <div className="text-7xl mb-4 grayscale opacity-30">{platform.icon}</div>
                      <h3 className="text-2xl font-bold mb-2 text-gray-500">{platform.name}</h3>
                      <p className="text-gray-600 font-medium">Bientôt disponible</p>
                    </div>
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
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border-2 border-blue-600/30 max-w-2xl mx-auto p-10 rounded-3xl shadow-2xl">
              <h2 className="text-3xl font-bold mb-4 text-white">Une question ?</h2>
              <p className="text-gray-200 mb-8 font-medium text-lg">
                N'hésitez pas à nous contacter sur nos réseaux sociaux ou via notre bot Telegram
              </p>
              <Link
                href="https://t.me/PLGSCRTF_BOT"
                target="_blank"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <span className="text-2xl">🤖</span>
                Contactez-nous sur Telegram
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
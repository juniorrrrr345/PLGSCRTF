'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import SplashScreen from '@/components/SplashScreen'
import { useTelegram } from '@/components/TelegramProvider'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Home() {
  const { data: stats } = useSWR('/api/stats', fetcher, {
    refreshInterval: 5000
  })

  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const { isTelegram } = useTelegram()

  useEffect(() => {
    setMounted(true)
    // Vérifier si c'est la première visite (désactiver splash pour Telegram)
    const hasVisited = sessionStorage.getItem('hasVisited')
    if (hasVisited || isTelegram) {
      setShowSplash(false)
    } else {
      sessionStorage.setItem('hasVisited', 'true')
    }
  }, [isTelegram])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Classes adaptées pour Telegram
  const heroTitle = isTelegram ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
  const heroSubtitle = isTelegram ? "text-base" : "text-lg sm:text-xl md:text-2xl"
  const buttonSize = isTelegram ? "text-sm px-4 py-2" : "text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
  const sectionPadding = isTelegram ? "px-3 pt-16" : "px-4 pt-20 sm:pt-24 md:pt-16"
  const statsGrid = isTelegram ? "grid-cols-2 gap-3" : "grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && !isTelegram && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: showSplash && !isTelegram ? 0 : 1 }}
        animate={{ opacity: showSplash && !isTelegram ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-screen">
      {/* Animated Background - Plus léger pour Telegram */}
      {!isTelegram && (
        <div className="fixed inset-0 -z-10">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 60% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
      )}

      {/* Hero Section avec padding top pour éviter le chevauchement */}
      <section className={`min-h-screen flex items-center justify-center ${sectionPadding}`}>
        <div className={`${isTelegram ? 'max-w-sm' : 'max-w-5xl'} w-full text-center`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={isTelegram ? "mb-6" : "mb-8"}
          >
            <h1 className={`${heroTitle} font-black mb-4 sm:mb-6 text-white`}>
              PLUGS <span className="gradient-text">CRTFS</span>
            </h1>
            <p className={`${heroSubtitle} text-gray-300 font-medium max-w-3xl mx-auto px-4`}>
              La marketplace exclusive des vendeurs certifiés
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`flex flex-col ${isTelegram ? 'gap-2' : 'sm:flex-row gap-3 sm:gap-4'} justify-center ${isTelegram ? 'mb-6' : 'mb-8 sm:mb-12'} px-4`}
          >
            <Link 
              href="/plugs" 
              className={`btn-primary ${buttonSize} flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-xl rounded-xl font-semibold transition-all ${!isTelegram ? 'transform hover:scale-105' : ''}`}
            >
              Explorer les Plugs
              <ArrowRightIcon className={isTelegram ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} />
            </Link>
            <Link 
              href="/products" 
              className={`btn-secondary ${buttonSize} flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 rounded-xl font-semibold transition-all ${!isTelegram ? 'transform hover:scale-105' : ''}`}
            >
              Voir les Produits
            </Link>
          </motion.div>

          {/* Stats avec animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`grid ${statsGrid} max-w-2xl mx-auto`}
          >
            {[
              { label: 'Vendeurs', value: stats?.vendeurs || '0', suffix: '+' },
              { label: 'Produits', value: stats?.produits || '0', suffix: '+' },
              { label: 'Clients', value: stats?.clients || '0', suffix: '+' },
              { label: 'Satisfaction', value: stats?.satisfaction || '100', suffix: '%' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className={`glass-card text-center ${isTelegram ? 'p-3' : 'p-4 sm:p-6'}`}
              >
                <div className={`${isTelegram ? 'text-2xl' : 'text-3xl sm:text-4xl'} font-bold text-white mb-1`}>
                  {stat.value}{stat.suffix}
                </div>
                <div className={`${isTelegram ? 'text-xs' : 'text-sm'} text-gray-400`}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-16 ${isTelegram ? 'px-3' : 'px-4'}`}>
        <div className={`${isTelegram ? 'max-w-sm' : 'max-w-6xl'} mx-auto`}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${isTelegram ? 'text-2xl' : 'text-3xl sm:text-4xl md:text-5xl'} font-bold text-center mb-12 text-white`}
          >
            Pourquoi choisir <span className="gradient-text">PLUGS CRTFS</span> ?
          </motion.h2>

          <div className={`grid ${isTelegram ? 'grid-cols-1 gap-4' : 'md:grid-cols-3 gap-6 sm:gap-8'}`}>
            {[
              {
                title: '✅ Vendeurs Certifiés',
                description: 'Tous nos vendeurs sont vérifiés et certifiés pour garantir votre sécurité'
              },
              {
                title: '🔒 Transactions Sécurisées',
                description: 'Système de paiement sécurisé avec protection des acheteurs'
              },
              {
                title: '⚡ Support 24/7',
                description: 'Une équipe dédiée pour vous accompagner à tout moment'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`glass-card ${isTelegram ? 'p-4' : 'p-6 sm:p-8'} text-center`}
              >
                <h3 className={`${isTelegram ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold mb-3 text-white`}>
                  {feature.title}
                </h3>
                <p className={`${isTelegram ? 'text-sm' : 'text-base'} text-gray-300`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </motion.div>
    </>
  )
}
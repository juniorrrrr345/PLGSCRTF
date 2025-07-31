'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import SplashScreen from '@/components/SplashScreen'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Home() {
  const { data: stats } = useSWR('/api/stats', fetcher, {
    refreshInterval: 5000
  })
  const { data: settings } = useSWR('/api/settings', fetcher)

  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Vérifier si c'est la première visite
    const hasVisited = sessionStorage.getItem('hasVisited')
    if (hasVisited) {
      setShowSplash(false)
    } else {
      sessionStorage.setItem('hasVisited', 'true')
    }
  }, [])

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

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: showSplash ? 0 : 1 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-screen">
        
      {/* Mini App Button */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
      >
        <Link
          href="https://t.me/PLGSCRTF_BOT/miniapp"
          target="_blank"
          className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-bold text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
        >
          <span className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity"></span>
          <span className="relative flex items-center gap-2">
            {settings?.miniAppButtonText || 'MINI APP PLGS CRTFS 🔌'}
          </span>
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            ✨
          </motion.span>
        </Link>
      </motion.div>
      
      {/* Animated Background - Plus sombre pour meilleur contraste */}
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

      {/* Hero Section avec padding top pour éviter le chevauchement */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-20 sm:pt-24 md:pt-16">
        <div className="max-w-5xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 text-white">
              PLUGS <span className="gradient-text">CRTFS</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto px-4">
              La marketplace exclusive des vendeurs certifiés
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4"
          >
            <Link 
              href="/plugs" 
              className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-xl rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              Explorer les Plugs
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link 
              href="/search" 
              className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 rounded-xl font-semibold transition-all"
            >
              Recherche Avancée
            </Link>
          </motion.div>

          {/* Stats en temps réel avec meilleur responsive */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto px-4"
          >
            <motion.div 
              className="bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700 rounded-xl p-3 sm:p-4 shadow-xl"
              key={stats?.plugCount}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {stats?.plugCount || 0}
              </div>
              <div className="text-sm sm:text-base text-gray-300 font-medium">Plugs Actifs</div>
              <div className="text-xs text-green-400 mt-1">🟢 En temps réel</div>
            </motion.div>
            <motion.div 
              className="bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700 rounded-xl p-3 sm:p-4 shadow-xl"
              key={stats?.userCount}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {stats?.userCount || 0}
              </div>
              <div className="text-sm sm:text-base text-gray-300 font-medium">Utilisateurs</div>
              <div className="text-xs text-green-400 mt-1">🟢 En temps réel</div>
            </motion.div>
          </motion.div>

          {/* CTA Section avec meilleur espacement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 sm:mt-20 md:mt-24 px-4"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 border border-white/10 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
                Prêt à rejoindre l'aventure ?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 sm:mb-6">
                Découvrez les meilleurs vendeurs certifiés de votre région
              </p>
              <Link 
                href="/plugs" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl"
              >
                Commencer maintenant
                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
    </>
  )
}
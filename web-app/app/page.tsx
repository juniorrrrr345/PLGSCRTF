'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Home() {
  const { data: stats } = useSWR('/api/stats', fetcher, {
    refreshInterval: 5000
  })

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
    <div className="relative min-h-screen">
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
            <div className="bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700 rounded-xl p-3 sm:p-4 shadow-xl">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats?.totalPlugs || 0}</div>
              <div className="text-sm sm:text-base text-gray-300 font-medium">Plugs Actifs</div>
            </div>
            <div className="bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700 rounded-xl p-3 sm:p-4 shadow-xl">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats?.totalUsers || 0}</div>
              <div className="text-sm sm:text-base text-gray-300 font-medium">Utilisateurs</div>
            </div>
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
    </div>
  )
}
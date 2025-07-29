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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="relative bg-black min-h-screen">
      {/* Animated Background - Plus sombre pour meilleur contraste */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
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

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white">
              PLUGS <span className="gradient-text">CRTFS</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-medium">
              La marketplace exclusive des vendeurs certifiés
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link href="/plugs" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-xl">
              Explorer les Plugs
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link href="/search" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border-2 border-gray-700">
              Recherche Avancée
            </Link>
          </motion.div>

          {/* Stats en temps réel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 max-w-md mx-auto"
          >
            <div className="bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700 rounded-xl p-4 shadow-xl">
              <div className="text-3xl font-bold text-white">{stats?.totalPlugs || 0}</div>
              <div className="text-gray-300 font-medium">Plugs Actifs</div>
            </div>
            <div className="bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700 rounded-xl p-4 shadow-xl">
              <div className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</div>
              <div className="text-gray-300 font-medium">Utilisateurs</div>
            </div>
          </motion.div>

          {/* CTA Section en bas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-2 border-blue-600/30 rounded-3xl p-12 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-black mb-6 text-white">
                Prêt à rejoindre l'aventure ?
              </h2>
              <p className="text-xl text-gray-300 mb-8 font-medium">
                Découvrez les meilleurs vendeurs certifiés de votre région
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="https://t.me/PLGSCRTF_BOT"
                  target="_blank"
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-xl"
                >
                  <span>🤖</span>
                  Lancer le Bot Telegram
                </Link>
                <Link href="/plugs" className="btn-secondary text-lg px-8 py-4 bg-gray-800 hover:bg-gray-700 border-2 border-gray-700">
                  Voir tous les Plugs
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRightIcon, SparklesIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

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
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark to-secondary/20" />
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="gradient-text">PLUGS CRTFS</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
              La marketplace exclusive des vendeurs certifiés
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex justify-center gap-8 md:gap-16 mb-12"
          >
            <div className="text-center">
              <motion.div
                key={stats?.userCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-4xl md:text-5xl font-bold text-accent"
              >
                {stats?.userCount || 0}
              </motion.div>
              <p className="text-gray-400 mt-2">Utilisateurs actifs</p>
            </div>
            <div className="text-center">
              <motion.div
                key={stats?.plugCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-4xl md:text-5xl font-bold text-primary"
              >
                {stats?.plugCount || 0}
              </motion.div>
              <p className="text-gray-400 mt-2">Vendeurs certifiés</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/plugs" className="glow-button group">
              Explorer les Plugs
              <ArrowRightIcon className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://t.me/PLGSCRTF_BOT"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full border-2 border-white/20 text-white font-bold text-lg transition-all hover:border-primary hover:text-primary hover:scale-105"
            >
              Ouvrir dans Telegram
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Pourquoi <span className="gradient-text">nous choisir</span> ?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheckIcon className="w-12 h-12" />,
                title: 'Sécurisé',
                description: 'Transactions sécurisées et vendeurs vérifiés',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: <BoltIcon className="w-12 h-12" />,
                title: 'Rapide',
                description: 'Livraison express dans toute la France',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: <SparklesIcon className="w-12 h-12" />,
                title: 'Qualité',
                description: 'Produits premium et service client 24/7',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${feature.gradient.split(' ')[1]}, ${feature.gradient.split(' ')[3]})`
                  }}
                />
                <div className="relative glass-card p-8 hover:scale-105 transition-transform duration-300">
                  <div className={`text-transparent bg-gradient-to-r ${feature.gradient} bg-clip-text mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 neon-border"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à découvrir nos <span className="gradient-text">vendeurs certifiés</span> ?
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Rejoignez des milliers d'utilisateurs satisfaits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plugs" className="glow-button">
                Voir tous les Plugs
              </Link>
              <Link href="/products" className="glow-button">
                Découvrir les Produits
              </Link>
              <Link href="/search" className="px-8 py-4 rounded-full border-2 border-white/20 text-white font-bold transition-all hover:border-accent hover:text-accent">
                Rechercher par zone
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
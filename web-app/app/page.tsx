'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowRightIcon, SparklesIcon, BoltIcon, ShieldCheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Home() {
  const { data: stats } = useSWR('/api/stats', fetcher, {
    refreshInterval: 5000
  })

  const [mounted, setMounted] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Masquer l'indicateur de scroll après que l'utilisateur ait scrollé
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    <div className="relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, rgba(120, 40, 200, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(40, 120, 200, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, rgba(120, 40, 200, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="gradient-text">PLUGS</span>{' '}
              <span className="text-white">CRTFS</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              La marketplace exclusive des vendeurs certifiés et de confiance
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card px-6 py-4"
              >
                <div className="text-3xl font-bold gradient-text">
                  {stats?.userCount || '0'}
                </div>
                <div className="text-sm text-gray-400">Utilisateurs</div>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card px-6 py-4"
              >
                <div className="text-3xl font-bold gradient-text">
                  {stats?.plugCount || '0'}
                </div>
                <div className="text-sm text-gray-400">Plugs Certifiés</div>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/plugs" className="btn-primary flex items-center justify-center gap-2">
                Découvrir les Plugs
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              
              <a
                href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                Bot Telegram
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-sm text-gray-400">Défiler pour découvrir plus</span>
              <ChevronDownIcon className="w-6 h-6 text-primary" />
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pourquoi choisir <span className="gradient-text">PLUGS CRTFS</span> ?
            </h2>
            <p className="text-gray-400 text-lg">
              Une plateforme pensée pour votre sécurité et satisfaction
            </p>
          </motion.div>

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

      {/* Quick Links Section with Mobile Notice */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent to-darker/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explorez toutes nos <span className="gradient-text">fonctionnalités</span>
            </h2>
            <p className="text-gray-400 text-lg mb-2">
              Découvrez tout ce que PLUGS CRTFS a à offrir
            </p>
            <p className="text-primary text-sm md:hidden animate-pulse">
              👇 Continuez à défiler pour voir plus de catégories
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/plugs" className="glass-card p-6 text-center hover:border-primary/50 transition-all group">
              <BoltIcon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Découvrir les Plugs</h3>
              <p className="text-gray-400">Parcourez notre sélection de vendeurs certifiés</p>
            </Link>

            <Link href="/products" className="glass-card p-6 text-center hover:border-primary/50 transition-all group">
              <svg className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Produits Exclusifs</h3>
              <p className="text-gray-400">Découvrez les derniers produits en vidéo</p>
            </Link>

            <Link href="/search" className="glass-card p-6 text-center hover:border-primary/50 transition-all group">
              <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Recherche Avancée</h3>
              <p className="text-gray-400">Trouvez exactement ce que vous cherchez</p>
            </Link>

            <a href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`} className="glass-card p-8 text-center hover:border-primary/50 transition-all group">
              <ShieldCheckIcon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Bot Telegram</h3>
              <p className="text-gray-400">Accédez à notre bot pour plus de fonctionnalités</p>
            </a>
          </div>

          {/* Mobile scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center md:hidden mb-8"
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ChevronDownIcon className="w-8 h-8 text-primary mx-auto" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4">
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
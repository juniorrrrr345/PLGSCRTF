'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Home() {
  const { data: stats } = useSWR('/api/stats', fetcher, {
    refreshInterval: 5000
  })
  
  const { data: settings } = useSWR('/api/settings', fetcher)
  
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
          className="w-16 h-16 border-4 border-telegram-accent border-t-transparent rounded-full"
        />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section avec effet parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background animé */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '60px 60px',
            }}
          />
        </div>
        
        {/* Contenu Hero */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              PLUGS CRTFS
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
              La marketplace exclusive des vendeurs certifiés
            </p>
          </motion.div>
          
          {/* Stats animées */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex justify-center gap-8 md:gap-16 mb-12"
          >
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl md:text-5xl font-bold text-telegram-accent"
              >
                {stats?.userCount || 0}
              </motion.div>
              <p className="text-gray-400 mt-2">Utilisateurs actifs</p>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-4xl md:text-5xl font-bold text-purple-500"
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
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/plugs" className="group relative px-8 py-4 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg transition-all hover:scale-105">
              <span className="relative z-10">Explorer les Plugs</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            <a 
              href="https://t.me/PLGSCRTF_BOT"
              className="px-8 py-4 rounded-full border-2 border-gray-600 text-white font-bold text-lg transition-all hover:border-telegram-accent hover:text-telegram-accent hover:scale-105"
            >
              Ouvrir dans Telegram
            </a>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            Pourquoi nous choisir ?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔒',
                title: 'Sécurisé',
                description: 'Transactions sécurisées et vendeurs vérifiés',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '⚡',
                title: 'Rapide',
                description: 'Livraison express dans toute la France',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '✨',
                title: 'Qualité',
                description: 'Produits premium et service client 24/7',
                color: 'from-green-500 to-emerald-500'
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
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    '--tw-gradient-from': feature.color.split(' ')[1],
                    '--tw-gradient-to': feature.color.split(' ')[3],
                  } as any}
                />
                <div className="relative bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Quick Links Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Accès rapide
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { href: '/plugs', icon: '🔌', title: 'Tous les Plugs', desc: 'Explorer la marketplace' },
              { href: '/search', icon: '🔍', title: 'Rechercher', desc: 'Trouver par localisation' },
              { href: '/social', icon: '📱', title: 'Réseaux', desc: 'Nos réseaux sociaux' },
              { href: 'https://t.me/PLGSCRTF_BOT', icon: '🤖', title: 'Bot Telegram', desc: 'Accès direct', external: true },
            ].map((link, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all hover:scale-105 border border-gray-700"
                  >
                    <div className="text-3xl mb-3">{link.icon}</div>
                    <h3 className="text-xl font-bold mb-1">{link.title}</h3>
                    <p className="text-gray-400 text-sm">{link.desc}</p>
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="block p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all hover:scale-105 border border-gray-700"
                  >
                    <div className="text-3xl mb-3">{link.icon}</div>
                    <h3 className="text-xl font-bold mb-1">{link.title}</h3>
                    <p className="text-gray-400 text-sm">{link.desc}</p>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                PLUGS CRTFS
              </h3>
              <p className="text-gray-400 mb-4">
                La plateforme de référence pour trouver des vendeurs certifiés et de confiance.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
                <a href="https://t.me/PLGSCRTF_BOT" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.2-1.11 7.53-1.57 9.98-.19 1.04-.57 1.39-.94 1.42-.8.07-1.41-.53-2.18-1.03-1.21-.79-1.9-1.28-3.07-2.05-1.36-.9-.48-1.39.3-2.2.2-.21 3.7-3.38 3.77-3.67.01-.04.01-.17-.06-.25-.08-.08-.19-.05-.27-.03-.12.02-1.96 1.25-5.54 3.66-.52.36-1.0.54-1.43.52-.47-.02-1.37-.27-2.04-.48-.82-.27-1.48-.41-1.42-.87.03-.24.36-.49 1.0-.75 3.9-1.7 6.51-2.82 7.82-3.36 3.73-1.53 4.5-1.8 5.01-1.81.11 0 .36.03.52.17.14.12.18.28.2.44-.01.05.01.14 0 .22z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><Link href="/plugs" className="text-gray-400 hover:text-white transition-colors">Tous les Plugs</Link></li>
                <li><Link href="/search" className="text-gray-400 hover:text-white transition-colors">Rechercher</Link></li>
                <li><Link href="/social" className="text-gray-400 hover:text-white transition-colors">Réseaux sociaux</Link></li>
                <li><Link href="/config" className="text-gray-400 hover:text-white transition-colors">Admin</Link></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">
                  <a href="https://t.me/PLGSCRTF_BOT" className="hover:text-white transition-colors">
                    @PLGSCRTF_BOT
                  </a>
                </li>
                <li className="text-gray-400">Support 24/7</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PLUGS CRTFS. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
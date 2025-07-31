'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import { useTelegram } from './TelegramProvider'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const { isTelegram } = useTelegram()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation adaptée pour Telegram (moins d'items)
  const navItems = isTelegram 
    ? [
        { href: '/', label: 'Accueil' },
        { href: '/plugs', label: 'Plugs' },
        { href: '/products', label: 'Produits' },
        { href: '/search', label: 'Rechercher' },
      ]
    : [
        { href: '/', label: 'Accueil' },
        { href: '/plugs', label: 'Plugs' },
        { href: '/products', label: 'Produits' },
        { href: '/search', label: 'Rechercher' },
        { href: '/about', label: 'À propos' },
        { href: '/social', label: 'Réseaux' },
      ]

  // Classes adaptées pour Telegram
  const navHeight = isTelegram ? 'h-12' : 'h-14 sm:h-16'
  const logoSize = isTelegram ? 'text-base' : 'text-lg sm:text-xl'
  const navPadding = isTelegram ? 'px-3' : 'px-4 sm:px-6 lg:px-8'

  return (
    <nav className={`fixed top-0 w-full z-50 bg-black/90 backdrop-blur-lg border-b border-white/10 ${isTelegram ? 'navbar' : ''}`}>
      <div className={`max-w-7xl mx-auto ${navPadding}`}>
        <div className={`flex items-center justify-between ${navHeight}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={!isTelegram ? { scale: 1.05 } : undefined}
              className={`${logoSize} font-bold transition-all navbar-title ${
                isHomePage && !scrolled 
                  ? 'text-gray-400 opacity-60' 
                  : 'text-white'
              }`}
            >
              PLUGS CRTFS
            </motion.div>
          </Link>

          {/* Desktop Navigation - caché sur Telegram pour plus d'espace */}
          {!isTelegram && (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Mobile menu button - toujours visible sur Telegram */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`${isTelegram ? '' : 'md:hidden'} p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all`}
          >
            {isOpen ? (
              <XMarkIcon className={isTelegram ? "h-5 w-5" : "h-5 w-5 sm:h-6 sm:w-6"} />
            ) : (
              <Bars3Icon className={isTelegram ? "h-5 w-5" : "h-5 w-5 sm:h-6 sm:w-6"} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`${isTelegram ? '' : 'md:hidden'} bg-black/95 backdrop-blur-lg border-t border-white/10`}
          >
            <div className={`${isTelegram ? 'px-3 py-2' : 'px-4 py-3'} space-y-1`}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block ${isTelegram ? 'px-3 py-2 text-sm' : 'px-3 py-2 text-sm'} rounded-lg font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {/* Ajouter les liens supplémentaires pour Telegram */}
              {isTelegram && (
                <>
                  <Link
                    href="/about"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                      pathname === '/about'
                        ? 'bg-white/10 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    À propos
                  </Link>
                  <Link
                    href="/social"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                      pathname === '/social'
                        ? 'bg-white/10 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Réseaux
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
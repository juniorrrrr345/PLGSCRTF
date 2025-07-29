'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simuler le chargement
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%)'
      }}
    >
      <div className="text-center">
        {/* Logo animé */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 mx-auto relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50" />
            <div className="relative w-full h-full bg-gradient-to-r from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-white">🔌</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white mb-2"
        >
          PLUGS CRTFS
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-8"
        >
          Chargement de la boutique...
        </motion.p>

        {/* Barre de progression */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "200px", opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-auto"
        >
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-500 mt-2"
          >
            {progress}%
          </motion.p>
        </motion.div>

        {/* Particules animées */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 100,
              }}
              animate={{
                y: -100,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
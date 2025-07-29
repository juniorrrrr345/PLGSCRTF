'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSWR('/api/settings/background', fetcher, {
    refreshInterval: 30000 // Rafraîchir toutes les 30 secondes
  })
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && settings?.backgroundImage) {
      // Appliquer l'image de fond au body
      document.body.style.backgroundImage = `url(${settings.backgroundImage})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
      document.body.style.backgroundRepeat = 'no-repeat'
      
      // Ajouter un overlay sombre pour la lisibilité
      const existingOverlay = document.getElementById('bg-overlay')
      if (!existingOverlay) {
        const overlay = document.createElement('div')
        overlay.id = 'bg-overlay'
        overlay.style.position = 'fixed'
        overlay.style.top = '0'
        overlay.style.left = '0'
        overlay.style.right = '0'
        overlay.style.bottom = '0'
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
        overlay.style.zIndex = '-1'
        overlay.style.pointerEvents = 'none'
        document.body.appendChild(overlay)
      }
    } else if (mounted) {
      // Retirer le background si pas d'image
      document.body.style.backgroundImage = ''
      const overlay = document.getElementById('bg-overlay')
      if (overlay) {
        overlay.remove()
      }
    }

    return () => {
      // Cleanup
      document.body.style.backgroundImage = ''
      const overlay = document.getElementById('bg-overlay')
      if (overlay) {
        overlay.remove()
      }
    }
  }, [mounted, settings?.backgroundImage])

  // Ajouter le logo dans le coin si disponible
  useEffect(() => {
    if (mounted && settings?.logoImage) {
      const existingLogo = document.getElementById('shop-logo')
      if (!existingLogo) {
        const logo = document.createElement('img')
        logo.id = 'shop-logo'
        logo.src = settings.logoImage
        logo.alt = 'Logo'
        logo.style.position = 'fixed'
        logo.style.bottom = '20px'
        logo.style.right = '20px'
        logo.style.width = '80px'
        logo.style.height = '80px'
        logo.style.objectFit = 'contain'
        logo.style.opacity = '0.8'
        logo.style.zIndex = '10'
        logo.style.pointerEvents = 'none'
        logo.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
        document.body.appendChild(logo)
      } else {
        existingLogo.src = settings.logoImage
      }
    } else if (mounted) {
      const logo = document.getElementById('shop-logo')
      if (logo) {
        logo.remove()
      }
    }

    return () => {
      const logo = document.getElementById('shop-logo')
      if (logo) {
        logo.remove()
      }
    }
  }, [mounted, settings?.logoImage])

  return <>{children}</>
}
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
      document.body.style.backgroundColor = 'transparent'
      
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
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
        overlay.style.zIndex = '-1'
        overlay.style.pointerEvents = 'none'
        document.body.appendChild(overlay)
      }
    } else if (mounted) {
      // Retirer le background si pas d'image
      document.body.style.backgroundImage = ''
      document.body.style.backgroundColor = ''
      const overlay = document.getElementById('bg-overlay')
      if (overlay) {
        overlay.remove()
      }
    }

    return () => {
      // Cleanup
      document.body.style.backgroundImage = ''
      document.body.style.backgroundColor = ''
      const overlay = document.getElementById('bg-overlay')
      if (overlay) {
        overlay.remove()
      }
    }
  }, [mounted, settings?.backgroundImage])

  return <>{children}</>
}
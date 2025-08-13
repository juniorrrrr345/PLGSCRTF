'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    console.error('[BackgroundProvider] Failed to fetch:', res.status)
    throw new Error('Failed to fetch background')
  }
  return res.json()
}

export default function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const { data: settings, error } = useSWR('/api/settings/background', fetcher, {
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (error) {
      console.error('[BackgroundProvider] Error loading background:', error)
    }
    
    if (mounted && settings?.backgroundImage) {
      console.log('[BackgroundProvider] Applying background image:', settings.backgroundImage)
      
      // Appliquer l'image de fond au body pour qu'elle couvre toute la page
      document.body.style.backgroundImage = `url(${settings.backgroundImage})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundColor = '#000000'
      document.body.style.minHeight = '100vh'
      
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
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'
        overlay.style.zIndex = '-1'
        overlay.style.pointerEvents = 'none'
        document.body.appendChild(overlay)
      }
    } else if (mounted && !settings?.backgroundImage) {
      console.log('[BackgroundProvider] No background image, cleaning up')
      
      // Retirer le background si pas d'image
      document.body.style.backgroundImage = ''
      document.body.style.backgroundColor = ''
      document.body.style.minHeight = ''
      const overlay = document.getElementById('bg-overlay')
      if (overlay) {
        overlay.remove()
      }
    }

    return () => {
      // Cleanup
      document.body.style.backgroundImage = ''
      document.body.style.backgroundColor = ''
      document.body.style.minHeight = ''
      const overlay = document.getElementById('bg-overlay')
      if (overlay) {
        overlay.remove()
      }
    }
  }, [mounted, settings?.backgroundImage, error])

  return <>{children}</>
}
'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { useTelegram } from './TelegramProvider'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSWR('/api/settings/background', fetcher, {
    refreshInterval: 30000 // Rafraîchir toutes les 30 secondes
  })
  
  const [mounted, setMounted] = useState(false)
  const { isTelegram } = useTelegram()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && settings?.backgroundImage) {
      // Nettoyer les styles précédents
      document.body.style.backgroundImage = ''
      document.body.style.backgroundColor = 'transparent'
      
      // Créer ou mettre à jour le conteneur de mosaïque
      let mosaicContainer = document.getElementById('mosaic-background')
      if (!mosaicContainer) {
        mosaicContainer = document.createElement('div')
        mosaicContainer.id = 'mosaic-background'
        mosaicContainer.style.position = 'fixed'
        mosaicContainer.style.top = '0'
        mosaicContainer.style.left = '0'
        mosaicContainer.style.right = '0'
        mosaicContainer.style.bottom = '0'
        mosaicContainer.style.zIndex = '-2'
        mosaicContainer.style.pointerEvents = 'none'
        mosaicContainer.style.overflow = 'hidden'
        document.body.appendChild(mosaicContainer)
      }
      
      // Tailles adaptatives selon l'appareil
      const imageSize = isTelegram ? '120px' : 'min(250px, 30vw)'
      const mobileImageSize = 'min(150px, 40vw)'
      
      // Styles pour la mosaïque
      mosaicContainer.innerHTML = `
        <style>
          .mosaic-image {
            position: absolute;
            width: ${imageSize};
            height: ${imageSize};
            background-image: url(${settings.backgroundImage});
            background-size: cover;
            background-position: center;
            opacity: 0.15;
            filter: grayscale(50%);
          }
          
          @media (max-width: 768px) {
            .mosaic-image {
              width: ${mobileImageSize};
              height: ${mobileImageSize};
            }
          }
          
          .mosaic-top-left {
            top: 10%;
            left: 5%;
            transform: rotate(-15deg);
          }
          
          .mosaic-top-right {
            top: 10%;
            right: 5%;
            transform: rotate(15deg);
          }
          
          .mosaic-bottom-left {
            bottom: 10%;
            left: 5%;
            transform: rotate(15deg);
          }
          
          .mosaic-bottom-right {
            bottom: 10%;
            right: 5%;
            transform: rotate(-15deg);
          }
          
          @media (max-width: 768px) {
            .mosaic-top-left { top: 5%; left: 2%; }
            .mosaic-top-right { top: 5%; right: 2%; }
            .mosaic-bottom-left { bottom: 5%; left: 2%; }
            .mosaic-bottom-right { bottom: 5%; right: 2%; }
          }
          
          /* Animation subtile */
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(var(--rotation)); }
            50% { transform: translateY(-10px) rotate(var(--rotation)); }
          }
          
          .mosaic-image {
            animation: float 6s ease-in-out infinite;
          }
          
          .mosaic-top-left { --rotation: -15deg; animation-delay: 0s; }
          .mosaic-top-right { --rotation: 15deg; animation-delay: 1.5s; }
          .mosaic-bottom-left { --rotation: 15deg; animation-delay: 3s; }
          .mosaic-bottom-right { --rotation: -15deg; animation-delay: 4.5s; }
        </style>
        <div class="mosaic-image mosaic-top-left"></div>
        <div class="mosaic-image mosaic-top-right"></div>
        <div class="mosaic-image mosaic-bottom-left"></div>
        <div class="mosaic-image mosaic-bottom-right"></div>
      `
      
      // Ajouter un overlay sombre pour la lisibilité
      let overlay = document.getElementById('bg-overlay')
      if (!overlay) {
        overlay = document.createElement('div')
        overlay.id = 'bg-overlay'
        overlay.style.position = 'fixed'
        overlay.style.top = '0'
        overlay.style.left = '0'
        overlay.style.right = '0'
        overlay.style.bottom = '0'
        overlay.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9))'
        overlay.style.zIndex = '-1'
        overlay.style.pointerEvents = 'none'
        document.body.appendChild(overlay)
      }
    } else if (mounted) {
      // Retirer le background si pas d'image
      const mosaicContainer = document.getElementById('mosaic-background')
      if (mosaicContainer) {
        mosaicContainer.remove()
      }
      const overlay = document.getElementById('bg-overlay')
      if (overlay) {
        overlay.remove()
      }
    }

    return () => {
      // Cleanup
      const mosaicContainer = document.getElementById('mosaic-background')
      if (mosaicContainer) {
        mosaicContainer.remove()
      }
      const overlay = document.getElementById('bg-overlay')
      if (overlay) {
        overlay.remove()
      }
    }
  }, [mounted, settings?.backgroundImage, isTelegram])

  return <>{children}</>
}
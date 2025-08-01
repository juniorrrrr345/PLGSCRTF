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
      const imageSize = isTelegram ? '100px' : '150px'
      const gap = isTelegram ? '10px' : '20px'
      
      // Styles pour la mosaïque complète
      mosaicContainer.innerHTML = `
        <style>
          .mosaic-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: grid;
            grid-template-columns: repeat(auto-fill, ${imageSize});
            grid-template-rows: repeat(auto-fill, ${imageSize});
            gap: ${gap};
            padding: ${gap};
            justify-content: center;
          }
          
          .mosaic-image {
            width: ${imageSize};
            height: ${imageSize};
            background-image: url(${settings.backgroundImage});
            background-size: cover;
            background-position: center;
            opacity: 0.08;
            border-radius: 12px;
            filter: grayscale(30%);
            transition: all 0.3s ease;
          }
          
          /* Variations de rotation pour créer un effet dynamique */
          .mosaic-image:nth-child(4n+1) { transform: rotate(5deg); }
          .mosaic-image:nth-child(4n+2) { transform: rotate(-5deg); }
          .mosaic-image:nth-child(4n+3) { transform: rotate(3deg); }
          .mosaic-image:nth-child(4n) { transform: rotate(-3deg); }
          
          /* Variations d'opacité */
          .mosaic-image:nth-child(5n+1) { opacity: 0.06; }
          .mosaic-image:nth-child(5n+2) { opacity: 0.08; }
          .mosaic-image:nth-child(5n+3) { opacity: 0.1; }
          .mosaic-image:nth-child(5n+4) { opacity: 0.07; }
          .mosaic-image:nth-child(5n) { opacity: 0.09; }
          
          /* Animation subtile au survol (desktop) */
          @media (hover: hover) {
            .mosaic-image:hover {
              opacity: 0.15;
              transform: scale(1.1) rotate(0deg);
              z-index: 1;
            }
          }
          
          /* Responsive pour mobile */
          @media (max-width: 768px) {
            .mosaic-grid {
              grid-template-columns: repeat(auto-fill, ${isTelegram ? '80px' : '100px'});
              grid-template-rows: repeat(auto-fill, ${isTelegram ? '80px' : '100px'});
              gap: ${isTelegram ? '8px' : '15px'};
              padding: ${isTelegram ? '8px' : '15px'};
            }
            
            .mosaic-image {
              width: ${isTelegram ? '80px' : '100px'};
              height: ${isTelegram ? '80px' : '100px'};
              border-radius: 8px;
            }
          }
          
          /* Animation de fade-in */
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: var(--final-opacity, 0.08); transform: scale(1) rotate(var(--rotation, 0deg)); }
          }
          
          .mosaic-image {
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          /* Délais d'animation pour effet cascade */
          ${Array.from({ length: 50 }, (_, i) => `
            .mosaic-image:nth-child(${i + 1}) {
              animation-delay: ${i * 0.02}s;
              --final-opacity: ${0.06 + (i % 5) * 0.01};
              --rotation: ${(i % 4 - 2) * 3}deg;
            }
          `).join('')}
        </style>
        <div class="mosaic-grid">
          ${Array.from({ length: 100 }, () => '<div class="mosaic-image"></div>').join('')}
        </div>
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
        overlay.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.9))'
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
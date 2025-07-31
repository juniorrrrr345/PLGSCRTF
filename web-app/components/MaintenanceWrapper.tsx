'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import MaintenancePage from './MaintenancePage'

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  // Initialiser avec la valeur du localStorage si disponible
  const [isInMaintenance, setIsInMaintenance] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maintenanceMode')
      return stored === 'true'
    }
    return false
  })
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Vérifier le mode maintenance depuis l'API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const maintenanceActive = !!data.maintenanceMode
        setIsInMaintenance(maintenanceActive)
        // Sauvegarder dans localStorage pour les prochains chargements
        localStorage.setItem('maintenanceMode', maintenanceActive.toString())
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Erreur vérification maintenance:', err)
        setIsLoading(false)
      })
  }, [])

  // Si en maintenance ET pas sur la page /config, afficher la page de maintenance immédiatement
  if (isInMaintenance && pathname !== '/config') {
    return <MaintenancePage />
  }

  // Si on est toujours en train de charger et qu'on n'a pas de valeur en cache
  if (isLoading && !isInMaintenance) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Sinon, afficher le contenu normal
  return <>{children}</>
}
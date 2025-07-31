'use client'

import { useEffect, useState } from 'react'
import MaintenancePage from './MaintenancePage'

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInMaintenance, setIsInMaintenance] = useState(false)

  useEffect(() => {
    // Vérifier le mode maintenance
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.maintenanceMode) {
          setIsInMaintenance(true)
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Erreur vérification maintenance:', err)
        setIsLoading(false)
      })
  }, [])

  // Pendant le chargement, afficher un écran noir
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Si en maintenance, afficher la page de maintenance
  if (isInMaintenance) {
    return <MaintenancePage />
  }

  // Sinon, afficher le contenu normal
  return <>{children}</>
}
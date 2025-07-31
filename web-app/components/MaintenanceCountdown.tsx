'use client'

import { useEffect, useState } from 'react'

interface MaintenanceCountdownProps {
  endTime: Date
}

export default function MaintenanceCountdown({ endTime }: MaintenanceCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeLeft('Maintenance terminée')
        return
      }

      const hours = Math.floor(distance / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  return (
    <div className="mt-4 p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg">
      <h4 className="text-sm font-semibold text-orange-400 mb-2">⏱️ Temps restant</h4>
      <p className="text-2xl font-mono font-bold text-orange-500">{timeLeft}</p>
      <p className="text-xs text-gray-400 mt-1">
        Fin prévue : {new Date(endTime).toLocaleString('fr-FR')}
      </p>
    </div>
  )
}
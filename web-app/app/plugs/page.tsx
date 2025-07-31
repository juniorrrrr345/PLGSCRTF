'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useSWR, { mutate } from 'swr'
import PlugCard from '@/components/PlugCard'
import PlugModal from '@/components/PlugModal'
import { MagnifyingGlassIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Fonction pour obtenir le drapeau d'un pays
function getCountryFlag(countryCode: string) {
  const flags: { [key: string]: string } = {
    'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'DE': '🇩🇪', 'GB': '🇬🇧',
    'PT': '🇵🇹', 'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹',
    'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷', 'AR': '🇦🇷',
    'JP': '🇯🇵', 'CN': '🇨🇳', 'KR': '🇰🇷', 'IN': '🇮🇳', 'AU': '🇦🇺'
  }
  return flags[countryCode] || '🌍'
}

// Fonction pour obtenir le nom complet d'un pays
function getCountryName(countryCode: string) {
  const countries: { [key: string]: string } = {
    'FR': 'France', 'ES': 'Espagne', 'IT': 'Italie', 'DE': 'Allemagne', 'GB': 'Royaume-Uni',
    'PT': 'Portugal', 'NL': 'Pays-Bas', 'BE': 'Belgique', 'CH': 'Suisse', 'AT': 'Autriche',
    'US': 'États-Unis', 'CA': 'Canada', 'MX': 'Mexique', 'BR': 'Brésil', 'AR': 'Argentine',
    'JP': 'Japon', 'CN': 'Chine', 'KR': 'Corée du Sud', 'IN': 'Inde', 'AU': 'Australie'
  }
  return countries[countryCode] || countryCode
}

export default function PlugsPage() {
  const { data: plugs, error, isLoading } = useSWR('/api/plugs', fetcher)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL')
  const [selectedPlug, setSelectedPlug] = useState<any>(null)
  const [filteredPlugs, setFilteredPlugs] = useState<any[]>([])
  const [availableCountries, setAvailableCountries] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (plugs) {
      // Extraire tous les pays disponibles
      const countriesSet = new Set<string>()
      plugs.forEach((plug: any) => {
        if (plug.location?.countries) {
          plug.location.countries.forEach((country: string) => {
            countriesSet.add(country)
          })
        }
      })
      setAvailableCountries(Array.from(countriesSet).sort())

      // Filtrer les plugs
      let filtered = plugs.filter((plug: any) =>
        plug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plug.location?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plug.location?.country?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      // Filtrer par pays si nécessaire
      if (selectedCountry !== 'ALL') {
        filtered = filtered.filter((plug: any) =>
          plug.location?.countries?.includes(selectedCountry)
        )
      }
      
      // Ajouter le rang pour les top 3
      const rankedPlugs = filtered.map((plug: any, index: number) => ({
        ...plug,
        rank: index < 3 ? index + 1 : null
      }))
      
      setFilteredPlugs(rankedPlugs)
    }
  }, [plugs, searchTerm, selectedCountry])



  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Erreur de chargement</h2>
          <p className="text-gray-400">Impossible de charger les plugs</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            🔌 Nos <span className="gradient-text">Plugs Certifiés</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Vendeurs vérifiés et classés par popularité
          </p>
          {plugs && (
            <p className="text-sm text-gray-500 mt-2">
              {filteredPlugs.length} plug{filteredPlugs.length > 1 ? 's' : ''} trouvé{filteredPlugs.length > 1 ? 's' : ''}
            </p>
          )}
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Barre de recherche */}
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un plug..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sélecteur de pays */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCountry('ALL')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCountry === 'ALL'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🌐 Tous les pays
            </button>
            {availableCountries.map(country => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCountry === country
                    ? 'bg-primary text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {getCountryFlag(country)} {getCountryName(country)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plugs Grid - 2 per row on all devices */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {filteredPlugs.map((plug: any, index: number) => (
            <motion.div
              key={plug._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PlugCard 
                plug={plug} 
                onClick={() => {
                  setSelectedPlug(plug)
                  setIsModalOpen(true)
                }}
              />
            </motion.div>
          ))}
        </div>

        {filteredPlugs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-400 text-lg">Aucun plug trouvé</p>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <PlugModal
        plug={selectedPlug}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPlug(null)
        }}
      />
    </div>
  )
}
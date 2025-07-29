'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import PlugCard from '@/components/PlugCard'
import PlugModal from '@/components/PlugModal'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function SearchPage() {
  const { data: plugs } = useSWR('/api/plugs', fetcher)
  const { data: settings } = useSWR('/api/settings', fetcher)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedMethods, setSelectedMethods] = useState({
    delivery: false,
    shipping: false,
    meetup: false
  })
  const [selectedPlug, setSelectedPlug] = useState(null)
  const [filteredPlugs, setFilteredPlugs] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (plugs) {
      let filtered = plugs

      // Filtre par recherche
      if (searchTerm) {
        filtered = filtered.filter((plug: any) =>
          plug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plug.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Filtre par pays
      if (selectedCountry) {
        filtered = filtered.filter((plug: any) => plug.country === selectedCountry)
      }

      // Filtre par département
      if (selectedDepartment) {
        filtered = filtered.filter((plug: any) => plug.department === selectedDepartment)
      }

      // Filtre par méthodes
      const hasMethodFilter = selectedMethods.delivery || selectedMethods.shipping || selectedMethods.meetup
      if (hasMethodFilter) {
        filtered = filtered.filter((plug: any) => {
          if (selectedMethods.delivery && !plug.methods?.delivery) return false
          if (selectedMethods.shipping && !plug.methods?.shipping) return false
          if (selectedMethods.meetup && !plug.methods?.meetup) return false
          return true
        })
      }

      setFilteredPlugs(filtered)
    }
  }, [plugs, searchTerm, selectedCountry, selectedDepartment, selectedMethods])

  const availableDepartments = settings?.countries?.find((c: any) => c.code === selectedCountry)?.departments || []

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="gradient-text">Recherche avancée</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Trouvez le plug parfait selon vos critères
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un plug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-20 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary/20 hover:bg-primary/30 rounded-full transition-all"
            >
              <FunnelIcon className="w-6 h-6 text-primary" />
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card p-6 mb-8 max-w-2xl mx-auto"
          >
            <h3 className="text-lg font-bold mb-4">Filtres avancés</h3>
            
            {/* Country */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Pays</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedDepartment('')
                }}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="">Tous les pays</option>
                {settings?.countries?.map((country: any) => (
                  <option key={country.code} value={country.name}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            {selectedCountry && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Département</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Tous les départements</option>
                  {availableDepartments.map((dept: any) => (
                    <option key={dept.code} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Methods */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Méthodes</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMethods.delivery}
                    onChange={(e) => setSelectedMethods({ ...selectedMethods, delivery: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
                  />
                  <span>🚚 Livraison</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMethods.shipping}
                    onChange={(e) => setSelectedMethods({ ...selectedMethods, shipping: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-secondary focus:ring-secondary"
                  />
                  <span>📮 Envoi postal</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMethods.meetup}
                    onChange={(e) => setSelectedMethods({ ...selectedMethods, meetup: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-accent focus:ring-accent"
                  />
                  <span>🤝 Rencontre</span>
                </label>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setSelectedCountry('')
                setSelectedDepartment('')
                setSelectedMethods({ delivery: false, shipping: false, meetup: false })
              }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all"
            >
              Réinitialiser les filtres
            </button>
          </motion.div>
        )}

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-400">
            {filteredPlugs.length} résultat{filteredPlugs.length > 1 ? 's' : ''} trouvé{filteredPlugs.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Plugs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugs.map((plug: any, index: number) => (
            <motion.div
              key={plug._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PlugCard 
                plug={plug} 
                onClick={() => setSelectedPlug(plug)}
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
            <p className="text-gray-400 text-lg">Aucun plug ne correspond à vos critères</p>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      {selectedPlug && (
        <PlugModal
          plug={selectedPlug}
          onClose={() => setSelectedPlug(null)}
        />
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import PlugCard from '@/components/PlugCard'
import PlugModal from '@/components/PlugModal'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function SearchPage() {
  const { data: plugs, mutate } = useSWR('/api/plugs', fetcher)
  const { data: settings } = useSWR('/api/settings', fetcher)
  const { data: locations } = useSWR('/api/locations', fetcher)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedMethods, setSelectedMethods] = useState({
    delivery: false,
    shipping: false,
    meetup: false
  })
  const [selectedPlug, setSelectedPlug] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filteredPlugs, setFilteredPlugs] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [availableCountries, setAvailableCountries] = useState<any[]>([])
  
  // Vérifier si des filtres sont actifs
  const hasActiveFilters = selectedCountry || selectedDepartment || 
    selectedMethods.delivery || selectedMethods.shipping || selectedMethods.meetup

  useEffect(() => {
    if (plugs) {
      // Calculer les pays disponibles
      const countriesSet = new Set<string>()
      plugs.forEach((plug: any) => {
        if (plug.country) {
          countriesSet.add(plug.country)
        }
      })
      
      // Créer la liste des pays avec leurs drapeaux
      const countries = Array.from(countriesSet).map(countryCode => {
        const countryData = settings?.countries?.find((c: any) => c.code === countryCode)
        return {
          code: countryCode,
          name: countryData?.name || countryCode,
          flag: countryData?.flag || ''
        }
      }).sort((a, b) => a.name.localeCompare(b.name))
      
      setAvailableCountries(countries)
      
      let filtered = plugs

      // Filtre par recherche (nom, description, ville, département, pays)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filtered = filtered.filter((plug: any) => {
          // Recherche dans le nom
          if (plug.name?.toLowerCase().includes(searchLower)) return true
          
          // Recherche dans la description
          if (plug.description?.toLowerCase().includes(searchLower)) return true
          
          // Recherche dans les pays
          if (plug.countries?.some((country: string) => {
            const countryData = settings?.countries?.find((c: any) => c.code === country)
            const countryName = countryData?.name || country
            return countryName.toLowerCase().includes(searchLower) || 
                   country.toLowerCase().includes(searchLower)
          })) return true
          
          // Recherche dans le pays principal
          if (plug.country?.toLowerCase().includes(searchLower)) return true
          const countryData = settings?.countries?.find((c: any) => c.code === plug.country)
          if (countryData?.name?.toLowerCase().includes(searchLower)) return true
          
          // Recherche dans les départements de livraison
          if (plug.deliveryDepartments?.some((dept: string) => 
            dept.toLowerCase().includes(searchLower)
          )) return true
          
          // Recherche dans les départements de meetup
          if (plug.meetupDepartments?.some((dept: string) => 
            dept.toLowerCase().includes(searchLower)
          )) return true
          
          // Recherche dans les codes postaux
          if (plug.deliveryPostalCodes?.some((code: string) => 
            code.includes(searchTerm)
          )) return true
          
          if (plug.meetupPostalCodes?.some((code: string) => 
            code.includes(searchTerm)
          )) return true
          
          // Recherche dans le département principal
          if (plug.department?.toLowerCase().includes(searchLower)) return true
          if (plug.location?.department?.toLowerCase().includes(searchLower)) return true
          
          // Recherche dans le code postal principal
          if (plug.postalCode?.includes(searchTerm)) return true
          if (plug.location?.postalCode?.includes(searchTerm)) return true
          
          return false
        })
      }

      // Filtre par pays
      if (selectedCountry) {
        filtered = filtered.filter((plug: any) => {
          // Vérifier dans countries (nouveau format)
          if (plug.countries?.includes(selectedCountry)) return true
          
          // Vérifier dans shippingCountries pour l'envoi
          if (plug.shippingCountries?.includes(selectedCountry)) return true
          
          // Vérifier l'ancien format country
          if (plug.country === selectedCountry) return true
          
          // Vérifier location.country
          if (plug.location?.country === selectedCountry) return true
          
          return false
        })
      }

      // Filtre par département
      if (selectedDepartment) {
        filtered = filtered.filter((plug: any) => {
          // Vérifier le département principal
          if (plug.department === selectedDepartment) return true
          
          // Vérifier dans les départements de livraison
          if (plug.deliveryDepartments?.includes(selectedDepartment)) return true
          
          // Vérifier dans les départements de meetup
          if (plug.meetupDepartments?.includes(selectedDepartment)) return true
          
          return false
        })
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

  // Obtenir les départements disponibles pour le pays sélectionné
  const availableDepartments = locations?.countries?.find((c: any) => c.code === selectedCountry)?.departments || []



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
              placeholder="Rechercher par nom, ville, département ou code postal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-20 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all group ${
                showFilters 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
                  : hasActiveFilters
                    ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 border-2 border-blue-400'
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:scale-105'
              }`}
              title={hasActiveFilters ? "Filtres actifs" : "Filtres avancés"}
            >
              <FunnelIcon className={`w-6 h-6 ${showFilters ? 'rotate-180' : ''} transition-transform duration-300`} />
              {hasActiveFilters && !showFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
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
            <h3 className="text-lg font-bold mb-4 text-white">Filtres avancés</h3>
            
            {/* Country */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Pays</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedDepartment('')
                }}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="" className="bg-gray-900 text-white">Tous les pays</option>
                {availableCountries.map((country: any) => (
                  <option key={country.code} value={country.code} className="bg-gray-900 text-white">
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            {selectedCountry && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Département</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="" className="bg-gray-900 text-white">Tous les départements</option>
                  {availableDepartments.map((dept: any) => (
                    <option key={dept.code} value={dept.name} className="bg-gray-900 text-white">
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Methods */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Méthodes</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMethods.delivery}
                    onChange={(e) => setSelectedMethods({ ...selectedMethods, delivery: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
                  />
                  <span className="text-white">🚚 Livraison</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMethods.shipping}
                    onChange={(e) => setSelectedMethods({ ...selectedMethods, shipping: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-secondary focus:ring-secondary"
                  />
                  <span className="text-white">📮 Envoi postal</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMethods.meetup}
                    onChange={(e) => setSelectedMethods({ ...selectedMethods, meetup: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-accent focus:ring-accent"
                  />
                  <span className="text-white">🤝 Meetup</span>
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
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all text-white"
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
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-300">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-400 mb-4">
                Aucun plug ne correspond à vos critères de recherche.
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-500">
                  Essayez avec d'autres mots-clés, une ville différente ou un autre département.
                </p>
              )}
              {(selectedCountry || selectedDepartment || Object.values(selectedMethods).some(v => v)) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCountry('')
                    setSelectedDepartment('')
                    setSelectedMethods({ delivery: false, shipping: false, meetup: false })
                  }}
                  className="mt-4 px-6 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-full transition-all"
                >
                  Réinitialiser tous les filtres
                </button>
              )}
            </div>
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
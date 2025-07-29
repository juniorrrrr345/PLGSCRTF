'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import PlugCard from '@/components/PlugCard'
import PlugModal from '@/components/PlugModal'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function PlugsPage() {
  const { data: plugs, error, isLoading } = useSWR('/api/plugs', fetcher)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlug, setSelectedPlug] = useState(null)
  const [filteredPlugs, setFilteredPlugs] = useState([])

  useEffect(() => {
    if (plugs) {
      const filtered = plugs.filter((plug: any) =>
        plug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plug.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plug.country?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPlugs(filtered)
    }
  }, [plugs, searchTerm])

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
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Tous les <span className="gradient-text">Plugs</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Découvrez nos vendeurs certifiés classés par popularité
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, pays ou département..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </motion.div>

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
            <p className="text-gray-400 text-lg">Aucun plug trouvé</p>
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
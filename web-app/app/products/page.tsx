'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import { MagnifyingGlassIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProductsPage() {
  const { data: products, error, isLoading } = useSWR('/api/products', fetcher)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (products) {
      let filtered = products.filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )

      if (selectedCategory !== 'all') {
        filtered = filtered.filter((product: any) => product.category === selectedCategory)
      }

      setFilteredProducts(filtered)
    }
  }, [products, searchTerm, selectedCategory])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Erreur de chargement des produits</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black gradient-text mb-4">
            Produits Exclusifs
          </h1>
          <p className="text-gray-400 text-lg">
            Découvrez les derniers produits de nos vendeurs certifiés
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-darker border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-darker border border-white/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors"
            >
              <option value="all">Toutes les catégories</option>
              <option value="electronics">Électronique</option>
              <option value="fashion">Mode</option>
              <option value="accessories">Accessoires</option>
              <option value="other">Autres</option>
            </select>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any, index: number) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Aucun produit trouvé</p>
          </motion.div>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
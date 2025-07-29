'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import useSWR from 'swr'
import { ShoppingBagIcon, LinkIcon, PlayIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProductsPage() {
  const { data: products = [] } = useSWR('/api/products', fetcher)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Nos Produits</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Découvrez notre sélection exclusive de produits premium
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any, index: number) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              {/* Media */}
              <div className="relative aspect-square overflow-hidden bg-gray-900">
                {product.mediaType === 'video' ? (
                  <>
                    <video 
                      src={product.media}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <PlayIcon className="w-12 h-12 text-white" />
                    </div>
                  </>
                ) : (
                  <img 
                    src={product.media}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                )}
                
                {/* Price Badge */}
                {product.price > 0 && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.price}€
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{product.socialNetwork}</span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LinkIcon className="w-5 h-5 text-blue-400" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBagIcon className="w-20 h-20 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">Aucun produit disponible pour le moment</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media */}
            <div className="relative aspect-video bg-black">
              {selectedProduct.mediaType === 'video' ? (
                <video 
                  src={selectedProduct.media}
                  controls
                  className="w-full h-full"
                  autoPlay
                />
              ) : (
                <img 
                  src={selectedProduct.media}
                  alt={selectedProduct.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-3">{selectedProduct.title}</h2>
              <p className="text-gray-400 mb-6">{selectedProduct.description}</p>
              
              {selectedProduct.price > 0 && (
                <div className="text-3xl font-bold gradient-text mb-6">
                  {selectedProduct.price}€
                </div>
              )}

              <a
                href={selectedProduct.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <LinkIcon className="w-5 h-5" />
                Contacter sur {selectedProduct.socialNetwork}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
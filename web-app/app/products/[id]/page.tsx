'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        router.push('/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Retour aux produits
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden">
              {product.images && product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCartIcon className="w-24 h-24 text-gray-600" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-gray-700'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {product.name}
              </h1>
              <p className="text-2xl text-primary font-bold">
                {product.price}€
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={product.inStock ? 'text-green-500' : 'text-red-500'}>
                {product.inStock ? 'En stock' : 'Rupture de stock'}
              </span>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
              <p className="text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Caractéristiques</h2>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">{key}</span>
                      <span className="text-white">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <span className="inline-block px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                {product.category}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                disabled={!product.inStock}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  product.inStock
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {product.inStock ? 'Commander' : 'Indisponible'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
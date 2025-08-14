import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ImageUpload from './ImageUpload'
import toast from 'react-hot-toast'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: any
  onSuccess: () => void
}

export default function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'electronics',
    images: [] as string[],
    inStock: true,
    featured: false,
    specifications: {} as Record<string, string>
  })
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || 'electronics',
        images: product.images || [],
        inStock: product.inStock !== undefined ? product.inStock : true,
        featured: product.featured || false,
        specifications: product.specifications || {}
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'electronics',
        images: [],
        inStock: true,
        featured: false,
        specifications: {}
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const url = product ? `/api/products/${product._id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      })

      if (response.ok) {
        toast.success(product ? 'Produit modifié avec succès' : 'Produit créé avec succès')
        onSuccess()
        onClose()
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du produit')
    } finally {
      setLoading(false)
    }
  }

  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [newSpecKey]: newSpecValue
        }
      })
      setNewSpecKey('')
      setNewSpecValue('')
    }
  }

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications }
    delete newSpecs[key]
    setFormData({ ...formData, specifications: newSpecs })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {product ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
              rows={4}
              required
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
              >
                <option value="electronics">Électronique</option>
                <option value="fashion">Mode</option>
                <option value="home">Maison</option>
                <option value="sports">Sport</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Images du produit
            </label>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={5}
            />
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Caractéristiques
            </label>
            <div className="space-y-2 mb-4">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white">
                    {key}: {value}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="px-3 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Valeur"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Stock and Featured */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-white">En stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-primary"
              />
              <span className="text-white">Produit vedette</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : (product ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  media: {
    type: String, // URL de la photo ou vidéo
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  socialLink: {
    type: String, // Lien réseau social personnalisé
    required: true
  },
  socialNetwork: {
    type: String, // Nom du réseau (ex: Instagram, Telegram, etc)
    default: 'Link'
  },
  price: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
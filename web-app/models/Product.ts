import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videos: [{
    url: String,
    publicId: String,
    thumbnail: String
  }],
  images: [{
    url: String,
    publicId: String
  }],
  plugId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plug',
    required: true
  },
  socialNetworks: {
    instagram: String,
    snapchat: String,
    telegram: String,
    whatsapp: String,
    other: String
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['electronics', 'fashion', 'accessories', 'other'],
    default: 'other'
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

productSchema.index({ name: 'text', description: 'text' })

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
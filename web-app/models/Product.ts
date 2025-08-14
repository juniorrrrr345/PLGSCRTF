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
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  specifications: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
})

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
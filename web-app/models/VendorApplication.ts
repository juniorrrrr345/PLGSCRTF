import mongoose from 'mongoose'

const vendorApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  telegramId: {
    type: Number,
    required: true
  },
  username: String,
  socialNetworks: {
    primary: [String],
    others: String
  },
  methods: {
    delivery: Boolean,
    shipping: Boolean,
    meetup: Boolean
  },
  location: {
    country: String,
    department: String,
    postalCode: String
  },
  shopPhoto: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: String
})

const VendorApplication = mongoose.models.VendorApplication || 
  mongoose.model('VendorApplication', vendorApplicationSchema)

export default VendorApplication
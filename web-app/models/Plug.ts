import mongoose from 'mongoose'

const plugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  photo: String,
  description: String,
  methods: {
    delivery: { type: Boolean, default: false },
    shipping: { type: Boolean, default: false },
    meetup: { type: Boolean, default: false }
  },
  deliveryDepartments?: string[];
  socialNetworks?: {
    snap?: string;
    instagram?: string;
    whatsapp?: string;
    signal?: string;
    threema?: string;
    potato?: string;
    telegram?: string;
    other?: string;
  };
  customNetworks?: Array<{
    id: string;
    name: string;
    emoji: string;
    link: string;
  }>;
  location?: {
    country: string;
    department: string;
    postalCode: string;
  };
  country: String,
  countryFlag: String,
  department: String,
  postalCode: String,
  likes: {
    type: Number,
    default: 0
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referralLink: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isExample: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

plugSchema.index({ likes: -1 })
plugSchema.index({ referralCount: -1 })

export default mongoose.models.Plug || mongoose.model('Plug', plugSchema)
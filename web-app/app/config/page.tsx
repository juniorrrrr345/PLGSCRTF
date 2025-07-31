'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR, { mutate } from 'swr'
import ImageUpload from '@/components/ImageUpload'
import SocialNetworkManager from '@/components/SocialNetworkManager'
import CountryDepartmentSelector from '@/components/CountryDepartmentSelector'
import PostalCodeManager from '@/components/PostalCodeManager'
import CustomDepartmentManager from '@/components/CustomDepartmentManager'
import { countriesData, getCountryDepartments } from '@/lib/countries-data'
import { 
  ChartBarIcon, 
  CogIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  BoltIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
  PhotoIcon,
  PaperAirplaneIcon,
  Bars3Icon,
  ShoppingBagIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ConfigPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddPlug, setShowAddPlug] = useState(false)
  const [editingPlug, setEditingPlug] = useState<any>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  
  // Form states
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [globalMessage, setGlobalMessage] = useState('')
  const [miniAppButtonText, setMiniAppButtonText] = useState('MINI APP PLGS CRTFS 🔌')
  const [socialNetworks, setSocialNetworks] = useState<any>({})
  const [shopSocialNetworks, setShopSocialNetworks] = useState<any[]>([])
  const [showAddSocialNetwork, setShowAddSocialNetwork] = useState(false)
  const [botSocialNetworks, setBotSocialNetworks] = useState<any[]>([])
  const [editingApplication, setEditingApplication] = useState<any>(null)
  const [showEditApplication, setShowEditApplication] = useState(false)
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    media: '',
    mediaType: 'image',
    socialLink: '',
    socialNetwork: 'Instagram',
    socialEmoji: '📷'
  })
  const [newPlug, setNewPlug] = useState<{
    name: string
    photo: string
    socialNetworks: any
    customNetworks?: any[]
    methods: { delivery: boolean, shipping: boolean, meetup: boolean }
    deliveryDepartments: string[]
    deliveryPostalCodes: string[]
    meetupDepartments: string[]
    meetupPostalCodes: string[]
    countries: string[]
    location: { country: string, department: string, postalCode: string }
    description: string
  }>({
    name: '',
    photo: '',
    socialNetworks: {},
    customNetworks: [],
    methods: { delivery: false, shipping: false, meetup: false },
    deliveryDepartments: [],
    deliveryPostalCodes: [],
    meetupDepartments: [],
    meetupPostalCodes: [],
    countries: ['FR'],
    location: { country: 'FR', department: '', postalCode: '' },
    description: ''
  })
  
  const { data: stats } = useSWR(isAuthenticated ? '/api/stats' : null, fetcher)
  const { data: settings } = useSWR(isAuthenticated ? '/api/settings' : null, fetcher)
  const { data: plugs } = useSWR(isAuthenticated ? '/api/plugs?all=true' : null, fetcher)
  const { data: applications } = useSWR(isAuthenticated ? '/api/applications' : null, fetcher)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const authStatus = localStorage.getItem('adminAuth')
        if (authStatus === 'true') {
          setIsAuthenticated(true)
        }
        
        // Check if desktop
        const checkDesktop = () => {
          setIsDesktop(window.innerWidth >= 1024)
        }
        
        checkDesktop()
        window.addEventListener('resize', checkDesktop)
        setIsLoading(false)
        return () => window.removeEventListener('resize', checkDesktop)
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsLoading(false)
      }
    }
  }, [])
  
  useEffect(() => {
    if (settings) {
      setWelcomeMessage(settings.welcomeMessage || '')
      setMiniAppButtonText(settings.miniAppButtonText || 'MINI APP PLGS CRTFS 🔌')
      
      // Charger les réseaux sociaux du bot
      if (settings.botSocialNetworks) {
        setBotSocialNetworks(settings.botSocialNetworks)
      }
      
      // Charger les réseaux sociaux
      if (settings.socialNetworks) {
        const networksArray = Object.entries(settings.socialNetworks).map(([key, value]: [string, any]) => ({
          id: key,
          name: typeof value === 'object' ? value.name : key.charAt(0).toUpperCase() + key.slice(1),
          emoji: typeof value === 'object' ? value.emoji : getDefaultEmoji(key),
          link: typeof value === 'object' ? value.link : value
        }))
        
        // Ajouter Mini App en première position
        const miniApp = {
          id: 'miniapp',
          name: 'Mini App',
          emoji: '🔌',
          link: 'https://t.me/PLGSCRTF_BOT/miniapp'
        }
        
        // Vérifier si Mini App n'existe pas déjà
        const hasMiniApp = networksArray.some(n => n.id === 'miniapp' || n.name === 'Mini App')
        if (!hasMiniApp) {
          setShopSocialNetworks([miniApp, ...networksArray])
        } else {
          setShopSocialNetworks(networksArray)
        }
      } else {
        // Si pas de réseaux sociaux, ajouter juste Mini App
        setShopSocialNetworks([{
          id: 'miniapp',
          name: 'Mini App',
          emoji: '🔌',
          link: 'https://t.me/PLGSCRTF_BOT/miniapp'
        }])
      }
    }
  }, [settings])

  const getDefaultEmoji = (key: string) => {
    const emojis: any = {
      instagram: '📷',
      snapchat: '👻',
      telegram: '✈️',
      whatsapp: '💬',
      signal: '🔒',
      tiktok: '🎵'
    }
    return emojis[key] || '🔗'
  }

  // Load products
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => setProducts(data || []))
        .catch(err => console.error('Error loading products:', err))
    }
  }, [isAuthenticated])
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      if (res.ok) {
        setIsAuthenticated(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminAuth', 'true')
        }
        toast.success('Connexion réussie !')
      } else {
        toast.error('Mot de passe incorrect')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }
  
  const handleLogout = () => {
    setIsAuthenticated(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminAuth')
    }
    setPassword('')
    router.push('/')
  }
  
  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcomeMessage, miniAppButtonText })
      })
      
      if (res.ok) {
        toast.success('Paramètres sauvegardés !')
        mutate('/api/settings')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleSaveBotSocialNetworks = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botSocialNetworks })
      })
      
      if (res.ok) {
        toast.success('Réseaux sociaux du bot sauvegardés !')
        mutate('/api/settings')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    }
  }
  
  const handleSendGlobalMessage = async () => {
    if (!globalMessage.trim()) {
      toast.error('Le message ne peut pas être vide')
      return
    }
    
    try {
      const res = await fetch('/api/messages/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: globalMessage })
      })
      
      if (res.ok) {
        toast.success('Message envoyé à tous les utilisateurs !')
        setGlobalMessage('')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
    }
  }
  
  const handleAddPlug = async () => {
    try {
      // Formater les données du plug
      const plugData = {
        ...newPlug,
        countries: newPlug.countries,
        country: newPlug.countries[0] || 'FR', // Rétrocompatibilité
        department: newPlug.location.department,
        postalCode: newPlug.location.postalCode,
        countryFlag: getCountryFlag(newPlug.countries[0] || 'FR'),
        // Convertir customNetworks en socialNetworks pour la compatibilité
        socialNetworks: newPlug.customNetworks ? newPlug.customNetworks.reduce((acc: any, network: any) => {
          acc[network.name.toLowerCase()] = network.link
          return acc
        }, {}) : {}
      }
      
      const res = await fetch('/api/admin/plugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plugData)
      })
      
      if (res.ok) {
        toast.success('Plug ajouté avec succès !')
        setShowAddPlug(false)
        setNewPlug({
          name: '',
          photo: '',
          socialNetworks: {},
          customNetworks: [],
          methods: { delivery: false, shipping: false, meetup: false },
          deliveryDepartments: [],
          deliveryPostalCodes: [],
          meetupDepartments: [],
          meetupPostalCodes: [],
          countries: ['FR'],
          location: { country: 'FR', department: '', postalCode: '' },
          description: ''
        })
        mutate('/api/plugs?all=true')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout')
    }
  }
  
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'FR': '🇫🇷',
      'BE': '🇧🇪',
      'CH': '🇨🇭',
      'CA': '🇨🇦',
      'LU': '🇱🇺'
    }
    return flags[country] || '🌍'
  }

  const handleUpdatePlug = async () => {
    try {
      // Formater les données du plug
      const plugData = {
        ...editingPlug,
        countryFlag: getCountryFlag(editingPlug.location?.country || editingPlug.country || 'FR'),
        // Convertir customNetworks en socialNetworks pour la compatibilité
        socialNetworks: editingPlug.customNetworks ? editingPlug.customNetworks.reduce((acc: any, network: any) => {
          acc[network.name.toLowerCase()] = network.link
          return acc
        }, {}) : editingPlug.socialNetworks || {}
      }
      
      const res = await fetch(`/api/plugs/${editingPlug._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plugData)
      })

      if (res.ok) {
        toast.success('Plug mis à jour avec succès !')
        setShowAddPlug(false)
        setEditingPlug(null)
        mutate('/api/plugs?all=true')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }
  
  const handleUpdateSocialNetwork = (key: string, value: string) => {
    setSocialNetworks({ ...socialNetworks, [key]: value })
  }

  const handleSaveSocialNetworks = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialNetworks })
      })
      
      if (res.ok) {
        toast.success('Réseaux sociaux mis à jour !')
        mutate('/api/settings')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleSaveShopSocialNetworks = async () => {
    try {
      // S'assurer que Mini App est toujours présent
      const miniApp = {
        id: 'miniapp',
        name: 'Mini App',
        emoji: '🔌',
        link: 'https://t.me/PLGSCRTF_BOT/miniapp'
      }
      
      // Filtrer Mini App existant et le remettre en première position
      const filteredNetworks = shopSocialNetworks.filter(n => n.id !== 'miniapp' && n.name !== 'Mini App')
      const allNetworks = [miniApp, ...filteredNetworks]
      
      // Convertir en format objet pour la compatibilité
      const socialNetworksObject = allNetworks.reduce((acc, network) => {
        if (network.name && network.link) {
          const key = network.name.toLowerCase().replace(/\s+/g, '')
          acc[key] = {
            name: network.name,
            emoji: network.emoji || '🔗',
            link: network.link
          }
        }
        return acc
      }, {})

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialNetworks: socialNetworksObject })
      })
      
      if (res.ok) {
        toast.success('Réseaux sociaux mis à jour !')
        mutate('/api/settings')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.description || !newProduct.media || !newProduct.socialLink) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })

      if (res.ok) {
        const product = await res.json()
        setProducts([...products, product])
        toast.success('Produit ajouté avec succès !')
        setShowAddProduct(false)
        setNewProduct({
          title: '',
          description: '',
          media: '',
          mediaType: 'image',
          socialLink: '',
          socialNetwork: 'Instagram',
          socialEmoji: '📷'
        })
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du produit')
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct.title || !editingProduct.description || !editingProduct.media || !editingProduct.socialLink) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      })

      if (res.ok) {
        const updatedProduct = await res.json()
        setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p))
        toast.success('Produit mis à jour !')
        setEditingProduct(null)
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return
    
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast.success('Produit supprimé')
        setProducts(products.filter(p => p._id !== productId))
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleDeletePlug = async (plugId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plug ?')) return
    
    try {
      const res = await fetch(`/api/plugs/${plugId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast.success('Plug supprimé !')
        mutate('/api/plugs?all=true')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }
  
  const handleApproveApplication = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/approve`, {
        method: 'POST'
      })
      
      if (res.ok) {
        toast.success('Candidature approuvée !')
        mutate('/api/applications')
        mutate('/api/plugs?all=true')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'approbation')
    }
  }
  
  const handleRejectApplication = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/reject`, {
        method: 'POST'
      })
      
      if (res.ok) {
        toast.success('Candidature rejetée')
        mutate('/api/applications')
      }
    } catch (error) {
      toast.error('Erreur lors du rejet')
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full p-8"
        >
          <h1 className="text-3xl font-bold mb-8 text-center gradient-text">
            Panel Admin
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe administrateur"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
              required
              autoFocus
            />
            
            <button type="submit" className="btn-primary w-full">
              Se connecter
            </button>
          </form>
          
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition-colors mt-4 flex items-center gap-2 mx-auto"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    )
  }
  
  const tabs = [
    { id: 'social', label: 'Réseaux Sociaux', icon: LinkIcon },
    { id: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
    { id: 'plugs', label: 'Plugs', icon: BoltIcon },
    { id: 'products', label: 'Produits', icon: ShoppingBagIcon },
    { id: 'applications', label: 'Candidatures', icon: DocumentTextIcon },
    { id: 'settings', label: 'Paramètres', icon: CogIcon }
  ]
  
  return (
    <div className="min-h-screen">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-darker rounded-lg border border-white/10"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
      
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(mobileMenuOpen || isDesktop) && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed lg:relative w-64 h-screen bg-gray-900 border-r border-gray-700 z-40 shadow-2xl"
            >
              <div className="p-6">
                <h2 className="text-3xl font-black text-white mb-2">Admin Panel</h2>
                <p className="text-gray-400 text-sm mb-8">Gestion de la boutique</p>
                
                <nav className="space-y-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        activeTab === tab.id 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
                
                <button
                  onClick={handleLogout}
                  className="w-full mt-8 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Déconnexion
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 lg:ml-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Tableau de bord</h1>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="glass-card p-6"
                    >
                      <UserGroupIcon className="w-8 h-8 text-primary mb-2" />
                      <p className="text-gray-400 text-sm">Utilisateurs</p>
                      <p className="text-3xl font-bold">{stats?.userCount || 0}</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="glass-card p-6"
                    >
                      <BoltIcon className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-gray-400 text-sm">Plugs actifs</p>
                      <p className="text-3xl font-bold">{stats?.plugCount || 0}</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="glass-card p-6"
                    >
                      <HeartIcon className="w-8 h-8 text-red-500 mb-2" />
                      <p className="text-gray-400 text-sm">Total likes</p>
                      <p className="text-3xl font-bold">
                        {plugs?.reduce((acc: number, plug: any) => acc + plug.likes, 0) || 0}
                      </p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="glass-card p-6"
                    >
                      <DocumentTextIcon className="w-8 h-8 text-yellow-500 mb-2" />
                      <p className="text-gray-400 text-sm">Candidatures</p>
                      <p className="text-3xl font-bold">
                        {applications?.filter((a: any) => a.status === 'pending').length || 0}
                      </p>
                    </motion.div>
                  </div>
                  
                  {/* Top Plugs */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">🏆 Top Plugs</h2>
                    <div className="space-y-3">
                      {plugs?.slice(0, 5).map((plug: any, index: number) => (
                        <div key={plug._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                              {index > 2 && `${index + 1}.`}
                            </span>
                            <div>
                              <p className="font-semibold">{plug.name}</p>
                              <p className="text-sm text-gray-400">
                                {plug.location?.department || plug.department || ''} • {plug.likes || 0} likes
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {plug.referralCount || 0} parrainages
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Top Parrains */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">👥 Top Parrains</h2>
                    <div className="space-y-3">
                      {plugs?.sort((a: any, b: any) => (b.referralCount || 0) - (a.referralCount || 0))
                        .slice(0, 5)
                        .map((plug: any, index: number) => (
                          <div key={plug._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {index === 0 && '🥇'}
                                {index === 1 && '🥈'}
                                {index === 2 && '🥉'}
                                {index > 2 && `${index + 1}.`}
                              </span>
                              <div>
                                <p className="font-semibold">{plug.name}</p>
                                <p className="text-sm text-gray-400">
                                  {plug.location?.department || plug.department || ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-blue-400">
                              {plug.referralCount || 0} parrainages
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Plugs Management */}
              {activeTab === 'plugs' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Gestion des Plugs</h1>
                    <button
                      onClick={() => setShowAddPlug(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Ajouter un plug
                    </button>
                  </div>
                  
                  <div className="grid gap-4">
                    {plugs?.map((plug: any) => (
                      <motion.div
                        key={plug._id}
                        whileHover={{ scale: 1.01 }}
                        className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {plug.photo && (
                            <img
                              src={plug.photo}
                              alt={plug.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-bold text-lg">{plug.name}</h3>
                            <p className="text-sm text-gray-400">
                              {plug.location?.country || plug.country || 'FR'} - {plug.location?.department || plug.department || ''} • 
                              ❤️ {plug.likes || 0} • 🔗 {plug.referralCount || 0}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {plug.methods?.delivery && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">🚚 Livraison</span>}
                              {plug.methods?.shipping && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">📮 Envoi</span>}
                              {plug.methods?.meetup && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">🤝 Meetup</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Convertir socialNetworks en customNetworks si nécessaire
                              const plugToEdit = {...plug}
                              // Initialiser countries si pas présent
                              if (!plugToEdit.countries || plugToEdit.countries.length === 0) {
                                plugToEdit.countries = plugToEdit.country ? [plugToEdit.country] : ['FR']
                              }
                              if (!plugToEdit.customNetworks || plugToEdit.customNetworks.length === 0) {
                                plugToEdit.customNetworks = []
                                if (plugToEdit.socialNetworks) {
                                  const networkMap: any = {
                                    snap: { name: 'Snapchat', emoji: '👻' },
                                    instagram: { name: 'Instagram', emoji: '📷' },
                                    whatsapp: { name: 'WhatsApp', emoji: '💬' },
                                    telegram: { name: 'Telegram', emoji: '✈️' },
                                    signal: { name: 'Signal', emoji: '🔒' },
                                    threema: { name: 'Threema', emoji: '🔐' },
                                    potato: { name: 'Potato', emoji: '🥔' }
                                  }
                                  Object.entries(plugToEdit.socialNetworks).forEach(([key, value]) => {
                                    if (value && networkMap[key]) {
                                      plugToEdit.customNetworks.push({
                                        id: Date.now().toString() + Math.random(),
                                        name: networkMap[key].name,
                                        emoji: networkMap[key].emoji,
                                        link: value as string
                                      })
                                    }
                                  })
                                }
                              }
                              setEditingPlug(plugToEdit)
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePlug(plug._id)}
                            className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Applications */}
              {activeTab === 'applications' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Candidatures Vendeurs</h1>
                  
                  {!applications ? (
                    <div className="glass-card p-8 text-center">
                      <p className="text-gray-400">Chargement des candidatures...</p>
                    </div>
                  ) : applications.filter((a: any) => a.status === 'pending').length === 0 ? (
                    <div className="glass-card p-8 text-center">
                      <p className="text-gray-400">Aucune candidature en attente</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {applications.filter((a: any) => a.status === 'pending').map((app: any) => {
                        try {
                        // Vérifier et normaliser les données
                        const safeApp = {
                          ...app,
                          socialNetworks: app.socialNetworks || { primary: [], others: '' },
                          methods: app.methods || {},
                          country: app.country || app.location?.country || '',
                          department: app.department || app.location?.department || '',
                          postalCode: app.postalCode || app.location?.postalCode || ''
                        }
                        
                        return (
                          <motion.div
                            key={app._id}
                            whileHover={{ scale: 1.01 }}
                            className="glass-card p-6"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-lg">@{app.username || 'Utilisateur'}</h3>
                                <p className="text-sm text-gray-400">
                                  Candidature du {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Date inconnue'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingApplication(app)
                                    setShowEditApplication(true)
                                  }}
                                  className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                                  title="Modifier"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleApproveApplication(app._id)}
                                  className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                                  title="Approuver"
                                >
                                  <CheckIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleRejectApplication(app._id)}
                                  className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                  title="Rejeter"
                                >
                                  <XMarkIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          
                          <div className="space-y-4">
                            {/* Photo de la boutique */}
                            {(safeApp.photo || safeApp.shopPhoto) && (
                              <div className="mb-4">
                                <p className="text-gray-400 mb-2">📸 Photo de la boutique:</p>
                                <div className="bg-gray-800 p-2 rounded-lg inline-block">
                                  <p className="text-xs text-gray-500 mb-1">Photo ID: {safeApp.photo || safeApp.shopPhoto}</p>
                                  <p className="text-xs text-gray-400">La photo est stockée sur Telegram</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Réseaux sociaux */}
                            <div className="bg-white/5 p-3 rounded-lg">
                              <p className="text-gray-400 font-semibold mb-2">📱 Réseaux sociaux:</p>
                              {safeApp.socialNetworks?.primary?.length > 0 ? (
                                <div className="space-y-2">
                                  {safeApp.socialNetworks.primary.map((network: string, idx: number) => {
                                    const networkNames: any = {
                                      snap: '👻 Snapchat',
                                      instagram: '📸 Instagram',
                                      whatsapp: '💬 WhatsApp',
                                      signal: '🔐 Signal',
                                      threema: '🔒 Threema',
                                      potato: '🥔 Potato',
                                      telegram: '✈️ Telegram'
                                    };
                                    const link = safeApp.socialNetworks?.links?.[network] || 'Pas de lien';
                                    return (
                                      <div key={`${network}-${idx}`} className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg">
                                        <span className="text-sm font-medium">
                                          {networkNames[network] || network}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-2 truncate max-w-[200px]">
                                          {link}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">Non spécifié</p>
                              )}
                              {safeApp.socialNetworks?.others && (
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                  <p className="text-sm">
                                    <span className="text-gray-400 font-medium">Autres réseaux:</span>
                                  </p>
                                  <p className="text-sm text-gray-300 mt-1">{safeApp.socialNetworks.others}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Méthodes et zones */}
                            <div className="bg-white/5 p-3 rounded-lg">
                              <p className="text-gray-400 font-semibold mb-2">📦 Méthodes de vente:</p>
                              <div className="space-y-2">
                                {safeApp.methods?.delivery && (
                                  <div>
                                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                                      🚚 Livraison
                                    </span>
                                    {safeApp.deliveryZones && (
                                      <p className="text-sm mt-1 ml-2">Zones: {safeApp.deliveryZones || 'Non spécifié'}</p>
                                    )}
                                  </div>
                                )}
                                {safeApp.methods?.shipping && (
                                  <div>
                                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                                      📮 Envoi
                                    </span>
                                    {safeApp.shippingZones && (
                                      <p className="text-sm mt-1 ml-2">Zones: {safeApp.shippingZones || 'Non spécifié'}</p>
                                    )}
                                  </div>
                                )}
                                {safeApp.methods?.meetup && (
                                  <div>
                                    <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                                      🤝 Meetup
                                    </span>
                                    {safeApp.meetupZones && (
                                      <p className="text-sm mt-1 ml-2">Zones: {safeApp.meetupZones || 'Non spécifié'}</p>
                                    )}
                                  </div>
                                )}
                                {!safeApp.methods?.delivery && !safeApp.methods?.shipping && !safeApp.methods?.meetup && (
                                  <p className="text-gray-500 italic">Aucune méthode sélectionnée</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Localisation */}
                            <div className="bg-white/5 p-3 rounded-lg">
                              <p className="text-gray-400 font-semibold mb-2">📍 Localisation:</p>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="text-gray-500">Pays:</p>
                                  <p>{safeApp.country || 'Non spécifié'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Département:</p>
                                  <p>{safeApp.department || 'Non spécifié'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Code postal:</p>
                                  <p>{safeApp.postalCode || 'Non spécifié'}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Description */}
                            <div className="bg-white/5 p-3 rounded-lg">
                              <p className="text-gray-400 font-semibold mb-2">📝 Description:</p>
                              <p className="text-sm">{safeApp.description || <span className="text-gray-500 italic">Non spécifié</span>}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    } catch (error) {
                      console.error('Error rendering application:', app._id, error)
                      return (
                        <div key={app._id} className="glass-card p-6 text-center">
                          <p className="text-red-400">Erreur lors de l'affichage de cette candidature</p>
                        </div>
                      )
                    }
                  })}
                    </div>
                  )}
                </div>
              )}
              
              {/* Products */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Produits</h1>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Ajouter un produit
                    </button>
                  </div>
                  
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products?.map((product: any) => (
                      <div key={product._id} className="glass-card p-4">
                        {/* Product Media */}
                        <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                          {product.mediaType === 'video' ? (
                            <video 
                              src={product.media} 
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img 
                              src={product.media} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <h3 className="font-bold text-lg mb-2">{product.title}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                        
                        {/* Social Link */}
                        <a 
                          href={product.socialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-4"
                        >
                          <span className="text-lg">{product.socialEmoji || '🔗'}</span>
                          {product.socialNetwork}
                        </a>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <PencilIcon className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="flex-1 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {products?.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Aucun produit pour le moment</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Social Networks */}
              {activeTab === 'social' && (
                <div className="space-y-6 max-w-4xl">
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Réseaux Sociaux de la Boutique</h1>
                    <button
                      onClick={() => setShowAddSocialNetwork(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Ajouter un réseau
                    </button>
                  </div>
                  
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-6">Gérer les réseaux sociaux</h2>
                    <p className="text-gray-400 mb-6">
                      Configurez les liens vers vos réseaux sociaux qui seront affichés sur la page dédiée.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-400">
                          💡 Conseil : Ajoutez vos réseaux sociaux, configurez-les et cliquez sur "Sauvegarder" pour les afficher sur la page publique.
                        </p>
                      </div>
                      
                      {shopSocialNetworks.map((network, index) => (
                        <div key={network.id || index} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                          {/* Emoji */}
                          <input
                            type="text"
                            value={network.emoji}
                            onChange={(e) => {
                              const updated = [...shopSocialNetworks]
                              updated[index].emoji = e.target.value.slice(-2)
                              setShopSocialNetworks(updated)
                            }}
                            className="w-16 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-center text-2xl"
                            maxLength={2}
                          />
                          
                          {/* Name */}
                          <input
                            type="text"
                            value={network.name}
                            onChange={(e) => {
                              const updated = [...shopSocialNetworks]
                              updated[index].name = e.target.value
                              setShopSocialNetworks(updated)
                            }}
                            placeholder="Nom du réseau"
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg"
                          />
                          
                          {/* Link */}
                          <input
                            type="text"
                            value={network.link}
                            onChange={(e) => {
                              const updated = [...shopSocialNetworks]
                              updated[index].link = e.target.value
                              setShopSocialNetworks(updated)
                            }}
                            placeholder="Lien ou @username"
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg"
                          />
                          
                          {/* Move Up */}
                          <button
                            onClick={() => {
                              if (index > 0) {
                                const updated = [...shopSocialNetworks]
                                const temp = updated[index]
                                updated[index] = updated[index - 1]
                                updated[index - 1] = temp
                                setShopSocialNetworks(updated)
                              }
                            }}
                            disabled={index === 0}
                            className={`p-2 rounded-lg transition-colors ${
                              index === 0 
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            }`}
                          >
                            ↑
                          </button>
                          
                          {/* Move Down */}
                          <button
                            onClick={() => {
                              if (index < shopSocialNetworks.length - 1) {
                                const updated = [...shopSocialNetworks]
                                const temp = updated[index]
                                updated[index] = updated[index + 1]
                                updated[index + 1] = temp
                                setShopSocialNetworks(updated)
                              }
                            }}
                            disabled={index === shopSocialNetworks.length - 1}
                            className={`p-2 rounded-lg transition-colors ${
                              index === shopSocialNetworks.length - 1
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            }`}
                          >
                            ↓
                          </button>
                          
                          {/* Delete */}
                          {network.id !== 'miniapp' && network.name !== 'Mini App' ? (
                            <button
                              onClick={() => {
                                const updated = shopSocialNetworks.filter((_, i) => i !== index)
                                setShopSocialNetworks(updated)
                              }}
                              className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          ) : (
                            <div className="p-2 text-gray-500" title="Mini App ne peut pas être supprimé">
                              <span className="text-xs">Fixe</span>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {shopSocialNetworks.length === 0 && (
                        <p className="text-gray-500 text-center py-8">
                          Aucun réseau social configuré. Cliquez sur "Ajouter un réseau" pour commencer.
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={handleSaveShopSocialNetworks}
                      className="btn-primary mt-6 flex items-center gap-2"
                    >
                      <CheckIcon className="w-5 h-5" />
                      Sauvegarder les réseaux sociaux
                    </button>
                  </div>
                </div>
              )}
              
              {/* Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-4xl">
                  <h1 className="text-3xl font-bold">Paramètres</h1>
                  
                  {/* Mini App Button Text */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">🔌 Texte du bouton Mini App</h2>
                    <p className="text-gray-400 mb-4">
                      Personnalisez le texte affiché sur le bouton Mini App en haut du bot Telegram.
                    </p>
                    <input
                      type="text"
                      value={miniAppButtonText}
                      onChange={(e) => setMiniAppButtonText(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                      placeholder="Ex: MINI APP PLGS CRTFS 🔌"
                    />
                    <button
                      onClick={handleSaveSettings}
                      className="btn-primary mt-4"
                    >
                      Enregistrer
                    </button>
                  </div>
                  
                  {/* Welcome Message */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Message d'accueil du bot</h2>
                    <textarea
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                      rows={4}
                      placeholder="Message d'accueil..."
                    />
                    <button
                      onClick={handleSaveSettings}
                      className="btn-primary mt-4"
                    >
                      Enregistrer
                    </button>
                  </div>
                  
                  {/* Global Message */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Envoyer un message global</h2>
                    <textarea
                      value={globalMessage}
                      onChange={(e) => setGlobalMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                      rows={4}
                      placeholder="Message à envoyer à tous les utilisateurs..."
                    />
                    <button
                      onClick={handleSendGlobalMessage}
                      className="btn-primary mt-4 flex items-center gap-2"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                      Envoyer à tous
                    </button>
                  </div>
                  
                  {/* Image Management */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-6">Personnalisation visuelle</h2>
                    
                    <div className="space-y-6">


                      {/* Fond de la boutique */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className="text-2xl">🎨</span> Fond de la boutique
                        </h3>
                        <div className="bg-gray-800 border-2 border-gray-600 rounded-xl p-4">
                          <ImageUpload
                            onUpload={async (url) => {
                              try {
                                const res = await fetch('/api/settings/background', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ backgroundImage: url })
                                })
                                if (res.ok) {
                                  toast.success('Fond mis à jour !')
                                }
                              } catch (error) {
                                toast.error('Erreur lors de la mise à jour')
                              }
                            }}
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Recommandé : Image haute résolution, 1920x1080px minimum
                          </p>
                        </div>
                      </div>

                      {/* Image d'accueil du bot */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className="text-2xl">🤖</span> Image d'accueil du bot
                        </h3>
                        <div className="bg-gray-800 border-2 border-gray-600 rounded-xl p-4">
                          <ImageUpload
                            onUpload={async (url) => {
                              try {
                                const res = await fetch('/api/settings', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ welcomeImage: url })
                                })
                                if (res.ok) {
                                  toast.success('Image d\'accueil mise à jour !')
                                }
                              } catch (error) {
                                toast.error('Erreur lors de la mise à jour')
                              }
                            }}
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Cette image sera affichée dans le message d'accueil du bot Telegram
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bot Social Networks */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Réseaux sociaux du bot</h2>
                    <p className="text-gray-400 mb-4">Ces liens apparaîtront en bas du menu principal du bot Telegram</p>
                    
                    <div className="space-y-4">
                      {botSocialNetworks?.map((network: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <input
                            type="text"
                            value={network.emoji || ''}
                            onChange={(e) => {
                              const newNetworks = [...botSocialNetworks]
                              newNetworks[index].emoji = e.target.value
                              setBotSocialNetworks(newNetworks)
                            }}
                            placeholder="🔗"
                            className="w-16 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-center"
                          />
                          <input
                            type="text"
                            value={network.name || ''}
                            onChange={(e) => {
                              const newNetworks = [...botSocialNetworks]
                              newNetworks[index].name = e.target.value
                              setBotSocialNetworks(newNetworks)
                            }}
                            placeholder="Nom du réseau"
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                          />
                          <input
                            type="text"
                            value={network.url || ''}
                            onChange={(e) => {
                              const newNetworks = [...botSocialNetworks]
                              newNetworks[index].url = e.target.value
                              setBotSocialNetworks(newNetworks)
                            }}
                            placeholder="https://..."
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                          />
                          <input
                            type="number"
                            value={network.order || 0}
                            onChange={(e) => {
                              const newNetworks = [...botSocialNetworks]
                              newNetworks[index].order = parseInt(e.target.value) || 0
                              setBotSocialNetworks(newNetworks)
                            }}
                            placeholder="0"
                            className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-center"
                          />
                          <button
                            onClick={() => {
                              const newNetworks = botSocialNetworks.filter((_: any, i: number) => i !== index)
                              setBotSocialNetworks(newNetworks)
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => {
                          const newNetworks = [...botSocialNetworks, {
                            name: '',
                            url: '',
                            emoji: '🔗',
                            order: botSocialNetworks.length
                          }]
                          setBotSocialNetworks(newNetworks)
                        }}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Ajouter un réseau social
                      </button>
                      
                      <button
                        onClick={handleSaveBotSocialNetworks}
                        className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
                      >
                        <CheckIcon className="w-5 h-5" />
                        Sauvegarder les réseaux sociaux du bot
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Add/Edit Plug Modal */}
      <AnimatePresence>
        {(showAddPlug || editingPlug) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-3xl w-full max-w-4xl my-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white">
                    {editingPlug ? '✏️ Modifier le plug' : '➕ Ajouter un nouveau plug'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddPlug(false)
                      setEditingPlug(null)
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-8">
                  {/* Section 1: Informations de base */}
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="text-2xl">📝</span> Informations de base
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Nom du plug *
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: PlugsParis"
                          value={editingPlug ? editingPlug.name : newPlug.name}
                          onChange={(e) => editingPlug 
                            ? setEditingPlug({...editingPlug, name: e.target.value})
                            : setNewPlug({...newPlug, name: e.target.value})
                          }
                          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Photo du plug
                        </label>
                        <div className="bg-gray-800 border-2 border-gray-600 rounded-xl p-4">
                          <ImageUpload
                            onUpload={(url) => editingPlug
                              ? setEditingPlug({...editingPlug, photo: url})
                              : setNewPlug({...newPlug, photo: url})
                            }
                          />
                          {(editingPlug?.photo || newPlug.photo) && (
                            <div className="mt-4">
                              <img 
                                src={editingPlug?.photo || newPlug.photo} 
                                alt="Preview" 
                                className="w-32 h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          placeholder="Décrivez votre service..."
                          value={editingPlug ? editingPlug.description : newPlug.description}
                          onChange={(e) => editingPlug
                            ? setEditingPlug({...editingPlug, description: e.target.value})
                            : setNewPlug({...newPlug, description: e.target.value})
                          }
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Localisation et Pays */}
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="text-2xl">🌍</span> Pays et localisation
                    </h3>
                    
                    <CountryDepartmentSelector
                      selectedCountries={editingPlug?.countries || newPlug.countries}
                      selectedDepartments={[]}
                      onCountriesChange={(countries) => {
                        if (editingPlug) {
                          setEditingPlug({...editingPlug, countries})
                        } else {
                          setNewPlug({...newPlug, countries})
                        }
                      }}
                      onDepartmentsChange={() => {}}
                      showDepartments={false}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Département principal du vendeur
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 75 ou Paris"
                          value={editingPlug?.location?.department || editingPlug?.department || newPlug.location.department}
                          onChange={(e) => editingPlug
                            ? setEditingPlug({...editingPlug, location: {...(editingPlug.location || {}), department: e.target.value}})
                            : setNewPlug({...newPlug, location: {...newPlug.location, department: e.target.value}})
                          }
                          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Code postal
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 75001"
                          value={editingPlug?.location?.postalCode || editingPlug?.postalCode || newPlug.location.postalCode}
                          onChange={(e) => editingPlug
                            ? setEditingPlug({...editingPlug, location: {...(editingPlug.location || {}), postalCode: e.target.value}})
                            : setNewPlug({...newPlug, location: {...newPlug.location, postalCode: e.target.value}})
                          }
                          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Méthodes de livraison */}
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="text-2xl">🚚</span> Méthodes disponibles
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-3 p-4 bg-gray-800 border-2 border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 transition-all">
                          <input
                            type="checkbox"
                            checked={editingPlug?.methods?.delivery || newPlug.methods.delivery}
                            onChange={(e) => editingPlug
                              ? setEditingPlug({...editingPlug, methods: {...(editingPlug.methods || {}), delivery: e.target.checked}})
                              : setNewPlug({...newPlug, methods: {...newPlug.methods, delivery: e.target.checked}})
                            }
                            className="w-5 h-5 text-blue-600"
                          />
                          <span className="text-lg">🚚 Livraison</span>
                        </label>
                        
                        <label className="flex items-center gap-3 p-4 bg-gray-800 border-2 border-gray-600 rounded-xl cursor-pointer hover:border-green-500 transition-all">
                          <input
                            type="checkbox"
                            checked={editingPlug?.methods?.shipping || newPlug.methods.shipping}
                            onChange={(e) => editingPlug
                              ? setEditingPlug({...editingPlug, methods: {...(editingPlug.methods || {}), shipping: e.target.checked}})
                              : setNewPlug({...newPlug, methods: {...newPlug.methods, shipping: e.target.checked}})
                            }
                            className="w-5 h-5 text-green-600"
                          />
                          <span className="text-lg">📦 Envoi postal</span>
                        </label>
                        
                        <label className="flex items-center gap-3 p-4 bg-gray-800 border-2 border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 transition-all">
                          <input
                            type="checkbox"
                            checked={editingPlug?.methods?.meetup || newPlug.methods.meetup}
                            onChange={(e) => editingPlug
                              ? setEditingPlug({...editingPlug, methods: {...(editingPlug.methods || {}), meetup: e.target.checked}})
                              : setNewPlug({...newPlug, methods: {...newPlug.methods, meetup: e.target.checked}})
                            }
                            className="w-5 h-5 text-purple-600"
                          />
                          <span className="text-lg">🤝 Meetup</span>
                        </label>
                      </div>

                      {/* Départements de livraison/envoi */}
                      {(editingPlug?.methods?.delivery || editingPlug?.methods?.shipping || 
                        newPlug.methods.delivery || newPlug.methods.shipping) && (
                        <div className="mt-6 p-4 bg-gray-800 rounded-xl border-2 border-green-600/30">
                          <h4 className="text-sm font-semibold text-gray-300 mb-4">
                            📦 Sélectionnez les départements où vous livrez/envoyez
                          </h4>
                          <CountryDepartmentSelector
                            selectedCountries={editingPlug?.countries || newPlug.countries}
                            selectedDepartments={editingPlug?.deliveryDepartments || newPlug.deliveryDepartments}
                            onCountriesChange={() => {}} // Pas de changement ici, juste affichage
                            onDepartmentsChange={(departments) => {
                              if (editingPlug) {
                                setEditingPlug({...editingPlug, deliveryDepartments: departments})
                              } else {
                                setNewPlug({...newPlug, deliveryDepartments: departments})
                              }
                            }}
                            showDepartments={true}
                          />
                          
                          {/* Codes postaux de livraison */}
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-300 mb-2">
                              Codes postaux de livraison (optionnel)
                            </h5>
                            <PostalCodeManager
                              postalCodes={editingPlug?.deliveryPostalCodes || newPlug.deliveryPostalCodes || []}
                              onChange={(codes) => {
                                if (editingPlug) {
                                  setEditingPlug({...editingPlug, deliveryPostalCodes: codes})
                                } else {
                                  setNewPlug({...newPlug, deliveryPostalCodes: codes})
                                }
                              }}
                              placeholder="Ex: 75001, 69002..."
                            />
                          </div>
                        </div>
                      )}

                      {/* Zones de meetup */}
                      {(editingPlug?.methods?.meetup || newPlug.methods.meetup) && (
                        <div className="mt-6 p-4 bg-gray-800 rounded-xl border-2 border-purple-600/30">
                          <h4 className="text-sm font-semibold text-gray-300 mb-4">
                            🤝 Sélectionnez les zones où vous proposez des meetups
                          </h4>
                          <CountryDepartmentSelector
                            selectedCountries={editingPlug?.countries || newPlug.countries}
                            selectedDepartments={editingPlug?.meetupDepartments || newPlug.meetupDepartments || []}
                            onCountriesChange={() => {}} // Pas de changement ici, juste affichage
                            onDepartmentsChange={(departments) => {
                              if (editingPlug) {
                                setEditingPlug({...editingPlug, meetupDepartments: departments})
                              } else {
                                setNewPlug({...newPlug, meetupDepartments: departments})
                              }
                            }}
                            showDepartments={true}
                          />
                          
                          {/* Codes postaux de meetup */}
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-300 mb-2">
                              Codes postaux de meetup (optionnel)
                            </h5>
                            <PostalCodeManager
                              postalCodes={editingPlug?.meetupPostalCodes || newPlug.meetupPostalCodes || []}
                              onChange={(codes) => {
                                if (editingPlug) {
                                  setEditingPlug({...editingPlug, meetupPostalCodes: codes})
                                } else {
                                  setNewPlug({...newPlug, meetupPostalCodes: codes})
                                }
                              }}
                              placeholder="Ex: 75001, 69002..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 4: Réseaux sociaux */}
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <SocialNetworkManager
                      networks={editingPlug ? (editingPlug.customNetworks || []) : (newPlug.customNetworks || [])}
                      onChange={(networks) => {
                        if (editingPlug) {
                          setEditingPlug({...editingPlug, customNetworks: networks})
                        } else {
                          setNewPlug({...newPlug, customNetworks: networks})
                        }
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => {
                        setShowAddPlug(false)
                        setEditingPlug(null)
                      }}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={editingPlug ? handleUpdatePlug : handleAddPlug}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckIcon className="w-5 h-5" />
                      {editingPlug ? 'Mettre à jour' : 'Ajouter le plug'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {(showAddProduct || editingProduct) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setShowAddProduct(false)
              setEditingProduct(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8 shadow-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white">
                    {editingProduct ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddProduct(false)
                      setEditingProduct(null)
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-8">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Titre du produit *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Pack Premium Instagram"
                      value={editingProduct?.title || newProduct?.title || ''}
                      onChange={(e) => {
                        if (editingProduct) {
                          setEditingProduct({...editingProduct, title: e.target.value})
                        } else {
                          setNewProduct({...newProduct, title: e.target.value})
                        }
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      placeholder="Décrivez votre produit..."
                      value={editingProduct?.description || newProduct?.description || ''}
                      onChange={(e) => {
                        if (editingProduct) {
                          setEditingProduct({...editingProduct, description: e.target.value})
                        } else {
                          setNewProduct({...newProduct, description: e.target.value})
                        }
                      }}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors resize-none"
                      required
                    />
                  </div>
                  
                  {/* Media Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Photo ou Vidéo *
                    </label>
                    <ImageUpload
                      currentImage={editingProduct?.media || newProduct?.media}
                      onUpload={(url) => {
                        const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')
                        if (editingProduct) {
                          setEditingProduct({
                            ...editingProduct, 
                            media: url,
                            mediaType: isVideo ? 'video' : 'image'
                          })
                        } else {
                          setNewProduct({
                            ...newProduct, 
                            media: url,
                            mediaType: isVideo ? 'video' : 'image'
                          })
                        }
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Formats acceptés: Images (JPG, PNG) ou Vidéos (MP4, WebM)
                    </p>
                  </div>
                  
                  {/* Social Network */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-300">Réseau social du produit *</h4>
                    
                    <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
                      {/* Emoji */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Emoji
                        </label>
                        <input
                          type="text"
                          placeholder="📷"
                          value={editingProduct?.socialEmoji || newProduct?.socialEmoji || ''}
                          onChange={(e) => {
                            const emoji = e.target.value.slice(-2) // Garder seulement le dernier emoji
                            if (editingProduct) {
                              setEditingProduct({...editingProduct, socialEmoji: emoji})
                            } else {
                              setNewProduct({...newProduct, socialEmoji: emoji})
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors text-center text-2xl"
                          maxLength={2}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['📷', '👻', '✈️', '💬', '🎵', '🔗', '📱', '💼', '🛍️', '🎮'].map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                if (editingProduct) {
                                  setEditingProduct({...editingProduct, socialEmoji: emoji})
                                } else {
                                  setNewProduct({...newProduct, socialEmoji: emoji})
                                }
                              }}
                              className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-xl"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Nom du réseau */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nom du réseau
                        </label>
                        <input
                          type="text"
                          placeholder="Instagram"
                          value={editingProduct?.socialNetwork || newProduct?.socialNetwork || ''}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({...editingProduct, socialNetwork: e.target.value})
                            } else {
                              setNewProduct({...newProduct, socialNetwork: e.target.value})
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                      
                      {/* Lien */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Lien du réseau
                        </label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={editingProduct?.socialLink || newProduct?.socialLink || ''}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({...editingProduct, socialLink: e.target.value})
                            } else {
                              setNewProduct({...newProduct, socialLink: e.target.value})
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={() => {
                        setShowAddProduct(false)
                        setEditingProduct(null)
                      }}
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckIcon className="w-5 h-5" />
                      {editingProduct ? 'Mettre à jour' : 'Ajouter le produit'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Social Network Modal */}
      <AnimatePresence>
        {showAddSocialNetwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddSocialNetwork(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Ajouter un réseau social</h3>
              
              <div className="space-y-4">
                {/* Custom emoji input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Emoji personnalisé
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="🔗"
                      maxLength={2}
                      className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-center text-2xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          const newNetwork = {
                            id: Date.now().toString(),
                            emoji: e.currentTarget.value,
                            name: '',
                            link: ''
                          }
                          setShopSocialNetworks([...shopSocialNetworks, newNetwork])
                          setShowAddSocialNetwork(false)
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        if (input.value) {
                          const newNetwork = {
                            id: Date.now().toString(),
                            emoji: input.value,
                            name: '',
                            link: ''
                          }
                          setShopSocialNetworks([...shopSocialNetworks, newNetwork])
                          setShowAddSocialNetwork(false)
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
                
                {/* Emoji suggestions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ou choisir parmi les suggestions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '📷', '👻', '✈️', '💬', '🎵', '🔗', '📱', '💼', 
                      '🛍️', '🎮', '📧', '🌐', '📲', '💻', '🎬', '📺',
                      '🎨', '📸', '🎤', '🎧', '📹', '🎭', '🎪', '🎯',
                      '🏪', '🛒', '💳', '📦', '🚀', '💎', '🔥', '⚡'
                    ].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          const newNetwork = {
                            id: Date.now().toString(),
                            emoji,
                            name: '',
                            link: ''
                          }
                          setShopSocialNetworks([...shopSocialNetworks, newNetwork])
                          setShowAddSocialNetwork(false)
                        }}
                        className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-2xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAddSocialNetwork(false)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Application Modal */}
      <AnimatePresence>
        {showEditApplication && editingApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditApplication(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-6">Modifier la candidature de @{editingApplication.username}</h3>
              
              <div className="space-y-6">
                {/* Photo de la boutique */}
                {(editingApplication.photo || editingApplication.shopPhoto) && (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      📸 Photo de la boutique
                    </label>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <img 
                        src={`/api/telegram-photo/${editingApplication.photo || editingApplication.shopPhoto}`}
                        alt="Photo de la boutique"
                        className="w-full max-w-md h-64 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden bg-gray-800 p-3 rounded text-sm text-gray-400">
                        ⚠️ Impossible de charger la photo. ID: {editingApplication.photo || editingApplication.shopPhoto}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <a
                          href={`/api/telegram-photo/${editingApplication.photo || editingApplication.shopPhoto}`}
                          download={`boutique_${editingApplication.username}.jpg`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          📥 Télécharger la photo
                        </a>
                        <button
                          onClick={() => window.open(`/api/telegram-photo/${editingApplication.photo || editingApplication.shopPhoto}`, '_blank')}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                        >
                          🔗 Ouvrir dans un nouvel onglet
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Réseaux sociaux avec liens */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📱 Réseaux sociaux et liens
                  </label>
                  <div className="space-y-2">
                    {editingApplication.socialNetworks?.primary?.map((network: string, idx: number) => {
                      const networkNames: any = {
                        snap: '👻 Snapchat',
                        instagram: '📸 Instagram',
                        whatsapp: '💬 WhatsApp',
                        signal: '🔐 Signal',
                        threema: '🔒 Threema',
                        potato: '🥔 Potato',
                        telegram: '✈️ Telegram'
                      };
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-32">{networkNames[network] || network}:</span>
                          <input
                            type="text"
                            value={editingApplication.socialNetworks?.links?.[network] || ''}
                            onChange={(e) => {
                              const newApp = {...editingApplication};
                              if (!newApp.socialNetworks.links) newApp.socialNetworks.links = {};
                              newApp.socialNetworks.links[network] = e.target.value;
                              setEditingApplication(newApp);
                            }}
                            placeholder="Lien ou @username"
                            className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded"
                          />
                        </div>
                      );
                    })}
                    
                    {editingApplication.socialNetworks?.others && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <label className="block text-sm text-gray-400 mb-1">Autres réseaux:</label>
                        <textarea
                          value={editingApplication.socialNetworks.others}
                          onChange={(e) => setEditingApplication({
                            ...editingApplication,
                            socialNetworks: {...editingApplication.socialNetworks, others: e.target.value}
                          })}
                          rows={2}
                          className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Méthodes de vente et zones */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📦 Méthodes de vente et zones
                  </label>
                  <div className="space-y-3">
                    {editingApplication.methods?.delivery && (
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                          <input
                            type="checkbox"
                            checked={editingApplication.methods.delivery}
                            onChange={(e) => setEditingApplication({
                              ...editingApplication,
                              methods: {...editingApplication.methods, delivery: e.target.checked}
                            })}
                          />
                          🚚 Livraison
                        </label>
                        <textarea
                          value={editingApplication.deliveryZones || ''}
                          onChange={(e) => setEditingApplication({...editingApplication, deliveryZones: e.target.value})}
                          placeholder="Zones de livraison (départements, codes postaux...)"
                          rows={2}
                          className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        />
                      </div>
                    )}
                    
                    {editingApplication.methods?.shipping && (
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                          <input
                            type="checkbox"
                            checked={editingApplication.methods.shipping}
                            onChange={(e) => setEditingApplication({
                              ...editingApplication,
                              methods: {...editingApplication.methods, shipping: e.target.checked}
                            })}
                          />
                          📮 Envoi
                        </label>
                        <textarea
                          value={editingApplication.shippingZones || ''}
                          onChange={(e) => setEditingApplication({...editingApplication, shippingZones: e.target.value})}
                          placeholder="Zones d'envoi (pays, régions...)"
                          rows={2}
                          className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        />
                      </div>
                    )}
                    
                    {editingApplication.methods?.meetup && (
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                          <input
                            type="checkbox"
                            checked={editingApplication.methods.meetup}
                            onChange={(e) => setEditingApplication({
                              ...editingApplication,
                              methods: {...editingApplication.methods, meetup: e.target.checked}
                            })}
                          />
                          🤝 Meetup
                        </label>
                        <textarea
                          value={editingApplication.meetupZones || ''}
                          onChange={(e) => setEditingApplication({...editingApplication, meetupZones: e.target.value})}
                          placeholder="Zones de meetup (villes, quartiers...)"
                          rows={2}
                          className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Localisation principale */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📍 Localisation principale du vendeur
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Pays</label>
                      <input
                        type="text"
                        value={editingApplication.country || ''}
                        onChange={(e) => setEditingApplication({...editingApplication, country: e.target.value})}
                        placeholder="Ex: France"
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Département</label>
                      <input
                        type="text"
                        value={editingApplication.department || ''}
                        onChange={(e) => setEditingApplication({...editingApplication, department: e.target.value})}
                        placeholder="Ex: 75"
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Code postal</label>
                      <input
                        type="text"
                        value={editingApplication.postalCode || ''}
                        onChange={(e) => setEditingApplication({...editingApplication, postalCode: e.target.value})}
                        placeholder="Ex: 75001"
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📝 Description
                  </label>
                  <textarea
                    value={editingApplication.description || ''}
                    onChange={(e) => setEditingApplication({...editingApplication, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                  />
                </div>
                
                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={async () => {
                      // Sauvegarder les modifications
                      try {
                        const res = await fetch(`/api/applications/${editingApplication._id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editingApplication)
                        })
                        
                        if (res.ok) {
                          toast.success('Candidature modifiée')
                          mutate('/api/applications')
                          setShowEditApplication(false)
                        }
                      } catch (error) {
                        toast.error('Erreur lors de la modification')
                      }
                    }}
                    className="flex-1 btn-primary"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setShowEditApplication(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
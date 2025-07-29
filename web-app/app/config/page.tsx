'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR, { mutate } from 'swr'
import ImageUpload from '@/components/ImageUpload'
import SocialNetworkManager from '@/components/SocialNetworkManager'
import CountryDepartmentSelector from '@/components/CountryDepartmentSelector'
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
  Bars3Icon
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  
  // Form states
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [globalMessage, setGlobalMessage] = useState('')
  const [newPlug, setNewPlug] = useState<{
    name: string
    photo: string
    socialNetworks: any
    customNetworks?: any[]
    methods: { delivery: boolean, shipping: boolean, meetup: boolean }
    deliveryDepartments: string[]
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
    }
  }, [settings])
  
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
        body: JSON.stringify({ welcomeMessage })
      })
      
      if (res.ok) {
        toast.success('Paramètres sauvegardés !')
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
      
      const res = await fetch('/api/plugs', {
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
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
    { id: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
    { id: 'plugs', label: 'Plugs', icon: BoltIcon },
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
                  
                  {applications?.filter((a: any) => a.status === 'pending').length === 0 ? (
                    <div className="glass-card p-8 text-center">
                      <p className="text-gray-400">Aucune candidature en attente</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {applications?.filter((a: any) => a.status === 'pending').map((app: any) => (
                        <motion.div
                          key={app._id}
                          whileHover={{ scale: 1.01 }}
                          className="glass-card p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">@{app.username}</h3>
                              <p className="text-sm text-gray-400">
                                Candidature du {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveApplication(app._id)}
                                className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                              >
                                <CheckIcon className="w-5 h-5" />
                              </button>
                              <button
                                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                              >
                                <XMarkIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-gray-400">Réseaux sociaux:</p>
                              <p>{app.socialNetworks.primary.join(', ') || 'Aucun'}</p>
                              {app.socialNetworks.others && <p className="text-gray-400">Autres: {app.socialNetworks.others}</p>}
                            </div>
                            
                            <div>
                              <p className="text-gray-400">Méthodes:</p>
                              <div className="flex gap-2 mt-1">
                                {app.methods.delivery && <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">Livraison</span>}
                                {app.methods.shipping && <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Envoi</span>}
                                {app.methods.meetup && <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">Meetup</span>}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-gray-400">Localisation:</p>
                              <p>{app.location.country} - {app.location.department} - {app.location.postalCode}</p>
                            </div>
                            
                            {app.description && (
                              <div>
                                <p className="text-gray-400">Description:</p>
                                <p>{app.description}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-4xl">
                  <h1 className="text-3xl font-bold">Paramètres</h1>
                  
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
                      {/* Logo de la boutique */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className="text-2xl">🏪</span> Logo de la boutique
                        </h3>
                        <div className="bg-gray-800 border-2 border-gray-600 rounded-xl p-4">
                          <ImageUpload
                            onUpload={async (url) => {
                              try {
                                const res = await fetch('/api/settings/background', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ logoImage: url })
                                })
                                if (res.ok) {
                                  toast.success('Logo mis à jour !')
                                }
                              } catch (error) {
                                toast.error('Erreur lors de la mise à jour')
                              }
                            }}
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Recommandé : Image carrée, 500x500px minimum
                          </p>
                        </div>
                      </div>

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
                          <span className="text-lg">🤝 Rencontre</span>
                        </label>
                      </div>

                      {/* Départements de livraison/envoi */}
                      {(editingPlug?.methods?.delivery || editingPlug?.methods?.shipping || 
                        newPlug.methods.delivery || newPlug.methods.shipping) && (
                        <div className="mt-6 p-4 bg-gray-800 rounded-xl border-2 border-green-600/30">
                          <h4 className="text-sm font-semibold text-gray-300 mb-4">
                            📍 Sélectionnez les départements où vous livrez/envoyez
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
    </div>
  )
}
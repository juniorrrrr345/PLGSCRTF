'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR, { mutate } from 'swr'
import ImageUpload from '@/components/ImageUpload'
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
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddPlug, setShowAddPlug] = useState(false)
  const [editingPlug, setEditingPlug] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  
  // Form states
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [globalMessage, setGlobalMessage] = useState('')
  const [newPlug, setNewPlug] = useState({
    name: '',
    photo: '',
    socialNetworks: { primary: [], others: '' },
    methods: { delivery: false, shipping: false, meetup: false },
    deliveryDepartments: [],
    location: { country: 'FR', department: '', postalCode: '' },
    description: ''
  })
  
  const { data: stats } = useSWR(isAuthenticated ? '/api/stats' : null, fetcher)
  const { data: settings } = useSWR(isAuthenticated ? '/api/settings' : null, fetcher)
  const { data: plugs } = useSWR(isAuthenticated ? '/api/plugs?all=true' : null, fetcher)
  const { data: applications } = useSWR(isAuthenticated ? '/api/applications' : null, fetcher)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
      return () => window.removeEventListener('resize', checkDesktop)
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
      const res = await fetch('/api/plugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlug)
      })
      
      if (res.ok) {
        toast.success('Plug ajouté avec succès !')
        setShowAddPlug(false)
        setNewPlug({
          name: '',
          photo: '',
          socialNetworks: { primary: [], others: '' },
          methods: { delivery: false, shipping: false, meetup: false },
          location: { country: 'FR', department: '', postalCode: '' },
          description: ''
        })
        mutate('/api/plugs?all=true')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout')
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
              className="fixed lg:relative w-64 h-screen bg-darker border-r border-white/10 z-40"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold gradient-text mb-8">Admin Panel</h2>
                
                <nav className="space-y-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id 
                          ? 'bg-primary text-black font-semibold' 
                          : 'hover:bg-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
                
                <button
                  onClick={handleLogout}
                  className="w-full mt-8 px-4 py-3 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                >
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
                                {plug.location.department} • {plug.likes} likes
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
                              {plug.location.country} - {plug.location.department} • 
                              ❤️ {plug.likes} • 🔗 {plug.referralCount || 0}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {plug.methods.delivery && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">🚚 Livraison</span>}
                              {plug.methods.shipping && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">📮 Envoi</span>}
                              {plug.methods.meetup && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">🤝 Meetup</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPlug(plug)}
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
                    <h2 className="text-xl font-bold mb-4">Gestion des images</h2>
                    <div className="space-y-3">
                      <button className="btn-secondary w-full">
                        <PhotoIcon className="w-5 h-5 mr-2" />
                        Changer l'image d'accueil
                      </button>
                      <button className="btn-secondary w-full">
                        <PhotoIcon className="w-5 h-5 mr-2" />
                        Changer le fond de la boutique
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddPlug(false)
              setEditingPlug(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-darker rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingPlug ? 'Modifier le plug' : 'Ajouter un plug'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom</label>
                    <input
                      type="text"
                      value={editingPlug ? editingPlug.name : newPlug.name}
                      onChange={(e) => editingPlug 
                        ? setEditingPlug({...editingPlug, name: e.target.value})
                        : setNewPlug({...newPlug, name: e.target.value})
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Photo</label>
                    <ImageUpload
                      onUpload={(url) => editingPlug
                        ? setEditingPlug({...editingPlug, photo: url})
                        : setNewPlug({...newPlug, photo: url})
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Méthodes</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingPlug ? editingPlug.methods.delivery : newPlug.methods.delivery}
                          onChange={(e) => editingPlug
                            ? setEditingPlug({...editingPlug, methods: {...editingPlug.methods, delivery: e.target.checked}})
                            : setNewPlug({...newPlug, methods: {...newPlug.methods, delivery: e.target.checked}})
                          }
                        />
                        🚚 Livraison
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingPlug ? editingPlug.methods.shipping : newPlug.methods.shipping}
                          onChange={(e) => editingPlug
                            ? setEditingPlug({...editingPlug, methods: {...editingPlug.methods, shipping: e.target.checked}})
                            : setNewPlug({...newPlug, methods: {...newPlug.methods, shipping: e.target.checked}})
                          }
                        />
                        📮 Envoi
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingPlug ? editingPlug.methods.meetup : newPlug.methods.meetup}
                          onChange={(e) => editingPlug
                            ? setEditingPlug({...editingPlug, methods: {...editingPlug.methods, meetup: e.target.checked}})
                            : setNewPlug({...newPlug, methods: {...newPlug.methods, meetup: e.target.checked}})
                          }
                        />
                        🤝 Meetup
                      </label>
                    </div>
                  </div>
                  
                  {/* Départements de livraison */}
                  {(editingPlug?.methods?.delivery || editingPlug?.methods?.shipping || 
                    newPlug.methods.delivery || newPlug.methods.shipping) && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Départements de livraison/envoi (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        placeholder="75, 92, 93, 94..."
                        value={editingPlug 
                          ? (editingPlug.deliveryDepartments || []).join(', ')
                          : (newPlug.deliveryDepartments || []).join(', ')
                        }
                        onChange={(e) => {
                          const departments = e.target.value.split(',').map(d => d.trim()).filter(d => d);
                          if (editingPlug) {
                            setEditingPlug({...editingPlug, deliveryDepartments: departments});
                          } else {
                            setNewPlug({...newPlug, deliveryDepartments: departments});
                          }
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Entrez les numéros de départements où vous livrez/envoyez
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Département</label>
                      <input
                        type="text"
                        value={editingPlug ? editingPlug.location.department : newPlug.location.department}
                        onChange={(e) => editingPlug
                          ? setEditingPlug({...editingPlug, location: {...editingPlug.location, department: e.target.value}})
                          : setNewPlug({...newPlug, location: {...newPlug.location, department: e.target.value}})
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Code postal</label>
                      <input
                        type="text"
                        value={editingPlug ? editingPlug.location.postalCode : newPlug.location.postalCode}
                        onChange={(e) => editingPlug
                          ? setEditingPlug({...editingPlug, location: {...editingPlug.location, postalCode: e.target.value}})
                          : setNewPlug({...newPlug, location: {...newPlug.location, postalCode: e.target.value}})
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editingPlug ? editingPlug.description : newPlug.description}
                      onChange={(e) => editingPlug
                        ? setEditingPlug({...editingPlug, description: e.target.value})
                        : setNewPlug({...newPlug, description: e.target.value})
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary focus:outline-none transition-colors"
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={editingPlug ? () => {} : handleAddPlug}
                    className="btn-primary flex-1"
                  >
                    {editingPlug ? 'Enregistrer' : 'Ajouter'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPlug(false)
                      setEditingPlug(null)
                    }}
                    className="btn-secondary flex-1"
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
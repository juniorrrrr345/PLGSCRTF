'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import useSWR, { mutate } from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ConfigPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const { data: stats } = useSWR(isAuthenticated ? '/api/stats' : null, fetcher)
  const { data: settings } = useSWR(isAuthenticated ? '/api/settings' : null, fetcher)
  const { data: plugs } = useSWR(isAuthenticated ? '/api/plugs' : null, fetcher)
  
  useEffect(() => {
    // Vérifier si déjà authentifié (session)
    const authStatus = sessionStorage.getItem('adminAuth')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])
  
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
        sessionStorage.setItem('adminAuth', 'true')
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
    sessionStorage.removeItem('adminAuth')
    setPassword('')
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md w-full"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">🔐 Panel Administrateur</h1>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-2 bg-telegram-bg rounded-lg border border-telegram-text-secondary focus:border-telegram-accent outline-none mb-4"
              required
            />
            
            <button type="submit" className="btn-primary w-full">
              Se connecter
            </button>
          </form>
          
          <Link href="/" className="text-telegram-accent text-center block mt-4">
            ← Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-telegram-bg">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">🛠 Panel Administrateur</h1>
            <button onClick={handleLogout} className="btn-secondary">
              Déconnexion
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {['dashboard', 'plugs', 'settings', 'applications'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-telegram-accent text-white' 
                    : 'bg-telegram-secondary text-telegram-text-secondary'
                }`}
              >
                {tab === 'dashboard' && '📊 Tableau de bord'}
                {tab === 'plugs' && '🔌 Plugs'}
                {tab === 'settings' && '⚙️ Paramètres'}
                {tab === 'applications' && '📋 Candidatures'}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">👥 Utilisateurs</h3>
                <p className="text-3xl font-bold">{stats?.userCount || 0}</p>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">🔌 Plugs actifs</h3>
                <p className="text-3xl font-bold">{stats?.plugCount || 0}</p>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">📈 Total likes</h3>
                <p className="text-3xl font-bold">
                  {plugs?.reduce((acc: number, plug: any) => acc + plug.likes, 0) || 0}
                </p>
              </div>
              
              <div className="card col-span-full">
                <h3 className="text-xl font-semibold mb-4">🏆 Top Parrains</h3>
                <div className="space-y-2">
                  {plugs?.slice(0, 5).map((plug: any, index: number) => (
                    <div key={plug._id} className="flex justify-between items-center">
                      <span>
                        {index === 0 && '👑'} {plug.name}
                      </span>
                      <span className="text-telegram-text-secondary">
                        {plug.referralCount} filleuls
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'plugs' && (
            <div className="space-y-4">
              <button className="btn-primary">
                ➕ Ajouter un plug
              </button>
              
              <div className="grid gap-4">
                {plugs?.map((plug: any) => (
                  <div key={plug._id} className="card flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{plug.name}</h3>
                      <p className="text-sm text-telegram-text-secondary">
                        {plug.country} - {plug.department} | ❤️ {plug.likes} likes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-sm">Modifier</button>
                      <button className="text-red-500 hover:text-red-400">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">📝 Message d'accueil</h3>
                <textarea
                  className="w-full px-4 py-2 bg-telegram-bg rounded-lg border border-telegram-text-secondary"
                  rows={3}
                  defaultValue={settings?.welcomeMessage}
                />
                <button className="btn-primary mt-2">Enregistrer</button>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">📸 Images</h3>
                <div className="space-y-2">
                  <button className="btn-secondary w-full">
                    Changer l'image d'accueil
                  </button>
                  <button className="btn-secondary w-full">
                    Changer le fond de la boutique
                  </button>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">📢 Message global</h3>
                <textarea
                  className="w-full px-4 py-2 bg-telegram-bg rounded-lg border border-telegram-text-secondary mb-2"
                  rows={3}
                  placeholder="Message à envoyer à tous les utilisateurs..."
                />
                <button className="btn-primary">Envoyer à tous</button>
              </div>
            </div>
          )}
          
          {activeTab === 'applications' && (
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">📋 Candidatures vendeurs</h3>
              <p className="text-telegram-text-secondary">Aucune candidature en attente</p>
            </div>
          )}
        </motion.div>
        
        <Link href="/" className="text-telegram-accent mt-8 inline-block">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState('')
  const router = useRouter()

  const handleSync = async () => {
    if (!token) {
      setError('Veuillez entrer le token admin')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/sync-missing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de synchronisation')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Synchronisation Admin</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Synchroniser les utilisateurs manquants</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Token Admin</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Entrez le token admin"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSync}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Synchronisation en cours...' : 'Lancer la synchronisation'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Résultat de la synchronisation</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded p-4">
                <h4 className="font-semibold mb-2">Avant</h4>
                <p>Bot: {result.before.bot} utilisateurs</p>
                <p>Boutique: {result.before.web} utilisateurs</p>
                <p>Différence: {result.before.difference}</p>
              </div>
              
              <div className="bg-gray-700 rounded p-4">
                <h4 className="font-semibold mb-2">Après</h4>
                <p>Bot: {result.after.bot} utilisateurs</p>
                <p>Boutique: {result.after.web} utilisateurs</p>
                <p>Différence: {result.after.difference}</p>
              </div>
            </div>

            <div className="bg-gray-700 rounded p-4">
              <p className="font-semibold mb-2">
                {result.synced} utilisateur(s) synchronisé(s)
              </p>
              
              {result.missingUsers.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400 mb-1">Utilisateurs ajoutés:</p>
                  <ul className="text-sm">
                    {result.missingUsers.map((user: any, index: number) => (
                      <li key={index}>
                        • {user.username} (ID: {user.telegramId})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="mt-6 text-blue-400 hover:text-blue-300"
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
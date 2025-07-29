'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

interface SocialNetwork {
  id: string
  name: string
  emoji: string
  link: string
}

interface SocialNetworkManagerProps {
  networks: SocialNetwork[]
  onChange: (networks: SocialNetwork[]) => void
}

export default function SocialNetworkManager({ networks = [], onChange }: SocialNetworkManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNetwork, setNewNetwork] = useState({ name: '', emoji: '', link: '' })

  const handleAdd = () => {
    if (newNetwork.name && newNetwork.emoji && newNetwork.link) {
      const network: SocialNetwork = {
        id: Date.now().toString(),
        ...newNetwork
      }
      onChange([...networks, network])
      setNewNetwork({ name: '', emoji: '', link: '' })
      setIsAdding(false)
    }
  }

  const handleUpdate = (id: string, updates: Partial<SocialNetwork>) => {
    onChange(networks.map(n => n.id === id ? { ...n, ...updates } : n))
  }

  const handleDelete = (id: string) => {
    onChange(networks.filter(n => n.id !== id))
  }

  const defaultEmojis = ['👻', '📷', '💬', '✈️', '🔒', '🔐', '🥔', '🎵', '📱', '💻', '🌐', '📧']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Réseaux sociaux</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Liste des réseaux existants */}
      <div className="space-y-2">
        {networks.map((network) => (
          <div key={network.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            {editingId === network.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={network.emoji}
                      onChange={(e) => handleUpdate(network.id, { emoji: e.target.value })}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center text-2xl"
                      placeholder="😀"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={network.name}
                      onChange={(e) => handleUpdate(network.id, { name: e.target.value })}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                      placeholder="Nom du réseau"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={network.link}
                      onChange={(e) => handleUpdate(network.id, { link: e.target.value })}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                      placeholder="@username ou lien"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    Valider
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{network.emoji}</span>
                  <div>
                    <div className="font-medium text-white">{network.name}</div>
                    <div className="text-sm text-gray-400">{network.link}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(network.id)}
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(network.id)}
                    className="p-1.5 hover:bg-red-600/20 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulaire d'ajout */}
      {isAdding && (
        <div className="bg-gray-800 border-2 border-blue-600 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Emoji</label>
              <input
                type="text"
                value={newNetwork.emoji}
                onChange={(e) => setNewNetwork({ ...newNetwork, emoji: e.target.value })}
                className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded text-center text-2xl"
                placeholder="😀"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {defaultEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewNetwork({ ...newNetwork, emoji })}
                    className="text-xl hover:bg-gray-700 p-1 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-4">
              <label className="block text-xs text-gray-400 mb-1">Nom du réseau</label>
              <input
                type="text"
                value={newNetwork.name}
                onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Ex: Instagram"
              />
            </div>
            <div className="col-span-6">
              <label className="block text-xs text-gray-400 mb-1">Lien ou username</label>
              <input
                type="text"
                value={newNetwork.link}
                onChange={(e) => setNewNetwork({ ...newNetwork, link: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Ex: @username ou +33612345678"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAdding(false)
                setNewNetwork({ name: '', emoji: '', link: '' })
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleAdd}
              disabled={!newNetwork.name || !newNetwork.emoji || !newNetwork.link}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
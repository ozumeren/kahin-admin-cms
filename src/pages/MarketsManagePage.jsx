// src/pages/MarketsManagePage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, XCircle, CheckCircle, Plus, TrendingUp } from 'lucide-react'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export default function MarketsManagePage() {
  const queryClient = useQueryClient()
  const [editingMarket, setEditingMarket] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    closing_date: '',
    image_url: '',
    category: ''
  })

  const categories = [
    { id: 'politics', name: 'Siyaset' },
    { id: 'sports', name: 'Spor' },
    { id: 'crypto', name: 'Kripto' },
    { id: 'economy', name: 'Ekonomi' },
    { id: 'entertainment', name: 'Eğlence' },
    { id: 'technology', name: 'Teknoloji' },
  ]

  // Markets listesini getir
  const { data: marketsData, isLoading, error } = useQuery({
    queryKey: ['adminMarkets'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/markets')
      return response.data
    }
  })

  // Market kapatma
  const closeMarketMutation = useMutation({
    mutationFn: async (marketId) => {
      const response = await apiClient.post(`/admin/markets/${marketId}/close`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Market başarıyla kapatıldı')
      queryClient.invalidateQueries(['adminMarkets'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Market kapatılırken hata oluştu')
    }
  })

  // Market sonuçlandırma
  const resolveMarketMutation = useMutation({
    mutationFn: async ({ marketId, outcome }) => {
      const response = await apiClient.post(`/admin/markets/${marketId}/resolve`, { outcome })
      return response.data
    },
    onSuccess: () => {
      toast.success('Market başarıyla sonuçlandırıldı')
      queryClient.invalidateQueries(['adminMarkets'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Market sonuçlandırılırken hata oluştu')
    }
  })

  // Market güncelleme
  const updateMarketMutation = useMutation({
    mutationFn: async ({ marketId, data }) => {
      const response = await apiClient.put(`/admin/markets/${marketId}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Market başarıyla güncellendi')
      queryClient.invalidateQueries(['adminMarkets'])
      setEditingMarket(null)
      setEditForm({
        title: '',
        description: '',
        closing_date: '',
        image_url: '',
        category: ''
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Market güncellenirken hata oluştu')
    }
  })

  const handleStartEdit = (market) => {
    setEditingMarket(market)
    setEditForm({
      title: market.title,
      description: market.description || '',
      closing_date: market.closing_date ? new Date(market.closing_date).toISOString().slice(0, 16) : '',
      image_url: market.image_url || '',
      category: market.category || 'politics'
    })
  }

  const handleSaveEdit = () => {
    if (!editForm.title || !editForm.closing_date) {
      toast.error('Başlık ve kapanış tarihi zorunludur')
      return
    }

    updateMarketMutation.mutate({
      marketId: editingMarket.id,
      data: editForm
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl shadow-md p-12 text-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#ccff33' }}></div>
        <p style={{ color: '#ffffff' }}>Yükleniyor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl shadow-md p-12 text-center" style={{ backgroundColor: '#1a1a1a' }}>
        <p style={{ color: '#FF0000' }}>Marketler yüklenirken hata oluştu: {error.message}</p>
      </div>
    )
  }

  const markets = marketsData?.data || []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>Market Yönetimi</h2>
          <p className="text-sm" style={{ color: '#888888' }}>
            Mevcut marketleri görüntüleyin ve yönetin
          </p>
        </div>
        <Link
          to="/markets/create"
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all"
          style={{ backgroundColor: '#ccff33', color: '#000000' }}
        >
          <Plus className="w-5 h-5" />
          Yeni Market
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Toplam</p>
          <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{markets.length}</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Açık</p>
          <p className="text-2xl font-bold" style={{ color: '#ccff33' }}>
            {markets.filter(m => m.status === 'open').length}
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Kapalı</p>
          <p className="text-2xl font-bold" style={{ color: '#FF6600' }}>
            {markets.filter(m => m.status === 'closed').length}
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Sonuçlandı</p>
          <p className="text-2xl font-bold" style={{ color: '#555555' }}>
            {markets.filter(m => m.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Markets List */}
      <div className="space-y-4">
        {markets.map((market) => (
          <div key={market.id} className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>{market.title}</h3>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: market.status === 'open' ? '#ccff33' : market.status === 'closed' ? '#FF6600' : '#555555',
                      color: market.status === 'open' ? '#000000' : '#ffffff'
                    }}
                  >
                    {market.status === 'open' ? 'Açık' : market.status === 'closed' ? 'Kapalı' : 'Sonuçlandı'}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: '#888888' }}>
                  {market.description}
                </p>
                <p className="text-xs" style={{ color: '#666666' }}>
                  Kapanış: {new Date(market.closing_date).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {market.status !== 'resolved' && (
                <button
                  onClick={() => handleStartEdit(market)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
                  style={{ backgroundColor: '#ccff33', color: '#000000' }}
                >
                  <Edit className="w-4 h-4" />
                  Düzenle
                </button>
              )}
              
              {market.status === 'open' && (
                <button
                  onClick={() => closeMarketMutation.mutate(market.id)}
                  disabled={closeMarketMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#FF6600', color: '#ffffff' }}
                >
                  <XCircle className="w-4 h-4" />
                  Kapat
                </button>
              )}

              {market.status === 'closed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => resolveMarketMutation.mutate({ marketId: market.id, outcome: true })}
                    disabled={resolveMarketMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#00ff00', color: '#000000' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Evet
                  </button>
                  <button
                    onClick={() => resolveMarketMutation.mutate({ marketId: market.id, outcome: false })}
                    disabled={resolveMarketMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#FF0000', color: '#ffffff' }}
                  >
                    <XCircle className="w-4 h-4" />
                    Hayır
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {markets.length === 0 && (
          <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(204, 255, 51, 0.1)' }}>
              <TrendingUp className="w-8 h-8" style={{ color: '#ccff33' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Henüz market bulunmuyor</h3>
            <p className="text-sm mb-4" style={{ color: '#888888' }}>
              Yeni bir market oluşturmak için butona tıklayın
            </p>
            <Link
              to="/markets/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
              style={{ backgroundColor: '#ccff33', color: '#000000' }}
            >
              <Plus className="w-4 h-4" />
              Market Oluştur
            </Link>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMarket && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingMarket(null)}
        >
          <div 
            className="rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>
              Market Düzenle
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Başlık *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl"
                  style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #333333' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Açıklama
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl resize-none"
                  style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #333333' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Kategori
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl"
                  style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #333333' }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Kapanış Tarihi *
                </label>
                <input
                  type="datetime-local"
                  value={editForm.closing_date}
                  onChange={(e) => setEditForm({ ...editForm, closing_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl"
                  style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #333333' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Görsel URL
                </label>
                <input
                  type="text"
                  value={editForm.image_url}
                  onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl"
                  style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #333333' }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingMarket(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium"
                  style={{ backgroundColor: '#333333', color: '#ffffff' }}
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateMarketMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#ccff33', color: '#000000' }}
                >
                  {updateMarketMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
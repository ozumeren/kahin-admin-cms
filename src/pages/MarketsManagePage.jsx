// admin-cms/src/pages/MarketsManagePage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Edit,
  XCircle,
  CheckCircle,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowRight,
  Trash2
} from 'lucide-react'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export default function MarketsManagePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [editingMarket, setEditingMarket] = useState(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    closing_date: '',
    image_url: ''
  })

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
      toast.success('Market başarıyla kapatıldı ve çözümleme ekranına eklendi')
      // Tüm ilgili sayfaları güncelle
      queryClient.invalidateQueries(['adminMarkets'])
      queryClient.invalidateQueries(['resolvableMarkets']) // Market Çözümleme sayfası
      queryClient.invalidateQueries(['adminDashboard']) // Dashboard
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Market kapatılırken hata oluştu')
    }
  })

  // Market sonuçlandırma kaldırıldı - Market Çözümlemesi sayfasından yapılacak

  // Market silme
  const deleteMarketMutation = useMutation({
    mutationFn: async (marketId) => {
      const response = await apiClient.delete(`/admin/markets/${marketId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Market başarıyla silindi')
      // Tüm ilgili sayfaları güncelle
      queryClient.invalidateQueries(['adminMarkets'])
      queryClient.invalidateQueries(['resolvableMarkets'])
      queryClient.invalidateQueries(['adminDashboard'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Market silinirken hata oluştu')
    }
  })

  // Market düzenleme
  const updateMarketMutation = useMutation({
    mutationFn: async ({ marketId, data }) => {
      const response = await apiClient.put(`/admin/markets/${marketId}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Market başarıyla güncellendi')
      // Tüm ilgili sayfaları güncelle
      queryClient.invalidateQueries(['adminMarkets'])
      queryClient.invalidateQueries(['resolvableMarkets'])
      queryClient.invalidateQueries(['adminDashboard'])
      setEditingMarket(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Market güncellenirken hata oluştu')
    }
  })

  const handleEditClick = (market) => {
    setEditingMarket(market)
    setEditFormData({
      title: market.title || '',
      description: market.description || '',
      category: market.category || 'politics',
      closing_date: market.closing_date ? market.closing_date.split('T')[0] : '',
      image_url: market.image_url || ''
    })
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    updateMarketMutation.mutate({
      marketId: editingMarket.id,
      data: editFormData
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ccff33' }}></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
        <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#FF0000' }} />
        <p style={{ color: '#FF0000' }}>Marketler yüklenirken hata oluştu</p>
        <button
          onClick={() => queryClient.invalidateQueries(['adminMarkets'])}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ backgroundColor: '#FF0000', color: '#ffffff' }}
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  const markets = marketsData?.data || []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Market Yönetimi
          </h1>
          <p style={{ color: '#888888' }}>Marketleri görüntüleyin, düzenleyin ve kapatın</p>
        </div>
        <Link 
          to="/markets/create"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: '#ccff33', color: '#000000' }}
        >
          <Plus className="w-5 h-5" />
          Yeni Market
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Toplam Market</p>
          <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{markets.length}</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Açık Marketler</p>
          <p className="text-2xl font-bold" style={{ color: '#00ff00' }}>
            {markets.filter(m => m.status === 'open').length}
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Kapalı Marketler</p>
          <p className="text-2xl font-bold" style={{ color: '#ffa500' }}>
            {markets.filter(m => m.status === 'closed').length}
          </p>
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {markets.map((market) => (
          <div
            key={market.id}
            className="rounded-2xl p-6 transition-all"
            style={{ 
              backgroundColor: '#1a1a1a',
              border: '1px solid #222222'
            }}
          >
            {/* Market Header */}
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-2 truncate" style={{ color: '#ffffff' }}>
                  {market.title}
                </h3>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: '#888888' }}>
                  {market.description}
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-lg text-xs font-medium flex-shrink-0"
                style={{
                  backgroundColor: 
                    market.status === 'open' ? 'rgba(0, 255, 0, 0.1)' :
                    market.status === 'closed' ? 'rgba(255, 165, 0, 0.1)' :
                    'rgba(128, 128, 128, 0.1)',
                  color:
                    market.status === 'open' ? '#00ff00' :
                    market.status === 'closed' ? '#ffa500' :
                    '#808080'
                }}
              >
                {market.status === 'open' ? 'Açık' :
                 market.status === 'closed' ? 'Kapandı' :
                 'Sonuçlandı'}
              </span>
            </div>

            {/* Market Info */}
            <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#888888' }}>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(market.closing_date).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>₺{parseFloat(market.volume || 0).toFixed(2)}</span>
              </div>
              {market.category && (
                <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#222222' }}>
                  {market.category}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {market.status !== 'resolved' && (
                <button
                  onClick={() => handleEditClick(market)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 flex items-center gap-2"
                  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                  title="Düzenle"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Düzenle</span>
                </button>
              )}

              {market.status === 'open' && (
                <button
                  onClick={() => closeMarketMutation.mutate(market.id)}
                  disabled={closeMarketMutation.isPending}
                  className="flex-1 min-w-[120px] px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: '#ffa500', color: '#ffffff' }}
                >
                  {closeMarketMutation.isPending ? 'Kapatılıyor...' : 'Kapat'}
                </button>
              )}

              {market.status === 'closed' && (
                <button
                  onClick={() => navigate('/market-resolution')}
                  className="flex-1 min-w-[120px] px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#ccff33', color: '#000000' }}
                >
                  <span>Çözümle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {market.status === 'resolved' && (
                <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Tamamlandı</span>
                </div>
              )}

              <button
                onClick={() => {
                  if (confirm('Bu marketi silmek istediğinizden emin misiniz?')) {
                    deleteMarketMutation.mutate(market.id)
                  }
                }}
                disabled={deleteMarketMutation.isPending}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: '#FF0000', color: '#ffffff' }}
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {markets.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(204, 255, 51, 0.1)' }}>
            <TrendingUp className="w-8 h-8" style={{ color: '#ccff33' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>
            Henüz market bulunmuyor
          </h3>
          <p className="mb-6" style={{ color: '#888888' }}>
            İlk marketinizi oluşturmak için butona tıklayın
          </p>
          <Link 
            to="/markets/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: '#ccff33', color: '#000000' }}
          >
            <Plus className="w-5 h-5" />
            Yeni Market Oluştur
          </Link>
        </div>
      )}

      {/* Edit Modal */}
      {editingMarket && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="rounded-2xl p-6 max-w-2xl w-full my-8" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#ffffff' }}>
              Market Düzenle
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#888888' }}>
                  Başlık
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: '#222222', color: '#ffffff', border: '1px solid #333333' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#888888' }}>
                  Açıklama
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg h-24"
                  style={{ backgroundColor: '#222222', color: '#ffffff', border: '1px solid #333333' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#888888' }}>
                  Kategori
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: '#222222', color: '#ffffff', border: '1px solid #333333' }}
                  required
                >
                  <option value="politics">Siyaset</option>
                  <option value="sports">Spor</option>
                  <option value="crypto">Kripto</option>
                  <option value="economy">Ekonomi</option>
                  <option value="entertainment">Eğlence</option>
                  <option value="technology">Teknoloji</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#888888' }}>
                  Kapanış Tarihi
                </label>
                <input
                  type="date"
                  value={editFormData.closing_date}
                  onChange={(e) => setEditFormData({ ...editFormData, closing_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: '#222222', color: '#ffffff', border: '1px solid #333333' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#888888' }}>
                  Görsel URL
                </label>
                <input
                  type="text"
                  value={editFormData.image_url}
                  onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: '#222222', color: '#ffffff', border: '1px solid #333333' }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updateMarketMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: '#ccff33', color: '#000000' }}
                >
                  {updateMarketMutation.isPending ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMarket(null)}
                  className="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: '#333333', color: '#ffffff' }}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
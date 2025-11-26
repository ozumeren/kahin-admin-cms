// admin-cms/src/pages/MarketHealthPage.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Activity, AlertTriangle, TrendingDown, Play, Pause, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export default function MarketHealthPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [pauseReason, setPauseReason] = useState('')

  // Fetch low liquidity markets
  const { data: liquidityData, isLoading } = useQuery({
    queryKey: ['lowLiquidityMarkets'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/markets/low-liquidity')
      return res.data.data
    }
  })

  // Fetch paused markets
  const { data: pausedData, isLoading: pausedLoading } = useQuery({
    queryKey: ['pausedMarkets'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/markets/paused')
      return res.data.data
    }
  })

  // Pause market mutation
  const pauseMutation = useMutation({
    mutationFn: async ({ marketId, reason }) => {
      const res = await apiClient.post(`/admin/markets/${marketId}/pause`, { reason })
      return res.data
    },
    onSuccess: () => {
      toast.success('Market başarıyla durduruldu')
      queryClient.invalidateQueries(['lowLiquidityMarkets'])
      queryClient.invalidateQueries(['pausedMarkets'])
      setSelectedMarket(null)
      setPauseReason('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hata oluştu')
    }
  })

  // Resume market mutation
  const resumeMutation = useMutation({
    mutationFn: async (marketId) => {
      const res = await apiClient.post(`/admin/markets/${marketId}/resume`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Market başarıyla aktif edildi')
      queryClient.invalidateQueries(['lowLiquidityMarkets'])
      queryClient.invalidateQueries(['pausedMarkets'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hata oluştu')
    }
  })

  const handlePause = (market) => {
    setSelectedMarket(market)
  }

  const confirmPause = () => {
    if (!pauseReason.trim()) {
      toast.error('Lütfen durdurma sebebi girin')
      return
    }
    pauseMutation.mutate({
      marketId: selectedMarket.marketId,
      reason: pauseReason
    })
  }

  const handleResume = (marketId) => {
    if (confirm('Bu marketi aktif etmek istediğinize emin misiniz?')) {
      resumeMutation.mutate(marketId)
    }
  }

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return '#00ff00'
      case 'moderate':
        return '#ffff00'
      case 'warning':
        return '#ff9900'
      case 'critical':
        return '#ff0000'
      case 'paused':
        return '#888888'
      default:
        return '#888888'
    }
  }

  const getHealthStatusLabel = (status) => {
    switch (status) {
      case 'healthy':
        return 'Sağlıklı'
      case 'moderate':
        return 'Orta'
      case 'warning':
        return 'Uyarı'
      case 'critical':
        return 'Kritik'
      case 'paused':
        return 'Durduruldu'
      default:
        return 'Bilinmiyor'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#ccff33' }} />
      </div>
    )
  }

  const markets = liquidityData?.markets || []
  const criteria = liquidityData?.criteria || {}
  const pausedMarkets = pausedData?.markets || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Market Sağlığı & Likidite
          </h1>
          <p style={{ color: '#888888' }}>
            Düşük likidite ve sağlık sorunları olan marketleri yönetin
          </p>
        </div>
      </div>

      {/* Criteria Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Min Derinlik</p>
          <p className="text-lg font-bold" style={{ color: '#ffffff' }}>{criteria.minDepth}</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Max Spread</p>
          <p className="text-lg font-bold" style={{ color: '#ffffff' }}>{criteria.maxSpread}%</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Min 24h Hacim</p>
          <p className="text-lg font-bold" style={{ color: '#ffffff' }}>₺{criteria.minVolume24h}</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-xs mb-1" style={{ color: '#888888' }}>Toplam Sorunlu Market</p>
          <p className="text-lg font-bold" style={{ color: '#ff9900' }}>{markets.length}</p>
        </div>
      </div>

      {/* Markets List */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
        <div className="p-6 border-b" style={{ borderColor: '#222222' }}>
          <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
            Sorunlu Marketler ({markets.length})
          </h2>
        </div>

        {markets.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4" style={{ color: '#00ff00' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>
              Harika! Tüm marketler sağlıklı
            </p>
            <p style={{ color: '#888888' }}>
              Şu anda likidite sorunu olan market bulunmuyor
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ divideColor: '#222222' }}>
            {markets.map((market) => (
              <div key={market.marketId} className="p-6 hover:bg-opacity-50 transition-all" style={{ backgroundColor: 'transparent' }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>
                        {market.marketTitle}
                      </h3>
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{
                          backgroundColor: getHealthStatusColor(market.healthStatus),
                          color: '#000000'
                        }}
                      >
                        {getHealthStatusLabel(market.healthStatus)}
                      </span>
                      {market.isPaused && (
                        <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#888888', color: '#000000' }}>
                          DURDURULDU
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-3" style={{ color: '#888888' }}>
                      Sağlık Skoru: {market.healthScore}/100
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {market.isPaused ? (
                      <button
                        onClick={() => handleResume(market.marketId)}
                        disabled={resumeMutation.isPending}
                        className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all hover:opacity-80"
                        style={{ backgroundColor: '#00ff00', color: '#000000' }}
                      >
                        <Play className="w-4 h-4" />
                        Aktif Et
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePause(market)}
                        disabled={pauseMutation.isPending}
                        className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all hover:opacity-80"
                        style={{ backgroundColor: '#ff0000', color: '#ffffff' }}
                      >
                        <Pause className="w-4 h-4" />
                        Durdur
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#111111' }}>
                    <p className="text-xs mb-1" style={{ color: '#888888' }}>Toplam Derinlik</p>
                    <p className="font-bold" style={{ color: '#ffffff' }}>{market.liquidity?.totalDepth || 0}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#111111' }}>
                    <p className="text-xs mb-1" style={{ color: '#888888' }}>Ortalama Spread</p>
                    <p className="font-bold" style={{ color: '#ffffff' }}>{market.spreads?.avgSpreadPercent || 'N/A'}%</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#111111' }}>
                    <p className="text-xs mb-1" style={{ color: '#888888' }}>24h Hacim</p>
                    <p className="font-bold" style={{ color: '#ffffff' }}>₺{market.volume24h || 0}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#111111' }}>
                    <p className="text-xs mb-1" style={{ color: '#888888' }}>24h İşlem</p>
                    <p className="font-bold" style={{ color: '#ffffff' }}>{market.tradesCount24h || 0}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#111111' }}>
                    <p className="text-xs mb-1" style={{ color: '#888888' }}>Son İşlem</p>
                    <p className="text-xs font-bold" style={{ color: '#ffffff' }}>
                      {market.lastTrade?.timeSince?.formatted || 'Yok'}
                    </p>
                  </div>
                </div>

                {/* Warnings */}
                {market.liquidityWarnings && market.liquidityWarnings.length > 0 && (
                  <div className="space-y-2">
                    {market.liquidityWarnings.map((warning, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 rounded-lg"
                        style={{
                          backgroundColor: warning.severity === 'high' ? 'rgba(255, 0, 0, 0.1)' :
                                          warning.severity === 'medium' ? 'rgba(255, 153, 0, 0.1)' :
                                          'rgba(255, 255, 0, 0.1)',
                          border: `1px solid ${warning.severity === 'high' ? '#ff0000' :
                                               warning.severity === 'medium' ? '#ff9900' :
                                               '#ffff00'}`
                        }}
                      >
                        <AlertTriangle
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          style={{
                            color: warning.severity === 'high' ? '#ff0000' :
                                   warning.severity === 'medium' ? '#ff9900' :
                                   '#ffff00'
                          }}
                        />
                        <p className="text-sm" style={{ color: '#ffffff' }}>
                          {warning.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paused Markets Section */}
      {pausedMarkets.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1a1a1a', border: '1px solid #ff9900' }}>
          <div className="p-6 border-b" style={{ borderColor: '#222222', backgroundColor: 'rgba(255, 153, 0, 0.1)' }}>
            <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
              Durdurulmuş Marketler ({pausedMarkets.length})
            </h2>
            <p className="text-sm mt-1" style={{ color: '#888888' }}>
              Bu marketler manuel olarak durduruldu ve işlem kabul etmiyor
            </p>
          </div>

          <div className="divide-y" style={{ divideColor: '#222222' }}>
            {pausedMarkets.map((market) => (
              <div key={market.id} className="p-6 hover:bg-opacity-50 transition-all" style={{ backgroundColor: 'transparent' }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>
                        {market.title}
                      </h3>
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ backgroundColor: '#888888', color: '#000000' }}
                      >
                        DURDURULDU
                      </span>
                    </div>

                    {/* Pause Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#ff9900' }}>
                        <Pause className="w-4 h-4" />
                        <span>Durdurulma: {market.pausedDuration?.formatted}</span>
                      </div>
                      {market.pauseReason && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
                          <p className="text-xs mb-1" style={{ color: '#888888' }}>Sebep:</p>
                          <p className="text-sm" style={{ color: '#ffffff' }}>{market.pauseReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleResume(market.id)}
                    disabled={resumeMutation.isPending}
                    className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all hover:opacity-80"
                    style={{ backgroundColor: '#00ff00', color: '#000000' }}
                  >
                    <Play className="w-4 h-4" />
                    Aktif Et
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {selectedMarket && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Marketi Durdur
            </h3>
            <p className="mb-4" style={{ color: '#888888' }}>
              {selectedMarket.marketTitle}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                Durdurma Sebebi
              </label>
              <textarea
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Örn: Düşük likidite, araştırma gerekiyor"
                rows={3}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #333333',
                  color: '#ffffff'
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedMarket(null)
                  setPauseReason('')
                }}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#333333', color: '#ffffff' }}
              >
                İptal
              </button>
              <button
                onClick={confirmPause}
                disabled={pauseMutation.isPending}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#ff0000', color: '#ffffff' }}
              >
                {pauseMutation.isPending ? 'Durduruluyor...' : 'Durdur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

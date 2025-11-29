import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle, Calendar, RotateCcw } from 'lucide-react'
import apiClient from '../lib/apiClient'

export default function MarketResolutionPage() {
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [previewOutcome, setPreviewOutcome] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [resolveData, setResolveData] = useState({
    outcome: null,
    notes: '',
    evidence: ''
  })

  const queryClient = useQueryClient()

  // Fetch resolvable markets (closed or ready to resolve)
  const { data: marketsData, isLoading } = useQuery({
    queryKey: ['resolvableMarkets'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/markets', {
        params: { status: 'closed' }
      })
      // Backend response: { success: true, data: [...] }
      // axios already unwraps to res.data, so we access res.data.data
      return { markets: res.data.data || [] }
    }
  })

  // Fetch scheduled resolutions
  const { data: scheduledData } = useQuery({
    queryKey: ['scheduledResolutions'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/markets/scheduled-resolutions')
      return res.data.data || []
    }
  })

  // Preview resolution mutation
  const previewMutation = useMutation({
    mutationFn: async ({ marketId, outcome }) => {
      const res = await apiClient.get(`/admin/markets/${marketId}/resolution-preview`, {
        params: { outcome }
      })
      return res.data.data
    },
    onSuccess: (data) => {
      setPreviewOutcome(data)
      setShowPreview(true)
    }
  })

  // Resolve market mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ marketId, data }) => {
      const res = await apiClient.post(`/admin/markets/${marketId}/resolve-enhanced`, data)
      return res.data
    },
    onSuccess: () => {
      // Tüm ilgili sayfaları güncelle
      queryClient.invalidateQueries(['resolvableMarkets'])
      queryClient.invalidateQueries(['scheduledResolutions'])
      queryClient.invalidateQueries(['adminMarkets']) // Marketler sayfası
      queryClient.invalidateQueries(['adminDashboard']) // Dashboard
      setShowResolveForm(false)
      setShowPreview(false)
      setSelectedMarket(null)
      setResolveData({ outcome: null, notes: '', evidence: '' })
    }
  })

  // Schedule resolution mutation
  const scheduleMutation = useMutation({
    mutationFn: async ({ marketId, data }) => {
      const res = await apiClient.post(`/admin/markets/${marketId}/schedule-resolution`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledResolutions'])
    }
  })

  const handlePreview = (market, outcome) => {
    setSelectedMarket(market)
    previewMutation.mutate({ marketId: market.id, outcome })
  }

  const handleResolve = () => {
    if (!selectedMarket || resolveData.outcome === null) return

    resolveMutation.mutate({
      marketId: selectedMarket.id,
      data: {
        outcome: resolveData.outcome,
        notes: resolveData.notes,
        evidence: resolveData.evidence,
        resolvedBy: 'current-admin-id' // This should come from auth context
      }
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getOutcomeLabel = (outcome) => {
    if (outcome === null || outcome === 'null') return 'REFUND'
    if (outcome === true || outcome === 'true') return 'YES'
    if (outcome === false || outcome === 'false') return 'NO'
    return outcome
  }

  if (isLoading) {
    return (
      <div style={{ padding: '24px', color: '#cccccc' }}>
        Yükleniyor...
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#ccff33', marginBottom: '8px' }}>
          Market Çözümlemesi
        </h1>
        <p style={{ color: '#888888' }}>
          Kapalı marketleri sonuçlandırın, kanıt ekleyin ve ödemeleri yönetin
        </p>
      </div>

      {/* Scheduled Resolutions */}
      {scheduledData && scheduledData.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calendar size={20} color="#ccff33" />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#cccccc' }}>
              Zamanlanmış Çözümlemeler ({scheduledData.length})
            </h2>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {scheduledData.map(market => (
              <div
                key={market.id}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffa500',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cccccc', marginBottom: '8px' }}>
                      {market.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#888888' }}>
                      <span>Çözüm Zamanı: {formatDate(market.scheduled_resolution_at)}</span>
                      <span>Sonuç: {getOutcomeLabel(market.scheduled_resolution_outcome)}</span>
                    </div>
                    {market.scheduled_resolution_notes && (
                      <p style={{ marginTop: '8px', fontSize: '14px', color: '#888888' }}>
                        {market.scheduled_resolution_notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolvable Markets */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#cccccc', marginBottom: '16px' }}>
          Çözümlenebilir Marketler ({marketsData?.markets?.length || 0})
        </h2>

        {!marketsData?.markets || marketsData.markets.length === 0 ? (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <FileText size={48} color="#666666" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#888888' }}>Çözümlenecek market bulunmuyor</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {marketsData.markets.map(market => (
              <div
                key={market.id}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  padding: '16px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ccff33'
                  e.currentTarget.style.backgroundColor = '#0f0f0f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333333'
                  e.currentTarget.style.backgroundColor = '#1a1a1a'
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cccccc', marginBottom: '4px' }}>
                    {market.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#888888' }}>
                    Kapanış: {formatDate(market.closing_date)}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handlePreview(market, true)}
                    disabled={previewMutation.isPending}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#22c55e',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <CheckCircle size={16} />
                    Önizle (YES)
                  </button>

                  <button
                    onClick={() => handlePreview(market, false)}
                    disabled={previewMutation.isPending}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <XCircle size={16} />
                    Önizle (NO)
                  </button>

                  <button
                    onClick={() => handlePreview(market, null)}
                    disabled={previewMutation.isPending}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#f59e0b',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <RotateCcw size={16} />
                    Önizle (REFUND)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewOutcome && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ccff33', marginBottom: '8px' }}>
                Çözüm Önizlemesi
              </h2>
              <h3 style={{ fontSize: '18px', color: '#cccccc', marginBottom: '16px' }}>
                {previewOutcome.market.title}
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#0a0a0a',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '14px', color: '#888888' }}>Sonuç:</span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: previewOutcome.resolution.outcome === 'YES' ? '#22c55e' :
                         previewOutcome.resolution.outcome === 'NO' ? '#ef4444' : '#f59e0b'
                }}>
                  {previewOutcome.resolution.outcome}
                </span>
                {previewOutcome.resolution.type === 'partial' && (
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: '#f59e0b',
                    color: '#000000',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    Para İadesi
                  </span>
                )}
              </div>

              {/* Impact Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', backgroundColor: '#0a0a0a', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>Toplam Katılımcı</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#cccccc' }}>
                    {previewOutcome.impact.totalHolders}
                  </p>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#0a0a0a', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>Toplam Ödeme</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ccff33' }}>
                    {previewOutcome.impact.totalPayout} TL
                  </p>
                </div>
                {previewOutcome.resolution.type !== 'partial' && (
                  <>
                    <div style={{ padding: '12px', backgroundColor: '#0a0a0a', borderRadius: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>Kazanan</p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>
                        {previewOutcome.impact.winnersCount}
                      </p>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#0a0a0a', borderRadius: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>Kaybeden</p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
                        {previewOutcome.impact.losersCount}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Winners List */}
              {previewOutcome.winners.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', color: '#22c55e', marginBottom: '8px', fontWeight: '600' }}>
                    {previewOutcome.resolution.type === 'partial' ? 'Para İadesi Alacaklar' : 'Kazananlar'}
                    {previewOutcome.hasMore.winners && ' (İlk 10)'}
                  </h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {previewOutcome.winners.map((winner, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          backgroundColor: '#0a0a0a',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '14px', color: '#cccccc', fontWeight: '500' }}>
                            {winner.username}
                          </p>
                          <p style={{ fontSize: '12px', color: '#888888' }}>
                            {winner.shares} hisse ({winner.outcome})
                          </p>
                        </div>
                        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#22c55e' }}>
                          +{winner.payout.toFixed(2)} TL
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Losers List */}
              {previewOutcome.losers.length > 0 && previewOutcome.resolution.type !== 'partial' && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', color: '#ef4444', marginBottom: '8px', fontWeight: '600' }}>
                    Kaybedenler {previewOutcome.hasMore.losers && '(İlk 10)'}
                  </h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {previewOutcome.losers.map((loser, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          backgroundColor: '#0a0a0a',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '14px', color: '#cccccc', fontWeight: '500' }}>
                            {loser.username}
                          </p>
                          <p style={{ fontSize: '12px', color: '#888888' }}>
                            {loser.shares} hisse ({loser.outcome})
                          </p>
                        </div>
                        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>
                          -{loser.loss.toFixed(2)} TL
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Orders Warning */}
              {previewOutcome.impact.openOrdersToCancel > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#7c2d12',
                  border: '1px solid #ea580c',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <AlertTriangle size={20} color="#f97316" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: '#fed7aa', fontWeight: '500', marginBottom: '4px' }}>
                      Açık Emirler İptal Edilecek
                    </p>
                    <p style={{ fontSize: '13px', color: '#fdba74' }}>
                      {previewOutcome.impact.openOrdersToCancel} açık emir iptal edilecek ve para iadesi yapılacak
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#333333',
                  color: '#cccccc',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setShowResolveForm(true)
                  setResolveData({
                    outcome: previewOutcome.resolution.outcome === 'YES' ? true :
                             previewOutcome.resolution.outcome === 'NO' ? false : null,
                    notes: '',
                    evidence: ''
                  })
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ccff33',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Form Modal */}
      {showResolveForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '24px'
          }}
          onClick={() => setShowResolveForm(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ccff33', marginBottom: '24px' }}>
              Market Çözümle
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#cccccc', marginBottom: '8px', fontWeight: '500' }}>
                Çözüm Notları
              </label>
              <textarea
                value={resolveData.notes}
                onChange={(e) => setResolveData({ ...resolveData, notes: e.target.value })}
                placeholder="Bu çözüm hakkında notlar ekleyin..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333333',
                  borderRadius: '6px',
                  color: '#cccccc',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#cccccc', marginBottom: '8px', fontWeight: '500' }}>
                Kanıt (URL veya Açıklama)
              </label>
              <textarea
                value={resolveData.evidence}
                onChange={(e) => setResolveData({ ...resolveData, evidence: e.target.value })}
                placeholder="Çözümü destekleyen kanıtları ekleyin (URL, haber linkleri, vb.)"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333333',
                  borderRadius: '6px',
                  color: '#cccccc',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowResolveForm(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#333333',
                  color: '#cccccc',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                İptal
              </button>
              <button
                onClick={handleResolve}
                disabled={resolveMutation.isPending}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ccff33',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: resolveMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: resolveMutation.isPending ? 0.6 : 1,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => !resolveMutation.isPending && (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => !resolveMutation.isPending && (e.currentTarget.style.opacity = '1')}
              >
                {resolveMutation.isPending ? 'Çözümleniyor...' : 'Çözümle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

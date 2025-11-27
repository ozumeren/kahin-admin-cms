import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Clock, CheckCircle, XCircle, Flag, TrendingUp, MessageSquare } from 'lucide-react'
import apiClient from '../lib/apiClient'

export default function DisputeManagementPage() {
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    status: '',
    reviewNotes: '',
    resolutionAction: '',
    resolutionNotes: ''
  })

  const queryClient = useQueryClient()

  // Fetch disputes with filters
  const { data: disputesData, isLoading } = useQuery({
    queryKey: ['disputes', statusFilter, priorityFilter],
    queryFn: async () => {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (priorityFilter !== 'all') params.priority = priorityFilter

      const res = await apiClient.get('/admin/disputes', { params })
      return res.data
    }
  })

  // Fetch dispute stats
  const { data: statsData } = useQuery({
    queryKey: ['disputeStats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/disputes/stats')
      return res.data.data
    }
  })

  // Update dispute status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ disputeId, data }) => {
      const res = await apiClient.patch(`/admin/disputes/${disputeId}/status`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['disputes'])
      queryClient.invalidateQueries(['disputeStats'])
      setShowReviewModal(false)
      setSelectedDispute(null)
      setReviewForm({ status: '', reviewNotes: '', resolutionAction: '', resolutionNotes: '' })
    }
  })

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: async ({ disputeId, priority }) => {
      const res = await apiClient.patch(`/admin/disputes/${disputeId}/priority`, { priority })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['disputes'])
      queryClient.invalidateQueries(['disputeStats'])
    }
  })

  const handleReviewSubmit = () => {
    if (!selectedDispute || !reviewForm.status) return

    updateStatusMutation.mutate({
      disputeId: selectedDispute.id,
      data: reviewForm
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'under_review': return '#3b82f6'
      case 'approved': return '#22c55e'
      case 'rejected': return '#ef4444'
      case 'resolved': return '#8b5cf6'
      default: return '#888888'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'normal': return '#3b82f6'
      case 'low': return '#888888'
      default: return '#888888'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Beklemede',
      'under_review': 'İnceleniyor',
      'approved': 'Onaylandı',
      'rejected': 'Reddedildi',
      'resolved': 'Çözüldü'
    }
    return labels[status] || status
  }

  const getPriorityLabel = (priority) => {
    const labels = {
      'urgent': 'Acil',
      'high': 'Yüksek',
      'normal': 'Normal',
      'low': 'Düşük'
    }
    return labels[priority] || priority
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
          İtiraz Yönetimi
        </h1>
        <p style={{ color: '#888888' }}>
          Kullanıcı itirazlarını inceleyin, önceliklendirin ve çözümleyin
        </p>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', backgroundColor: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MessageSquare size={20} color="#ccff33" />
              <span style={{ fontSize: '14px', color: '#888888' }}>Toplam İtiraz</span>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#cccccc' }}>{statsData.total}</p>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#1a1a1a', border: '1px solid #f59e0b', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock size={20} color="#f59e0b" />
              <span style={{ fontSize: '14px', color: '#888888' }}>Bekleyen</span>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {statsData.needsAttention?.pending || 0}
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#1a1a1a', border: '1px solid #ef4444', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={20} color="#ef4444" />
              <span style={{ fontSize: '14px', color: '#888888' }}>Acil</span>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
              {statsData.needsAttention?.urgent || 0}
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#1a1a1a', border: '1px solid #22c55e', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle size={20} color="#22c55e" />
              <span style={{ fontSize: '14px', color: '#888888' }}>Çözülen</span>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
              {statsData.byStatus?.resolved || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '6px',
            color: '#cccccc',
            fontSize: '14px'
          }}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Beklemede</option>
          <option value="under_review">İnceleniyor</option>
          <option value="approved">Onaylandı</option>
          <option value="rejected">Reddedildi</option>
          <option value="resolved">Çözüldü</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '6px',
            color: '#cccccc',
            fontSize: '14px'
          }}
        >
          <option value="all">Tüm Öncelikler</option>
          <option value="urgent">Acil</option>
          <option value="high">Yüksek</option>
          <option value="normal">Normal</option>
          <option value="low">Düşük</option>
        </select>
      </div>

      {/* Disputes List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {!disputesData?.disputes || disputesData.disputes.length === 0 ? (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <AlertCircle size={48} color="#666666" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#888888' }}>İtiraz bulunmuyor</p>
          </div>
        ) : (
          disputesData.disputes.map(dispute => (
            <div
              key={dispute.id}
              style={{
                backgroundColor: '#1a1a1a',
                border: `1px solid ${getPriorityColor(dispute.priority)}`,
                borderRadius: '8px',
                padding: '16px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cccccc' }}>
                      {dispute.market?.title || 'Market Silinmiş'}
                    </h3>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      backgroundColor: getStatusColor(dispute.status),
                      color: '#000000',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {getStatusLabel(dispute.status)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      backgroundColor: getPriorityColor(dispute.priority),
                      color: '#ffffff',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {getPriorityLabel(dispute.priority)}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                    Kullanıcı: {dispute.user?.username || 'Bilinmeyen'} • {formatDate(dispute.createdAt)}
                  </p>
                  <p style={{ fontSize: '14px', color: '#cccccc', marginBottom: '12px' }}>
                    {dispute.dispute_reason}
                  </p>
                  {dispute.dispute_evidence && (
                    <p style={{ fontSize: '13px', color: '#888888', fontStyle: 'italic' }}>
                      Kanıt: {dispute.dispute_evidence}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setSelectedDispute(dispute)
                    setShowReviewModal(true)
                    setReviewForm({
                      status: dispute.status === 'pending' ? 'under_review' : dispute.status,
                      reviewNotes: dispute.review_notes || '',
                      resolutionAction: dispute.resolution_action || '',
                      resolutionNotes: dispute.resolution_notes || ''
                    })
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  İncele
                </button>

                {dispute.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updatePriorityMutation.mutate({ disputeId: dispute.id, priority: 'high' })}
                      disabled={updatePriorityMutation.isPending}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f59e0b',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Yüksek Öncelik
                    </button>

                    <button
                      onClick={() => updatePriorityMutation.mutate({ disputeId: dispute.id, priority: 'urgent' })}
                      disabled={updatePriorityMutation.isPending}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Acil
                    </button>
                  </>
                )}
              </div>

              {dispute.review_notes && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '6px',
                  borderLeft: '3px solid #3b82f6'
                }}>
                  <p style={{ fontSize: '13px', color: '#888888', marginBottom: '4px' }}>
                    Admin Notu ({dispute.reviewer?.username || 'Admin'}):
                  </p>
                  <p style={{ fontSize: '14px', color: '#cccccc' }}>
                    {dispute.review_notes}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedDispute && (
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
          onClick={() => setShowReviewModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '12px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ccff33', marginBottom: '24px' }}>
              İtirazı İncele
            </h2>

            {/* Dispute Info */}
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#0a0a0a', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                Market: {selectedDispute.market?.title}
              </p>
              <p style={{ fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                Kullanıcı: {selectedDispute.user?.username} ({selectedDispute.user?.email})
              </p>
              <p style={{ fontSize: '14px', color: '#888888', marginBottom: '8px' }}>
                Tür: {selectedDispute.dispute_type}
              </p>
              <p style={{ fontSize: '14px', color: '#cccccc', marginTop: '12px' }}>
                {selectedDispute.dispute_reason}
              </p>
            </div>

            {/* Review Form */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#cccccc', marginBottom: '8px', fontWeight: '500' }}>
                Durum
              </label>
              <select
                value={reviewForm.status}
                onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333333',
                  borderRadius: '6px',
                  color: '#cccccc',
                  fontSize: '14px'
                }}
              >
                <option value="">Seçiniz</option>
                <option value="under_review">İnceleniyor</option>
                <option value="approved">Onayla</option>
                <option value="rejected">Reddet</option>
                <option value="resolved">Çözüldü</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#cccccc', marginBottom: '8px', fontWeight: '500' }}>
                İnceleme Notları
              </label>
              <textarea
                value={reviewForm.reviewNotes}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewNotes: e.target.value })}
                placeholder="İnceleme notlarınızı ekleyin..."
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

            {reviewForm.status === 'resolved' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#cccccc', marginBottom: '8px', fontWeight: '500' }}>
                    Çözüm Aksiyonu
                  </label>
                  <select
                    value={reviewForm.resolutionAction}
                    onChange={(e) => setReviewForm({ ...reviewForm, resolutionAction: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #333333',
                      borderRadius: '6px',
                      color: '#cccccc',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Seçiniz</option>
                    <option value="no_action">Aksiyon Yok</option>
                    <option value="market_corrected">Market Düzeltildi</option>
                    <option value="partial_refund">Kısmi İade</option>
                    <option value="full_refund">Tam İade</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#cccccc', marginBottom: '8px', fontWeight: '500' }}>
                    Çözüm Notları
                  </label>
                  <textarea
                    value={reviewForm.resolutionNotes}
                    onChange={(e) => setReviewForm({ ...reviewForm, resolutionNotes: e.target.value })}
                    placeholder="Çözüm detaylarını açıklayın..."
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
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#333333',
                  color: '#cccccc',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                İptal
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={!reviewForm.status || updateStatusMutation.isPending}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ccff33',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: !reviewForm.status || updateStatusMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: !reviewForm.status || updateStatusMutation.isPending ? 0.6 : 1
                }}
              >
                {updateStatusMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

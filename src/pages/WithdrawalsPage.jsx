// admin-cms/src/pages/WithdrawalsPage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Banknote, Filter, Check, X, Clock, Search, AlertCircle } from 'lucide-react'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export default function WithdrawalsPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    status: 'all',
    userId: '',
    page: 1
  })
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState('approve') // 'approve' or 'reject'

  // Fetch withdrawals
  const { data: withdrawalsData, isLoading } = useQuery({
    queryKey: ['withdrawals', filters],
    queryFn: async () => {
      const params = { page: filters.page, limit: 50 }
      if (filters.status !== 'all') params.status = filters.status
      if (filters.userId) params.userId = filters.userId

      const res = await apiClient.get('/admin/withdrawals', { params })
      return res.data
    }
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      const res = await apiClient.post(`/admin/withdrawals/${id}/approve`, { notes })
      return res.data
    },
    onSuccess: () => {
      toast.success('Withdrawal approved successfully')
      queryClient.invalidateQueries(['withdrawals'])
      setShowReviewModal(false)
      setSelectedWithdrawal(null)
      setReviewNotes('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve withdrawal')
    }
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      const res = await apiClient.post(`/admin/withdrawals/${id}/reject`, { notes })
      return res.data
    },
    onSuccess: () => {
      toast.success('Withdrawal rejected')
      queryClient.invalidateQueries(['withdrawals'])
      setShowReviewModal(false)
      setSelectedWithdrawal(null)
      setReviewNotes('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject withdrawal')
    }
  })

  const handleReview = () => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes')
      return
    }

    const mutation = reviewAction === 'approve' ? approveMutation : rejectMutation
    mutation.mutate({
      id: selectedWithdrawal.id,
      notes: reviewNotes
    })
  }

  const openReviewModal = (withdrawal, action) => {
    setSelectedWithdrawal(withdrawal)
    setReviewAction(action)
    setReviewNotes('')
    setShowReviewModal(true)
  }

  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'approved': '#22c55e',
      'rejected': '#ef4444',
      'processing': '#3b82f6',
      'completed': '#10b981'
    }
    return colors[status] || '#888888'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Beklemede',
      'approved': 'Onaylandı',
      'rejected': 'Reddedildi',
      'processing': 'İşleniyor',
      'completed': 'Tamamlandı'
    }
    return labels[status] || status
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'bank_transfer': 'Banka Transferi',
      'credit_card': 'Kredi Kartı',
      'digital_wallet': 'Dijital Cüzdan'
    }
    return labels[method] || method
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
          Para Çekme Yönetimi
        </h1>
        <p style={{ color: '#888888' }}>
          Kullanıcı para çekme taleplerini onaylayın veya reddedin
        </p>
      </div>

      {/* Pending Withdrawals Alert */}
      {withdrawalsData && withdrawalsData.withdrawals.filter(w => w.status === 'pending').length > 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} color="#f59e0b" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>
              {withdrawalsData.withdrawals.filter(w => w.status === 'pending').length} bekleyen para çekme talebi var
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        padding: '20px',
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Filter size={20} color="#ccff33" />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cccccc' }}>
            Filtreler
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#888888', marginBottom: '6px' }}>
              Durum
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #333333',
                borderRadius: '6px',
                color: '#cccccc',
                fontSize: '14px'
              }}
            >
              <option value="all">Tümü</option>
              <option value="pending">Beklemede</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
              <option value="processing">İşleniyor</option>
              <option value="completed">Tamamlandı</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#888888', marginBottom: '6px' }}>
              Kullanıcı ID
            </label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value, page: 1 })}
              placeholder="UUID"
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #333333',
                borderRadius: '6px',
                color: '#cccccc',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Withdrawals List */}
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #333333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Banknote size={20} color="#ccff33" />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cccccc' }}>
              Para Çekme Talepleri
            </h3>
          </div>
          {withdrawalsData && (
            <p style={{ fontSize: '14px', color: '#888888' }}>
              Toplam: {withdrawalsData.total} talep
            </p>
          )}
        </div>

        {!withdrawalsData?.withdrawals || withdrawalsData.withdrawals.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <Search size={48} color="#666666" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#888888' }}>Para çekme talebi bulunamadı</p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {withdrawalsData.withdrawals.map((withdrawal, index) => (
              <div
                key={withdrawal.id}
                style={{
                  padding: '16px',
                  borderBottom: index < withdrawalsData.withdrawals.length - 1 ? '1px solid #333333' : 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f0f0f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        backgroundColor: getStatusColor(withdrawal.status),
                        color: '#ffffff',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {getStatusLabel(withdrawal.status)}
                      </span>
                      <p style={{ fontSize: '14px', color: '#cccccc', fontWeight: '500' }}>
                        {withdrawal.User?.username || 'Unknown User'}
                      </p>
                    </div>
                    <p style={{ fontSize: '13px', color: '#888888', marginBottom: '4px' }}>
                      {withdrawal.User?.email}
                    </p>
                    <p style={{ fontSize: '13px', color: '#888888', marginBottom: '8px' }}>
                      {getPaymentMethodLabel(withdrawal.paymentMethod)}
                    </p>
                    {withdrawal.bankDetails && (
                      <div style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>
                        IBAN: {withdrawal.bankDetails.iban || 'N/A'}
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#666666' }}>
                      {formatDate(withdrawal.createdAt)}
                    </p>
                    {withdrawal.reviewNotes && (
                      <p style={{ fontSize: '13px', color: '#888888', marginTop: '8px', fontStyle: 'italic' }}>
                        Not: {withdrawal.reviewNotes}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
                      -{formatCurrency(withdrawal.amount)} ₺
                    </p>
                    {withdrawal.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openReviewModal(withdrawal, 'approve')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={14} />
                          Onayla
                        </button>
                        <button
                          onClick={() => openReviewModal(withdrawal, 'reject')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <X size={14} />
                          Reddet
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {withdrawalsData && withdrawalsData.totalPages > 1 && (
          <div style={{ padding: '16px', borderTop: '1px solid #333333', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
              disabled={filters.page === 1}
              style={{
                padding: '8px 16px',
                backgroundColor: filters.page === 1 ? '#333333' : '#ccff33',
                color: filters.page === 1 ? '#666666' : '#000000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: filters.page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Önceki
            </button>
            <span style={{ padding: '8px 16px', color: '#cccccc' }}>
              Sayfa {filters.page} / {withdrawalsData.totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: Math.min(withdrawalsData.totalPages, filters.page + 1) })}
              disabled={filters.page === withdrawalsData.totalPages}
              style={{
                padding: '8px 16px',
                backgroundColor: filters.page === withdrawalsData.totalPages ? '#333333' : '#ccff33',
                color: filters.page === withdrawalsData.totalPages ? '#666666' : '#000000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: filters.page === withdrawalsData.totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Sonraki
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                {reviewAction === 'approve' ? 'Para Çekme Onayı' : 'Para Çekme Reddi'}
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="p-2" style={{ color: '#888888' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: '#888888' }}>Kullanıcı:</p>
              <p className="font-semibold" style={{ color: '#ffffff' }}>{selectedWithdrawal.User?.username}</p>
              <p className="text-sm" style={{ color: '#888888' }}>{selectedWithdrawal.User?.email}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: '#888888' }}>Miktar:</p>
              <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                {formatCurrency(selectedWithdrawal.amount)} ₺
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                Not <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={reviewAction === 'approve' ? 'Onay notunu girin...' : 'Red sebebini girin...'}
                rows="3"
                className="w-full px-4 py-3 rounded-xl font-medium resize-none"
                style={{
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  border: '1px solid #333333'
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all"
                style={{ backgroundColor: '#333333', color: '#ffffff' }}
              >
                İptal
              </button>
              <button
                onClick={handleReview}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                style={{
                  backgroundColor: reviewAction === 'approve' ? '#22c55e' : '#ef4444',
                  color: '#ffffff'
                }}
              >
                {approveMutation.isPending || rejectMutation.isPending ? 'İşleniyor...' : (reviewAction === 'approve' ? 'Onayla' : 'Reddet')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

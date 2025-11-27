// admin-cms/src/pages/DepositsPage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wallet, Filter, Check, X, Search, AlertCircle, Plus, FileText } from 'lucide-react'
import apiClient from '../api/client'
import toast from 'react-hot-toast'

export default function DepositsPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    status: 'all',
    userId: '',
    referenceNumber: '',
    page: 1
  })
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState('verify') // 'verify' or 'reject'

  // Create deposit form
  const [createForm, setCreateForm] = useState({
    userId: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    referenceNumber: '',
    proofUrl: ''
  })

  // Fetch deposits
  const { data: depositsData, isLoading } = useQuery({
    queryKey: ['deposits', filters],
    queryFn: async () => {
      const params = { page: filters.page, limit: 50 }
      if (filters.status !== 'all') params.status = filters.status
      if (filters.userId) params.userId = filters.userId
      if (filters.referenceNumber) params.referenceNumber = filters.referenceNumber

      const res = await apiClient.get('/admin/deposits', { params })
      return res.data
    }
  })

  // Create deposit mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/admin/deposits', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Deposit created successfully')
      queryClient.invalidateQueries(['deposits'])
      setShowCreateModal(false)
      setCreateForm({
        userId: '',
        amount: '',
        paymentMethod: 'bank_transfer',
        referenceNumber: '',
        proofUrl: ''
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create deposit')
    }
  })

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      const res = await apiClient.post(`/admin/deposits/${id}/verify`, { notes })
      return res.data
    },
    onSuccess: () => {
      toast.success('Deposit verified and balance credited')
      queryClient.invalidateQueries(['deposits'])
      setShowReviewModal(false)
      setSelectedDeposit(null)
      setReviewNotes('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to verify deposit')
    }
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      const res = await apiClient.post(`/admin/deposits/${id}/reject`, { notes })
      return res.data
    },
    onSuccess: () => {
      toast.success('Deposit rejected')
      queryClient.invalidateQueries(['deposits'])
      setShowReviewModal(false)
      setSelectedDeposit(null)
      setReviewNotes('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject deposit')
    }
  })

  const handleReview = () => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes')
      return
    }

    const mutation = reviewAction === 'verify' ? verifyMutation : rejectMutation
    mutation.mutate({
      id: selectedDeposit.id,
      notes: reviewNotes
    })
  }

  const handleCreateDeposit = () => {
    if (!createForm.userId || !createForm.amount) {
      toast.error('User ID and Amount are required')
      return
    }

    createMutation.mutate({
      ...createForm,
      amount: parseFloat(createForm.amount)
    })
  }

  const openReviewModal = (deposit, action) => {
    setSelectedDeposit(deposit)
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
      'verified': '#22c55e',
      'rejected': '#ef4444',
      'processing': '#3b82f6'
    }
    return colors[status] || '#888888'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Beklemede',
      'verified': 'Onaylandı',
      'rejected': 'Reddedildi',
      'processing': 'İşleniyor'
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
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#ccff33', marginBottom: '8px' }}>
            Para Yatırma İzleme
          </h1>
          <p style={{ color: '#888888' }}>
            Kullanıcı para yatırma taleplerini doğrulayın veya reddedin
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ccff33',
            color: '#000000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} />
          Yeni Para Yatırma
        </button>
      </div>

      {/* Pending Deposits Alert */}
      {depositsData && depositsData.deposits.filter(d => d.status === 'pending').length > 0 && (
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
              {depositsData.deposits.filter(d => d.status === 'pending').length} bekleyen para yatırma talebi var
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
              <option value="verified">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
              <option value="processing">İşleniyor</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#888888', marginBottom: '6px' }}>
              Referans No
            </label>
            <input
              type="text"
              value={filters.referenceNumber}
              onChange={(e) => setFilters({ ...filters, referenceNumber: e.target.value, page: 1 })}
              placeholder="Referans numarası"
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

      {/* Deposits List */}
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #333333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={20} color="#ccff33" />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cccccc' }}>
              Para Yatırma Talepleri
            </h3>
          </div>
          {depositsData && (
            <p style={{ fontSize: '14px', color: '#888888' }}>
              Toplam: {depositsData.total} talep
            </p>
          )}
        </div>

        {!depositsData?.deposits || depositsData.deposits.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <Search size={48} color="#666666" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#888888' }}>Para yatırma talebi bulunamadı</p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {depositsData.deposits.map((deposit, index) => (
              <div
                key={deposit.id}
                style={{
                  padding: '16px',
                  borderBottom: index < depositsData.deposits.length - 1 ? '1px solid #333333' : 'none',
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
                        backgroundColor: getStatusColor(deposit.status),
                        color: '#ffffff',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {getStatusLabel(deposit.status)}
                      </span>
                      <p style={{ fontSize: '14px', color: '#cccccc', fontWeight: '500' }}>
                        {deposit.User?.username || 'Unknown User'}
                      </p>
                    </div>
                    <p style={{ fontSize: '13px', color: '#888888', marginBottom: '4px' }}>
                      {deposit.User?.email}
                    </p>
                    <p style={{ fontSize: '13px', color: '#888888', marginBottom: '8px' }}>
                      {getPaymentMethodLabel(deposit.paymentMethod)}
                    </p>
                    {deposit.referenceNumber && (
                      <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} />
                        Ref: {deposit.referenceNumber}
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#666666' }}>
                      {formatDate(deposit.createdAt)}
                    </p>
                    {deposit.verificationNotes && (
                      <p style={{ fontSize: '13px', color: '#888888', marginTop: '8px', fontStyle: 'italic' }}>
                        Not: {deposit.verificationNotes}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>
                      +{formatCurrency(deposit.amount)} ₺
                    </p>
                    {deposit.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openReviewModal(deposit, 'verify')}
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
                          onClick={() => openReviewModal(deposit, 'reject')}
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
        {depositsData && depositsData.totalPages > 1 && (
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
              Sayfa {filters.page} / {depositsData.totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: Math.min(depositsData.totalPages, filters.page + 1) })}
              disabled={filters.page === depositsData.totalPages}
              style={{
                padding: '8px 16px',
                backgroundColor: filters.page === depositsData.totalPages ? '#333333' : '#ccff33',
                color: filters.page === depositsData.totalPages ? '#666666' : '#000000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: filters.page === depositsData.totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Sonraki
            </button>
          </div>
        )}
      </div>

      {/* Create Deposit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                Yeni Para Yatırma Kaydı
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2" style={{ color: '#888888' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Kullanıcı ID <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  placeholder="UUID"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: '1px solid #333333'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Miktar (₺) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: '1px solid #333333'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Ödeme Yöntemi
                </label>
                <select
                  value={createForm.paymentMethod}
                  onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: '1px solid #333333'
                  }}
                >
                  <option value="bank_transfer">Banka Transferi</option>
                  <option value="credit_card">Kredi Kartı</option>
                  <option value="digital_wallet">Dijital Cüzdan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Referans Numarası
                </label>
                <input
                  type="text"
                  value={createForm.referenceNumber}
                  onChange={(e) => setCreateForm({ ...createForm, referenceNumber: e.target.value })}
                  placeholder="İşlem referans numarası"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: '1px solid #333333'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Dekont URL
                </label>
                <input
                  type="text"
                  value={createForm.proofUrl}
                  onChange={(e) => setCreateForm({ ...createForm, proofUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    border: '1px solid #333333'
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all"
                style={{ backgroundColor: '#333333', color: '#ffffff' }}
              >
                İptal
              </button>
              <button
                onClick={handleCreateDeposit}
                disabled={createMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                style={{ backgroundColor: '#ccff33', color: '#000000' }}
              >
                {createMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                {reviewAction === 'verify' ? 'Para Yatırma Onayı' : 'Para Yatırma Reddi'}
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="p-2" style={{ color: '#888888' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: '#888888' }}>Kullanıcı:</p>
              <p className="font-semibold" style={{ color: '#ffffff' }}>{selectedDeposit.User?.username}</p>
              <p className="text-sm" style={{ color: '#888888' }}>{selectedDeposit.User?.email}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: '#888888' }}>Miktar:</p>
              <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                +{formatCurrency(selectedDeposit.amount)} ₺
              </p>
            </div>

            {selectedDeposit.referenceNumber && (
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: '#888888' }}>Referans:</p>
                <p className="text-sm font-mono" style={{ color: '#cccccc' }}>
                  {selectedDeposit.referenceNumber}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                Not <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={reviewAction === 'verify' ? 'Onay notunu girin...' : 'Red sebebini girin...'}
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
                disabled={verifyMutation.isPending || rejectMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                style={{
                  backgroundColor: reviewAction === 'verify' ? '#22c55e' : '#ef4444',
                  color: '#ffffff'
                }}
              >
                {verifyMutation.isPending || rejectMutation.isPending ? 'İşleniyor...' : (reviewAction === 'verify' ? 'Onayla' : 'Reddet')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Receipt, Filter, AlertCircle, Search } from 'lucide-react'
import apiClient from '../lib/apiClient'

export default function TransactionsPage() {
  const [filters, setFilters] = useState({
    type: 'all',
    userId: '',
    minAmount: '',
    maxAmount: '',
    page: 1
  })

  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = { page: filters.page, limit: 50 }
      if (filters.type !== 'all') params.type = filters.type
      if (filters.userId) params.userId = filters.userId
      if (filters.minAmount) params.minAmount = filters.minAmount
      if (filters.maxAmount) params.maxAmount = filters.maxAmount

      const res = await apiClient.get('/admin/transactions', { params })
      return res.data
    }
  })

  // Fetch large transactions
  const { data: largeTransactionsData } = useQuery({
    queryKey: ['largeTransactions'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/transactions/large', {
        params: { threshold: 10000, limit: 10 }
      })
      return res.data
    }
  })

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

  const getTransactionTypeColor = (type) => {
    const colors = {
      'deposit': '#22c55e',
      'withdrawal': '#ef4444',
      'trade': '#3b82f6',
      'payout': '#8b5cf6',
      'refund': '#f59e0b',
      'fee': '#ccff33',
      'correction': '#ec4899',
      'compensation': '#10b981',
      'penalty': '#dc2626'
    }
    return colors[type] || '#888888'
  }

  const getTransactionTypeLabel = (type) => {
    const labels = {
      'deposit': 'Para Yatırma',
      'withdrawal': 'Para Çekme',
      'trade': 'İşlem',
      'payout': 'Ödeme',
      'refund': 'İade',
      'fee': 'Komisyon',
      'correction': 'Düzeltme',
      'compensation': 'Tazminat',
      'penalty': 'Ceza'
    }
    return labels[type] || type
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
          İşlem İzleme
        </h1>
        <p style={{ color: '#888888' }}>
          Tüm platform işlemlerini görüntüleyin ve filtreleyin
        </p>
      </div>

      {/* Large Transactions Alert */}
      {largeTransactionsData && largeTransactionsData.count > 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
            <AlertCircle size={20} color="#f59e0b" />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>
                Büyük İşlemler ({largeTransactionsData.count})
              </h3>
              <p style={{ fontSize: '13px', color: '#888888', marginBottom: '12px' }}>
                {largeTransactionsData.threshold} TL ve üzeri işlemler
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {largeTransactionsData.transactions.slice(0, 5).map(tx => (
              <div
                key={tx.id}
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
                  <p style={{ fontSize: '14px', color: '#cccccc', fontWeight: '500', marginBottom: '4px' }}>
                    {tx.username} • {getTransactionTypeLabel(tx.type)}
                  </p>
                  <p style={{ fontSize: '12px', color: '#888888' }}>
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: getTransactionTypeColor(tx.type) }}>
                  {formatCurrency(tx.amount)} ₺
                </p>
              </div>
            ))}
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
              İşlem Tipi
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
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
              <option value="deposit">Para Yatırma</option>
              <option value="withdrawal">Para Çekme</option>
              <option value="trade">İşlem</option>
              <option value="payout">Ödeme</option>
              <option value="refund">İade</option>
              <option value="fee">Komisyon</option>
              <option value="correction">Düzeltme</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#888888', marginBottom: '6px' }}>
              Min Tutar (₺)
            </label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => setFilters({ ...filters, minAmount: e.target.value, page: 1 })}
              placeholder="0"
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
              Max Tutar (₺)
            </label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value, page: 1 })}
              placeholder="∞"
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

      {/* Transactions List */}
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #333333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={20} color="#ccff33" />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cccccc' }}>
              İşlemler
            </h3>
          </div>
          {transactionsData && (
            <p style={{ fontSize: '14px', color: '#888888' }}>
              Toplam: {transactionsData.total} işlem
            </p>
          )}
        </div>

        {!transactionsData?.transactions || transactionsData.transactions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <Search size={48} color="#666666" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#888888' }}>İşlem bulunamadı</p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {transactionsData.transactions.map((tx, index) => (
              <div
                key={tx.id}
                style={{
                  padding: '16px',
                  borderBottom: index < transactionsData.transactions.length - 1 ? '1px solid #333333' : 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f0f0f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        backgroundColor: getTransactionTypeColor(tx.type),
                        color: tx.type === 'fee' ? '#000000' : '#ffffff',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {getTransactionTypeLabel(tx.type)}
                      </span>
                      <p style={{ fontSize: '14px', color: '#cccccc', fontWeight: '500' }}>
                        {tx.username || 'Bilinmeyen Kullanıcı'}
                      </p>
                    </div>
                    <p style={{ fontSize: '13px', color: '#888888', marginBottom: '4px' }}>
                      {tx.email}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666666' }}>
                      {formatDate(tx.createdAt)}
                    </p>
                    {tx.description && (
                      <p style={{ fontSize: '13px', color: '#888888', marginTop: '8px', fontStyle: 'italic' }}>
                        {tx.description}
                      </p>
                    )}
                    {tx.marketTitle && (
                      <p style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>
                        Market: {tx.marketTitle}
                      </p>
                    )}
                  </div>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: getTransactionTypeColor(tx.type) }}>
                    {formatCurrency(tx.amount)} ₺
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {transactionsData && transactionsData.totalPages > 1 && (
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
              Sayfa {filters.page} / {transactionsData.totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: Math.min(transactionsData.totalPages, filters.page + 1) })}
              disabled={filters.page === transactionsData.totalPages}
              style={{
                padding: '8px 16px',
                backgroundColor: filters.page === transactionsData.totalPages ? '#333333' : '#ccff33',
                color: filters.page === transactionsData.totalPages ? '#666666' : '#000000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: filters.page === transactionsData.totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

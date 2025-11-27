// admin-cms/src/pages/UsersManagePage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users as UsersIcon, Shield, DollarSign, X, Eye, Activity, Lock, Unlock, Plus, Minus } from 'lucide-react'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export default function UsersManagePage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [balanceReason, setBalanceReason] = useState('')
  const [balanceType, setBalanceType] = useState('increase') // 'increase' or 'decrease'
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/users?search=${searchQuery}`)
      return response.data.data
    }
  })

  const users = usersData?.users || []

  // Fetch balance history for selected user
  const { data: balanceHistory } = useQuery({
    queryKey: ['userBalanceHistory', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return null
      const response = await apiClient.get(`/admin/users/${selectedUser.id}/balance/history`)
      return response.data.data
    },
    enabled: !!selectedUser?.id && showDetailModal
  })

  const adjustBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount, reason, type }) => {
      const adjustmentAmount = type === 'decrease' ? -Math.abs(amount) : Math.abs(amount)
      const response = await apiClient.post(`/admin/users/${userId}/balance/adjust`, {
        amount: adjustmentAmount,
        reason,
        type: type === 'decrease' ? 'correction' : 'compensation'
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Bakiye başarıyla güncellendi')
      queryClient.invalidateQueries(['adminUsers'])
      queryClient.invalidateQueries(['userBalanceHistory'])
      setSelectedUser(null)
      setBalanceAmount('')
      setBalanceReason('')
      setShowBalanceModal(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bakiye güncellenirken hata oluştu')
    }
  })

  const freezeBalanceMutation = useMutation({
    mutationFn: async ({ userId, reason }) => {
      const response = await apiClient.post(`/admin/users/${userId}/balance/freeze`, { reason })
      return response.data
    },
    onSuccess: () => {
      toast.success('Bakiye donduruldu')
      queryClient.invalidateQueries(['adminUsers'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bakiye dondurulurken hata oluştu')
    }
  })

  const unfreezeBalanceMutation = useMutation({
    mutationFn: async ({ userId, reason }) => {
      const response = await apiClient.post(`/admin/users/${userId}/balance/unfreeze`, { reason })
      return response.data
    },
    onSuccess: () => {
      toast.success('Bakiye çözüldü')
      queryClient.invalidateQueries(['adminUsers'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bakiye çözülürken hata oluştu')
    }
  })

  const promoteToAdminMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.patch(`/admin/users/${userId}/promote`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Kullanıcı admin yapıldı')
      queryClient.invalidateQueries(['adminUsers'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Admin yapılırken hata oluştu')
    }
  })

  const demoteFromAdminMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.patch(`/admin/users/${userId}/demote`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Admin yetkisi kaldırıldı')
      queryClient.invalidateQueries(['adminUsers'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Admin yetkisi kaldırılırken hata oluştu')
    }
  })

  const handleAdjustBalance = () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      toast.error('Geçerli bir miktar girin')
      return
    }
    if (!balanceReason || balanceReason.trim() === '') {
      toast.error('Lütfen bir sebep belirtin')
      return
    }
    adjustBalanceMutation.mutate({
      userId: selectedUser.id,
      amount: parseFloat(balanceAmount),
      reason: balanceReason,
      type: balanceType
    })
  }

  const handleFreezeBalance = () => {
    const reason = prompt('Bakiye dondurma sebebini girin:')
    if (!reason || reason.trim() === '') {
      toast.error('Lütfen bir sebep belirtin')
      return
    }
    freezeBalanceMutation.mutate({
      userId: selectedUser.id,
      reason
    })
  }

  const handleUnfreezeBalance = () => {
    const reason = prompt('Bakiye çözme sebebini girin:')
    if (!reason || reason.trim() === '') {
      toast.error('Lütfen bir sebep belirtin')
      return
    }
    unfreezeBalanceMutation.mutate({
      userId: selectedUser.id,
      reason
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ccff33' }}></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Kullanıcı Yönetimi
          </h1>
          <p style={{ color: '#888888' }}>Kullanıcıları yönetin ve bakiye ekleyin</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#888888' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kullanıcı ara (isim veya e-posta)..."
            className="w-full pl-12 pr-4 py-3 rounded-xl font-medium"
            style={{ 
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #333333'
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Toplam Kullanıcı</p>
          <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{users.length}</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Admin Kullanıcılar</p>
          <p className="text-2xl font-bold" style={{ color: '#ccff33' }}>
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Toplam Bakiye</p>
          <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
            ₺{users.reduce((sum, u) => sum + parseFloat(u.balance || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #222222', backgroundColor: '#111111' }}>
              <th className="p-4 text-left text-sm font-semibold" style={{ color: '#ffffff' }}>Kullanıcı</th>
              <th className="p-4 text-left text-sm font-semibold" style={{ color: '#ffffff' }}>E-posta</th>
              <th className="p-4 text-left text-sm font-semibold" style={{ color: '#ffffff' }}>Bakiye</th>
              <th className="p-4 text-left text-sm font-semibold" style={{ color: '#ffffff' }}>Rol</th>
              <th className="p-4 text-right text-sm font-semibold" style={{ color: '#ffffff' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #222222' }}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(204, 255, 51, 0.1)' }}>
                      <UsersIcon className="w-5 h-5" style={{ color: '#ccff33' }} />
                    </div>
                    <span className="font-medium" style={{ color: '#ffffff' }}>{user.username}</span>
                  </div>
                </td>
                <td className="p-4" style={{ color: '#888888' }}>{user.email}</td>
                <td className="p-4">
                  <span className="font-semibold" style={{ color: '#10b981' }}>
                    ₺{parseFloat(user.balance || 0).toFixed(2)}
                  </span>
                </td>
                <td className="p-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium" 
                    style={{
                      backgroundColor: user.role === 'admin' ? '#ccff33' : '#333333',
                      color: user.role === 'admin' ? '#000000' : '#ffffff'
                    }}
                  >
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowDetailModal(true)
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                      title="Detayları Gör"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowBalanceModal(true)
                        setShowDetailModal(false)
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ backgroundColor: '#ccff33', color: '#000000' }}
                      title="Bakiye Yönet"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    {user.role !== 'admin' ? (
                      <button
                        onClick={() => promoteToAdminMutation.mutate(user.id)}
                        disabled={promoteToAdminMutation.isPending}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                        style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                        title="Admin Yap"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm(`${user.username} kullanıcısının admin yetkisini kaldırmak istediğinizden emin misiniz?`)) {
                            demoteFromAdminMutation.mutate(user.id)
                          }
                        }}
                        disabled={demoteFromAdminMutation.isPending}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                        style={{ backgroundColor: '#FF0000', color: '#ffffff' }}
                        title="Admin Yetkisini Kaldır"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(204, 255, 51, 0.1)' }}>
              <UsersIcon className="w-8 h-8" style={{ color: '#ccff33' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>
              Kullanıcı bulunamadı
            </h3>
            <p style={{ color: '#888888' }}>
              Arama kriterlerinize uygun kullanıcı bulun amadı.
            </p>
          </div>
        )}
      </div>

      {/* Balance Management Modal */}
      {selectedUser && showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                Bakiye Yönetimi
              </h3>
              <button onClick={() => {
                setSelectedUser(null)
                setShowBalanceModal(false)
                setBalanceAmount('')
                setBalanceReason('')
                setBalanceType('increase')
              }} className="p-2" style={{ color: '#888888' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: '#888888' }}>Kullanıcı:</p>
              <p className="font-semibold" style={{ color: '#ffffff' }}>{selectedUser.username}</p>
              <p className="text-sm" style={{ color: '#888888' }}>{selectedUser.email}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: '#888888' }}>Mevcut Bakiye:</p>
              <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                ₺{parseFloat(selectedUser.balance || 0).toFixed(2)}
              </p>
            </div>

            {/* Balance Adjustment Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                İşlem Tipi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBalanceType('increase')}
                  className="px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: balanceType === 'increase' ? '#10b981' : '#111111',
                    color: '#ffffff',
                    border: balanceType === 'increase' ? '2px solid #10b981' : '1px solid #333333'
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Artır
                </button>
                <button
                  onClick={() => setBalanceType('decrease')}
                  className="px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: balanceType === 'decrease' ? '#ef4444' : '#111111',
                    color: '#ffffff',
                    border: balanceType === 'decrease' ? '2px solid #ef4444' : '1px solid #333333'
                  }}
                >
                  <Minus className="w-4 h-4" />
                  Azalt
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                Miktar
              </label>
              <input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 rounded-xl font-medium"
                style={{
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  border: '1px solid #333333'
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                Sebep <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={balanceReason}
                onChange={(e) => setBalanceReason(e.target.value)}
                placeholder="İşlem sebebini belirtin..."
                rows="3"
                className="w-full px-4 py-3 rounded-xl font-medium resize-none"
                style={{
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  border: '1px solid #333333'
                }}
              />
            </div>

            {/* Freeze/Unfreeze Buttons */}
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
              <p className="text-sm font-medium mb-3" style={{ color: '#888888' }}>
                Bakiye Kontrolü
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleFreezeBalance}
                  disabled={freezeBalanceMutation.isPending}
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#f59e0b', color: '#000000' }}
                >
                  <Lock className="w-4 h-4" />
                  Dondur
                </button>
                <button
                  onClick={handleUnfreezeBalance}
                  disabled={unfreezeBalanceMutation.isPending}
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                >
                  <Unlock className="w-4 h-4" />
                  Çöz
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setShowBalanceModal(false)
                  setBalanceAmount('')
                  setBalanceReason('')
                  setBalanceType('increase')
                }}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all"
                style={{ backgroundColor: '#333333', color: '#ffffff' }}
              >
                İptal
              </button>
              <button
                onClick={handleAdjustBalance}
                disabled={adjustBalanceMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                style={{
                  backgroundColor: balanceType === 'increase' ? '#10b981' : '#ef4444',
                  color: '#ffffff'
                }}
              >
                {adjustBalanceMutation.isPending ? 'İşleniyor...' : (balanceType === 'increase' ? 'Bakiye Artır' : 'Bakiye Azalt')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="rounded-2xl p-6 max-w-3xl w-full my-8" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                Kullanıcı Detayları
              </h3>
              <button onClick={() => {
                setSelectedUser(null)
                setShowDetailModal(false)
              }} className="p-2" style={{ color: '#888888' }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Profile Card */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(204, 255, 51, 0.1)' }}>
                    <UsersIcon className="w-8 h-8" style={{ color: '#ccff33' }} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1" style={{ color: '#ffffff' }}>
                      {selectedUser.username}
                    </h4>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: selectedUser.role === 'admin' ? '#ccff33' : '#333333',
                        color: selectedUser.role === 'admin' ? '#000000' : '#ffffff'
                      }}
                    >
                      {selectedUser.role === 'admin' ? 'ADMIN' : 'USER'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#888888' }}>E-posta</p>
                    <p className="font-medium" style={{ color: '#ffffff' }}>{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#888888' }}>Kullanıcı ID</p>
                    <p className="font-mono text-sm" style={{ color: '#888888' }}>#{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#888888' }}>Kayıt Tarihi</p>
                    <p className="text-sm" style={{ color: '#888888' }}>
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Balance Card */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <DollarSign className="w-6 h-6" style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#888888' }}>Mevcut Bakiye</p>
                    <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
                      ₺{parseFloat(selectedUser.balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t" style={{ borderColor: '#222222' }}>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setShowBalanceModal(true)
                    }}
                    className="w-full px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#ccff33', color: '#000000' }}
                  >
                    <DollarSign className="w-4 h-4" />
                    Bakiye Yönet
                  </button>
                </div>
              </div>
            </div>

            {/* Balance History Section */}
            <div className="mb-6">
              <h4 className="text-lg font-bold mb-4" style={{ color: '#ffffff' }}>
                Bakiye Geçmişi
              </h4>
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
                {balanceHistory && balanceHistory.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {balanceHistory.slice(0, 10).map((transaction, index) => {
                      const isPositive = parseFloat(transaction.amount) > 0
                      return (
                        <div
                          key={transaction.id}
                          className="p-4"
                          style={{
                            borderBottom: index < Math.min(balanceHistory.length, 10) - 1 ? '1px solid #222222' : 'none'
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1" style={{ color: '#ffffff' }}>
                                {transaction.type === 'deposit' && 'Para Yatırma'}
                                {transaction.type === 'withdrawal' && 'Para Çekme'}
                                {transaction.type === 'trade' && 'İşlem'}
                                {transaction.type === 'payout' && 'Ödeme'}
                                {transaction.type === 'refund' && 'İade'}
                                {transaction.type === 'fee' && 'Komisyon'}
                                {transaction.type === 'correction' && 'Düzeltme'}
                                {transaction.type === 'compensation' && 'Tazminat'}
                                {transaction.type === 'penalty' && 'Ceza'}
                              </p>
                              {transaction.description && (
                                <p className="text-xs" style={{ color: '#888888' }}>
                                  {transaction.description}
                                </p>
                              )}
                              <p className="text-xs mt-1" style={{ color: '#666666' }}>
                                {new Date(transaction.createdAt).toLocaleString('tr-TR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <p
                              className="text-lg font-bold"
                              style={{ color: isPositive ? '#10b981' : '#ef4444' }}
                            >
                              {isPositive ? '+' : ''}₺{parseFloat(transaction.amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: '#666666' }} />
                    <p className="text-sm" style={{ color: '#888888' }}>
                      Henüz işlem geçmişi yok
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedUser.role !== 'admin' ? (
                <button
                  onClick={() => {
                    promoteToAdminMutation.mutate(selectedUser.id)
                    setShowDetailModal(false)
                    setSelectedUser(null)
                  }}
                  disabled={promoteToAdminMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                >
                  <Shield className="w-4 h-4" />
                  Admin Yap
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (confirm(`${selectedUser.username} kullanıcısının admin yetkisini kaldırmak istediğinizden emin misiniz?`)) {
                      demoteFromAdminMutation.mutate(selectedUser.id)
                      setShowDetailModal(false)
                      setSelectedUser(null)
                    }
                  }}
                  disabled={demoteFromAdminMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#FF0000', color: '#ffffff' }}
                >
                  <Shield className="w-4 h-4" />
                  Admin Yetkisini Kaldır
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setShowDetailModal(false)
                }}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#333333', color: '#ffffff' }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
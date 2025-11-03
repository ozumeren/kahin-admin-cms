// admin-cms/src/pages/UsersManagePage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users as UsersIcon, Shield, DollarSign, X, Eye, TrendingUp, Activity } from 'lucide-react'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export default function UsersManagePage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/users?search=${searchQuery}`)
      return response.data.data
    }
  })

  const users = usersData?.users || []

  const addBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount }) => {
      const response = await apiClient.post(`/admin/users/${userId}/add-balance`, {
        amount: parseFloat(amount),
        description: 'Admin tarafından eklenen bakiye'
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Bakiye başarıyla eklendi')
      queryClient.invalidateQueries(['adminUsers'])
      setSelectedUser(null)
      setBalanceAmount('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bakiye eklenirken hata oluştu')
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

  const handleAddBalance = () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      toast.error('Geçerli bir miktar girin')
      return
    }
    addBalanceMutation.mutate({
      userId: selectedUser.id,
      amount: balanceAmount
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
                        setShowDetailModal(false)
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ backgroundColor: '#ccff33', color: '#000000' }}
                      title="Bakiye Ekle"
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

      {/* Add Balance Modal */}
      {selectedUser && !showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                Bakiye Ekle
              </h3>
              <button onClick={() => setSelectedUser(null)} className="p-2" style={{ color: '#888888' }}>
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

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                Eklenecek Miktar
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

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all"
                style={{ backgroundColor: '#333333', color: '#ffffff' }}
              >
                İptal
              </button>
              <button
                onClick={handleAddBalance}
                disabled={addBalanceMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                style={{ backgroundColor: '#ccff33', color: '#000000' }}
              >
                {addBalanceMutation.isPending ? 'Ekleniyor...' : 'Bakiye Ekle'}
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
                    onClick={() => setShowDetailModal(false)}
                    className="w-full px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#ccff33', color: '#000000' }}
                  >
                    <DollarSign className="w-4 h-4" />
                    Bakiye Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
                <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: '#ccff33' }} />
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Toplam İşlem</p>
                <p className="text-xl font-bold" style={{ color: '#ffffff' }}>-</p>
                <p className="text-xs mt-1" style={{ color: '#666666' }}>Yakında</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
                <Activity className="w-6 h-6 mx-auto mb-2" style={{ color: '#3b82f6' }} />
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Aktif Pozisyon</p>
                <p className="text-xl font-bold" style={{ color: '#ffffff' }}>-</p>
                <p className="text-xs mt-1" style={{ color: '#666666' }}>Yakında</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
                <DollarSign className="w-6 h-6 mx-auto mb-2" style={{ color: '#10b981' }} />
                <p className="text-xs mb-1" style={{ color: '#888888' }}>Toplam Kar/Zarar</p>
                <p className="text-xl font-bold" style={{ color: '#ffffff' }}>-</p>
                <p className="text-xs mt-1" style={{ color: '#666666' }}>Yakında</p>
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
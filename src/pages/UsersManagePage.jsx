// src/pages/UsersManagePage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, DollarSign, Shield, Users as UsersIcon } from 'lucide-react'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export default function UsersManagePage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [balanceAmount, setBalanceAmount] = useState('')

  // Kullanıcıları getir
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/users?search=${searchQuery}`)
      return response.data.data
    }
  })

  // Bakiye ekleme
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

  // Admin yapma
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
      toast.error(error.response?.data?.message || 'İşlem başarısız')
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
      <div className="rounded-2xl shadow-md p-12 text-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#ccff33' }}></div>
        <p style={{ color: '#ffffff' }}>Yükleniyor...</p>
      </div>
    )
  }

  const users = usersData || []

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>Kullanıcı Yönetimi</h2>
        <p className="text-sm" style={{ color: '#888888' }}>
          Kullanıcıları görüntüleyin ve yönetin
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
            style={{ color: '#888888' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kullanıcı ara (email, username)..."
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
            <tr style={{ borderBottom: '1px solid #222222' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: '#888888' }}>Kullanıcı</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: '#888888' }}>Email</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: '#888888' }}>Bakiye</th>
              <th className="text-center p-4 text-sm font-medium" style={{ color: '#888888' }}>Rol</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: '#888888' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #222222' }}>
                <td className="p-4">
                  <div>
                    <p className="font-semibold" style={{ color: '#ffffff' }}>{user.username}</p>
                    <p className="text-xs" style={{ color: '#666666' }}>
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm" style={{ color: '#888888' }}>{user.email}</p>
                </td>
                <td className="p-4 text-right">
                  <p className="font-semibold" style={{ color: '#10b981' }}>
                    ₺{parseFloat(user.balance || 0).toFixed(2)}
                  </p>
                </td>
                <td className="p-4 text-center">
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
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{ backgroundColor: '#ccff33', color: '#000000' }}
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => promoteToAdminMutation.mutate(user.id)}
                        disabled={promoteToAdminMutation.isPending}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
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
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Kullanıcı bulunamadı</h3>
            <p className="text-sm" style={{ color: '#888888' }}>
              Arama kriterlerinize uygun kullanıcı bulunamadı
            </p>
          </div>
        )}
      </div>

      {/* Add Balance Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="rounded-2xl shadow-2xl p-8 max-w-md w-full"
            style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>
              Bakiye Ekle
            </h2>

            <div className="mb-6">
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
                <p className="text-sm mb-1" style={{ color: '#888888' }}>Kullanıcı</p>
                <p className="font-semibold" style={{ color: '#ffffff' }}>{selectedUser.username}</p>
                <p className="text-sm" style={{ color: '#888888' }}>{selectedUser.email}</p>
              </div>

              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
                <p className="text-sm mb-1" style={{ color: '#888888' }}>Mevcut Bakiye</p>
                <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                  ₺{parseFloat(selectedUser.balance || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                  Eklenecek Miktar (₺)
                </label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="100.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #333333'
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setBalanceAmount('')
                }}
                className="flex-1 px-4 py-3 rounded-xl font-medium"
                style={{ backgroundColor: '#333333', color: '#ffffff' }}
              >
                İptal
              </button>
              <button
                onClick={handleAddBalance}
                disabled={addBalanceMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl font-medium disabled:opacity-50"
                style={{ backgroundColor: '#ccff33', color: '#000000' }}
              >
                {addBalanceMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
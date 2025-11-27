import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wallet, TrendingUp, Lock, AlertTriangle, DollarSign, Users, BarChart3 } from 'lucide-react'
import apiClient from '../lib/apiClient'

export default function TreasuryPage() {
  const [selectedTab, setSelectedTab] = useState('overview') // 'overview', 'negative', 'top-holders'

  // Fetch treasury overview
  const { data: treasuryData, isLoading: treasuryLoading } = useQuery({
    queryKey: ['treasuryOverview'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/treasury/overview')
      return res.data.data
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  // Fetch liquidity status
  const { data: liquidityData } = useQuery({
    queryKey: ['liquidityStatus'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/treasury/liquidity')
      return res.data.data
    },
    refetchInterval: 30000
  })

  // Fetch negative balances
  const { data: negativeBalancesData } = useQuery({
    queryKey: ['negativeBalances'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/treasury/negative-balances')
      return res.data.data
    },
    enabled: selectedTab === 'negative'
  })

  // Fetch top holders
  const { data: topHoldersData } = useQuery({
    queryKey: ['topHolders'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/treasury/top-holders')
      return res.data.data
    },
    enabled: selectedTab === 'top-holders'
  })

  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const getLiquidityStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#22c55e'
      case 'warning': return '#f59e0b'
      case 'critical': return '#ef4444'
      default: return '#888888'
    }
  }

  if (treasuryLoading) {
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
          Platform Treasury
        </h1>
        <p style={{ color: '#888888' }}>
          Platform bakiyesi, likidite durumu ve finansal özet
        </p>
      </div>

      {/* Liquidity Status Alert */}
      {liquidityData && liquidityData.status !== 'healthy' && (
        <div style={{
          padding: '16px',
          backgroundColor: liquidityData.status === 'critical' ? '#7c2d12' : '#78350f',
          border: `1px solid ${getLiquidityStatusColor(liquidityData.status)}`,
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'start',
          gap: '12px'
        }}>
          <AlertTriangle size={24} color={getLiquidityStatusColor(liquidityData.status)} />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
              Likidite Uyarısı
            </h3>
            <p style={{ fontSize: '14px', color: '#fed7aa' }}>
              {liquidityData.message}
            </p>
            <p style={{ fontSize: '13px', color: '#fdba74', marginTop: '8px' }}>
              Kullanım Oranı: %{liquidityData.utilizationRate}
            </p>
          </div>
        </div>
      )}

      {/* Treasury Overview Cards */}
      {treasuryData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #ccff33',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Wallet size={24} color="#ccff33" />
              <span style={{ fontSize: '14px', color: '#888888', fontWeight: '500' }}>
                Platform Toplam Bakiye
              </span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ccff33', marginBottom: '4px' }}>
              {formatCurrency(treasuryData.platformBalance)} ₺
            </p>
            <p style={{ fontSize: '12px', color: '#666666' }}>
              {treasuryData.activeUsers} aktif kullanıcı
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #3b82f6',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Users size={24} color="#3b82f6" />
              <span style={{ fontSize: '14px', color: '#888888', fontWeight: '500' }}>
                Kullanıcı Bakiyeleri
              </span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
              {formatCurrency(treasuryData.totalUserBalances)} ₺
            </p>
            <p style={{ fontSize: '12px', color: '#666666' }}>
              Kullanılabilir bakiye
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #f59e0b',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Lock size={24} color="#f59e0b" />
              <span style={{ fontSize: '14px', color: '#888888', fontWeight: '500' }}>
                Kilitli Fonlar
              </span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
              {formatCurrency(treasuryData.lockedFunds)} ₺
            </p>
            <p style={{ fontSize: '12px', color: '#666666' }}>
              Emirler: {formatCurrency(treasuryData.lockedInOrders)} ₺ • Pozisyonlar: {formatCurrency(treasuryData.lockedInPositions)} ₺
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #22c55e',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <TrendingUp size={24} color="#22c55e" />
              <span style={{ fontSize: '14px', color: '#888888', fontWeight: '500' }}>
                Platform Kar (30 Gün)
              </span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e', marginBottom: '4px' }}>
              {formatCurrency(treasuryData.platformProfit30d)} ₺
            </p>
            <p style={{ fontSize: '12px', color: '#666666' }}>
              Komisyon gelirleri
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #8b5cf6',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <BarChart3 size={24} color="#8b5cf6" />
              <span style={{ fontSize: '14px', color: '#888888', fontWeight: '500' }}>
                Aktif Marketler
              </span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
              {treasuryData.activeMarkets}
            </p>
            <p style={{ fontSize: '12px', color: '#666666' }}>
              Toplam: {treasuryData.totalMarkets} market
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            border: `1px solid ${getLiquidityStatusColor(liquidityData?.status)}`,
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <DollarSign size={24} color={getLiquidityStatusColor(liquidityData?.status)} />
              <span style={{ fontSize: '14px', color: '#888888', fontWeight: '500' }}>
                Likidite Durumu
              </span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: getLiquidityStatusColor(liquidityData?.status), marginBottom: '4px' }}>
              {liquidityData?.status === 'healthy' ? '✓ Sağlıklı' :
               liquidityData?.status === 'warning' ? '⚠ Uyarı' : '✗ Kritik'}
            </p>
            <p style={{ fontSize: '12px', color: '#666666' }}>
              Kullanım: %{liquidityData?.utilizationRate || '0'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #333333' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            onClick={() => setSelectedTab('overview')}
            style={{
              padding: '12px 0',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: selectedTab === 'overview' ? '2px solid #ccff33' : '2px solid transparent',
              color: selectedTab === 'overview' ? '#ccff33' : '#888888',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Genel Bakış
          </button>
          <button
            onClick={() => setSelectedTab('negative')}
            style={{
              padding: '12px 0',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: selectedTab === 'negative' ? '2px solid #ccff33' : '2px solid transparent',
              color: selectedTab === 'negative' ? '#ccff33' : '#888888',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Negatif Bakiyeler
          </button>
          <button
            onClick={() => setSelectedTab('top-holders')}
            style={{
              padding: '12px 0',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: selectedTab === 'top-holders' ? '2px solid #ccff33' : '2px solid transparent',
              color: selectedTab === 'top-holders' ? '#ccff33' : '#888888',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            En Yüksek Bakiyeler
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && treasuryData && (
        <div style={{
          padding: '24px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333333',
          borderRadius: '12px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#cccccc', marginBottom: '16px' }}>
            Platform İstatistikleri
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#888888', marginBottom: '4px' }}>Toplam Platform Bakiyesi</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#cccccc' }}>
                {formatCurrency(treasuryData.platformBalance)} ₺
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#888888', marginBottom: '4px' }}>Kullanılabilir Likidite</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#cccccc' }}>
                {formatCurrency(treasuryData.availableLiquidity)} ₺
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#888888', marginBottom: '4px' }}>Aktif Kullanıcılar</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#cccccc' }}>
                {treasuryData.activeUsers}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#888888', marginBottom: '4px' }}>30 Günlük Platform Karı</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>
                {formatCurrency(treasuryData.platformProfit30d)} ₺
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'negative' && (
        <div>
          {!negativeBalancesData || negativeBalancesData.length === 0 ? (
            <div style={{
              padding: '32px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#22c55e', fontSize: '16px' }}>
                ✓ Negatif bakiye yok
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #333333' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>
                  ⚠ {negativeBalancesData.length} Kullanıcıda Negatif Bakiye
                </h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {negativeBalancesData.map(user => (
                  <div
                    key={user.id}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #333333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#cccccc', marginBottom: '4px' }}>
                        {user.username}
                      </p>
                      <p style={{ fontSize: '12px', color: '#888888' }}>
                        {user.email}
                      </p>
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
                      {formatCurrency(user.balance)} ₺
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'top-holders' && topHoldersData && (
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333333',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #333333' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ccff33' }}>
              💰 En Yüksek {topHoldersData.length} Bakiye
            </h3>
          </div>
          <div>
            {topHoldersData.map((user, index) => (
              <div
                key={user.id}
                style={{
                  padding: '16px',
                  borderBottom: index < topHoldersData.length - 1 ? '1px solid #333333' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: index < 3 ? '#ccff33' : '#333333',
                    color: index < 3 ? '#000000' : '#cccccc',
                    borderRadius: '50%',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    #{index + 1}
                  </span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#cccccc', marginBottom: '4px' }}>
                      {user.username}
                    </p>
                    <p style={{ fontSize: '12px', color: '#888888' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>
                  {formatCurrency(user.balance)} ₺
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

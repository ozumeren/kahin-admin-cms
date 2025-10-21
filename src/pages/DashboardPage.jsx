// admin-cms/src/pages/DashboardPage.jsx
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import apiClient from '../lib/apiClient'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [markets, users] = await Promise.all([
        apiClient.get('/admin/markets'),
        apiClient.get('/admin/users')
      ])
      return {
        markets: markets.data.data,
        users: users.data.data
      }
    }
  })

  const cards = [
    {
      title: 'Toplam Market',
      value: stats?.markets?.length || 0,
      icon: TrendingUp,
      color: '#ccff33',
      bgColor: 'rgba(204, 255, 51, 0.1)'
    },
    {
      title: 'Açık Marketler',
      value: stats?.markets?.filter(m => m.status === 'open').length || 0,
      icon: Activity,
      color: '#00ff00',
      bgColor: 'rgba(0, 255, 0, 0.1)'
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats?.users?.length || 0,
      icon: Users,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Toplam Hacim',
      value: '₺' + (stats?.markets?.reduce((acc, m) => acc + (parseFloat(m.volume) || 0), 0).toFixed(2) || '0.00'),
      icon: DollarSign,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="h-20"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="rounded-2xl p-6 transition-all hover:scale-105"
              style={{ 
                backgroundColor: '#1a1a1a',
                border: '1px solid #222222'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
              </div>
              <h3 className="text-sm mb-2" style={{ color: '#888888' }}>
                {card.title}
              </h3>
              <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>
                {card.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Recent Markets */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
        <h2 className="text-xl font-bold mb-6" style={{ color: '#ffffff' }}>
          Son Marketler
        </h2>
        <div className="space-y-4">
          {stats?.markets?.slice(0, 5).map((market) => (
            <div
              key={market.id}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
            >
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#ffffff' }}>
                  {market.title}
                </h3>
                <p className="text-sm" style={{ color: '#888888' }}>
                  {new Date(market.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: market.status === 'open' ? '#ccff33' : market.status === 'closed' ? '#FF6600' : '#555555',
                    color: market.status === 'open' ? '#000000' : '#ffffff'
                  }}
                >
                  {market.status === 'open' ? 'Açık' : market.status === 'closed' ? 'Kapalı' : 'Sonuçlandı'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
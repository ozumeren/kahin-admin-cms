// admin-cms/src/pages/DashboardPage.jsx
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, DollarSign, Activity, Clock, CheckCircle } from 'lucide-react'
import apiClient from '../lib/apiClient'

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard')
      return res.data.data
    }
  })

  const { data: marketsData } = useQuery({
    queryKey: ['adminMarkets'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/markets')
      return res.data.data || []
    }
  })

  const stats = dashboardData
  const markets = Array.isArray(marketsData) ? marketsData : []
  const totalVolume = parseFloat(stats?.volume?.total || 0)

  const cards = [
    {
      title: 'Toplam Market',
      value: stats?.markets?.total || 0,
      icon: TrendingUp,
      color: '#ccff33',
      bgColor: 'rgba(204, 255, 51, 0.1)'
    },
    {
      title: 'Açık Marketler',
      value: stats?.markets?.open || 0,
      icon: Activity,
      color: '#00ff00',
      bgColor: 'rgba(0, 255, 0, 0.1)'
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats?.users?.total || 0,
      icon: Users,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Toplam Hacim',
      value: `₺${totalVolume.toFixed(2)}`,
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

  const recentMarkets = Array.isArray(markets) ? markets.slice(0, 5) : []

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
              style={{ 
                backgroundColor: '#1a1a1a',
                border: '1px solid #222222'
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: card.bgColor }}
              >
                <Icon className="w-6 h-6" style={{ color: card.color }} />
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

      {/* Son Marketler */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>
          Son Marketler
        </h2>
        <div className="space-y-4">
          {recentMarkets.map((market) => (
            <div
              key={market.id}
              className="rounded-2xl p-6 transition-all"
              style={{ 
                backgroundColor: '#1a1a1a',
                border: '1px solid #222222'
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-3 truncate" style={{ color: '#ffffff' }}>
                    {market.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#888888' }}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{new Date(market.closing_date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span>₺{parseFloat(market.volume || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 self-start">
                  <span
                    className="inline-block px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    style={{
                      backgroundColor: 
                        market.status === 'open' ? 'rgba(0, 255, 0, 0.1)' :
                        market.status === 'closed' ? 'rgba(255, 165, 0, 0.1)' :
                        'rgba(128, 128, 128, 0.1)',
                      color:
                        market.status === 'open' ? '#00ff00' :
                        market.status === 'closed' ? '#ffa500' :
                        '#808080'
                    }}
                  >
                    {market.status === 'open' ? 'Açık' :
                     market.status === 'closed' ? 'Kapandı' :
                     'Sonuçlandı'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {recentMarkets.length === 0 && (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
              <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: '#ccff33', opacity: 0.3 }} />
              <p style={{ color: '#888888' }}>Henüz market bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
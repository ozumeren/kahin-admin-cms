// admin-cms/src/components/AdminLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Users, LogOut, Menu, X, Shield, Activity, CheckCircle, AlertTriangle, Wallet, Receipt } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Çıkış yapıldı')
      navigate('/login')
    } catch (error) {
      toast.error('Çıkış yapılırken hata oluştu')
    }
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingUp, label: 'Marketler', path: '/markets' },
    { icon: Activity, label: 'Market Sağlığı', path: '/market-health' },
    { icon: CheckCircle, label: 'Market Çözümlemesi', path: '/market-resolution' },
    { icon: AlertTriangle, label: 'İtiraz Yönetimi', path: '/disputes' },
    { icon: Wallet, label: 'Treasury', path: '/treasury' },
    { icon: Receipt, label: 'İşlemler', path: '/transactions' },
    { icon: Users, label: 'Kullanıcılar', path: '/users' },
  ]

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl transition-all"
        style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full transition-transform duration-300 z-40 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ 
          width: '280px', 
          backgroundColor: '#111111',
          borderRight: '1px solid #222222'
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: '#222222' }}>
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center"
              style={{ width: '40px', height: 'auto' }}
            >
              <img 
                src="https://i.ibb.co/qL5cd5C1/Logo.png" 
                alt="Kahinmarket Logo"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#ccff33' }}>
              Kahin CMS
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium"
                style={{
                  backgroundColor: isActive(item.path) ? 'rgba(204, 255, 51, 0.1)' : 'transparent',
                  color: isActive(item.path) ? '#ccff33' : '#ffffff',
                  border: isActive(item.path) ? '1px solid #ccff33' : '1px solid transparent'
                }}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t" style={{ borderColor: '#222222' }}>
          <div className="mb-3 px-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00ff00' }}></div>
                <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>
                  {user?.username}
                </p>
              </div>
              <span 
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{ 
                  backgroundColor: '#ccff33', 
                  color: '#000000',
                  letterSpacing: '0.5px'
                }}
              >
                ADMIN
              </span>
            </div>
            <p className="text-xs" style={{ color: '#888888' }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: '#FF0000', color: '#ffffff' }}
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="min-h-screen transition-all duration-300"
        style={{ 
          marginLeft: '0',
          '@media (min-width: 1024px)': {
            marginLeft: '280px'
          }
        }}
      >
        {/* Top Bar */}
        <header 
          className="sticky top-0 z-30 px-4 lg:px-8 py-4 border-b backdrop-blur-sm"
          style={{ 
            backgroundColor: 'rgba(17, 17, 17, 0.95)',
            borderColor: '#222222'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-12"></div>
            <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
              {menuItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
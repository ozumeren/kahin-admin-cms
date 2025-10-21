// admin-cms/src/components/AdminLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Users, LogOut, Menu, X } from 'lucide-react'
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
    { icon: Users, label: 'Kullanıcılar', path: '/users' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full transition-transform duration-300 z-40
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
          <h1 className="text-2xl font-bold" style={{ color: '#ccff33' }}>
            Kahin CMS
          </h1>
          <p className="text-sm mt-1" style={{ color: '#888888' }}>
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: '#222222' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold" style={{ color: '#ffffff' }}>
                {user?.username}
              </p>
              <p className="text-xs" style={{ color: '#888888' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
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
        style={{ marginLeft: '280px' }}
      >
        {/* Top Bar */}
        <header 
          className="sticky top-0 z-30 px-8 py-4 border-b"
          style={{ 
            backgroundColor: '#111111',
            borderColor: '#222222'
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
              {menuItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ backgroundColor: '#ccff33' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00ff00' }}></div>
              <span className="text-sm font-semibold" style={{ color: '#000000' }}>ADMIN</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
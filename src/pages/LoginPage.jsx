// admin-cms/src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  // Zaten giriş yapmışsa dashboard'a yönlendir
  if (isAuthenticated) {
    navigate('/dashboard')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('Giriş başarılı!')
      navigate('/dashboard')
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Giriş yapılırken hata oluştu'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(204, 255, 51, 0.1)', border: '2px solid #ccff33' }}
          >
            <div style={{ width: '40px', height: '40px' }}>
              <Shield style={{ color: '#ccff33' }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Kahin Admin CMS
          </h1>
          <p className="text-sm" style={{ color: '#888888' }}>
            Admin paneline giriş yapın
          </p>
        </div>

        {/* Login Form */}
        <div 
          className="rounded-2xl p-8"
          style={{ 
            backgroundColor: '#111111',
            border: '1px solid #222222'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                E-posta
              </label>
              <div className="relative">
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#888888' }}>
                  <Mail />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pr-4 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #333333',
                    paddingLeft: '3rem'
                  }}
                  placeholder="admin@kahinmarket.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                Şifre
              </label>
              <div className="relative">
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#888888' }}>
                  <Lock />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full pr-4 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #333333',
                    paddingLeft: '3rem'
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#ccff33',
                color: '#000000'
              }}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Warning */}
          <div 
            className="mt-6 p-4 rounded-xl flex items-start gap-3"
            style={{ 
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)'
            }}
          >
            <div style={{ width: '20px', height: '20px', minWidth: '20px', color: '#FF0000', flexShrink: 0 }}>
              <Shield />
            </div>
            <p className="text-sm" style={{ color: '#FF0000' }}>
              Bu panel sadece admin kullanıcılar içindir. Yetkisiz erişim girişimleri kayıt altına alınır.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm mt-8" style={{ color: '#888888' }}>
          © 2025 Kahin Market. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  )
}
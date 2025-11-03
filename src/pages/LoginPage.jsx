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
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div 
            className="flex items-center justify-center mx-auto"
            style={{ 
              marginBottom: '1rem',
              width: '80px',
              height: 'auto'
            }}
          >
            <img 
              src="https://i.ibb.co/qL5cd5C1/Logo.png" 
              alt="Kahinmarket Logo" 
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#ffffff', marginBottom: '0.5rem' }}>
            Kahin Admin CMS
          </h1>
          <p className="text-sm" style={{ color: '#888888' }}>
            Admin paneline giriş yapın
          </p>
        </div>

        {/* Login Form */}
        <div 
          className="rounded-2xl"
          style={{ 
            backgroundColor: '#111111',
            border: '1px solid #222222',
            padding: '2rem'
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                className="block text-sm font-medium" 
                style={{ color: '#ffffff', marginBottom: '0.5rem' }}
              >
                E-posta
              </label>
              <div className="relative">
                <div 
                  className="absolute flex items-center justify-center"
                  style={{ 
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                >
                  <Mail className="w-5 h-5" style={{ color: '#888888' }} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full font-medium transition-all"
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #333333',
                    borderRadius: '0.75rem',
                    paddingLeft: '3rem',
                    paddingRight: '1rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="admin@kahinmarket.com"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                className="block text-sm font-medium" 
                style={{ color: '#ffffff', marginBottom: '0.5rem' }}
              >
                Şifre
              </label>
              <div className="relative">
                <div 
                  className="absolute flex items-center justify-center"
                  style={{ 
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                >
                  <Lock className="w-5 h-5" style={{ color: '#888888' }} />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full font-medium transition-all"
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #333333',
                    borderRadius: '0.75rem',
                    paddingLeft: '3rem',
                    paddingRight: '1rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#ccff33',
                color: '#000000',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '1.5rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.opacity = '1'
              }}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Warning */}
          <div 
            className="flex items-start"
            style={{ 
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '0.75rem',
              padding: '1rem',
              gap: '0.75rem'
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <Shield className="w-5 h-5" style={{ color: '#FF0000' }} />
            </div>
            <p className="text-sm" style={{ color: '#FF0000', flex: 1, margin: 0 }}>
              Bu panel sadece admin kullanıcılar içindir. Yetkisiz erişim girişimleri kayıt altına alınır.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p 
          className="text-center text-sm" 
          style={{ color: '#888888', marginTop: '2rem' }}
        >
          © 2025 Kahinmarket. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  )
}
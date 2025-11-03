// admin-cms/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../lib/apiClient'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          
          // Sadece admin kullanıcılar girebilir
          if (parsedUser.role !== 'admin') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
            setIsAuthenticated(false)
          } else {
            setUser(parsedUser)
            setIsAuthenticated(true)
          }
        } catch (error) {
          console.error('Auth init error:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      console.log('🔐 Login isteği gönderiliyor...', { email })
      
      const response = await apiClient.post('/auth/login', { email, password })
      
      console.log('📦 Backend response:', response.data)
      
      // ✅ Backend response formatı: { success, message, accessToken, user }
      const { accessToken, user: userData } = response.data

      // Sadece admin kullanıcılar girebilir
      if (userData.role !== 'admin') {
        throw new Error('Bu panele sadece admin kullanıcılar erişebilir')
      }

      console.log('✅ Admin kullanıcı doğrulandı:', userData)

      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      setIsAuthenticated(true)

      return { success: true }
    } catch (error) {
      console.error('❌ Login error:', error)
      console.error('❌ Error response:', error.response?.data)
      
      // Hata mesajını düzgün şekilde göster
      const errorMessage = error.response?.data?.message || error.message || 'Giriş başarısız'
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
// src/pages/CreateMarketPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, X } from 'lucide-react'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export default function CreateMarketPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'politics',
    closing_date: '',
    image_url: '',
    market_type: 'binary'
  })

  const [customOptions, setCustomOptions] = useState(['', ''])

  const categories = [
    { id: 'politics', name: 'Siyaset' },
    { id: 'sports', name: 'Spor' },
    { id: 'crypto', name: 'Kripto' },
    { id: 'economy', name: 'Ekonomi' },
    { id: 'entertainment', name: 'Eğlence' },
    { id: 'technology', name: 'Teknoloji' },
  ]

  const createMarketMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/admin/markets', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Market başarıyla oluşturuldu')
      queryClient.invalidateQueries(['adminMarkets'])
      navigate('/markets')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Market oluşturulurken hata oluştu')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.title || !formData.closing_date) {
      toast.error('Başlık ve kapanış tarihi zorunludur')
      return
    }

    const submitData = { ...formData }

    // Multiple choice için options ekle
    if (formData.market_type === 'multiple_choice') {
      const validOptions = customOptions.filter(opt => opt.trim() !== '')
      if (validOptions.length < 2) {
        toast.error('En az 2 seçenek gereklidir')
        return
      }
      submitData.options = validOptions.map((text, index) => ({
        option_text: text,
        option_order: index
      }))
    }

    createMarketMutation.mutate(submitData)
  }

  const addOption = () => {
    setCustomOptions([...customOptions, ''])
  }

  const removeOption = (index) => {
    if (customOptions.length > 2) {
      setCustomOptions(customOptions.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...customOptions]
    newOptions[index] = value
    setCustomOptions(newOptions)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/markets')}
          className="flex items-center gap-2 mb-4 text-sm font-medium"
          style={{ color: '#888888' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>Yeni Market Oluştur</h2>
        <p className="text-sm" style={{ color: '#888888' }}>
          Kullanıcıların tahmin yapabileceği yeni bir market oluşturun
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl p-6 space-y-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          
          {/* Market Tipi */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
              Market Tipi
            </label>
            <select
              value={formData.market_type}
              onChange={(e) => setFormData({ ...formData, market_type: e.target.value })}
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#111111', color: '#ffffff', border: '1px solid #333333' }}
            >
              <option value="binary">Binary (Evet/Hayır)</option>
              <option value="multiple_choice">Çoktan Seçmeli</option>
            </select>
          </div>

          {/* Başlık */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
              Başlık *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Örn: Bitcoin 2025'te 100.000$ olacak mı?"
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#111111', color: '#ffffff', border: '1px solid #333333' }}
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Market hakkında detaylı açıklama..."
              className="w-full px-4 py-3 rounded-xl resize-none"
              style={{ backgroundColor: '#111111', color: '#ffffff', border: '1px solid #333333' }}
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#111111', color: '#ffffff', border: '1px solid #333333' }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Kapanış Tarihi */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
              Kapanış Tarihi *
            </label>
            <input
              type="datetime-local"
              value={formData.closing_date}
              onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#111111', color: '#ffffff', border: '1px solid #333333' }}
            />
          </div>

          {/* Görsel URL */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
              Görsel URL
            </label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#111111', color: '#ffffff', border: '1px solid #333333' }}
            />
            {formData.image_url && (
              <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1px solid #333333' }}>
                <img 
                  src={formData.image_url} 
                  alt="Önizleme" 
                  className="w-full h-48 object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>

          {/* Multiple Choice Options */}
          {formData.market_type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                Seçenekler (En az 2)
              </label>
              <div className="space-y-2">
                {customOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Seçenek ${index + 1}`}
                      className="flex-1 px-4 py-3 rounded-xl"
                      style={{ backgroundColor: '#111111', color: '#ffffff', border: '1px solid #333333' }}
                    />
                    {customOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-3 rounded-xl transition-all"
                        style={{ backgroundColor: '#FF0000', color: '#ffffff' }}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all"
                  style={{ backgroundColor: '#333333', color: '#ffffff' }}
                >
                  <Plus className="w-4 h-4" />
                  Seçenek Ekle
                </button>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/markets')}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-all"
              style={{ backgroundColor: '#333333', color: '#ffffff' }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={createMarketMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: '#ccff33', color: '#000000' }}
            >
              {createMarketMutation.isPending ? 'Oluşturuluyor...' : 'Market Oluştur'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
// admin-cms/src/pages/CreateMarketPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, X, Calendar, Image as ImageIcon } from 'lucide-react'
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

  // Minimum tarih = bugün
  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/markets')}
          className="flex items-center gap-2 mb-4 text-sm font-medium transition-all hover:opacity-70"
          style={{ color: '#888888' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
          Yeni Market Oluştur
        </h1>
        <p style={{ color: '#888888' }}>Yeni bir tahmin piyasası oluşturun</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
            Market Başlığı *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Örn: Bitcoin 2025 yılında 100.000$ olacak mı?"
            className="w-full px-4 py-3 rounded-xl font-medium"
            style={{ 
              backgroundColor: '#111111',
              color: '#ffffff',
              border: '1px solid #333333'
            }}
          />
        </div>

        {/* Description */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
            Açıklama
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Market hakkında detaylı açıklama..."
            className="w-full px-4 py-3 rounded-xl font-medium resize-none"
            style={{ 
              backgroundColor: '#111111',
              color: '#ffffff',
              border: '1px solid #333333'
            }}
          />
        </div>

        {/* Category & Closing Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl font-medium"
              style={{ 
                backgroundColor: '#111111',
                color: '#ffffff',
                border: '1px solid #333333'
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Closing Date */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
              Kapanış Tarihi *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#888888' }} />
              <input
                type="date"
                value={formData.closing_date}
                onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                required
                min={minDate}
                className="w-full pl-12 pr-4 py-3 rounded-xl font-medium"
                style={{ 
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  border: '1px solid #333333'
                }}
              />
            </div>
          </div>
        </div>

        {/* Market Type */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <label className="block text-sm font-medium mb-3" style={{ color: '#ffffff' }}>
            Market Tipi
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, market_type: 'binary' })}
              className="p-4 rounded-xl transition-all"
              style={{
                backgroundColor: formData.market_type === 'binary' ? 'rgba(204, 255, 51, 0.1)' : '#111111',
                border: formData.market_type === 'binary' ? '2px solid #ccff33' : '1px solid #333333',
                color: formData.market_type === 'binary' ? '#ccff33' : '#ffffff'
              }}
            >
              <div className="font-semibold mb-1">İkili (EVET/HAYIR)</div>
              <div className="text-sm opacity-70">Standart evet/hayır sorusu</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, market_type: 'multiple_choice' })}
              className="p-4 rounded-xl transition-all"
              style={{
                backgroundColor: formData.market_type === 'multiple_choice' ? 'rgba(204, 255, 51, 0.1)' : '#111111',
                border: formData.market_type === 'multiple_choice' ? '2px solid #ccff33' : '1px solid #333333',
                color: formData.market_type === 'multiple_choice' ? '#ccff33' : '#ffffff'
              }}
            >
              <div className="font-semibold mb-1">Çoktan Seçmeli</div>
              <div className="text-sm opacity-70">Birden fazla seçenek</div>
            </button>
          </div>
        </div>

        {/* Multiple Choice Options */}
        {formData.market_type === 'multiple_choice' && (
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
            <label className="block text-sm font-medium mb-3" style={{ color: '#ffffff' }}>
              Seçenekler (En az 2)
            </label>
            <div className="space-y-3">
              {customOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Seçenek ${index + 1}`}
                    className="flex-1 px-4 py-3 rounded-xl font-medium"
                    style={{ 
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      border: '1px solid #333333'
                    }}
                  />
                  {customOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-3 rounded-xl transition-all hover:opacity-70"
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#333333', color: '#ffffff', border: '1px dashed #555555' }}
              >
                <Plus className="w-5 h-5" />
                Seçenek Ekle
              </button>
            </div>
          </div>
        )}

        {/* Image URL */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222' }}>
          <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
            Görsel URL (İsteğe Bağlı)
          </label>
          <div className="relative">
            <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#888888' }} />
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full pl-12 pr-4 py-3 rounded-xl font-medium"
              style={{ 
                backgroundColor: '#111111',
                color: '#ffffff',
                border: '1px solid #333333'
              }}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/markets')}
            className="flex-1 px-6 py-4 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: '#333333', color: '#ffffff' }}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={createMarketMutation.isPending}
            className="flex-1 px-6 py-4 rounded-xl font-bold transition-all hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: '#ccff33', color: '#000000' }}
          >
            {createMarketMutation.isPending ? 'Oluşturuluyor...' : 'Market Oluştur'}
          </button>
        </div>
      </form>
    </div>
  )
}
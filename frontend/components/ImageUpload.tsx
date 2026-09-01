'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getImageUrl } from '@/lib/utils'
import { Upload, X, Camera } from 'lucide-react'

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        // Fallback jika bucket tidak ditemukan atau policy restricted
        // Konversi ke base64 / data URL
        const reader = new FileReader()
        reader.onloadend = () => {
          onChange(reader.result as string)
          setUploading(false)
        }
        reader.readAsDataURL(file)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
      onChange(publicUrl)
    } catch (err: any) {
      setError(err.message || 'Gagal upload gambar.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-ink/50 mb-1.5">Foto Produk</label>

      {value ? (
        <div className="relative w-full h-44 mb-1 rounded-xl overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getImageUrl(value)} alt="Preview" className="w-full h-full object-cover" />

          <label className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer">
            <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
            <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition">
              {uploading ? 'Mengupload...' : 'Klik untuk ganti foto'}
            </span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
          </label>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-brick flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-44 mb-1 rounded-xl border-2 border-dashed border-stone cursor-pointer hover:border-navy transition text-ink/40 text-sm gap-1.5">
          <Upload className="w-5 h-5" />
          {uploading ? 'Mengupload...' : 'Klik untuk pilih gambar'}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      )}

      {error && <p className="text-brick text-xs mt-1">{error}</p>}
    </div>
  )
}

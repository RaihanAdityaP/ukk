'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { Upload, X, Camera, Loader2 } from 'lucide-react'

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
      const res = await api.upload.file(file, 'products')
      onChange(res.url)
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

          <label
            className={`absolute inset-0 bg-black/50 transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
              uploading ? 'opacity-100 pointer-events-none' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-1 text-white">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs font-medium">Mengupload foto produk...</span>
              </div>
            ) : (
              <>
                <Camera className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-medium">Klik untuk ganti foto</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
          </label>

          {!uploading && (
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
          )}
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center w-full h-44 mb-1 rounded-xl border-2 border-dashed border-stone transition text-ink/40 text-sm gap-2 ${
            uploading ? 'bg-stone/10 cursor-not-allowed' : 'cursor-pointer hover:border-navy hover:bg-stone/10'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-navy">
              <Loader2 className="w-7 h-7 animate-spin text-navy" />
              <span className="text-xs font-medium animate-pulse">Sedang mengupload gambar...</span>
            </div>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Klik untuk pilih gambar</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      )}

      {error && <p className="text-brick text-xs mt-1">{error}</p>}
    </div>
  )
}

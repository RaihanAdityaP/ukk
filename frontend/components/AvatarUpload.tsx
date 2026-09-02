'use client'

import { useState } from 'react'
import { api, getToken } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { Camera, Loader2 } from 'lucide-react'

export default function AvatarUpload({
  value,
  fallbackLetter,
  onChange,
}: {
  value: string
  fallbackLetter: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    if (!getToken()) {
      setError('Harus login dulu.')
      return
    }

    setUploading(true)

    try {
      const res = await api.upload.file(file, 'avatars')
      onChange(res.url)
    } catch (err: any) {
      setError(err.message || 'Gagal upload foto profil.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 rounded-full overflow-hidden bg-stone/40 flex items-center justify-center group border border-stone shadow-inner">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getImageUrl(value)} alt="Foto profil" className="w-full h-full object-cover" />
        ) : (
          <span className="font-serif text-4xl text-navy/30">{fallbackLetter}</span>
        )}

        <label
          className={`absolute inset-0 bg-black/50 transition flex flex-col items-center justify-center text-white cursor-pointer ${
            uploading ? 'opacity-100 pointer-events-none' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
              <span className="text-[10px] font-medium tracking-wider uppercase">Upload...</span>
            </div>
          ) : (
            <Camera className="w-5 h-5" />
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-brick text-xs">{error}</p>}
    </div>
  )
}

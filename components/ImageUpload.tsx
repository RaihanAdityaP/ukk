'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)

    if (uploadError) {
      setUploading(false)
      setError('Gagal upload gambar. ' + uploadError.message)
      return
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    onChange(data.publicUrl)
    setUploading(false)
  }

  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Foto Produk</label>

      {value ? (
        <div className="relative w-full h-44 mb-1 border-2 border-ink overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-white text-brick text-xs font-semibold px-2 py-1 opacity-0 group-hover:opacity-100 transition"
          >
            Hapus
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-44 mb-1 border-2 border-dashed border-stone cursor-pointer hover:border-navy transition text-ink/40 text-sm gap-1">
          <span className="text-2xl">＋</span>
          {uploading ? 'Mengupload...' : 'Klik untuk pilih gambar'}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      )}

      {error && <p className="text-brick text-xs">{error}</p>}
    </div>
  )
}

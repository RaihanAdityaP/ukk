'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { generateId } from '@/lib/utils'

export default function AvatarUpload({
  value,
  fallbackLetter,
  onChange,
}: {
  value: string
  fallbackLetter: string
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

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setUploading(false)
      setError('Harus login dulu.')
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${generateId()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)

    if (uploadError) {
      setUploading(false)
      setError('Gagal upload foto. ' + uploadError.message)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    onChange(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 rounded-full border-2 border-ink overflow-hidden bg-stone/40 flex items-center justify-center group">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Foto profil" className="w-full h-full object-cover" />
        ) : (
          <span className="font-serif text-4xl text-navy/30">{fallbackLetter}</span>
        )}
        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs cursor-pointer">
          {uploading ? '...' : 'Ganti'}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-brick text-xs">{error}</p>}
    </div>
  )
}

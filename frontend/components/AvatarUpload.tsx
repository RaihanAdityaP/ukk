'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getImageUrl } from '@/lib/utils'
import { Camera } from 'lucide-react'

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
    setUploading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Harus login dulu.')
        setUploading(false)
        return
      }

      const ext = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        // Fallback ke data URL
        const reader = new FileReader()
        reader.onloadend = () => {
          onChange(reader.result as string)
          setUploading(false)
        }
        reader.readAsDataURL(file)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      onChange(publicUrl)
    } catch (err: any) {
      setError(err.message || 'Gagal upload foto profil.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 rounded-full overflow-hidden bg-stone/40 flex items-center justify-center group border border-stone">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getImageUrl(value)} alt="Foto profil" className="w-full h-full object-cover" />
        ) : (
          <span className="font-serif text-4xl text-navy/30">{fallbackLetter}</span>
        )}
        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer">
          {uploading ? <span className="text-xs">...</span> : <Camera className="w-5 h-5" />}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-brick text-xs">{error}</p>}
    </div>
  )
}

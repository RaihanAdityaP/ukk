'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getToken } from '@/lib/api'
import AvatarUpload from '@/components/AvatarUpload'
import { LogOut } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!getToken()) {
        router.push('/login?redirect=/profile')
        return
      }

      try {
        const user = await api.auth.me()
        if (user) {
          setEmail(user.email ?? '')
          setFullName(user.name ?? '')
          setPhone(user.phone ?? '')
          setAddress(user.address ?? '')
          setAvatarUrl(user.avatar_url ?? '')
          setRole(user.role ?? 'customer')
        }
      } catch (err) {
        router.push('/login?redirect=/profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [router])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileMsg('')
    setSavingProfile(true)

    try {
      await api.auth.updateProfile({
        name: fullName,
        phone,
        address,
        avatar_url: avatarUrl,
      })
      setProfileMsg('Profil berhasil diperbarui')
      setTimeout(() => setProfileMsg(''), 2500)
    } catch (err: any) {
      setProfileMsg(err.message || 'Gagal menyimpan profil.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleLogout() {
    await api.auth.logout()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return <main className="max-w-lg mx-auto px-4 py-16 text-center text-ink/40">Memuat profil...</main>
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-navy mb-6">Profil Saya</h1>

      <form onSubmit={handleSaveProfile} className="bg-white rounded-xl p-5 space-y-4 mb-6">
        <div className="flex justify-center mb-1">
          <AvatarUpload value={avatarUrl} fallbackLetter={fullName.charAt(0) || email.charAt(0)} onChange={setAvatarUrl} />
        </div>

        <div className="text-center mb-2">
          <span className="inline-block text-xs font-medium bg-navy/10 text-navy px-3 py-1 rounded-full">
            {role === 'admin' ? 'Admin' : 'Customer'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Nama Lengkap</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy text-ink"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">No. HP / WhatsApp</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy text-ink"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Alamat Pengiriman</label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy text-ink"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Email</label>
          <input
            value={email}
            disabled
            className="w-full rounded-lg border border-stone px-3 py-2.5 bg-stone/20 text-ink/50 cursor-not-allowed"
          />
        </div>

        {profileMsg && <p className="text-sm text-navy font-medium">{profileMsg}</p>}

        <button
          type="submit"
          disabled={savingProfile}
          className="bg-accent text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-brick hover:text-white disabled:opacity-50 transition"
        >
          {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </form>

      <button onClick={handleLogout} className="flex items-center gap-2 text-brick text-sm font-medium hover:underline">
        <LogOut className="w-4 h-4" />
        Logout dari akun ini
      </button>
    </main>
  )
}

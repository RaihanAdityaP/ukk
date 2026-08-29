'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AvatarUpload from '@/components/AvatarUpload'
import { LogOut } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/profile')
        return
      }
      setEmail(user.email ?? '')

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setFullName(profile.full_name ?? '')
        setAvatarUrl(profile.avatar_url ?? '')
        setRole(profile.role)
      }
      setLoading(false)
    }
    loadProfile()
  }, [router, supabase])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileMsg('')
    setSavingProfile(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq('id', user.id)

    setSavingProfile(false)
    setProfileMsg(error ? 'Gagal menyimpan. Coba lagi.' : 'Profil berhasil diperbarui')
    setTimeout(() => setProfileMsg(''), 2500)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordMsg('')

    if (newPassword.length < 6) {
      setPasswordError('Password minimal 6 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.')
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      setPasswordError('Gagal mengganti password. ' + error.message)
      return
    }

    setPasswordMsg('Password berhasil diganti')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordMsg(''), 2500)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
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
            className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Email</label>
          <input
            value={email}
            disabled
            className="w-full rounded-lg border border-stone px-3 py-2.5 bg-stone/20 text-ink/50 cursor-not-allowed"
          />
          <p className="text-xs text-ink/40 mt-1">Email tidak bisa diubah lewat halaman ini.</p>
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

      <div className="bg-white rounded-xl p-5 mb-6">
        <h2 className="font-serif text-xl font-bold text-navy mb-4">Ganti Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink/50 mb-1.5">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/50 mb-1.5">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy"
            />
          </div>

          {passwordError && <p className="text-brick text-sm">{passwordError}</p>}
          {passwordMsg && <p className="text-navy text-sm font-medium">{passwordMsg}</p>}

          <button
            type="submit"
            disabled={savingPassword}
            className="border-2 border-navy text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-navy hover:text-white disabled:opacity-50 transition"
          >
            {savingPassword ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </form>
      </div>

      <button onClick={handleLogout} className="flex items-center gap-2 text-brick text-sm font-medium hover:underline">
        <LogOut className="w-4 h-4" />
        Logout dari akun ini
      </button>
    </main>
  )
}

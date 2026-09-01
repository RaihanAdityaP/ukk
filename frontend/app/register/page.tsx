'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    try {
      await api.auth.register({
        name: fullName,
        email,
        password,
        phone,
        address,
      })
      setSuccess('Pendaftaran berhasil! Mengalihkan ke beranda...')
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 800)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Gagal mendaftar. Coba lagi.')
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-navy text-white p-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-navy font-bold font-serif">W</div>
          <span className="font-serif text-xl font-bold">Wijaya Living & Elektronik</span>
        </div>
        <div>
          <p className="font-serif text-3xl leading-snug mb-3">
            &quot;Dari elektronik rumah tangga sampai perlengkapan hidup — semua ada di sini.&quot;
          </p>
          <p className="text-white/50 text-sm">Daftar dan mulai belanja dalam hitungan detik.</p>
        </div>
        <div className="text-white/30 text-xs">© 2026 Wijaya Living & Elektronik</div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 bg-paper">
        <form onSubmit={handleRegister} className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white font-bold text-sm font-serif">W</div>
            <span className="font-serif font-bold text-navy">Wijaya</span>
          </div>

          <h1 className="font-serif text-2xl font-bold text-navy mb-1">Buat akun baru</h1>
          <p className="text-ink/50 text-sm mb-6">Sudah punya akun? <Link href="/login" className="text-brick font-semibold hover:underline">Masuk di sini</Link></p>

          <label className="block text-xs font-medium text-ink/50 mb-1.5">Nama Lengkap</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-stone px-3 py-2.5 mb-4 bg-white focus:outline-none focus:border-navy text-ink"
            placeholder="Nama kamu"
          />

          <label className="block text-xs font-medium text-ink/50 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-stone px-3 py-2.5 mb-4 bg-white focus:outline-none focus:border-navy text-ink"
            placeholder="nama@email.com"
          />

          <label className="block text-xs font-medium text-ink/50 mb-1.5">No. Telepon / WhatsApp</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-stone px-3 py-2.5 mb-4 bg-white focus:outline-none focus:border-navy text-ink"
            placeholder="08123456789"
          />

          <label className="block text-xs font-medium text-ink/50 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-stone px-3 py-2.5 mb-5 bg-white focus:outline-none focus:border-navy text-ink"
            placeholder="Minimal 6 karakter"
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-lg mb-4">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg mb-4">
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-accent text-navy font-semibold py-3 rounded-lg hover:bg-brick hover:text-white disabled:opacity-50 transition"
          >
            {loading ? 'Mendaftar...' : success ? 'Pendaftaran Berhasil...' : 'Daftar'}
          </button>

          <Link href="/" className="block text-center text-ink/40 text-sm mt-5 hover:text-navy">
            ← Kembali lihat-lihat produk
          </Link>
        </form>
      </div>
    </main>
  )
}

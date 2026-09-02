'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { user } = await api.auth.login({ email, password })
      setSuccess(`Selamat datang kembali, ${user?.name || 'Pengguna'}! Mengalihkan...`)

      setTimeout(() => {
        const redirect = searchParams.get('redirect')
        if (user?.role === 'admin') {
          router.push(redirect && redirect.startsWith('/admin') ? redirect : '/admin/products')
        } else {
          router.push(redirect && !redirect.startsWith('/admin') ? redirect : '/')
        }
        router.refresh()
      }, 700)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Email atau password salah.')
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
            &quot;Belanja kebutuhan rumah, dari sumber yang sudah dipercaya sejak 2016.&quot;
          </p>
          <p className="text-white/50 text-sm">Toko keluarga, kini hadir online.</p>
        </div>
        <div className="text-white/30 text-xs">© 2026 Wijaya Living & Elektronik</div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 bg-paper">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white font-bold text-sm font-serif">W</div>
            <span className="font-serif font-bold text-navy">Wijaya</span>
          </div>

          <h1 className="font-serif text-2xl font-bold text-navy mb-1">Masuk ke akun kamu</h1>
          <p className="text-ink/50 text-sm mb-6">Belum punya akun? <Link href="/register" className="text-brick font-semibold hover:underline">Daftar di sini</Link></p>

          <label className="block text-xs font-medium text-ink/50 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-stone px-3 py-2.5 mb-4 bg-white focus:outline-none focus:border-navy text-ink"
            placeholder="nama@email.com"
          />

          <label className="block text-xs font-medium text-ink/50 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-stone px-3 py-2.5 mb-5 bg-white focus:outline-none focus:border-navy text-ink"
            placeholder="••••••••"
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
            className="w-full bg-accent text-navy font-semibold py-3 rounded-lg hover:bg-brick hover:text-white disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Memproses...' : success ? 'Berhasil Masuk...' : 'Login'}</span>
          </button>

          <div className="mt-4 p-3 bg-stone/20 rounded-lg text-xs text-ink/70">
            <p className="font-semibold text-ink mb-1">Akun Demo:</p>
            <p>Admin: <span className="font-mono text-navy">admin@wijayaliving.id</span> / <span className="font-mono text-navy">WheniAdmin1</span></p>
            <p>Customer: <span className="font-mono text-navy">customer@wijaya.id</span> / <span className="font-mono text-navy">WheniCustomer1</span></p>
          </div>

          <Link href="/" className="block text-center text-ink/40 text-sm mt-5 hover:text-navy">
            ← Kembali lihat-lihat produk
          </Link>
        </form>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

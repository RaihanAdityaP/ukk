'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !data.user) {
      setLoading(false)
      setError('Email atau password salah.')
      return
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    setLoading(false)

    const redirect = searchParams.get('redirect')
    if (profile?.role === 'admin') {
      router.push(redirect && redirect.startsWith('/admin') ? redirect : '/admin/products')
    } else {
      router.push(redirect && !redirect.startsWith('/admin') ? redirect : '/')
    }
    router.refresh()
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Panel kiri — brand */}
      <div className="hidden lg:flex flex-col justify-between bg-navy text-white p-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-accent flex items-center justify-center text-navy font-bold font-serif">W</div>
          <span className="font-serif text-xl font-bold">Wijaya Living & Elektronik</span>
        </div>
        <div>
          <p className="font-serif text-3xl leading-snug mb-3">
            "Belanja kebutuhan rumah, dari sumber yang sudah dipercaya sejak 2016."
          </p>
          <p className="text-white/50 text-sm">Toko keluarga, kini hadir online.</p>
        </div>
        <div className="text-white/30 text-xs">© 2026 Wijaya Living & Elektronik</div>
      </div>

      {/* Panel kanan — form */}
      <div className="flex items-center justify-center px-6 py-16 bg-paper">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-navy flex items-center justify-center text-white font-bold text-sm font-serif">W</div>
            <span className="font-serif font-bold text-navy">Wijaya</span>
          </div>

          <h1 className="font-serif text-2xl font-bold text-navy mb-1">Masuk ke akun kamu</h1>
          <p className="text-ink/50 text-sm mb-6">Belum punya akun? <Link href="/register" className="text-brick font-semibold hover:underline">Daftar di sini</Link></p>

          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-stone px-3 py-2.5 mb-4 bg-white focus:outline-none focus:border-navy"
            placeholder="nama@email.com"
          />

          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-stone px-3 py-2.5 mb-5 bg-white focus:outline-none focus:border-navy"
            placeholder="••••••••"
          />

          {error && <p className="text-brick text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-navy font-bold uppercase tracking-wide text-sm py-3 hover:bg-brick hover:text-white disabled:opacity-50 transition"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>

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

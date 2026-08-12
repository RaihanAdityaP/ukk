'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function NavBar() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-navy text-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent flex items-center justify-center text-navy font-bold font-serif">W</div>
          <div className="leading-none">
            <span className="font-serif font-bold text-lg block">Wijaya</span>
            <span className="hidden sm:flex items-center gap-1 text-[10px] tracking-widest text-white/50 uppercase mt-0.5">
              <span className="brand-stamp w-3 h-3 flex items-center justify-center text-[7px]">✦</span>
              Sejak 2016
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-white/70">
          <Link href="/" className="hover:text-white transition">Shop</Link>
          <Link href="/cart" className="hover:text-white transition">Cart</Link>
          <Link href="/admin/products" className="hover:text-white transition">Admin</Link>
          {user ? (
            <button onClick={handleLogout} className="text-white/50 hover:text-brick transition">
              Logout
            </button>
          ) : (
            <Link href="/login" className="bg-accent text-navy font-semibold px-4 py-1.5 hover:opacity-90 transition">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

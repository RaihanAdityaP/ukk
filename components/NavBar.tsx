'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function NavBar() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role, avatar_url').eq('id', data.user.id).single()
        setIsAdmin(profile?.role === 'admin')
        setAvatarUrl(profile?.avatar_url ?? '')
      } else {
        setIsAdmin(false)
        setAvatarUrl('')
      }
    }
    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role, avatar_url').eq('id', session.user.id).single()
        setIsAdmin(profile?.role === 'admin')
        setAvatarUrl(profile?.avatar_url ?? '')
      } else {
        setIsAdmin(false)
        setAvatarUrl('')
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  // Tutup menu tiap kali pindah halaman
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Login & register punya layout dua panel sendiri, gak perlu navbar di atasnya
  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  const AvatarCircle = () => (
    <span className="w-6 h-6 rounded-full bg-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px]">{(user?.email ?? '?').charAt(0).toUpperCase()}</span>
      )}
    </span>
  )

  return (
    <header className="bg-navy text-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent flex items-center justify-center text-navy font-bold font-serif shrink-0">W</div>
          <span className="font-serif font-bold text-lg">Wijaya</span>
        </Link>

        {/* Nav penuh — desktop/tablet */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-white/70">
          <Link href="/" className="hover:text-white transition">Shop</Link>
          <Link href="/cart" className="hover:text-white transition">Cart</Link>
          {isAdmin && <Link href="/admin/products" className="hover:text-white transition">Admin</Link>}
          {user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 hover:text-white transition">
                <AvatarCircle />
                Profil
              </Link>
              <button onClick={handleLogout} className="text-white/50 hover:text-brick transition">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-accent text-navy font-semibold px-4 py-1.5 hover:opacity-90 transition">
              Login
            </Link>
          )}
        </nav>

        {/* Tombol hamburger — mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden w-9 h-9 flex items-center justify-center"
          aria-label="Menu"
        >
          {menuOpen ? (
            <span className="text-2xl leading-none">✕</span>
          ) : (
            <span className="flex flex-col gap-1.5">
              <span className="w-6 h-0.5 bg-white block" />
              <span className="w-6 h-0.5 bg-white block" />
              <span className="w-6 h-0.5 bg-white block" />
            </span>
          )}
        </button>
      </div>

      {/* Dropdown menu — mobile */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-white/10 bg-navy px-4 py-3 flex flex-col gap-1 text-sm font-medium">
          <Link href="/" className="py-2.5 text-white/80 hover:text-white transition">Shop</Link>
          <Link href="/cart" className="py-2.5 text-white/80 hover:text-white transition">Cart</Link>
          {isAdmin && <Link href="/admin/products" className="py-2.5 text-white/80 hover:text-white transition">Admin</Link>}
          {user ? (
            <>
              <Link href="/profile" className="py-2.5 flex items-center gap-2 text-white/80 hover:text-white transition">
                <AvatarCircle />
                Profil
              </Link>
              <button onClick={handleLogout} className="py-2.5 text-left text-white/50 hover:text-brick transition">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="mt-1 bg-accent text-navy font-semibold px-4 py-2.5 text-center hover:opacity-90 transition">
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}

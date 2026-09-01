'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api, getStoredUser, getToken } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { ShoppingCart, User, LogOut, Menu, X, Shield } from 'lucide-react'

export default function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function loadUser() {
      const token = getToken()
      const stored = getStoredUser()
      if (token && stored) {
        setUser(stored)
        setIsAdmin(stored.role === 'admin')
        setAvatarUrl(stored.avatar_url ?? '')

        // Async sync latest user from backend
        api.auth.me().then((freshUser) => {
          if (freshUser) {
            setUser(freshUser)
            setIsAdmin(freshUser.role === 'admin')
            setAvatarUrl(freshUser.avatar_url ?? '')
          }
        }).catch(() => {
          // Token expired or invalid
        })
      } else {
        setUser(null)
        setIsAdmin(false)
        setAvatarUrl('')
      }
    }

    loadUser()

    const handleAuthChange = () => loadUser()
    window.addEventListener('auth-state-changed', handleAuthChange)
    return () => window.removeEventListener('auth-state-changed', handleAuthChange)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function handleLogout() {
    await api.auth.logout()
    setUser(null)
    setIsAdmin(false)
    router.push('/')
    router.refresh()
  }

  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  const AvatarCircle = () => (
    <span className="w-7 h-7 rounded-full bg-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={getImageUrl(avatarUrl)} alt="Profil" className="w-full h-full object-cover" />
      ) : (
        <User className="w-3.5 h-3.5 text-white/70" />
      )}
    </span>
  )

  return (
    <header className="bg-navy text-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-navy font-bold font-serif text-sm shrink-0">W</div>
          <span className="font-serif font-bold text-lg">Wijaya</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-sm font-medium text-white/70">
          <Link href="/" className={`hover:text-white transition ${pathname === '/' ? 'text-white font-bold' : ''}`}>Shop</Link>
          <Link href="/cart" className={`flex items-center gap-1.5 hover:text-white transition ${pathname === '/cart' ? 'text-white font-bold' : ''}`}>
            <ShoppingCart className="w-4 h-4" />
            Cart
          </Link>
          {isAdmin && (
            <div className="flex items-center gap-4 pl-3 border-l border-white/20">
              <Link href="/admin" className={`flex items-center gap-1 hover:text-white transition ${pathname === '/admin' ? 'text-accent font-bold' : 'text-white/80'}`}>
                <Shield className="w-3.5 h-3.5 text-accent" />
                Admin
              </Link>
              <Link href="/admin/products" className={`hover:text-white transition ${pathname.startsWith('/admin/products') ? 'text-white font-bold' : ''}`}>
                Produk
              </Link>
              <Link href="/admin/orders" className={`hover:text-white transition ${pathname.startsWith('/admin/orders') ? 'text-white font-bold' : ''}`}>
                Pesanan
              </Link>
              <Link href="/admin/logs" className={`hover:text-white transition ${pathname.startsWith('/admin/logs') ? 'text-white font-bold' : ''}`}>
                Log
              </Link>
            </div>
          )}
          {user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 hover:text-white transition">
                <AvatarCircle />
                {user.name || 'Profil'}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/50 hover:text-brick transition">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-accent text-navy font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition">
              Login
            </Link>
          )}
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden w-9 h-9 flex items-center justify-center"
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="sm:hidden border-t border-white/10 bg-navy px-4 py-3 flex flex-col gap-1 text-sm font-medium">
          <Link href="/" className="py-2.5 text-white/80 hover:text-white transition">Shop</Link>
          <Link href="/cart" className="py-2.5 flex items-center gap-2 text-white/80 hover:text-white transition">
            <ShoppingCart className="w-4 h-4" />
            Cart
          </Link>
          {isAdmin && (
            <Link href="/admin/products" className="py-2.5 flex items-center gap-2 text-white/80 hover:text-white transition">
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link href="/profile" className="py-2.5 flex items-center gap-2 text-white/80 hover:text-white transition">
                <AvatarCircle />
                {user.name || 'Profil'}
              </Link>
              <button onClick={handleLogout} className="py-2.5 flex items-center gap-2 text-left text-white/50 hover:text-brick transition">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="mt-1 bg-accent text-navy font-semibold px-4 py-2.5 rounded-lg text-center hover:opacity-90 transition">
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}

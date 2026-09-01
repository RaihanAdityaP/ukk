'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getStoredUser, getToken } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { Plus, Pencil, Trash2, Shuffle, Image as ImageIcon } from 'lucide-react'

type SortKey = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc' | 'newest' | 'random'

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [shuffleSeed, setShuffleSeed] = useState(0)

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await api.products.list()
      setProducts(data)
    } catch (err) {
      console.error('Failed to load products', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push('/login?redirect=/admin/products')
      return
    }
    const user = getStoredUser()
    if (user && user.role !== 'admin') {
      router.push('/')
      return
    }

    loadProducts()
  }, [router])

  async function handleDelete(id: number | string) {
    const product = products.find((p) => p.id === id)
    const name = product ? product.name : `Produk ID #${id}`

    if (!confirm(`Yakin mau hapus produk "${name}"?`)) return
    try {
      await api.products.delete(id)
      await api.logs.record('DELETE_PRODUCT', `Admin menghapus produk "${name}"`)
      loadProducts()
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus produk.')
    }
  }

  const sortedProducts = useMemo(() => {
    const list = [...products]
    switch (sortKey) {
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name))
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price)
      case 'stock-asc':
        return list.sort((a, b) => a.stock - b.stock)
      case 'stock-desc':
        return list.sort((a, b) => b.stock - a.stock)
      case 'newest':
        return list.sort((a, b) => {
          const dateDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          return dateDiff !== 0 ? dateDiff : a.name.localeCompare(b.name)
        })
      case 'random': {
        const shuffled = [...list]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }
      default:
        return list
    }
  }, [products, sortKey, shuffleSeed])

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-medium text-ink/40 mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-navy">Kelola Produk</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/logs" className="flex items-center gap-1.5 bg-white text-navy border border-stone font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-stone/20 transition">
            Log Aktivitas
          </Link>
          <Link href="/admin/products/new" className="flex items-center gap-1.5 bg-accent text-navy font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-brick hover:text-white transition">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-stone px-3 py-2 text-sm bg-white focus:outline-none focus:border-navy text-ink"
        >
          <option value="newest">Terbaru</option>
          <option value="name-asc">Nama (A-Z)</option>
          <option value="name-desc">Nama (Z-A)</option>
          <option value="price-asc">Harga Termurah</option>
          <option value="price-desc">Harga Termahal</option>
          <option value="stock-desc">Stok Terbanyak</option>
          <option value="stock-asc">Stok Tersedikit</option>
          <option value="random">Acak</option>
        </select>
        {sortKey === 'random' && (
          <button
            onClick={() => setShuffleSeed((s) => s + 1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-navy bg-white px-3 py-2 rounded-lg hover:bg-stone/30 transition"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Acak Ulang
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-ink/40 py-10 text-center">Memuat produk...</p>
      ) : (
        <div className="space-y-2.5">
          {sortedProducts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
              <div className="w-12 h-12 rounded-lg bg-stone/40 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-navy/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <div className="flex items-center gap-2 text-xs text-ink/50">
                  <span>Rp {p.price.toLocaleString('id-ID')}</span>
                  <span className={p.stock === 0 ? 'text-brick' : ''}>· Stok {p.stock}</span>
                </div>
              </div>
              <Link
                href={`/admin/products/${p.id}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-navy hover:bg-navy/10 transition flex-shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(p.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-brick hover:bg-brick/10 transition flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

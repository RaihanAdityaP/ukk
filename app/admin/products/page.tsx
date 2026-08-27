'use client'

import { useEffect, useMemo, useState } from 'react'
import { Product } from '@/lib/types'

type SortKey = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc' | 'newest' | 'random'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [shuffleSeed, setShuffleSeed] = useState(0)

  async function loadProducts() {
    setLoading(true)
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Yakin mau hapus produk ini?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    loadProducts()
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
        // created_at bisa kembar kalau banyak produk di-insert dalam 1 query sekaligus,
        // makanya dikasih nama sebagai patokan kedua biar urutannya konsisten (gak "acak" tiap refresh)
        return list.sort((a, b) => {
          const dateDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          return dateDiff !== 0 ? dateDiff : a.name.localeCompare(b.name)
        })
      case 'random': {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _seed = shuffleSeed // dipakai biar useMemo tau harus acak ulang
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
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-navy">Kelola Produk</h1>
        </div>
        <a href="/admin/products/new" className="bg-accent text-navy font-bold uppercase tracking-wide text-xs px-5 py-2.5 hover:bg-brick hover:text-white transition">
          + Tambah Produk
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-wide text-ink/50">Urutkan:</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="border-2 border-stone px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-navy"
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
        </div>
        {sortKey === 'random' && (
          <button
            onClick={() => setShuffleSeed((s) => s + 1)}
            className="text-xs font-semibold text-navy border-2 border-navy px-3 py-1.5 hover:bg-navy hover:text-white transition"
          >
            🔀 Acak Ulang
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-ink/40 py-10 text-center">Memuat produk...</p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="sm:hidden divide-y-2 divide-stone">
            {sortedProducts.map((p) => (
              <div key={p.id} className="py-4">
                <p className="font-serif font-semibold text-lg mb-1">{p.name}</p>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Rp {p.price.toLocaleString('id-ID')}</span>
                  <span className={p.stock === 0 ? 'text-brick' : 'text-ink/60'}>Stok: {p.stock}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <a href={`/admin/products/${p.id}`} className="text-navy font-medium hover:underline">Edit</a>
                  <button onClick={() => handleDelete(p.id)} className="text-brick font-medium hover:underline">Hapus</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <table className="hidden sm:table w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink text-left text-ink/50 text-xs uppercase tracking-wide">
                <th className="py-2 font-medium">Produk</th>
                <th className="py-2 font-medium">Harga</th>
                <th className="py-2 font-medium">Stok</th>
                <th className="py-2 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone">
              {sortedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/60 transition">
                  <td className="py-3.5 font-serif font-semibold">{p.name}</td>
                  <td className="py-3.5">Rp {p.price.toLocaleString('id-ID')}</td>
                  <td className="py-3.5">
                    <span className={p.stock === 0 ? 'text-brick' : ''}>{p.stock}</span>
                  </td>
                  <td className="py-3.5 text-right space-x-4">
                    <a href={`/admin/products/${p.id}`} className="text-navy font-medium hover:underline">Edit</a>
                    <button onClick={() => handleDelete(p.id)} className="text-brick font-medium hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  )
}
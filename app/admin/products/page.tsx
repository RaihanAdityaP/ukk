'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/lib/types'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between border-b-2 border-ink pb-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-navy">Kelola Produk</h1>
        </div>
        <a href="/admin/products/new" className="bg-accent text-navy font-bold uppercase tracking-wide text-xs px-5 py-2.5 hover:bg-brick hover:text-white transition">
          + Tambah Produk
        </a>
      </div>

      {loading ? (
        <p className="text-ink/40 py-10 text-center">Memuat produk...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-ink text-left text-ink/50 text-xs uppercase tracking-wide">
              <th className="py-2 font-medium">Produk</th>
              <th className="py-2 font-medium">Harga</th>
              <th className="py-2 font-medium">Stok</th>
              <th className="py-2 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone">
            {products.map((p) => (
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
      )}
    </main>
  )
}

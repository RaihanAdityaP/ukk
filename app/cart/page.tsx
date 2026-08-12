'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CartItem } from '@/lib/types'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  async function loadCart() {
    setLoading(true)
    const res = await fetch('/api/cart')
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    loadCart()
  }, [])

  async function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) return
    await fetch(`/api/cart/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    loadCart()
  }

  async function removeItem(id: string) {
    await fetch(`/api/cart/${id}`, { method: 'DELETE' })
    loadCart()
  }

  const total = items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0)

  if (loading) {
    return <main className="max-w-3xl mx-auto px-4 py-16 text-center text-ink/40">Memuat keranjang...</main>
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-navy border-b-2 border-ink pb-3 mb-8">Keranjang Belanja</h1>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-stone py-20 text-center">
          <p className="text-ink/40 mb-4">Keranjang kamu masih kosong.</p>
          <Link href="/" className="text-brick font-semibold hover:underline">Mulai belanja →</Link>
        </div>
      ) : (
        <>
          <div className="divide-y-2 divide-stone mb-8">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <div className="w-16 h-16 flex-shrink-0 bg-stone/40 overflow-hidden">
                  {item.product?.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-semibold truncate">{item.product?.name}</p>
                  <p className="text-sm text-ink/40">Rp {item.product?.price.toLocaleString('id-ID')} / unit</p>
                </div>
                <div className="flex items-center border-2 border-ink">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 hover:bg-stone/30">−</button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 hover:bg-stone/30">+</button>
                </div>
                <p className="w-28 text-right font-serif font-bold text-navy">
                  Rp {((item.product?.price ?? 0) * item.quantity).toLocaleString('id-ID')}
                </p>
                <button onClick={() => removeItem(item.id)} className="text-ink/30 hover:text-brick text-sm w-5">✕</button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t-2 border-ink pt-4 mb-8">
            <span className="font-serif text-lg font-bold">Total</span>
            <span className="font-serif text-3xl font-bold text-navy">Rp {total.toLocaleString('id-ID')}</span>
          </div>

          <Link
            href="/checkout"
            className="block text-center bg-accent text-navy font-bold uppercase tracking-wide text-sm py-3.5 hover:bg-brick hover:text-white transition"
          >
            Lanjut Checkout →
          </Link>
        </>
      )}
    </main>
  )
}

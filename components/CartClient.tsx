'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CartItem } from '@/lib/types'
import { Minus, Plus, Trash2, Image as ImageIcon, ArrowRight } from 'lucide-react'

export default function CartClient({ initialItems }: { initialItems: CartItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [warningId, setWarningId] = useState<string | null>(null)

  async function updateQuantity(id: string, newQuantity: number, stock?: number) {
    if (newQuantity < 1) return
    if (stock != null && newQuantity > stock) {
      setWarningId(id)
      setTimeout(() => setWarningId(null), 2000)
      return
    }

    // Update tampilan duluan (optimistic), biar kerasa instan
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))

    await fetch(`/api/cart/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity }),
    })
    router.refresh()
  }

  async function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    await fetch(`/api/cart/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const total = items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl py-16 text-center">
        <p className="text-ink/40 mb-4">Keranjang kamu masih kosong.</p>
        <Link href="/" className="text-brick font-semibold hover:underline">Mulai belanja →</Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2.5 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white rounded-xl p-3">
            <div className="w-14 h-14 rounded-lg bg-stone/40 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {item.product?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.product.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-5 h-5 text-navy/20" />
              )}
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="font-medium text-sm truncate">{item.product?.name}</p>
              <p className="text-xs text-ink/40">Rp {item.product?.price.toLocaleString('id-ID')} / unit</p>
            </div>

            <div className="order-3 sm:order-none">
              <div className="flex items-center gap-2 bg-stone/25 rounded-full px-1.5 py-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1, item.product?.stock)}
                  className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center hover:bg-brick transition"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.product?.stock)}
                  disabled={item.product != null && item.quantity >= item.product.stock}
                  className="w-6 h-6 rounded-full bg-accent text-navy flex items-center justify-center hover:bg-brick hover:text-white disabled:opacity-30 disabled:hover:bg-accent disabled:hover:text-navy transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {warningId === item.id && (
                <p className="text-[10px] text-brick mt-1 text-center whitespace-nowrap">Maks: {item.product?.stock}</p>
              )}
            </div>

            <p className="w-24 text-right font-medium text-sm text-navy order-4 sm:order-none">
              Rp {((item.product?.price ?? 0) * item.quantity).toLocaleString('id-ID')}
            </p>
            <button
              onClick={() => removeItem(item.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-ink/30 hover:bg-brick/10 hover:text-brick transition order-2 sm:order-none"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Total</span>
          <span className="font-serif text-2xl font-bold text-navy">Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 bg-accent text-navy font-semibold py-3.5 rounded-xl hover:bg-brick hover:text-white transition"
      >
        Lanjut Checkout
        <ArrowRight className="w-4 h-4" />
      </Link>
    </>
  )
}

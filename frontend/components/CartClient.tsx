'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getToken } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { Minus, Plus, Trash2, Image as ImageIcon, ArrowRight, Loader2 } from 'lucide-react'

export default function CartClient() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [warningId, setWarningId] = useState<number | string | null>(null)

  useEffect(() => {
    if (!getToken()) {
      router.push('/login?redirect=/cart')
      return
    }

    loadCart()
  }, [])

  async function loadCart() {
    try {
      const data = await api.cart.list()
      setItems(data)
    } catch (err) {
      console.error('Failed to load cart', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(id: number | string, newQuantity: number, stock?: number) {
    if (newQuantity < 1) return
    if (stock != null && newQuantity > stock) {
      setWarningId(id)
      setTimeout(() => setWarningId(null), 2000)
      return
    }

    // Optimistic UI update
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))

    try {
      await api.cart.update(id, newQuantity)
    } catch (err) {
      loadCart()
    }
  }

  async function removeItem(id: number | string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    try {
      await api.cart.remove(id)
    } catch (err) {
      loadCart()
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl py-20 flex flex-col items-center justify-center text-ink/40">
        <Loader2 className="w-8 h-8 animate-spin text-navy mb-2" />
        <p className="text-sm">Memuat keranjang belanja...</p>
      </div>
    )
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
                <img src={getImageUrl(item.product.image_url)} alt={item.product?.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-5 h-5 text-navy/20" />
              )}
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="font-medium text-sm truncate">{item.product?.name}</p>
              <p className="text-xs text-ink/40">Rp {(item.product?.price ?? 0).toLocaleString('id-ID')} / unit</p>
            </div>

            <div className="order-3 sm:order-none">
              <div className="flex items-center gap-2 bg-stone/25 rounded-full px-1.5 py-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1, item.product?.stock)}
                  className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center hover:bg-brick transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.product?.stock)}
                  disabled={item.product != null && item.quantity >= item.product.stock}
                  className="w-6 h-6 rounded-full bg-accent text-navy flex items-center justify-center hover:bg-brick hover:text-white disabled:opacity-30 disabled:hover:bg-accent disabled:hover:text-navy transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {warningId === item.id && (
                <p className="text-[10px] text-brick mt-1 text-center whitespace-nowrap">Maks: {item.product?.stock}</p>
              )}
            </div>

            <p className="w-28 text-right font-medium text-sm text-navy order-4 sm:order-none">
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

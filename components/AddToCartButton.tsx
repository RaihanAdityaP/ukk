'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, X, Image as ImageIcon } from 'lucide-react'

export default function AddToCartButton({
  productId,
  productName,
  price,
  imageUrl,
  disabled,
  maxStock,
  compact,
}: {
  productId: string
  productName?: string
  price?: number
  imageUrl?: string | null
  disabled?: boolean
  maxStock?: number
  compact?: boolean
}) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [qtyText, setQtyText] = useState('1')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function openModal() {
    setQuantity(1)
    setQtyText('1')
    setModalOpen(true)
  }

  function updateQuantity(newQty: number) {
    const clamped = maxStock ? Math.min(maxStock, Math.max(1, newQty)) : Math.max(1, newQty)
    setQuantity(clamped)
    setQtyText(String(clamped))
  }

  async function handleConfirm() {
    const finalQty = qtyText === '' || parseInt(qtyText, 10) < 1 ? 1 : quantity
    setLoading(true)

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: finalQty }),
      })

      setLoading(false)

      if (res.status === 401) {
        router.push('/login?redirect=/')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setModalOpen(false)
        setToast({ type: 'error', text: data?.error ?? 'Gagal menambahkan ke keranjang.' })
        setTimeout(() => setToast(null), 3000)
        return
      }

      setModalOpen(false)
      setToast({ type: 'success', text: `${productName ?? 'Produk'} (${finalQty}x) berhasil ditambahkan ke keranjang` })
      setTimeout(() => setToast(null), 3000)
    } catch {
      setLoading(false)
      setModalOpen(false)
      setToast({ type: 'error', text: 'Gagal terhubung ke server. Coba lagi.' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <>
      {compact ? (
        <button
          onClick={openModal}
          disabled={disabled}
          className="w-7 h-7 rounded-lg bg-navy text-white flex items-center justify-center hover:bg-brick disabled:opacity-30 disabled:bg-stone transition ml-auto"
          aria-label="Tambah ke keranjang"
        >
          <Plus className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={openModal}
          disabled={disabled}
          className="flex items-center gap-1.5 bg-accent text-navy text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-30 hover:bg-brick hover:text-white transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {disabled ? 'Stok Habis' : 'Tambah'}
        </button>
      )}

      {/* Modal pilih jumlah */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center px-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl w-full max-w-sm p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-ink/40 hover:bg-stone/30 hover:text-brick transition"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6 pr-6">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={productName} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-stone/40 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5 text-navy/20" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-0.5">Tambah ke Keranjang</p>
                <h3 className="font-serif text-lg font-bold text-navy leading-snug truncate">{productName ?? 'Produk'}</h3>
              </div>
            </div>

            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center gap-3 bg-stone/25 rounded-full px-2.5 py-1.5">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center hover:bg-brick active:scale-90 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qtyText}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    setQtyText(digits)
                    if (digits !== '') {
                      const parsed = parseInt(digits, 10)
                      setQuantity(maxStock ? Math.min(maxStock, Math.max(1, parsed)) : Math.max(1, parsed))
                    }
                  }}
                  onBlur={() => {
                    if (qtyText === '' || parseInt(qtyText, 10) < 1) {
                      updateQuantity(1)
                    } else {
                      updateQuantity(parseInt(qtyText, 10))
                    }
                  }}
                  className="w-9 text-center font-serif text-lg font-bold text-ink bg-transparent outline-none"
                />
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-accent text-navy flex items-center justify-center hover:bg-brick hover:text-white active:scale-90 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {maxStock != null && (
              <p className="text-center text-xs text-ink/40 mb-5">Stok tersedia: {maxStock}</p>
            )}

            {price != null && (
              <div className="flex items-center justify-between border-t border-stone pt-4 mb-5">
                <span className="text-sm text-ink/60">Subtotal</span>
                <span className="font-serif text-xl font-bold text-navy">
                  Rp {(price * quantity).toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-accent text-navy font-semibold text-sm py-3 rounded-lg hover:bg-brick hover:text-white disabled:opacity-50 transition"
            >
              {loading ? 'Menambahkan...' : 'Konfirmasi'}
            </button>
          </div>
        </div>
      )}

      {/* Toast notifikasi hasil */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm">
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              toast.type === 'success' ? 'bg-navy' : 'bg-brick'
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}
    </>
  )
}

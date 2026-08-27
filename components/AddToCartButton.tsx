'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddToCartButton({
  productId,
  productName,
  price,
  imageUrl,
  disabled,
  maxStock,
}: {
  productId: string
  productName?: string
  price?: number
  imageUrl?: string | null
  disabled?: boolean
  maxStock?: number
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
    // Jaga-jaga kalau field sempat dikosongin tapi belum blur pas tombol Konfirmasi diklik
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
      <button
        onClick={openModal}
        disabled={disabled}
        className="bg-navy text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 disabled:opacity-30 hover:bg-brick transition whitespace-nowrap"
      >
        {disabled ? 'Stok Habis' : 'Tambah'}
      </button>

      {/* Modal pilih jumlah */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center px-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative bg-white border-2 border-ink w-full max-w-sm p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-ink/40 hover:text-brick transition text-lg"
              aria-label="Tutup"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6 pr-6">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={productName} className="w-14 h-14 object-cover border border-stone flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-stone/40 flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-xl text-navy/20">{(productName ?? 'P').charAt(0)}</span>
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
                  className="w-8 h-8 rounded-full bg-navy text-white text-base font-bold flex items-center justify-center hover:bg-brick active:scale-90 transition shadow-sm"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qtyText}
                  onChange={(e) => {
                    // Boleh dikosongin sementara pas lagi ngetik, gak langsung dipaksa balik ke 1
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    setQtyText(digits)
                    if (digits !== '') {
                      const parsed = parseInt(digits, 10)
                      setQuantity(maxStock ? Math.min(maxStock, Math.max(1, parsed)) : Math.max(1, parsed))
                    }
                  }}
                  onBlur={() => {
                    // Kalau ditinggal kosong atau gak valid, baru dirapiin balik ke angka yang valid
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
                  className="w-8 h-8 rounded-full bg-accent text-navy text-base font-bold flex items-center justify-center hover:bg-brick hover:text-white active:scale-90 transition shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {maxStock != null && (
              <p className="text-center text-xs text-ink/40 mb-5">Stok tersedia: {maxStock}</p>
            )}

            {price != null && (
              <div className="flex items-center justify-between border-t-2 border-stone pt-4 mb-5">
                <span className="text-sm text-ink/60">Subtotal</span>
                <span className="font-serif text-xl font-bold text-navy">
                  Rp {(price * quantity).toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-accent text-navy font-bold uppercase tracking-wide text-sm py-3 hover:bg-brick hover:text-white disabled:opacity-50 transition"
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
            className={`border-2 px-4 py-3 text-sm font-medium text-white shadow-lg ${
              toast.type === 'success' ? 'bg-navy border-navy' : 'bg-brick border-brick'
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}
    </>
  )
}
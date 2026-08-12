'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    payment_method: 'cod',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ order_code: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Gagal membuat pesanan.')
      return
    }

    setSuccess(data)
  }

  if (success) {
    return (
      <main className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 border-2 border-navy text-navy flex items-center justify-center mx-auto mb-6 text-2xl font-serif">✓</div>
        <h1 className="font-serif text-2xl font-bold text-navy mb-2">Pesanan berhasil dibuat!</h1>
        <p className="text-ink/50 mb-1 text-sm uppercase tracking-wide">Kode Pesanan</p>
        <p className="font-serif text-2xl font-bold mb-8">{success.order_code}</p>
        <button
          onClick={() => router.push('/')}
          className="bg-accent text-navy font-bold uppercase tracking-wide text-sm px-8 py-3 hover:bg-brick hover:text-white transition"
        >
          Kembali Belanja
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-navy border-b-2 border-ink pb-3 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Nama Penerima</label>
          <input
            required
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            className="w-full border-2 border-stone px-3 py-2.5 bg-white focus:outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Nomor HP</label>
          <input
            required
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
            className="w-full border-2 border-stone px-3 py-2.5 bg-white focus:outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1.5">Alamat Lengkap</label>
          <textarea
            required
            rows={3}
            value={form.customer_address}
            onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
            className="w-full border-2 border-stone px-3 py-2.5 bg-white focus:outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 mb-2">Metode Pembayaran</label>
          <div className="flex gap-3">
            {[
              { value: 'cod', label: 'Bayar di Tempat' },
              { value: 'transfer', label: 'Transfer Bank' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 border-2 px-3 py-2.5 text-sm cursor-pointer text-center transition ${
                  form.payment_method === opt.value ? 'border-navy bg-navy text-white font-semibold' : 'border-stone text-ink/60'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={opt.value}
                  checked={form.payment_method === opt.value}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-brick text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-navy font-bold uppercase tracking-wide text-sm py-3.5 hover:bg-brick hover:text-white disabled:opacity-50 transition"
        >
          {loading ? 'Memproses...' : 'Buat Pesanan'}
        </button>
      </form>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { Check, Truck, CreditCard } from 'lucide-react'

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: () => void
          onPending?: () => void
          onError?: () => void
          onClose?: () => void
        }
      ) => void
    }
  }
}

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
  const [success, setSuccess] = useState<{ order_code: string; paymentStatus?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 1. Buat order dulu (status pending), sama kayak sebelumnya
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setLoading(false)
      setError(data.error ?? 'Gagal membuat pesanan.')
      return
    }

    // 2. Kalau bayar via COD, selesai — order pending, dibayar pas barang sampai
    if (form.payment_method === 'cod') {
      setLoading(false)
      setSuccess({ order_code: data.order_code })
      return
    }

    // 3. Kalau bayar online, minta token Snap dari Midtrans terus buka popup pembayaran
    const paymentRes = await fetch('/api/payment/create-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_code: data.order_code }),
    })
    const paymentData = await paymentRes.json()
    setLoading(false)

    if (!paymentRes.ok || !paymentData.token) {
      setError('Order dibuat, tapi gagal membuka pembayaran online. Order code: ' + data.order_code)
      return
    }

    window.snap?.pay(paymentData.token, {
      onSuccess: () => setSuccess({ order_code: data.order_code, paymentStatus: 'Pembayaran berhasil' }),
      onPending: () => setSuccess({ order_code: data.order_code, paymentStatus: 'Menunggu pembayaran' }),
      onError: () => setError('Pembayaran gagal. Order code kamu: ' + data.order_code + ' (bisa dibayar ulang lewat halaman pesanan).'),
      onClose: () => setSuccess({ order_code: data.order_code, paymentStatus: 'Pembayaran belum diselesaikan' }),
    })
  }

  if (success) {
    return (
      <main className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy mb-2">Pesanan berhasil dibuat!</h1>
        <p className="text-ink/50 mb-1 text-sm">Kode pesanan kamu</p>
        <p className="font-serif text-2xl font-bold mb-2">{success.order_code}</p>
        {success.paymentStatus && <p className="text-sm text-ink/50 mb-6">{success.paymentStatus}</p>}
        <button
          onClick={() => router.push('/')}
          className="bg-accent text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-brick hover:text-white transition"
        >
          Kembali Belanja
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      {/* Script Snap.js dari Midtrans — sandbox atau production tergantung env */}
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js'}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <h1 className="font-serif text-2xl font-bold text-navy mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Nama Penerima</label>
          <input
            required
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Nomor HP</label>
          <input
            required
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
            className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/50 mb-1.5">Alamat Lengkap</label>
          <textarea
            required
            rows={3}
            value={form.customer_address}
            onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
            className="w-full rounded-lg border border-stone px-3 py-2.5 focus:outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/50 mb-2">Metode Pembayaran</label>
          <div className="flex gap-3">
            {[
              { value: 'cod', label: 'Bayar di Tempat', icon: Truck },
              { value: 'midtrans', label: 'Bayar Online', icon: CreditCard },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-lg px-3 py-3 text-sm cursor-pointer transition ${
                  form.payment_method === opt.value ? 'bg-navy text-white' : 'bg-stone/25 text-ink/60 hover:bg-stone/40'
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
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </label>
            ))}
          </div>
          {form.payment_method === 'midtrans' && (
            <p className="text-xs text-ink/40 mt-2">Bisa transfer bank, e-wallet, atau kartu — pilih di halaman pembayaran.</p>
          )}
        </div>

        {error && <p className="text-brick text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-navy font-semibold py-3 rounded-lg hover:bg-brick hover:text-white disabled:opacity-50 transition"
        >
          {loading ? 'Memproses...' : 'Buat Pesanan'}
        </button>
      </form>
    </main>
  )
}

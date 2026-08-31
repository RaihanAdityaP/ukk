import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import { Check, Clock, X } from 'lucide-react'

// Halaman ini yang dilihat customer setelah selesai bayar di Midtrans
// (terutama buat metode yang redirect keluar app, misal QRIS/GoPay di HP).
// Midtrans nempelin ?order_id=... di URL pas redirect balik ke sini.
//
// PENTING: status yang ditampilin di sini diambil ULANG dari database kita
// (bukan cuma percaya query URL begitu aja), soalnya query URL bisa diubah-ubah
// orang. Status asli yang valid itu yang udah diupdate lewat webhook notification.
export default async function PaymentFinishPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const { order_id } = await searchParams
  const supabase = await createServerSupabase()

  const { data: order } = order_id
    ? await supabase.from('orders').select('order_code, status, total').eq('order_code', order_id).single()
    : { data: null }

  if (!order) {
    return (
      <main className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-ink/50 mb-6">Pesanan tidak ditemukan.</p>
        <Link href="/" className="text-brick font-semibold hover:underline">Kembali ke Shop</Link>
      </main>
    )
  }

  const statusConfig: Record<string, { icon: typeof Check; color: string; title: string; desc: string }> = {
    paid: {
      icon: Check,
      color: 'bg-navy',
      title: 'Pembayaran Berhasil',
      desc: 'Terima kasih! Pesanan kamu sedang diproses.',
    },
    pending: {
      icon: Clock,
      color: 'bg-accent',
      title: 'Menunggu Pembayaran',
      desc: 'Selesaikan pembayaran kamu. Status akan otomatis update begitu pembayaran diterima.',
    },
    cancelled: {
      icon: X,
      color: 'bg-brick',
      title: 'Pembayaran Gagal',
      desc: 'Transaksi dibatalkan atau kadaluarsa. Kamu bisa coba checkout ulang.',
    },
  }

  const config = statusConfig[order.status] ?? statusConfig.pending
  const Icon = config.icon

  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center">
      <div className={`w-16 h-16 rounded-full ${config.color} text-white flex items-center justify-center mx-auto mb-6`}>
        <Icon className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-2xl font-bold text-navy mb-2">{config.title}</h1>
      <p className="text-ink/50 text-sm mb-6">{config.desc}</p>

      <div className="bg-white rounded-xl p-4 mb-6 inline-block">
        <p className="text-xs text-ink/40 mb-1">Kode Pesanan</p>
        <p className="font-serif text-xl font-bold text-navy">{order.order_code}</p>
        <p className="text-sm text-ink/50 mt-2">Rp {order.total.toLocaleString('id-ID')}</p>
      </div>

      <div>
        <Link
          href="/"
          className="inline-block bg-accent text-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-brick hover:text-white transition"
        >
          Kembali Belanja
        </Link>
      </div>
    </main>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { snap } from '@/lib/midtrans'

// POST /api/payment/create-transaction
// Body: { order_code }
// Dipanggil SETELAH order berhasil dibuat (status pending), buat dapetin token
// pembayaran Midtrans Snap yang bakal dipakai buka popup pembayaran di frontend.
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const { order_code } = await request.json()
  if (!order_code) {
    return NextResponse.json({ error: 'order_code wajib diisi.' }, { status: 400 })
  }

  // Ambil detail order milik user ini (RLS otomatis batasin cuma order miliknya sendiri)
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_code', order_code)
    .eq('customer_id', user.id)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order tidak ditemukan.' }, { status: 404 })
  }

  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: order.order_code, // harus unik, dipakai Midtrans buat nge-track transaksi ini
        gross_amount: order.total,
      },
      customer_details: {
        first_name: order.customer_name,
        phone: order.customer_phone,
      },
      item_details: order.order_items.map((item: { product_name: string; price: number; quantity: number }) => ({
        name: item.product_name.slice(0, 50), // Midtrans batesin max 50 karakter
        price: item.price,
        quantity: item.quantity,
      })),
    })

    return NextResponse.json({ token: transaction.token, redirect_url: transaction.redirect_url })
  } catch (error) {
    console.error('Midtrans error:', error)
    return NextResponse.json({ error: 'Gagal membuat transaksi pembayaran.' }, { status: 500 })
  }
}

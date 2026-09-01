import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// POST /api/payment/notification
// Ini endpoint yang dipanggil MIDTRANS (bukan browser user), tiap kali status
// pembayaran berubah (dibayar, gagal, expired, dll). Wajib ada supaya status
// order di database ke-update otomatis walau user nutup halaman/popup tanpa
// nunggu callback selesai.
//
// PENTING: URL endpoint ini ("https://domain-kamu.com/api/payment/notification")
// harus didaftarin di Midtrans Dashboard > Settings > Configuration > Payment Notification URL
export async function POST(request: NextRequest) {
  const body = await request.json()

  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body

  // Verifikasi signature biar yakin notifikasi ini beneran dari Midtrans, bukan orang lain nembak API ini asal-asalan
  const expectedSignature = crypto
    .createHash('sha512')
    .update(order_id + status_code + gross_amount + process.env.MIDTRANS_SERVER_KEY)
    .digest('hex')

  if (signature_key !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  // Pakai service-role-like client langsung (bukan anon key biasa), soalnya ini
  // server-to-server dari Midtrans, gak ada sesi login user yang bisa dipakai RLS.
  // Karena kita gak punya service_role key di sini, kita andalkan function database
  // yang security definer buat update status order (lihat SQL di bawah).
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let newStatus = 'pending'
  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    newStatus = fraud_status === 'accept' || !fraud_status ? 'paid' : 'pending'
  } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
    newStatus = 'cancelled'
  } else if (transaction_status === 'pending') {
    newStatus = 'pending'
  }

  const { error } = await supabase.rpc('update_order_status_from_payment', {
    p_order_code: order_id,
    p_new_status: newStatus,
  })

  if (error) {
    console.error('Gagal update status order:', error)
    return NextResponse.json({ error: 'Gagal update status.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

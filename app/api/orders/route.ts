import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/orders → list order (admin lihat semua, customer lihat punya sendiri via RLS)
export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

// POST /api/orders → checkout. Semua logic (cek stok, kurangin stok, buat order)
// dijalankan atomik lewat function database checkout_cart, biar aman dari race condition
// kalau ada 2 orang checkout barang yang sama bersamaan pas stok tipis.
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const { customer_name, customer_phone, customer_address, payment_method } = await request.json()

  if (!customer_name || !customer_phone || !customer_address || !payment_method) {
    return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('checkout_cart', {
    p_customer_name: customer_name,
    p_customer_phone: customer_phone,
    p_customer_address: customer_address,
    p_payment_method: payment_method,
  })

  if (error) {
    // Pesan error dari database (misal "Stok tidak cukup untuk: X") langsung diterusin ke user
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const result = Array.isArray(data) ? data[0] : data
  return NextResponse.json({ id: result.order_id, order_code: result.order_code }, { status: 201 })
}

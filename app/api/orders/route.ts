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

// POST /api/orders → checkout, bikin order baru dari cart milik user yang login
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const { customer_name, customer_phone, customer_address, payment_method } = await request.json()

  if (!customer_name || !customer_phone || !customer_address || !payment_method) {
    return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })
  }

  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select('*, product:products(*)')
    .eq('user_id', user.id)

  if (cartError) return NextResponse.json({ error: cartError.message }, { status: 500 })
  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Keranjang kosong.' }, { status: 400 })
  }

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const orderCode = `WJY-${String((count ?? 0) + 1).padStart(4, '0')}`

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_code: orderCode,
      customer_id: user.id,
      customer_name,
      customer_phone,
      customer_address,
      payment_method,
      total,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  const orderItemsPayload = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload)
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  await supabase.from('cart_items').delete().eq('user_id', user.id)

  return NextResponse.json(order, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// PUT /api/cart/:id → update quantity item di keranjang
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const { quantity } = await request.json()

  if (quantity == null || quantity < 1) {
    return NextResponse.json({ error: 'Jumlah tidak valid.' }, { status: 400 })
  }

  // Cek dulu stok produk terkait, jangan sampai quantity di cart ngelebihin stok asli
  const { data: cartItem } = await supabase
    .from('cart_items')
    .select('*, product:products(stock)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cartItem) {
    return NextResponse.json({ error: 'Item tidak ditemukan.' }, { status: 404 })
  }
  if (cartItem.product && quantity > cartItem.product.stock) {
    return NextResponse.json({ error: `Stok tidak cukup. Tersisa ${cartItem.product.stock}.` }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .eq('user_id', user.id) // pastiin cuma bisa update cart miliknya sendiri
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

// DELETE /api/cart/:id → hapus item dari keranjang
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Harus login dulu.' }, { status: 401 })

  const { error } = await supabase.from('cart_items').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
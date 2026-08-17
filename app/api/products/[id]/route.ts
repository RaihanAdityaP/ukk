import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET /api/products/:id → detail 1 produk
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  return NextResponse.json(data)
}

// PUT /api/products/:id → edit produk (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, price, stock, category_id, image_url, description, is_featured } = body

  if (!name?.trim() || price == null || stock == null) {
    return NextResponse.json({ error: 'Nama, harga, dan stok wajib diisi.' }, { status: 400 })
  }
  if (price < 0 || stock < 0) {
    return NextResponse.json({ error: 'Harga dan stok tidak boleh negatif.' }, { status: 400 })
  }

  if (is_featured) {
    await supabase.from('products').update({ is_featured: false }).eq('is_featured', true).neq('id', id)
  }

  const { data, error } = await supabase
    .from('products')
    .update({ name, price, stock, category_id, image_url, description, is_featured: !!is_featured, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

// DELETE /api/products/:id → hapus produk (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
